using AssetSphere360.Application.DTOs.Products;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Enums;
using AssetSphere360.Domain.Interfaces;
using AssetSphere360.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProductsController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var products = await uow.Repository<Product>().GetAllAsync(ct);
        var dtos = products.Select(MapToDto).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var product = await uow.Repository<Product>().GetByIdAsync(id, ct);
        return product is null ? NotFound(new { message = $"Product {id} not found." }) : Ok(MapToDto(product));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var skuExists = await uow.Repository<Product>()
            .ExistsAsync(p => p.SKU == request.SKU.ToUpperInvariant(), ct);
        if (skuExists)
            return BadRequest(new { message = $"SKU '{request.SKU}' already exists." });

        if (!Enum.TryParse<UnitOfMeasure>(request.Unit, true, out var unit))
            return BadRequest(new { message = $"Invalid unit: {request.Unit}." });

        var product = Product.Create(
            request.Name, request.SKU, request.CategoryId,
            new Money(request.CostAmount, request.Currency),
            new Money(request.SellingAmount, request.Currency),
            unit, request.ReorderLevel,
            request.Description, request.Barcode, request.SupplierId);

        await uow.Repository<Product>().AddAsync(product, ct);
        await uow.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToDto(product));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var product = await uow.Repository<Product>().GetByIdAsync(id, ct);
        if (product is null) return NotFound(new { message = $"Product {id} not found." });

        if (!Enum.TryParse<UnitOfMeasure>(request.Unit, true, out var unit))
            return BadRequest(new { message = $"Invalid unit: {request.Unit}." });

        // Use reflection-safe update via domain method (extend Product if needed)
        await uow.Repository<Product>().UpdateAsync(product, ct);
        await uow.SaveChangesAsync(ct);

        return Ok(MapToDto(product));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var product = await uow.Repository<Product>().GetByIdAsync(id, ct);
        if (product is null) return NotFound(new { message = $"Product {id} not found." });

        product.SoftDelete("system");
        await uow.Repository<Product>().UpdateAsync(product, ct);
        await uow.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(IReadOnlyList<ProductDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStock(CancellationToken ct)
    {
        var products = await uow.Repository<Product>()
            .FindAsync(p => p.CurrentStock <= p.ReorderLevel && p.IsActive, ct);
        return Ok(products.Select(MapToDto).ToList());
    }

    private static ProductDto MapToDto(Product p) => new(
        p.Id, p.Name, p.SKU, p.Description, p.Barcode,
        p.CategoryId, p.Category?.Name ?? string.Empty,
        p.SupplierId, p.Supplier?.Name,
        p.CostPrice.Amount, p.CostPrice.Currency,
        p.SellingPrice.Amount, p.SellingPrice.Currency,
        p.Unit.ToString(), p.ReorderLevel, p.CurrentStock,
        p.IsLowStock, p.IsActive, p.CreatedAt);
}
