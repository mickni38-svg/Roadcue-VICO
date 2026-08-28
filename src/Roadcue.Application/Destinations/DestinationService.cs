using Roadcue.Domain.Trips;

namespace Roadcue.Application.Destinations;

public sealed class DestinationService : IDestinationService
{
    private readonly IActiveTripRepository _trips;
    private readonly IDestinationGeocoder _geocoder;
    private readonly TimeProvider _clock;

    public DestinationService(
        IActiveTripRepository trips,
        IDestinationGeocoder geocoder,
        TimeProvider clock )
    {
        _trips = trips;
        _geocoder = geocoder;
        _clock = clock;
    }

    public async Task<SetDestinationResult> SetActiveDestinationAsync(
        Guid driverId,
        string query,
        string? countryHint,
        CancellationToken cancellationToken = default )
    {
        if (string.IsNullOrWhiteSpace( query ))
        {
            return new SetDestinationResult(
                SetDestinationStatus.NotFound,
                FailureReason: "empty_query" );
        }

        var request = new GeocodeRequest(
            RawText: query.Trim(),
            CountryHint: countryHint );

        var geo = await _geocoder.GeocodeAsync( request, cancellationToken );

        switch (geo.Outcome)
        {
            case GeocodeOutcome.Ambiguous:
                return new SetDestinationResult(
                    SetDestinationStatus.Ambiguous,
                    Candidates: geo.Candidates!
                        .Select( ToCandidateDto )
                        .ToList() );

            case GeocodeOutcome.NotFound:
                return new SetDestinationResult( SetDestinationStatus.NotFound );

            case GeocodeOutcome.Failed:
                // Gammel destination bevares – vi rører intet i repo.
                return new SetDestinationResult(
                    SetDestinationStatus.ProviderUnavailable,
                    FailureReason: geo.FailureReason );
        }

        var match = geo.Match!;
        var now = _clock.GetUtcNow().UtcDateTime;

        var trip = await _trips.GetActiveTripAsync( driverId, cancellationToken );
        if (trip is null)
        {
            trip = new Trip
            {
                Id = Guid.NewGuid(),
                DriverId = driverId,
                Status = TripStatus.Active,
                StartedAt = now,
                LastChangedAt = now,
            };
            await _trips.AddAsync( trip, cancellationToken );
        }

        trip.Destination = new Destination
        {
            Name = match.Name,
            Latitude = match.Latitude,
            Longitude = match.Longitude,
            Address = match.Address,
            ProviderPlaceId = match.ProviderPlaceId,
            SetAt = now,
        };
        trip.LastChangedAt = now;

        await _trips.SaveChangesAsync( cancellationToken );

        return new SetDestinationResult(
            SetDestinationStatus.Set,
            Destination: ToDto( trip ) );
    }

    public async Task<ActiveDestinationDto?> GetActiveDestinationAsync(
        Guid driverId,
        CancellationToken cancellationToken = default )
    {
        var trip = await _trips.GetActiveTripAsync( driverId, cancellationToken );
        if (trip is null || trip.Destination is null)
        {
            return null;
        }

        return ToDto( trip );
    }

    private static ActiveDestinationDto ToDto( Trip trip )
    {
        var d = trip.Destination!;
        return new ActiveDestinationDto(
            TripId: trip.Id,
            DriverId: trip.DriverId,
            Name: d.Name,
            Latitude: d.Latitude,
            Longitude: d.Longitude,
            Address: d.Address,
            ProviderPlaceId: d.ProviderPlaceId,
            SetAt: d.SetAt );
    }

    private static DestinationCandidateDto ToCandidateDto( GeocodeCandidate c ) =>
        new(
            Name: c.Name,
            Latitude: c.Latitude,
            Longitude: c.Longitude,
            Address: c.Address,
            ProviderPlaceId: c.ProviderPlaceId );
}
