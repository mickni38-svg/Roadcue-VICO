namespace Roadcue.Application.Locations;

public sealed class LocationOptions
{
    public const string SectionName = "Location";

    public int CurrentMaxAgeSeconds { get; set; } = 120;

    public double PreciseRouteMaxAccuracyMeters { get; set; } = 50;

    public int FutureTimestampToleranceSeconds { get; set; } = 30;
}
