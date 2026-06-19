namespace AssetSphere360.Application.DTOs.Reports;

public record ProductReportRow(
    string SKU,
    string Name,
    string CategoryName,
    string? SupplierName,
    decimal CostAmount,
    decimal SellingAmount,
    decimal CurrentStock,
    string Unit,
    decimal ReorderLevel,
    bool IsLowStock);

public record StockMovementReportRow(
    DateTime MovementDate,
    string ProductName,
    string ProductSku,
    string WarehouseName,
    string MovementType,
    decimal Quantity,
    decimal UnitCost,
    string? ReferenceNumber,
    string? Notes);
