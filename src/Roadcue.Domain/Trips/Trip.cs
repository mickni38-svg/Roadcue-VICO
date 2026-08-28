using Roadcue.Domain.Drivers;

namespace Roadcue.Domain.Trips;

/// <summary>
/// Chaufførens aktive tur. UC-36 introducerer minimum: én aktiv Trip
/// pr. driver med tilhørende <see cref="Destination"/>. Fuld
/// lifecycle (annuller/afslut/historik) håndteres af UC-38.
/// </summary>
public class Trip
{
    public Guid Id { get; set; }

    public Guid DriverId { get; set; }

    public TripStatus Status { get; set; } = TripStatus.Active;

    public DateTime StartedAt { get; set; }

    public DateTime LastChangedAt { get; set; }

    public Destination? Destination { get; set; }

    public Driver? Driver { get; set; }
}
