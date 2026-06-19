using AssetSphere360.Application.DTOs.Reports;
using AssetSphere360.Application.Interfaces;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ReportsController(IUnitOfWork uow, IReportService reportService) : ControllerBase
{
    [HttpGet("products/excel")]
    public async Task<IActionResult> ExportProductsExcel(CancellationToken ct)
    {
        var products = await uow.Repository<Product>().GetAllAsync(ct);
        var rows = products.Select(MapToReportRow).ToList();

        var bytes = reportService.ExportProductsToExcel(rows);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"products-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("products/pdf")]
    public async Task<IActionResult> ExportProductsPdf(CancellationToken ct)
    {
        var products = await uow.Repository<Product>().GetAllAsync(ct);
        var rows = products.Select(MapToReportRow).ToList();

        var bytes = reportService.ExportProductsToPdf(rows);
        return File(bytes, "application/pdf", $"products-{DateTime.UtcNow:yyyyMMdd}.pdf");
    }

    [HttpGet("stock-movements/excel")]
    public async Task<IActionResult> ExportStockMovementsExcel(CancellationToken ct)
    {
        var movements = await uow.Repository<StockMovement>().GetAllAsync(ct);
        var rows = movements
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new StockMovementReportRow(
                m.MovementDate,
                m.Product?.Name ?? string.Empty,
                m.Product?.SKU ?? string.Empty,
                m.Warehouse?.Name ?? string.Empty,
                m.MovementType.ToString(),
                m.Quantity, m.UnitCost, m.ReferenceNumber, m.Notes))
            .ToList();

        var bytes = reportService.ExportStockMovementsToExcel(rows);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"stock-movements-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    private static ProductReportRow MapToReportRow(Product p) => new(
        p.SKU, p.Name,
        p.Category?.Name ?? string.Empty,
        p.Supplier?.Name,
        p.CostPrice.Amount,
        p.SellingPrice.Amount,
        p.CurrentStock,
        p.Unit.ToString(),
        p.ReorderLevel,
        p.IsLowStock);
}
