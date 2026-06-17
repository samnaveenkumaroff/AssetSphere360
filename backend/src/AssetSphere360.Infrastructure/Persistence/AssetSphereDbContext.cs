using AssetSphere360.Domain.Entities;
using AssetSphere360.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AssetSphere360.Infrastructure.Persistence;

public class AssetSphereDbContext(DbContextOptions<AssetSphereDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AssetSphereDbContext).Assembly);

        modelBuilder.Entity<AppUser>().ToTable("Users");
        modelBuilder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Supplier>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Warehouse>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => !e.IsDeleted);
    }
}
