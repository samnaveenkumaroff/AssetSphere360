using AssetSphere360.Application.DTOs.Auth;
using FluentValidation;

namespace AssetSphere360.Application.Validators;

public class RegisterValidator : AbstractValidator<RegisterRequest>
{
    private static readonly string[] ValidRoles = ["Admin", "Manager", "Staff"];

    public RegisterValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain a lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain a digit.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain a special character.");

        RuleFor(x => x.Role)
            .Must(r => ValidRoles.Contains(r))
            .WithMessage("Role must be Admin, Manager, or Staff.");
    }
}
