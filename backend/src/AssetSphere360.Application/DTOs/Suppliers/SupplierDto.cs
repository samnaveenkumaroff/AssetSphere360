namespace AssetSphere360.Application.DTOs.Suppliers;

public record SupplierDto(
    Guid Id,
    string Name,
    string ContactPerson,
    string Email,
    string Phone,
    string? GstNumber,
    bool IsActive,
    int ProductCount);

public record CreateSupplierRequest(
    string Name, string ContactPerson, string Email, string Phone,
    string? AddressLine1 = null, string? City = null, string? State = null,
    string? PostalCode = null, string? GstNumber = null);

public record UpdateSupplierRequest(
    string Name, string ContactPerson, string Email, string Phone,
    string? AddressLine1 = null, string? City = null, string? State = null,
    string? PostalCode = null, string? GstNumber = null);
