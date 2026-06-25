using AssetSphere360.Application.DTOs.SalesOrders;
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
public class SalesOrdersController(IUnitOfWork uow, IOrderNumberService orderNumberService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var orders = await uow.Repository<SalesOrder>().GetAllAsync(ct);
        return Ok(orders.OrderByDescending(o => o.OrderDate).Select(MapToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var order = await uow.Repository<SalesOrder>().GetByIdAsync(id, ct);
        return order is null ? NotFound(new { message = $"Sales order {id} not found." }) : Ok(MapToDto(order));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateSalesOrderRequest request, CancellationToken ct)
    {
        var orderNumber = await orderNumberService.GenerateNextSalesOrderNumberAsync(ct);
        var order = SalesOrder.Create(orderNumber, request.CustomerName, request.WarehouseId,
            request.CustomerEmail, request.CustomerPhone, request.Notes);

        foreach (var line in request.Lines)
            order.AddLine(line.ProductId, line.Quantity, line.UnitPrice);

        await uow.Repository<SalesOrder>().AddAsync(order, ct);
        await uow.SaveChangesAsync(ct);

        var saved = await uow.Repository<SalesOrder>().GetByIdAsync(order.Id, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapToDto(saved!));
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.Submit(), ct);

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var order = await uow.Repository<SalesOrder>().GetByIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Sales order {id} not found." });

        // Validate sufficient stock exists before approving a sale
        foreach (var line in order.Lines)
        {
            var product = await uow.Repository<Product>().GetByIdAsync(line.ProductId, ct);
            if (product is null)
                return BadRequest(new { message = $"Product {line.ProductId} not found." });
            if (product.CurrentStock < line.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {product.Name}: have {product.CurrentStock}, need {line.Quantity}." });
        }

        try
        {
            order.Approve();
            await uow.Repository<SalesOrder>().UpdateAsync(order, ct);
            await uow.SaveChangesAsync(ct);
            return Ok(MapToDto(order));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/ship")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<IActionResult> Ship(Guid id, CancellationToken ct)
    {
        var order = await uow.Repository<SalesOrder>().GetByIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Sales order {id} not found." });

        try
        {
            await uow.BeginTransactionAsync(ct);

            order.Ship();
            await uow.Repository<SalesOrder>().UpdateAsync(order, ct);

            // Stock auto-update: shipping decreases stock + creates a StockMovement audit record
            foreach (var line in order.Lines)
            {
                var product = await uow.Repository<Product>().GetByIdAsync(line.ProductId, ct);
                if (product is null) continue;

                product.AdjustStock(-line.Quantity);
                await uow.Repository<Product>().UpdateAsync(product, ct);

                var movement = StockMovement.Create(
                    line.ProductId, order.WarehouseId, StockMovementType.StockOut,
                    line.Quantity, line.UnitPrice, order.OrderNumber,
                    $"Shipped for SO {order.OrderNumber}");
                await uow.Repository<StockMovement>().AddAsync(movement, ct);
            }

            await uow.SaveChangesAsync(ct);
            await uow.CommitTransactionAsync(ct);

            var updated = await uow.Repository<SalesOrder>().GetByIdAsync(id, ct);
            return Ok(MapToDto(updated!));
        }
        catch (InvalidOperationException ex)
        {
            await uow.RollbackTransactionAsync(ct);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/deliver")]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<IActionResult> Deliver(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.MarkDelivered(), ct);

    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
        => await TransitionStatus(id, o => o.Cancel(), ct);

    private async Task<IActionResult> TransitionStatus(Guid id, Action<SalesOrder> transition, CancellationToken ct)
    {
        var order = await uow.Repository<SalesOrder>().GetByIdAsync(id, ct);
        if (order is null) return NotFound(new { message = $"Sales order {id} not found." });

        try
        {
            transition(order);
            await uow.Repository<SalesOrder>().UpdateAsync(order, ct);
            await uow.SaveChangesAsync(ct);
            return Ok(MapToDto(order));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private static SalesOrderDto MapToDto(SalesOrder o) => new(
        o.Id, o.OrderNumber, o.CustomerName, o.CustomerEmail, o.CustomerPhone,
        o.WarehouseId, o.Warehouse?.Name ?? string.Empty, o.Status.ToString(),
        o.OrderDate, o.ShippedDate, o.DeliveredDate, o.Notes,
        o.TotalAmount.Amount, o.TotalAmount.Currency,
        o.Lines.Select(l => new SalesOrderLineDto(
            l.Id, l.ProductId, l.Product?.Name ?? string.Empty, l.Product?.SKU ?? string.Empty,
            l.Quantity, l.UnitPrice, l.UnitPriceCurrency, l.LineTotal)).ToList());
}
