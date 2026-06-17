namespace AssetSphere360.Application.DTOs.Products;

public record UpdateProductRequest(
    string Name,
    Guid CategoryId,
    decimal CostAmount,
    decimal SellingAmount,
    string Unit,
    decimal ReorderLevel,
    string? Description = null,
    string? Barcode = null,
    Guid? SupplierId = null,
    string Currency = "INR");
