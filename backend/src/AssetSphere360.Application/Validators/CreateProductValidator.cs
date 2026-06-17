using AssetSphere360.Application.DTOs.Products;
using FluentValidation;

namespace AssetSphere360.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required.")
            .MaximumLength(50).WithMessage("SKU cannot exceed 50 characters.")
            .Matches(@"^[A-Z0-9\-]+$").WithMessage("SKU must contain only uppercase letters, numbers, and hyphens.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required.");

        RuleFor(x => x.CostAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Cost price cannot be negative.");

        RuleFor(x => x.SellingAmount)
            .GreaterThan(0).WithMessage("Selling price must be greater than zero.");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Reorder level cannot be negative.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit of measure is required.");
    }
}
