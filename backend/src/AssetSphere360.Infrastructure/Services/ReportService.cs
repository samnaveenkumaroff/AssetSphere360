using AssetSphere360.Application.DTOs.Reports;
using AssetSphere360.Application.Interfaces;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AssetSphere360.Infrastructure.Services;

public class ReportService : IReportService
{
    private const string BrandName = "AssetSphere 360";
    private static readonly XLColor BrandColor = XLColor.FromHtml("#1976D2");
    private static readonly XLColor StockInColor = XLColor.FromHtml("#C8E6C9");      // light green
    private static readonly XLColor StockOutColor = XLColor.FromHtml("#FFCDD2");     // light red
    private static readonly XLColor AdjustmentColor = XLColor.FromHtml("#FFF9C4");   // light yellow
    private static readonly XLColor TransferColor = XLColor.FromHtml("#BBDEFB");     // light blue
    private static readonly XLColor ReturnColor = XLColor.FromHtml("#D1C4E9");       // light purple
    private static readonly XLColor LowStockColor = XLColor.FromHtml("#EF5350");     // strong red
    private static readonly XLColor LowStockFontColor = XLColor.White;

    static ReportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] ExportProductsToExcel(IEnumerable<ProductReportRow> products)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Products");

        // ── Branded title row ──
        sheet.Cell(1, 1).Value = $"{BrandName} — Product Inventory Report";
        sheet.Range(1, 1, 1, 10).Merge();
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 16;
        sheet.Cell(1, 1).Style.Font.FontColor = XLColor.White;
        sheet.Cell(1, 1).Style.Fill.BackgroundColor = BrandColor;
        sheet.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        sheet.Row(1).Height = 28;

        sheet.Cell(2, 1).Value = $"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
        sheet.Range(2, 1, 2, 10).Merge();
        sheet.Cell(2, 1).Style.Font.Italic = true;
        sheet.Cell(2, 1).Style.Font.FontSize = 9;
        sheet.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // ── Header row (row 4) ──
        const int headerRow = 4;
        string[] headers = ["SKU", "Name", "Category", "Supplier", "Cost", "Selling Price", "Stock", "Unit", "Reorder Level", "Status"];
        for (var i = 0; i < headers.Length; i++)
            sheet.Cell(headerRow, i + 1).Value = headers[i];

        var headerRowRange = sheet.Row(headerRow);
        headerRowRange.Style.Font.Bold = true;
        headerRowRange.Style.Fill.BackgroundColor = XLColor.LightGray;

        var row = headerRow + 1;
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

            if (p.IsLowStock)
            {
                var dataRow = sheet.Range(row, 1, row, 10);
                dataRow.Style.Fill.BackgroundColor = LowStockColor;
                dataRow.Style.Font.FontColor = LowStockFontColor;
                dataRow.Style.Font.Bold = true;
            }

            row++;
        }

        sheet.Columns().AdjustToContents();
        sheet.SheetView.FreezeRows(headerRow);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] ExportStockMovementsToExcel(IEnumerable<StockMovementReportRow> movements)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Stock Movements");

        // ── Branded title row ──
        sheet.Cell(1, 1).Value = $"{BrandName} — Stock Movement Report";
        sheet.Range(1, 1, 1, 9).Merge();
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 16;
        sheet.Cell(1, 1).Style.Font.FontColor = XLColor.White;
        sheet.Cell(1, 1).Style.Fill.BackgroundColor = BrandColor;
        sheet.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        sheet.Row(1).Height = 28;

        sheet.Cell(2, 1).Value = $"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
        sheet.Range(2, 1, 2, 9).Merge();
        sheet.Cell(2, 1).Style.Font.Italic = true;
        sheet.Cell(2, 1).Style.Font.FontSize = 9;
        sheet.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // ── Legend row (row 3) ──
        var legendItems = new[]
        {
            ("StockIn", StockInColor), ("StockOut", StockOutColor),
            ("Adjustment", AdjustmentColor), ("Transfer", TransferColor), ("Return", ReturnColor)
        };
        var legendCol = 1;
        foreach (var (label, color) in legendItems)
        {
            sheet.Cell(3, legendCol).Value = label;
            sheet.Cell(3, legendCol).Style.Fill.BackgroundColor = color;
            sheet.Cell(3, legendCol).Style.Font.FontSize = 8;
            sheet.Cell(3, legendCol).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            legendCol++;
        }

        // ── Header row (row 5) ──
        const int headerRow = 5;
        string[] headers = ["Date", "Product", "SKU", "Warehouse", "Type", "Quantity", "Unit Cost", "Reference", "Notes"];
        for (var i = 0; i < headers.Length; i++)
            sheet.Cell(headerRow, i + 1).Value = headers[i];

        var headerRowRange = sheet.Row(headerRow);
        headerRowRange.Style.Font.Bold = true;
        headerRowRange.Style.Fill.BackgroundColor = XLColor.LightGray;

        var row = headerRow + 1;
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

            var rowColor = m.MovementType switch
            {
                "StockIn" => StockInColor,
                "StockOut" => StockOutColor,
                "Adjustment" => AdjustmentColor,
                "Transfer" => TransferColor,
                "Return" => ReturnColor,
                _ => (XLColor?)null
            };

            if (rowColor is not null)
                sheet.Range(row, 1, row, 9).Style.Fill.BackgroundColor = rowColor;

            row++;
        }

        sheet.Columns().AdjustToContents();
        sheet.SheetView.FreezeRows(headerRow);

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

                page.Header().Column(col =>
                {
                    col.Item().Background("#1976D2").Padding(12).Row(row =>
                    {
                        row.RelativeItem().Text(t =>
                        {
                            t.Span(BrandName).FontSize(18).Bold().FontColor(Colors.White);
                            t.Span(" — Product Inventory Report").FontSize(14).FontColor(Colors.White);
                        });
                    });
                    col.Item().PaddingTop(4).Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC")
                        .FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
                });

                page.Content().PaddingTop(10).Table(table =>
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
                        var bg = p.IsLowStock ? Color.FromHex("#EF5350") : Colors.White;
                        var fontColor = p.IsLowStock ? Colors.White : Colors.Black;

                        table.Cell().Background(bg).Padding(4).Text(p.SKU).FontColor(fontColor);
                        table.Cell().Background(bg).Padding(4).Text(p.Name).FontColor(fontColor);
                        table.Cell().Background(bg).Padding(4).Text(p.CategoryName).FontColor(fontColor);
                        table.Cell().Background(bg).Padding(4).Text($"₹{p.CostAmount:N2}").FontColor(fontColor);
                        table.Cell().Background(bg).Padding(4).Text($"₹{p.SellingAmount:N2}").FontColor(fontColor);
                        table.Cell().Background(bg).Padding(4).Text(p.CurrentStock.ToString("N0")).FontColor(fontColor);

                        var statusCell = table.Cell().Background(bg).Padding(4).Text(p.IsLowStock ? "LOW STOCK" : "OK");
                        if (p.IsLowStock)
                            statusCell.FontColor(fontColor).Bold();
                        else
                            statusCell.FontColor(fontColor);
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span($"{BrandName} — Generated on ").FontSize(8);
                    text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm UTC")).FontSize(8);
                });
            });
        });

        return document.GeneratePdf();
    }
}
