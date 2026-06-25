using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.OrderNumber).IsRequired().HasMaxLength(30);
        builder.HasIndex(p => p.OrderNumber).IsUnique();
        builder.Property(p => p.Status).HasConversion<int>();
        builder.Property(p => p.Notes).HasMaxLength(1000);
        builder.Ignore(p => p.TotalAmount);

        builder.HasOne(p => p.Supplier)
               .WithMany()
               .HasForeignKey(p => p.SupplierId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Warehouse)
               .WithMany()
               .HasForeignKey(p => p.WarehouseId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Lines)
               .WithOne(l => l.PurchaseOrder)
               .HasForeignKey(l => l.PurchaseOrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
