using Roadcue.Application.Destinations;

namespace Roadcue.Infrastructure.Geocoding;

/// <summary>
/// Deterministisk in-memory-geocoder. Bruges når <c>Here:ApiKey</c>
/// mangler (dev/POC uden nøgle) og i automatiske tests. Ingen
/// netværkskald.
/// </summary>
public sealed class StubDestinationGeocoder : IDestinationGeocoder
{
    private static readonly IReadOnlyDictionary<string, GeocodeCandidate> Exact =
        new Dictionary<string, GeocodeCandidate>( StringComparer.OrdinalIgnoreCase )
        {
            ["hamburg"] = new(
                Name: "Hamburg",
                Latitude: 53.5511,
                Longitude: 9.9937,
                Address: "Hamburg, Germany",
                ProviderPlaceId: "stub:hamburg",
                Confidence: 0.95 ),
            ["hamburg havn"] = new(
                Name: "Hamburg Havn",
                Latitude: 53.5416,
                Longitude: 9.9840,
                Address: "Port of Hamburg, Germany",
                ProviderPlaceId: "stub:hamburg-havn",
                Confidence: 0.9 ),
        };

    private static readonly IReadOnlyDictionary<string, IReadOnlyList<GeocodeCandidate>> Ambiguous =
        new Dictionary<string, IReadOnlyList<GeocodeCandidate>>( StringComparer.OrdinalIgnoreCase )
        {
            ["københavn"] = new List<GeocodeCandidate>
            {
                new(
                    Name: "København",
                    Latitude: 55.6761,
                    Longitude: 12.5683,
                    Address: "København, Denmark",
                    ProviderPlaceId: "stub:kobenhavn-city",
                    Confidence: 0.8 ),
                new(
                    Name: "Københavns Lufthavn",
                    Latitude: 55.6180,
                    Longitude: 12.6560,
                    Address: "Kastrup, Denmark",
                    ProviderPlaceId: "stub:kobenhavn-cph",
                    Confidence: 0.75 ),
            },
        };

    public Task<GeocodeResult> GeocodeAsync(
        GeocodeRequest request,
        CancellationToken cancellationToken = default )
    {
        var key = (request.RawText ?? string.Empty).Trim();

        if (Ambiguous.TryGetValue( key, out var candidates ))
        {
            return Task.FromResult( GeocodeResult.Ambiguous( candidates ) );
        }

        if (Exact.TryGetValue( key, out var match ))
        {
            return Task.FromResult( GeocodeResult.Found( match ) );
        }

        return Task.FromResult( GeocodeResult.NotFound() );
    }
}
