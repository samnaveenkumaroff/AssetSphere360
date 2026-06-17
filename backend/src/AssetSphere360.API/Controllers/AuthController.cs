using AssetSphere360.Application.DTOs.Auth;
using AssetSphere360.Application.Interfaces;
using AssetSphere360.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AssetSphere360.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController(
    UserManager<AppUser>   userManager,
    SignInManager<AppUser> signInManager,
    IJwtService            jwtService) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await userManager.FindByEmailAsync(request.Email) is not null)
            return BadRequest(new { message = "Email already registered." });

        var user = new AppUser
        {
            FirstName = request.FirstName,
            LastName  = request.LastName,
            Email     = request.Email,
            UserName  = request.Email
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        var role = request.Role is "Admin" or "Manager" or "Staff" ? request.Role : "Staff";
        await userManager.AddToRoleAsync(user, role);

        var roles       = await userManager.GetRolesAsync(user);
        var accessToken = jwtService.GenerateAccessToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.RefreshToken       = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        return CreatedAtAction(nameof(Register), new AuthResponse(
            accessToken, refreshToken, DateTime.UtcNow.AddHours(1),
            user.Id.ToString(), user.Email!, user.FullName, roles));
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            return Unauthorized(new { message = "Invalid credentials." });

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return result.IsLockedOut
                ? Unauthorized(new { message = "Account locked. Try again in 15 minutes." })
                : Unauthorized(new { message = "Invalid credentials." });

        var roles        = await userManager.GetRolesAsync(user);
        var accessToken  = jwtService.GenerateAccessToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.RefreshToken       = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.LastLoginAt        = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        return Ok(new AuthResponse(
            accessToken, refreshToken, DateTime.UtcNow.AddHours(1),
            user.Id.ToString(), user.Email!, user.FullName, roles));
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        var (userId, _) = jwtService.ValidateExpiredToken(request.AccessToken);
        var user = await userManager.FindByIdAsync(userId);

        if (user is null
            || user.RefreshToken       != request.RefreshToken
            || user.RefreshTokenExpiry <= DateTime.UtcNow)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        var roles        = await userManager.GetRolesAsync(user);
        var accessToken  = jwtService.GenerateAccessToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.RefreshToken       = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        return Ok(new AuthResponse(
            accessToken, refreshToken, DateTime.UtcNow.AddHours(1),
            user.Id.ToString(), user.Email!, user.FullName, roles));
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId is not null)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user is not null)
            {
                user.RefreshToken       = null;
                user.RefreshTokenExpiry = null;
                await userManager.UpdateAsync(user);
            }
        }
        return NoContent();
    }
}
