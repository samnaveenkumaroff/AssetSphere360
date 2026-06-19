using System.Linq.Expressions;
using AssetSphere360.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssetSphere360.Infrastructure.Persistence.Repositories;

public class Repository<T>(AssetSphereDbContext context) : IRepository<T> where T : class
{
    protected readonly AssetSphereDbContext _context = context;
    protected readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var idProperty = typeof(T).GetProperty("Id");
        if (idProperty is null) return await _dbSet.FindAsync([id], ct);

        var query = ApplyIncludes(_dbSet.AsQueryable());
        return await query.FirstOrDefaultAsync(
            e => EF.Property<Guid>(e!, "Id") == id, ct);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default)
        => await ApplyIncludes(_dbSet.AsNoTracking()).ToListAsync(ct);

    public async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await ApplyIncludes(_dbSet.AsNoTracking()).Where(predicate).ToListAsync(ct);

    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entity, ct);
        return entity;
    }

    public Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity, CancellationToken ct = default)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await _dbSet.AnyAsync(predicate, ct);

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default)
        => predicate is null
            ? await _dbSet.CountAsync(ct)
            : await _dbSet.CountAsync(predicate, ct);

    private static IQueryable<T> ApplyIncludes(IQueryable<T> query)
    {
        if (typeof(T) == typeof(AssetSphere360.Domain.Entities.Product))
        {
            var q = (IQueryable<AssetSphere360.Domain.Entities.Product>)query;
            q = q.Include(p => p.Category).Include(p => p.Supplier);
            return (IQueryable<T>)q;
        }

        if (typeof(T) == typeof(AssetSphere360.Domain.Entities.StockMovement))
        {
            var q = (IQueryable<AssetSphere360.Domain.Entities.StockMovement>)query;
            q = q.Include(m => m.Product).Include(m => m.Warehouse);
            return (IQueryable<T>)q;
        }

        if (typeof(T) == typeof(AssetSphere360.Domain.Entities.Category))
        {
            var q = (IQueryable<AssetSphere360.Domain.Entities.Category>)query;
            q = q.Include(c => c.ParentCategory);
            return (IQueryable<T>)q;
        }

        return query;
    }
}
