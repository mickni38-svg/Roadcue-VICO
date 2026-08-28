using Microsoft.EntityFrameworkCore;
using Roadcue.Application.Destinations;
using Roadcue.Domain.Trips;

namespace Roadcue.Infrastructure.Persistence;

public sealed class ActiveTripRepository : IActiveTripRepository
{
    private readonly RoadcueDbContext _db;

    public ActiveTripRepository( RoadcueDbContext db )
    {
        _db = db;
    }

    public Task<Trip?> GetActiveTripAsync(
        Guid driverId,
        CancellationToken cancellationToken = default )
    {
        return _db.Trips
            .Where( t => t.DriverId == driverId && t.Status == TripStatus.Active )
            .OrderByDescending( t => t.StartedAt )
            .FirstOrDefaultAsync( cancellationToken );
    }

    public async Task AddAsync( Trip trip, CancellationToken cancellationToken = default )
    {
        await _db.Trips.AddAsync( trip, cancellationToken );
    }

    public Task SaveChangesAsync( CancellationToken cancellationToken = default )
    {
        return _db.SaveChangesAsync( cancellationToken );
    }
}
