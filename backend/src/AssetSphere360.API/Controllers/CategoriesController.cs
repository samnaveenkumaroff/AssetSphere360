using AssetSphere360.Application.DTOs.Categories;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize]
public class CategoriesController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var categories = await uow.Repository<Category>().GetAllAsync(ct);
        var products = await uow.Repository<Product>().GetAllAsync(ct);

        var dtos = categories.Select(c => new CategoryDto(
            c.Id, c.Name, c.Description, c.ParentCategoryId,
            c.ParentCategory?.Name,
            products.Count(p => p.CategoryId == c.Id)
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var category = await uow.Repository<Category>().GetByIdAsync(id, ct);
        if (category is null) return NotFound(new { message = $"Category {id} not found." });

        var products = await uow.Repository<Product>().FindAsync(p => p.CategoryId == id, ct);
        return Ok(new CategoryDto(
            category.Id, category.Name, category.Description,
            category.ParentCategoryId, category.ParentCategory?.Name, products.Count));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        var category = Category.Create(request.Name, request.Description, request.ParentCategoryId);
        await uow.Repository<Category>().AddAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = category.Id },
            new CategoryDto(category.Id, category.Name, category.Description, category.ParentCategoryId, null, 0));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await uow.Repository<Category>().GetByIdAsync(id, ct);
        if (category is null) return NotFound(new { message = $"Category {id} not found." });

        category.Update(request.Name, request.Description);
        await uow.Repository<Category>().UpdateAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return Ok(new CategoryDto(category.Id, category.Name, category.Description, category.ParentCategoryId, null, 0));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var category = await uow.Repository<Category>().GetByIdAsync(id, ct);
        if (category is null) return NotFound(new { message = $"Category {id} not found." });

        var hasProducts = await uow.Repository<Product>().ExistsAsync(p => p.CategoryId == id, ct);
        if (hasProducts)
            return BadRequest(new { message = "Cannot delete category with existing products." });

        category.SoftDelete("system");
        await uow.Repository<Category>().UpdateAsync(category, ct);
        await uow.SaveChangesAsync(ct);

        return NoContent();
    }
}
