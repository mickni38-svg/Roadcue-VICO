namespace Roadcue.Infrastructure.Geocoding;

/// <summary>
/// Bundet til konfigurationsafsnittet <c>Here</c>.
/// Nøgle må aldrig committes – kommer fra env/secrets.
/// </summary>
public sealed class HereOptions
{
    public const string SectionName = "Here";

    public string? ApiKey { get; set; }

    public string GeocodingBaseUrl { get; set; }
        = "https://geocode.search.hereapi.com";
}
