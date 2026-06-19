using AssetSphere360.Application.DTOs.Warehouses;
using AssetSphere360.Domain.Entities;
using AssetSphere360.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class WarehousesController(IUnitOfWork uow) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var warehouses = await uow.Repository<Warehouse>().GetAllAsync(ct);
        return Ok(warehouses.Select(w => new WarehouseDto(w.Id, w.Name, w.Code, w.IsActive)));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseRequest request, CancellationToken ct)
    {
        var warehouse = Warehouse.Create(request.Name, request.Code);
        await uow.Repository<Warehouse>().AddAsync(warehouse, ct);
        await uow.SaveChangesAsync(ct);
        return Ok(new WarehouseDto(warehouse.Id, warehouse.Name, warehouse.Code, true));
    }
}
