namespace AssetSphere360.Application.DTOs.SalesOrders;

public record SalesOrderLineDto(
    Guid Id, Guid ProductId, string ProductName, string ProductSku,
    decimal Quantity, decimal UnitPrice, string Currency, decimal LineTotal);

public record SalesOrderDto(
    Guid Id, string OrderNumber, string CustomerName, string? CustomerEmail, string? CustomerPhone,
    Guid WarehouseId, string WarehouseName, string Status,
    DateTime OrderDate, DateTime? ShippedDate, DateTime? DeliveredDate,
    string? Notes, decimal TotalAmount, string Currency,
    IReadOnlyList<SalesOrderLineDto> Lines);

public record CreateSalesOrderLineRequest(Guid ProductId, decimal Quantity, decimal UnitPrice);

public record CreateSalesOrderRequest(
    string CustomerName, string? CustomerEmail, string? CustomerPhone, Guid WarehouseId,
    string? Notes, IReadOnlyList<CreateSalesOrderLineRequest> Lines);
