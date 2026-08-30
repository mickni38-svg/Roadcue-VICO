using Roadcue.Domain.Drivers;

namespace Roadcue.Domain.Trips;

/// <summary>
/// Chaufførens vedvarende tur. Der kan højst være én aktiv Trip pr. driver.
/// Destination og lifecycle er Trip-data; GPS-historik forbliver separat.
/// </summary>
public class Trip
{
    public Guid Id { get; set; }
    public Guid DriverId { get; set; }
    public TripStatus Status { get; set; } = TripStatus.Active;
    public DateTime StartedAt { get; set; }
    public DateTime LastChangedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public Destination? Destination { get; set; }
    public Driver? Driver { get; set; }
}
