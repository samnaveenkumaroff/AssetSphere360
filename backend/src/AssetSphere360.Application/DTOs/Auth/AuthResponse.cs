namespace AssetSphere360.Application.DTOs.Auth;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    string UserId,
    string Email,
    string FullName,
    IList<string> Roles);
