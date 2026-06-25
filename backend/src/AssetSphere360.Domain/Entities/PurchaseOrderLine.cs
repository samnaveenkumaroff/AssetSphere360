using AssetSphere360.Domain.Common;

namespace AssetSphere360.Domain.Entities;

public class PurchaseOrderLine : BaseEntity
{
    public Guid PurchaseOrderId { get; private set; }
    public PurchaseOrder PurchaseOrder { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public decimal UnitCost { get; private set; }
    public string UnitCostCurrency { get; private set; } = "INR";
    public decimal LineTotal => Quantity * UnitCost;

    private PurchaseOrderLine() { }

    public static PurchaseOrderLine Create(
        Guid purchaseOrderId, Guid productId, decimal quantity, decimal unitCost, string currency = "INR")
        => new()
        {
            PurchaseOrderId = purchaseOrderId,
            ProductId = productId,
            Quantity = quantity,
            UnitCost = unitCost,
            UnitCostCurrency = currency
        };
}
