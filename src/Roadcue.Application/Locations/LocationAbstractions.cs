using Roadcue.Domain.Drivers;

namespace Roadcue.Application.Locations;

public interface IDriverLocationRepository
{
    Task AddAsync( DriverLocation location, CancellationToken cancellationToken = default );

    Task<DriverLocation?> GetLatestAsync( Guid driverId, CancellationToken cancellationToken = default );
}

public interface ILocationService
{
    Task<LocationResult> RegisterAsync(
        Guid driverId,
        RegisterLocationRequest request,
        CancellationToken cancellationToken = default );

    Task<LocationResult?> GetCurrentAsync(
        Guid driverId,
        CancellationToken cancellationToken = default );
}

public interface ICurrentDriverContext
{
    Task<Guid?> GetCurrentDriverIdAsync( CancellationToken cancellationToken = default );
}
