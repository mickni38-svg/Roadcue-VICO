using Roadcue.Domain.Trips;

namespace Roadcue.Application.Destinations;

/// <summary>
/// Persistensport for aktive ture. Ejes af Application-laget, så
/// <see cref="DestinationService"/> forbliver fri af EF Core.
/// Infrastructure leverer EF Core-implementationen.
/// </summary>
public interface IActiveTripRepository
{
    Task<Trip?> GetActiveTripAsync(
        Guid driverId,
        CancellationToken cancellationToken = default );

    Task AddAsync(
        Trip trip,
        CancellationToken cancellationToken = default );

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default );
}
