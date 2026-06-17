namespace AssetSphere360.Application.DTOs.Products;

public record ProductDto(
    Guid Id,
    string Name,
    string SKU,
    string? Description,
    string? Barcode,
    Guid CategoryId,
    string CategoryName,
    Guid? SupplierId,
    string? SupplierName,
    decimal CostAmount,
    string CostCurrency,
    decimal SellingAmount,
    string SellingCurrency,
    string Unit,
    decimal ReorderLevel,
    decimal CurrentStock,
    bool IsLowStock,
    bool IsActive,
    DateTime CreatedAt);
