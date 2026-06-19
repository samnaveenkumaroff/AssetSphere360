using AssetSphere360.Application.Interfaces;
using AssetSphere360.Domain.Interfaces;
using AssetSphere360.Infrastructure.Identity;
using AssetSphere360.Infrastructure.Persistence;
using AssetSphere360.Infrastructure.Persistence.Repositories;
using AssetSphere360.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AssetSphere360.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AssetSphereDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sql => sql.MigrationsAssembly(typeof(AssetSphereDbContext).Assembly.FullName)));

        services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequiredLength        = 8;
            options.Password.RequireDigit          = true;
            options.Password.RequireLowercase      = true;
            options.Password.RequireUppercase      = true;
            options.Password.RequireNonAlphanumeric = true;
            options.User.RequireUniqueEmail        = true;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan  = TimeSpan.FromMinutes(15);
        })
        .AddEntityFrameworkStores<AssetSphereDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IReportService, ReportService>();

        return services;
    }
}
