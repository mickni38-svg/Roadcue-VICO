namespace Roadcue.Domain.Drivers;

public class Driver
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string CountryCode { get; set; } = string.Empty;

    public string LanguageCode { get; set; } = string.Empty;

    public string Status { get; set; } = "Offline";

    public ICollection<DriverLocation> Locations { get; set; }
        = new List<DriverLocation>();
}