using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.ValueObjects;

namespace AssetSphere360.Domain.Entities;

public class PurchaseOrder : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public Guid SupplierId { get; private set; }
    public Supplier Supplier { get; private set; } = null!;
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public DateTime OrderDate { get; private set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public DateTime? ReceivedDate { get; private set; }
    public string? Notes { get; private set; }
    public ICollection<PurchaseOrderLine> Lines { get; private set; } = [];

    public Money TotalAmount => new(
        Lines.Sum(l => l.Quantity * l.UnitCost),
        Lines.FirstOrDefault()?.UnitCostCurrency ?? "INR");

    private PurchaseOrder() { }

    public static PurchaseOrder Create(
        string orderNumber, Guid supplierId, Guid warehouseId,
        DateTime? expectedDeliveryDate = null, string? notes = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(orderNumber);
        return new PurchaseOrder
        {
            OrderNumber = orderNumber,
            SupplierId = supplierId,
            WarehouseId = warehouseId,
            ExpectedDeliveryDate = expectedDeliveryDate,
            Notes = notes?.Trim()
        };
    }

    public void AddLine(Guid productId, decimal quantity, decimal unitCost, string currency = "INR")
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Cannot modify lines on a non-draft order.");
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        Lines.Add(PurchaseOrderLine.Create(Id, productId, quantity, unitCost, currency));
    }

    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Only draft orders can be submitted.");
        if (Lines.Count == 0)
            throw new InvalidOperationException("Cannot submit an order with no line items.");
        Status = OrderStatus.Submitted;
    }

    public void Approve()
    {
        if (Status != OrderStatus.Submitted)
            throw new InvalidOperationException("Only submitted orders can be approved.");
        Status = OrderStatus.Approved;
    }

    public void MarkReceived()
    {
        if (Status != OrderStatus.Approved)
            throw new InvalidOperationException("Only approved orders can be marked as received.");
        Status = OrderStatus.Delivered;
        ReceivedDate = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Delivered or OrderStatus.Cancelled)
            throw new InvalidOperationException($"Cannot cancel an order in {Status} status.");
        Status = OrderStatus.Cancelled;
    }
}
