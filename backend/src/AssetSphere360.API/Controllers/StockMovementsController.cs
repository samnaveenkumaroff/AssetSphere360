using AssetSphere360.Application.DTOs.StockMovements;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class StockMovementsController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var movements = await uow.Repository<StockMovement>().GetAllAsync(ct);
        var dtos = movements
            .OrderByDescending(m => m.MovementDate)
            .Select(MapToDto)
            .ToList();
        return Ok(dtos);
    }

    [HttpGet("product/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, CancellationToken ct)
    {
        var movements = await uow.Repository<StockMovement>()
            .FindAsync(m => m.ProductId == productId, ct);
        return Ok(movements.OrderByDescending(m => m.MovementDate).Select(MapToDto).ToList());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateStockMovementRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<StockMovementType>(request.MovementType, true, out var type))
            return BadRequest(new { message = $"Invalid movement type: {request.MovementType}" });

        var product = await uow.Repository<Product>().GetByIdAsync(request.ProductId, ct);
        if (product is null)
            return NotFound(new { message = $"Product {request.ProductId} not found." });

        var warehouse = await uow.Repository<Warehouse>().GetByIdAsync(request.WarehouseId, ct);
        if (warehouse is null)
            return NotFound(new { message = $"Warehouse {request.WarehouseId} not found." });

        // Determine stock delta based on movement type
        var delta = type switch
        {
            StockMovementType.StockIn or StockMovementType.Return => request.Quantity,
            StockMovementType.StockOut => -request.Quantity,
            StockMovementType.Adjustment => request.Quantity, // can be +/- via signed quantity in future
            StockMovementType.Transfer => 0, // transfers net to zero at product level (multi-warehouse not tracked yet)
            _ => 0
        };

        try
        {
            await uow.BeginTransactionAsync(ct);

            product.AdjustStock(delta);
            await uow.Repository<Product>().UpdateAsync(product, ct);

            var movement = StockMovement.Create(
                request.ProductId, request.WarehouseId, type,
                request.Quantity, request.UnitCost,
                request.ReferenceNumber, request.Notes);

            await uow.Repository<StockMovement>().AddAsync(movement, ct);
            await uow.SaveChangesAsync(ct);
            await uow.CommitTransactionAsync(ct);

            return CreatedAtAction(nameof(GetByProduct), new { productId = product.Id },
                MapToDto(movement, product, warehouse));
        }
        catch (InvalidOperationException ex)
        {
            await uow.RollbackTransactionAsync(ct);
            return BadRequest(new { message = ex.Message });
        }
    }

    private static StockMovementDto MapToDto(StockMovement m) => new(
        m.Id, m.ProductId, m.Product?.Name ?? string.Empty, m.Product?.SKU ?? string.Empty,
        m.WarehouseId, m.Warehouse?.Name ?? string.Empty,
        m.MovementType.ToString(), m.Quantity, m.UnitCost,
        m.ReferenceNumber, m.Notes, m.MovementDate);

    private static StockMovementDto MapToDto(StockMovement m, Product p, Warehouse w) => new(
        m.Id, m.ProductId, p.Name, p.SKU, m.WarehouseId, w.Name,
        m.MovementType.ToString(), m.Quantity, m.UnitCost,
        m.ReferenceNumber, m.Notes, m.MovementDate);
}
