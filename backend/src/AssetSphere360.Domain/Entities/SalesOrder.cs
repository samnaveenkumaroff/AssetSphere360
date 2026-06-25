using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.ValueObjects;

namespace AssetSphere360.Domain.Entities;

public class SalesOrder : BaseEntity
{
    public string OrderNumber { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public Guid WarehouseId { get; private set; }
    public Warehouse Warehouse { get; private set; } = null!;
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public DateTime OrderDate { get; private set; } = DateTime.UtcNow;
    public DateTime? ShippedDate { get; private set; }
    public DateTime? DeliveredDate { get; private set; }
    public string? Notes { get; private set; }
    public ICollection<SalesOrderLine> Lines { get; private set; } = [];

    public Money TotalAmount => new(
        Lines.Sum(l => l.Quantity * l.UnitPrice),
        Lines.FirstOrDefault()?.UnitPriceCurrency ?? "INR");

    private SalesOrder() { }

    public static SalesOrder Create(
        string orderNumber, string customerName, Guid warehouseId,
        string? customerEmail = null, string? customerPhone = null, string? notes = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(orderNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(customerName);
        return new SalesOrder
        {
            OrderNumber = orderNumber,
            CustomerName = customerName.Trim(),
            CustomerEmail = customerEmail?.Trim(),
            CustomerPhone = customerPhone?.Trim(),
            WarehouseId = warehouseId,
            Notes = notes?.Trim()
        };
    }

    public void AddLine(Guid productId, decimal quantity, decimal unitPrice, string currency = "INR")
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOperationException("Cannot modify lines on a non-draft order.");
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        Lines.Add(SalesOrderLine.Create(Id, productId, quantity, unitPrice, currency));
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

    public void Ship()
    {
        if (Status != OrderStatus.Approved)
            throw new InvalidOperationException("Only approved orders can be shipped.");
        Status = OrderStatus.Shipped;
        ShippedDate = DateTime.UtcNow;
    }

    public void MarkDelivered()
    {
        if (Status != OrderStatus.Shipped)
            throw new InvalidOperationException("Only shipped orders can be marked delivered.");
        Status = OrderStatus.Delivered;
        DeliveredDate = DateTime.UtcNow;
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Delivered or OrderStatus.Cancelled)
            throw new InvalidOperationException($"Cannot cancel an order in {Status} status.");
        Status = OrderStatus.Cancelled;
    }
}
