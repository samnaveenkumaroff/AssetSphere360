using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.ContactPerson).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Email).IsRequired().HasMaxLength(150);
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.Phone).IsRequired().HasMaxLength(20);
        builder.Property(s => s.GstNumber).HasMaxLength(15);

        builder.OwnsOne(s => s.Address, a =>
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
