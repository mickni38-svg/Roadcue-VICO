namespace Roadcue.Domain.Places;

public class Place
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public string Type { get; set; } = string.Empty;

    public bool HasFuel { get; set; }

    public bool HasFood { get; set; }
}