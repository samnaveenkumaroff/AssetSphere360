namespace AssetSphere360.Domain.ValueObjects;

public record Money(decimal Amount, string Currency = "INR")
{
    public static Money Zero(string currency = "INR") => new(0, currency);

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot add {Currency} and {other.Currency}");
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Multiply(decimal factor) => new(Amount * factor, Currency);

    public override string ToString() => $"{Currency} {Amount:N2}";
}
