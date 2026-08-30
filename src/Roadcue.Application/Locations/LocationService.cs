using Microsoft.Extensions.Options;
using Roadcue.Domain.Drivers;

namespace Roadcue.Application.Locations;

public sealed class LocationService : ILocationService
{
    private readonly IDriverLocationRepository _repository;
    private readonly LocationOptions _options;
    private readonly TimeProvider _timeProvider;

    public LocationService(
        IDriverLocationRepository repository,
        IOptions<LocationOptions> options,
        TimeProvider timeProvider )
    {
        _repository = repository;
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public async Task<LocationResult> RegisterAsync(
        Guid driverId,
        RegisterLocationRequest request,
        CancellationToken cancellationToken = default )
    {
        Validate( request );

        var location = new DriverLocation
        {
            Id = Guid.NewGuid(),
            DriverId = driverId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AccuracyMeters = request.AccuracyMeters,
            SpeedKmh = request.SpeedKmh,
            Heading = request.Heading,
            RecordedAt = request.RecordedAt.UtcDateTime
        };

        await _repository.AddAsync( location, cancellationToken );

        return ToResult( location );
    }

    public async Task<LocationResult?> GetCurrentAsync(
        Guid driverId,
        CancellationToken cancellationToken = default )
    {
        var location = await _repository.GetLatestAsync( driverId, cancellationToken );
        return location is null ? null : ToResult( location );
    }

    private void Validate( RegisterLocationRequest request )
    {
        if (request.Latitude is < -90 or > 90)
            throw new LocationValidationException( "latitude_out_of_range" );

        if (request.Longitude is < -180 or > 180)
            throw new LocationValidationException( "longitude_out_of_range" );

        if (request.RecordedAt.Year < 2020)
            throw new LocationValidationException( "recorded_at_invalid" );

        var now = _timeProvider.GetUtcNow();
        if (request.RecordedAt > now.AddSeconds( _options.FutureTimestampToleranceSeconds ))
            throw new LocationValidationException( "recorded_at_in_future" );

        if (request.AccuracyMeters < 0)
            throw new LocationValidationException( "accuracy_negative" );

        if (request.SpeedKmh < 0)
            throw new LocationValidationException( "speed_negative" );

        if (request.Heading is < 0 or >= 360)
            throw new LocationValidationException( "heading_out_of_range" );
    }

    private LocationResult ToResult( DriverLocation location )
    {
        var recordedAt = new DateTimeOffset(
            DateTime.SpecifyKind( location.RecordedAt, DateTimeKind.Utc ) );
        var age = _timeProvider.GetUtcNow() - recordedAt;
        var ageSeconds = Math.Max( 0, age.TotalSeconds );
        var isCurrent = ageSeconds <= _options.CurrentMaxAgeSeconds;
        var isPrecise = location.AccuracyMeters.HasValue
            && location.AccuracyMeters.Value <= _options.PreciseRouteMaxAccuracyMeters;

        return new LocationResult(
            location.Latitude,
            location.Longitude,
            recordedAt,
            location.AccuracyMeters,
            location.SpeedKmh,
            location.Heading,
            isCurrent,
            ageSeconds,
            isCurrent && isPrecise );
    }
}
