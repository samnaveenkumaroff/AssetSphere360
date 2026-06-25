namespace AssetSphere360.Application.DTOs.PurchaseOrders;

public record PurchaseOrderLineDto(
    Guid Id, Guid ProductId, string ProductName, string ProductSku,
    decimal Quantity, decimal UnitCost, string Currency, decimal LineTotal);

public record PurchaseOrderDto(
    Guid Id, string OrderNumber, Guid SupplierId, string SupplierName,
    Guid WarehouseId, string WarehouseName, string Status,
    DateTime OrderDate, DateTime? ExpectedDeliveryDate, DateTime? ReceivedDate,
    string? Notes, decimal TotalAmount, string Currency,
    IReadOnlyList<PurchaseOrderLineDto> Lines);

public record CreatePurchaseOrderLineRequest(Guid ProductId, decimal Quantity, decimal UnitCost);

public record CreatePurchaseOrderRequest(
    Guid SupplierId, Guid WarehouseId,
    DateTime? ExpectedDeliveryDate, string? Notes,
    IReadOnlyList<CreatePurchaseOrderLineRequest> Lines);
