namespace Roadcue.Application.Locations;

public sealed record RegisterLocationRequest(
    double Latitude,
    double Longitude,
    DateTimeOffset RecordedAt,
    double? AccuracyMeters,
    double? SpeedKmh,
    double? Heading );

public sealed record LocationResult(
    double Latitude,
    double Longitude,
    DateTimeOffset RecordedAt,
    double? AccuracyMeters,
    double? SpeedKmh,
    double? Heading,
    bool IsCurrent,
    double AgeSeconds,
    bool IsSuitableForPreciseRouteComparison );

public sealed class LocationValidationException : Exception
{
    public LocationValidationException( string message ) : base( message ) { }
}
