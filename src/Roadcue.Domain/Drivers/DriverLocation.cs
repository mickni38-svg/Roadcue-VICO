namespace Roadcue.Domain.Drivers;

public class DriverLocation
{
    public Guid Id { get; set; }

    public Guid DriverId { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public double SpeedKmh { get; set; }

    public double Heading { get; set; }

    public DateTime RecordedAt { get; set; }

    public Driver Driver { get; set; } = null!;
}