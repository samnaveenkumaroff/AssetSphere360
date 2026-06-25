using AssetSphere360.Application.Interfaces;
using AssetSphere360.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AssetSphere360.Infrastructure.Services;

public class OrderNumberService(AssetSphereDbContext context) : IOrderNumberService
{
    public async Task<string> GenerateNextPurchaseOrderNumberAsync(CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"PO-{year}-";

        var count = await context.PurchaseOrders
            .IgnoreQueryFilters()
            .CountAsync(p => p.OrderNumber.StartsWith(prefix), ct);

        return $"{prefix}{(count + 1):D4}";
    }

    public async Task<string> GenerateNextSalesOrderNumberAsync(CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"SO-{year}-";

        var count = await context.SalesOrders
            .IgnoreQueryFilters()
            .CountAsync(s => s.OrderNumber.StartsWith(prefix), ct);

        return $"{prefix}{(count + 1):D4}";
    }
}
