namespace AssetSphere360.Application.Interfaces;

public interface IOrderNumberService
{
    Task<string> GenerateNextPurchaseOrderNumberAsync(CancellationToken ct = default);
    Task<string> GenerateNextSalesOrderNumberAsync(CancellationToken ct = default);
}
