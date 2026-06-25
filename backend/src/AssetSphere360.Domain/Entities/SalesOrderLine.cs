using AssetSphere360.Domain.Common;

namespace AssetSphere360.Domain.Entities;

public class SalesOrderLine : BaseEntity
{
    public Guid SalesOrderId { get; private set; }
    public SalesOrder SalesOrder { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public string UnitPriceCurrency { get; private set; } = "INR";
    public decimal LineTotal => Quantity * UnitPrice;

    private SalesOrderLine() { }

    public static SalesOrderLine Create(
        Guid salesOrderId, Guid productId, decimal quantity, decimal unitPrice, string currency = "INR")
        => new()
        {
            SalesOrderId = salesOrderId,
            ProductId = productId,
            Quantity = quantity,
            UnitPrice = unitPrice,
            UnitPriceCurrency = currency
        };
}
