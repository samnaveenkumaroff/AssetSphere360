using AssetSphere360.Application.DTOs.StockMovements;
using FluentValidation;

namespace AssetSphere360.Application.Validators;

public class CreateStockMovementValidator : AbstractValidator<CreateStockMovementRequest>
{
    private static readonly string[] ValidTypes =
        ["StockIn", "StockOut", "Adjustment", "Transfer", "Return"];

    public CreateStockMovementValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero.");
        RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MovementType)
            .Must(t => ValidTypes.Contains(t))
            .WithMessage($"MovementType must be one of: {string.Join(", ", ValidTypes)}");
    }
}
