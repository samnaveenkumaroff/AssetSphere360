using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.Enums;

namespace AssetSphere360.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public StockMovementType MovementType { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public string? ReferenceNumber { get; private set; }
    public string? Notes { get; private set; }
    public DateTime MovementDate { get; private set; } = DateTime.UtcNow;

    private StockMovement() { }

    public static StockMovement Create(
        Guid productId, Guid warehouseId,
        StockMovementType type, decimal quantity,
        decimal unitCost, string? referenceNumber = null,
        string? notes = null)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");
        return new StockMovement
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            MovementType = type,
            Quantity = quantity,
            UnitCost = unitCost,
            ReferenceNumber = referenceNumber?.Trim(),
            Notes = notes?.Trim()
        };
    }
}
