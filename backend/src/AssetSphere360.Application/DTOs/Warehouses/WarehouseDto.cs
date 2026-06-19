namespace AssetSphere360.Application.DTOs.Warehouses;

public record WarehouseDto(Guid Id, string Name, string Code, bool IsActive);
public record CreateWarehouseRequest(string Name, string Code);
