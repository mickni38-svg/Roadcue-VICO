using Roadcue.Application.Destinations;
using Roadcue.Application.Locations;
using Roadcue.Domain.Trips;

namespace Roadcue.Application.Trips;

public sealed class TripService : ITripService
{
    private readonly IActiveTripRepository _trips;
    private readonly ILocationService _locations;
    private readonly TimeProvider _clock;

    public TripService(IActiveTripRepository trips, ILocationService locations, TimeProvider clock)
    {
        _trips = trips;
        _locations = locations;
        _clock = clock;
    }

    public async Task<ActiveTripDto?> GetActiveAsync(Guid driverId, CancellationToken cancellationToken = default)
    {
        var trip = await _trips.GetActiveTripAsync(driverId, cancellationToken);
        return trip is null ? null : await ToDtoAsync(trip, cancellationToken);
    }

    public Task<ActiveTripDto?> EndActiveAsync(Guid driverId, CancellationToken cancellationToken = default) =>
        CloseAsync(driverId, TripStatus.Ended, cancellationToken);

    public Task<ActiveTripDto?> CancelActiveAsync(Guid driverId, CancellationToken cancellationToken = default) =>
        CloseAsync(driverId, TripStatus.Cancelled, cancellationToken);

    private async Task<ActiveTripDto?> CloseAsync(Guid driverId, TripStatus status, CancellationToken cancellationToken)
    {
        var trip = await _trips.GetActiveTripAsync(driverId, cancellationToken);
        if (trip is null) return null;

        var now = _clock.GetUtcNow().UtcDateTime;
        trip.Status = status;
        trip.LastChangedAt = now;
        if (status == TripStatus.Ended) trip.CompletedAt = now;
        if (status == TripStatus.Cancelled) trip.CancelledAt = now;
        await _trips.SaveChangesAsync(cancellationToken);
        return await ToDtoAsync(trip, cancellationToken);
    }

    private async Task<ActiveTripDto> ToDtoAsync(Trip trip, CancellationToken cancellationToken)
    {
        var location = await _locations.GetCurrentAsync(trip.DriverId, cancellationToken);
        var destination = trip.Destination is null ? null : new TripDestinationDto(
            trip.Destination.Name,
            trip.Destination.Latitude,
            trip.Destination.Longitude,
            trip.Destination.Address,
            trip.Destination.ProviderPlaceId,
            Utc(trip.Destination.SetAt));

        return new ActiveTripDto(
            trip.Id,
            trip.DriverId,
            trip.Status.ToString().ToLowerInvariant(),
            Utc(trip.StartedAt),
            Utc(trip.LastChangedAt),
            trip.CompletedAt.HasValue ? Utc(trip.CompletedAt.Value) : null,
            trip.CancelledAt.HasValue ? Utc(trip.CancelledAt.Value) : null,
            destination,
            location);
    }

    private static DateTimeOffset Utc(DateTime value) =>
        new(DateTime.SpecifyKind(value, DateTimeKind.Utc));
}
