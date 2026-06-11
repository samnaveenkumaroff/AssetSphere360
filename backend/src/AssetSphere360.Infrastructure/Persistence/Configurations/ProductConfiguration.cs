using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.SKU).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => p.SKU).IsUnique();
        builder.Property(p => p.Barcode).HasMaxLength(100);
        builder.Property(p => p.Description).HasMaxLength(1000);

        // Money value object → owned entity (maps to columns in same table)
        builder.OwnsOne(p => p.CostPrice, m =>
        {
            m.Property(x => x.Amount).HasColumnName("CostAmount").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("CostCurrency").HasMaxLength(3);
        });
        builder.OwnsOne(p => p.SellingPrice, m =>
        {
            m.Property(x => x.Amount).HasColumnName("SellingAmount").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("SellingCurrency").HasMaxLength(3);
        });

        builder.Property(p => p.Unit).HasConversion<int>();
        builder.Property(p => p.ReorderLevel).HasPrecision(18, 4);
        builder.Property(p => p.CurrentStock).HasPrecision(18, 4);

        builder.HasOne(p => p.Category)
               .WithMany(c => c.Products)
               .HasForeignKey(p => p.CategoryId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Supplier)
               .WithMany(s => s.Products)
               .HasForeignKey(p => p.SupplierId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
