using AssetSphere360.Application.DTOs.Suppliers;
using FluentValidation;

namespace AssetSphere360.Application.Validators;

public class CreateSupplierValidator : AbstractValidator<CreateSupplierRequest>
{
    public CreateSupplierValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactPerson).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.GstNumber).MaximumLength(15)
            .Matches(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")
            .When(x => !string.IsNullOrWhiteSpace(x.GstNumber))
            .WithMessage("Invalid GST number format.");
    }
}
