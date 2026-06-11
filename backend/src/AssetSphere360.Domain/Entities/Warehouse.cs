using AssetSphere360.Domain.Common;
using AssetSphere360.Domain.ValueObjects;

namespace AssetSphere360.Domain.Entities;

public class Warehouse : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Code { get; private set; } = string.Empty;
    public Address? Address { get; private set; }
    public bool IsActive { get; private set; } = true;
    public ICollection<StockMovement> StockMovements { get; private set; } = [];

    private Warehouse() { }

    public static Warehouse Create(string name, string code, Address? address = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        return new Warehouse
        {
            Name = name.Trim(),
            Code = code.Trim().ToUpperInvariant(),
            Address = address
        };
    }
}
