using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.OrderNumber).IsRequired().HasMaxLength(30);
        builder.HasIndex(s => s.OrderNumber).IsUnique();
        builder.Property(s => s.CustomerName).IsRequired().HasMaxLength(200);
        builder.Property(s => s.CustomerEmail).HasMaxLength(150);
        builder.Property(s => s.CustomerPhone).HasMaxLength(20);
        builder.Property(s => s.Status).HasConversion<int>();
        builder.Property(s => s.Notes).HasMaxLength(1000);
        builder.Ignore(s => s.TotalAmount);

        builder.HasOne(s => s.Warehouse)
               .WithMany()
               .HasForeignKey(s => s.WarehouseId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(s => s.Lines)
               .WithOne(l => l.SalesOrder)
               .HasForeignKey(l => l.SalesOrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
