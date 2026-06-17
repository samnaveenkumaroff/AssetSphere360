using AssetSphere360.Application.DTOs.Suppliers;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Interfaces;
using AssetSphere360.Domain.ValueObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
[Authorize]
public class SuppliersController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var suppliers = await uow.Repository<Supplier>().GetAllAsync(ct);
        var products = await uow.Repository<Product>().GetAllAsync(ct);

        var dtos = suppliers.Select(s => new SupplierDto(
            s.Id, s.Name, s.ContactPerson, s.Email, s.Phone,
            s.GstNumber, s.IsActive,
            products.Count(p => p.SupplierId == s.Id)
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var supplier = await uow.Repository<Supplier>().GetByIdAsync(id, ct);
        if (supplier is null) return NotFound(new { message = $"Supplier {id} not found." });

        var products = await uow.Repository<Product>().FindAsync(p => p.SupplierId == id, ct);
        return Ok(new SupplierDto(
            supplier.Id, supplier.Name, supplier.ContactPerson, supplier.Email,
            supplier.Phone, supplier.GstNumber, supplier.IsActive, products.Count));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateSupplierRequest request, CancellationToken ct)
    {
        var address = request.AddressLine1 is not null
            ? new Address(request.AddressLine1, "", request.City ?? "", request.State ?? "", request.PostalCode ?? "")
            : null;

        var supplier = Supplier.Create(
            request.Name, request.ContactPerson, request.Email, request.Phone,
            address, request.GstNumber);

        await uow.Repository<Supplier>().AddAsync(supplier, ct);
        await uow.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = supplier.Id },
            new SupplierDto(supplier.Id, supplier.Name, supplier.ContactPerson, supplier.Email,
                supplier.Phone, supplier.GstNumber, supplier.IsActive, 0));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var supplier = await uow.Repository<Supplier>().GetByIdAsync(id, ct);
        if (supplier is null) return NotFound(new { message = $"Supplier {id} not found." });

        supplier.SoftDelete("system");
        await uow.Repository<Supplier>().UpdateAsync(supplier, ct);
        await uow.SaveChangesAsync(ct);

        return NoContent();
    }
}
