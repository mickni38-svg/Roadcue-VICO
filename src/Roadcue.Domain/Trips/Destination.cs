namespace Roadcue.Domain.Trips;

/// <summary>
/// Struktureret repræsentation af en aktiv destination.
/// Værdiobjekt: en Trip har præcis én destination og identificeres
/// ikke selvstændigt uden for sin Trip.
/// </summary>
public class Destination
{
    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string? Address { get; set; }

    public string? ProviderPlaceId { get; set; }

    public DateTime SetAt { get; set; }
}
