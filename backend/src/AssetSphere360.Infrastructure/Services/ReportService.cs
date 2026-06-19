using AssetSphere360.Application.DTOs.Reports;
using AssetSphere360.Application.Interfaces;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AssetSphere360.Infrastructure.Services;

public class ReportService : IReportService
{
    static ReportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] ExportProductsToExcel(IEnumerable<ProductReportRow> products)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Products");

        string[] headers = ["SKU", "Name", "Category", "Supplier", "Cost", "Selling Price", "Stock", "Unit", "Reorder Level", "Status"];
        for (var i = 0; i < headers.Length; i++)
            sheet.Cell(1, i + 1).Value = headers[i];

        var headerRow = sheet.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

        var row = 2;
        foreach (var p in products)
        {
            sheet.Cell(row, 1).Value = p.SKU;
            sheet.Cell(row, 2).Value = p.Name;
            sheet.Cell(row, 3).Value = p.CategoryName;
            sheet.Cell(row, 4).Value = p.SupplierName ?? "—";
            sheet.Cell(row, 5).Value = p.CostAmount;
            sheet.Cell(row, 6).Value = p.SellingAmount;
            sheet.Cell(row, 7).Value = p.CurrentStock;
            sheet.Cell(row, 8).Value = p.Unit;
            sheet.Cell(row, 9).Value = p.ReorderLevel;
            sheet.Cell(row, 10).Value = p.IsLowStock ? "Low Stock" : "OK";
            row++;
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportStockMovementsToExcel(IEnumerable<StockMovementReportRow> movements)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Stock Movements");

        string[] headers = ["Date", "Product", "SKU", "Warehouse", "Type", "Quantity", "Unit Cost", "Reference", "Notes"];
        for (var i = 0; i < headers.Length; i++)
            sheet.Cell(1, i + 1).Value = headers[i];

        var headerRow = sheet.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

        var row = 2;
        foreach (var m in movements)
        {
            sheet.Cell(row, 1).Value = m.MovementDate;
            sheet.Cell(row, 2).Value = m.ProductName;
            sheet.Cell(row, 3).Value = m.ProductSku;
            sheet.Cell(row, 4).Value = m.WarehouseName;
            sheet.Cell(row, 5).Value = m.MovementType;
            sheet.Cell(row, 6).Value = m.Quantity;
            sheet.Cell(row, 7).Value = m.UnitCost;
            sheet.Cell(row, 8).Value = m.ReferenceNumber ?? "—";
            sheet.Cell(row, 9).Value = m.Notes ?? "—";
            row++;
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportProductsToPdf(IEnumerable<ProductReportRow> products)
    {
        var productList = products.ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header()
                    .Text("AssetSphere 360 — Product Inventory Report")
                    .FontSize(16).Bold();

                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    table.Header(header =>
                    {
                        foreach (var title in new[] { "SKU", "Name", "Category", "Cost", "Price", "Stock", "Status" })
                        {
                            header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text(title).Bold();
                        }
                    });

                    foreach (var p in productList)
                    {
                        table.Cell().Padding(4).Text(p.SKU);
                        table.Cell().Padding(4).Text(p.Name);
                        table.Cell().Padding(4).Text(p.CategoryName);
                        table.Cell().Padding(4).Text($"₹{p.CostAmount:N2}");
                        table.Cell().Padding(4).Text($"₹{p.SellingAmount:N2}");
                        table.Cell().Padding(4).Text(p.CurrentStock.ToString("N0"));
                        table.Cell().Padding(4).Text(p.IsLowStock ? "Low Stock" : "OK");
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Generated on ").FontSize(8);
                    text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC")).FontSize(8);
                });
            });
        });

        return document.GeneratePdf();
    }
}
