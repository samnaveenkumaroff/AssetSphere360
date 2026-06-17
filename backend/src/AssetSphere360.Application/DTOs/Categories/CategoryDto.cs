namespace AssetSphere360.Application.DTOs.Categories;

public record CategoryDto(
    Guid Id,
    string Name,
    string? Description,
    Guid? ParentCategoryId,
    string? ParentCategoryName,
    int ProductCount);

public record CreateCategoryRequest(string Name, string? Description = null, Guid? ParentCategoryId = null);
public record UpdateCategoryRequest(string Name, string? Description = null, Guid? ParentCategoryId = null);
