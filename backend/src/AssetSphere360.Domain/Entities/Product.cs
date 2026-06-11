using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.ValueObjects;

namespace AssetSphere360.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string SKU { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Barcode { get; private set; }
    public Guid CategoryId { get; private set; }
    public Category Category { get; private set; } = null!;
    public Guid? SupplierId { get; private set; }
    public Supplier? Supplier { get; private set; }
    public Money CostPrice { get; private set; } = Money.Zero();
    public Money SellingPrice { get; private set; } = Money.Zero();
    public UnitOfMeasure Unit { get; private set; }
    public decimal ReorderLevel { get; private set; }
    public decimal CurrentStock { get; private set; }
    public bool IsActive { get; private set; } = true;
    public ICollection<StockMovement> StockMovements { get; private set; } = [];

    private Product() { }

    public static Product Create(
        string name, string sku, Guid categoryId,
        Money costPrice, Money sellingPrice,
        UnitOfMeasure unit, decimal reorderLevel,
        string? description = null, string? barcode = null,
        Guid? supplierId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(sku);
        return new Product
        {
            Name = name.Trim(),
            SKU = sku.Trim().ToUpperInvariant(),
            CategoryId = categoryId,
            CostPrice = costPrice,
            SellingPrice = sellingPrice,
            Unit = unit,
            ReorderLevel = reorderLevel,
            Description = description?.Trim(),
            Barcode = barcode?.Trim(),
            SupplierId = supplierId
        };
    }

    public void AdjustStock(decimal quantity)
    {
        if (CurrentStock + quantity < 0)
            throw new InvalidOperationException("Stock cannot go below zero.");
        CurrentStock += quantity;
    }

    public bool IsLowStock => CurrentStock <= ReorderLevel;
}
