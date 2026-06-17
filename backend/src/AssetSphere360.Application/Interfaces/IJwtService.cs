namespace AssetSphere360.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(Guid userId, string email, string firstName, string lastName, IList<string> roles);
    string GenerateRefreshToken();
    (string userId, string email) ValidateExpiredToken(string token);
}
