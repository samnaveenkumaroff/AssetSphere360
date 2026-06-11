using AssetSphere360.Domain.Common;

namespace AssetSphere360.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? ParentCategoryId { get; private set; }
    public Category? ParentCategory { get; private set; }
    public ICollection<Category> SubCategories { get; private set; } = [];
    public ICollection<Product> Products { get; private set; } = [];

    private Category() { }

    public static Category Create(string name, string? description = null, Guid? parentCategoryId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        return new Category
        {
            Name = name.Trim(),
            Description = description?.Trim(),
            ParentCategoryId = parentCategoryId
        };
    }

    public void Update(string name, string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name.Trim();
        Description = description?.Trim();
    }
}
