namespace AssetSphere360.Application.DTOs.StockMovements;

public record StockMovementDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSku,
    Guid WarehouseId,
    string WarehouseName,
    string MovementType,
    decimal Quantity,
    decimal UnitCost,
    string? ReferenceNumber,
    string? Notes,
    DateTime MovementDate);

public record CreateStockMovementRequest(
    Guid ProductId,
    Guid WarehouseId,
    string MovementType,
    decimal Quantity,
    decimal UnitCost,
    string? ReferenceNumber = null,
    string? Notes = null);
