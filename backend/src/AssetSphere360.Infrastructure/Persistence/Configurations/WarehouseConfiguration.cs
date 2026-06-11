using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Name).IsRequired().HasMaxLength(200);
        builder.Property(w => w.Code).IsRequired().HasMaxLength(20);
        builder.HasIndex(w => w.Code).IsUnique();

        builder.OwnsOne(w => w.Address, a =>
        {
            a.Property(x => x.Line1).HasColumnName("AddressLine1").HasMaxLength(200);
            a.Property(x => x.Line2).HasColumnName("AddressLine2").HasMaxLength(200);
            a.Property(x => x.City).HasColumnName("City").HasMaxLength(100);
            a.Property(x => x.State).HasColumnName("State").HasMaxLength(100);
            a.Property(x => x.PostalCode).HasColumnName("PostalCode").HasMaxLength(10);
            a.Property(x => x.Country).HasColumnName("Country").HasMaxLength(100);
        });
    }
}
