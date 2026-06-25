using AssetSphere360.Application.DTOs.PurchaseOrders;
using AssetSphere360.Application.Interfaces;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PurchaseOrdersController(IUnitOfWork uow, IOrderNumberService orderNumberService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var orders = await uow.Repository<PurchaseOrder>().GetAllAsync(ct);
        return Ok(orders.OrderByDescending(o => o.OrderDate).Select(MapToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var order = await uow.Repository<PurchaseOrder>().GetByIdAsync(id, ct);
        return order is null ? NotFound(new { message = $"Purchase order {id} not found." }) : Ok(MapToDto(order));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderRequest request, CancellationToken ct)
    {
        var orderNumber = await orderNumberService.GenerateNextPurchaseOrderNumberAsync(ct);
        var order = PurchaseOrder.Create(orderNumber, request.SupplierId, request.WarehouseId,
            request.ExpectedDeliveryDate, request.Notes);

        foreach (var line in request.Lines)
            order.AddLine(line.ProductId, line.Quantity, line.UnitCost);

        await uow.Repository<PurchaseOrder>().AddAsync(order, ct);
        await uow.SaveChangesAsync(ct);

        var saved = await uow.Repository<PurchaseOrder>().GetByIdAsync(order.Id, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapToDto(saved!));
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.Submit(), ct);

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.Approve(), ct);

    [HttpPost("{id:guid}/receive")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Receive(Guid id, CancellationToken ct)
    {
        var order = await uow.Repository<PurchaseOrder>().GetByIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Purchase order {id} not found." });

        try
        {
            await uow.BeginTransactionAsync(ct);

            order.MarkReceived();
            await uow.Repository<PurchaseOrder>().UpdateAsync(order, ct);

            // Stock auto-update: each line increases product stock + creates a StockMovement audit record
            foreach (var line in order.Lines)
            {
                var product = await uow.Repository<Product>().GetByIdAsync(line.ProductId, ct);
                if (product is null) continue;

                product.AdjustStock(line.Quantity);
                await uow.Repository<Product>().UpdateAsync(product, ct);

                var movement = StockMovement.Create(
                    line.ProductId, order.WarehouseId, StockMovementType.StockIn,
                    line.Quantity, line.UnitCost, order.OrderNumber,
                    $"Received from PO {order.OrderNumber}");
                await uow.Repository<StockMovement>().AddAsync(movement, ct);
            }

            await uow.SaveChangesAsync(ct);
            await uow.CommitTransactionAsync(ct);

            var updated = await uow.Repository<PurchaseOrder>().GetByIdAsync(id, ct);
            return Ok(MapToDto(updated!));
        }
        catch (InvalidOperationException ex)
        {
            await uow.RollbackTransactionAsync(ct);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.Cancel(), ct);

    private async Task<IActionResult> TransitionStatus(Guid id, Action<PurchaseOrder> transition, CancellationToken ct)
    {
        var order = await uow.Repository<PurchaseOrder>().GetByIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Purchase order {id} not found." });

        try
        {
            transition(order);
            await uow.Repository<PurchaseOrder>().UpdateAsync(order, ct);
            await uow.SaveChangesAsync(ct);
            return Ok(MapToDto(order));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private static PurchaseOrderDto MapToDto(PurchaseOrder o) => new(
        o.Id, o.OrderNumber, o.SupplierId, o.Supplier?.Name ?? string.Empty,
        o.WarehouseId, o.Warehouse?.Name ?? string.Empty, o.Status.ToString(),
        o.OrderDate, o.ExpectedDeliveryDate, o.ReceivedDate, o.Notes,
        o.TotalAmount.Amount, o.TotalAmount.Currency,
        o.Lines.Select(l => new PurchaseOrderLineDto(
            l.Id, l.ProductId, l.Product?.Name ?? string.Empty, l.Product?.SKU ?? string.Empty,
            l.Quantity, l.UnitCost, l.UnitCostCurrency, l.LineTotal)).ToList());
}
