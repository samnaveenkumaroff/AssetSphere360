using System.Text;
using AssetSphere360.API.Middleware;
using AssetSphere360.Application;
using AssetSphere360.Infrastructure;
using AssetSphere360.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var jwtKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey not configured.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidIssuer              = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience         = true,
        ValidAudience            = builder.Configuration["JwtSettings:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime         = true,
        ClockSkew                = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly",  p => p.RequireRole("Admin"));
    options.AddPolicy("ManagerUp", p => p.RequireRole("Admin", "Manager"));
    options.AddPolicy("StaffUp",   p => p.RequireRole("Admin", "Manager", "Staff"));
});

builder.Services.AddCors(options =>
    options.AddPolicy("AssetSpherePolicy", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()));

var app = builder.Build();

app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "AssetSphere 360 API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AssetSpherePolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    foreach (var role in new[] { "Admin", "Manager", "Staff" })
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
}

app.Run();
