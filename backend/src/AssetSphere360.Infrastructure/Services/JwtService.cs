using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AssetSphere360.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AssetSphere360.Infrastructure.Services;

public class JwtService(IConfiguration configuration) : IJwtService
{
    private readonly string _secretKey = configuration["JwtSettings:SecretKey"]
        ?? throw new InvalidOperationException("JwtSettings:SecretKey not configured.");
    private readonly string _issuer    = configuration["JwtSettings:Issuer"]   ?? "AssetSphere360.API";
    private readonly string _audience  = configuration["JwtSettings:Audience"] ?? "AssetSphere360.Client";
    private readonly int _expiryMinutes = int.Parse(configuration["JwtSettings:ExpiryMinutes"] ?? "60");

    public string GenerateAccessToken(Guid userId, string email, string firstName, string lastName, IList<string> roles)
    {
        var key         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email,          email),
            new(ClaimTypes.GivenName,      firstName),
            new(ClaimTypes.Surname,        lastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer:            _issuer,
            audience:          _audience,
            claims:            claims,
            expires:           DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public (string userId, string email) ValidateExpiredToken(string token)
    {
        var key        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var handler    = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,  ValidIssuer           = _issuer,
            ValidateAudience         = true,  ValidAudience         = _audience,
            ValidateIssuerSigningKey = true,  IssuerSigningKey      = key,
            ValidateLifetime         = false
        };

        var principal = handler.ValidateToken(token, parameters, out _);
        var userId    = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? throw new SecurityTokenException("Missing user ID.");
        var email     = principal.FindFirstValue(ClaimTypes.Email)
                        ?? throw new SecurityTokenException("Missing email.");
        return (userId, email);
    }
}
