using Roadcue.Application.Locations;

namespace Roadcue.Application.Trips;

public sealed record TripDestinationDto(
    string Name,
    double Latitude,
    double Longitude,
    string? Address,
    string? ProviderPlaceId,
    DateTimeOffset SetAt );

public sealed record ActiveTripDto(
    Guid Id,
    Guid DriverId,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset LastChangedAt,
    DateTimeOffset? CompletedAt,
    DateTimeOffset? CancelledAt,
    TripDestinationDto? Destination,
    LocationResult? CurrentLocation );

public interface ITripService
{
    Task<ActiveTripDto?> GetActiveAsync(Guid driverId, CancellationToken cancellationToken = default);
    Task<ActiveTripDto?> EndActiveAsync(Guid driverId, CancellationToken cancellationToken = default);
    Task<ActiveTripDto?> CancelActiveAsync(Guid driverId, CancellationToken cancellationToken = default);
}
