using AssetSphere360.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AssetSphere360.Infrastructure.Persistence.Configurations;

public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Quantity).HasPrecision(18, 4).IsRequired();
        builder.Property(s => s.UnitCost).HasPrecision(18, 4).IsRequired();
        builder.Property(s => s.MovementType).HasConversion<int>();
        builder.Property(s => s.ReferenceNumber).HasMaxLength(100);
        builder.Property(s => s.Notes).HasMaxLength(500);

        builder.HasOne(s => s.Product)
               .WithMany(p => p.StockMovements)
               .HasForeignKey(s => s.ProductId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Warehouse)
               .WithMany(w => w.StockMovements)
               .HasForeignKey(s => s.WarehouseId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
