using AssetSphere360.Application.DTOs.Reports;

namespace AssetSphere360.Application.Interfaces;

public interface IReportService
{
    byte[] ExportProductsToExcel(IEnumerable<ProductReportRow> products);
    byte[] ExportStockMovementsToExcel(IEnumerable<StockMovementReportRow> movements);
    byte[] ExportProductsToPdf(IEnumerable<ProductReportRow> products);
}
