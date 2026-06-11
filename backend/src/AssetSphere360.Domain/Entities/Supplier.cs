using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.ValueObjects;

namespace AssetSphere360.Domain.Entities;

public class Supplier : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string ContactPerson { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public Address? Address { get; private set; }
    public string? GstNumber { get; private set; }
    public bool IsActive { get; private set; } = true;
    public ICollection<Product> Products { get; private set; } = [];

    private Supplier() { }

    public static Supplier Create(
        string name, string contactPerson,
        string email, string phone,
        Address? address = null, string? gstNumber = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        return new Supplier
        {
            Name = name.Trim(),
            ContactPerson = contactPerson.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Phone = phone.Trim(),
            Address = address,
            GstNumber = gstNumber?.Trim()
        };
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
