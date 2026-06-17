using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DashboardController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var products = await uow.Repository<Product>().GetAllAsync(ct);
        var categories = await uow.Repository<Category>().GetAllAsync(ct);
        var suppliers = await uow.Repository<Supplier>().GetAllAsync(ct);

        var totalStockValue = products.Sum(p => p.CurrentStock * p.CostPrice.Amount);
        var lowStockCount = products.Count(p => p.IsLowStock && p.IsActive);

        return Ok(new
        {
            totalProducts = products.Count,
            activeProducts = products.Count(p => p.IsActive),
            totalCategories = categories.Count,
            totalSuppliers = suppliers.Count(s => s.IsActive),
            totalStockValue,
            lowStockCount,
            lowStockProducts = products
                .Where(p => p.IsLowStock && p.IsActive)
                .Select(p => new { p.Id, p.Name, p.SKU, p.CurrentStock, p.ReorderLevel })
                .Take(10)
        });
    }
}
