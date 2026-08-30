using Microsoft.EntityFrameworkCore;
using Roadcue.Application.Locations;
using Roadcue.Domain.Drivers;

namespace Roadcue.Infrastructure.Persistence;

public sealed class DriverLocationRepository : IDriverLocationRepository
{
    private readonly RoadcueDbContext _db;

    public DriverLocationRepository( RoadcueDbContext db )
    {
        _db = db;
    }

    public async Task AddAsync(
        DriverLocation location,
        CancellationToken cancellationToken = default )
    {
        _db.DriverLocations.Add( location );
        await _db.SaveChangesAsync( cancellationToken );
    }

    public Task<DriverLocation?> GetLatestAsync(
        Guid driverId,
        CancellationToken cancellationToken = default )
    {
        return _db.DriverLocations
            .AsNoTracking()
            .Where( x => x.DriverId == driverId )
            .OrderByDescending( x => x.RecordedAt )
            .FirstOrDefaultAsync( cancellationToken );
    }
}
