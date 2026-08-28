using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Roadcue.Application.Destinations;

namespace Roadcue.Infrastructure.Geocoding;

/// <summary>
/// Adapter til HERE Geocoding &amp; Search API. Kaldes gennem en typed
/// <see cref="HttpClient"/>. HERE-fejl må aldrig boble ud – de wrappes
/// til <see cref="GeocodeResult.Failed"/> så application-laget kan
/// bevare den nuværende destination.
/// </summary>
public sealed class HereDestinationGeocoder : IDestinationGeocoder
{
    // Over denne tærskel accepterer vi topresultatet som entydigt.
    private const double HighConfidence = 0.85;

    // Under denne difference mellem #1 og #2 kalder vi det tvetydigt.
    private const double AmbiguityMargin = 0.1;

    private readonly HttpClient _http;
    private readonly HereOptions _options;
    private readonly ILogger<HereDestinationGeocoder> _logger;

    public HereDestinationGeocoder(
        HttpClient http,
        IOptions<HereOptions> options,
        ILogger<HereDestinationGeocoder> logger )
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<GeocodeResult> GeocodeAsync(
        GeocodeRequest request,
        CancellationToken cancellationToken = default )
    {
        if (string.IsNullOrWhiteSpace( _options.ApiKey ))
        {
            return GeocodeResult.Failed( "here_api_key_missing" );
        }

        var query = Uri.EscapeDataString( request.RawText );
        var url = $"/v1/geocode?q={query}&apiKey={_options.ApiKey}&limit=5";

        if (!string.IsNullOrWhiteSpace( request.CountryHint ))
        {
            url += $"&in=countryCode:{Uri.EscapeDataString( request.CountryHint )}";
        }

        HereGeocodeResponse? payload;
        try
        {
            using var response = await _http.GetAsync( url, cancellationToken );
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "HERE geocoding returned {StatusCode} for query {Query}",
                    (int)response.StatusCode,
                    request.RawText );
                return GeocodeResult.Failed( $"here_status_{(int)response.StatusCode}" );
            }

            payload = await response.Content
                .ReadFromJsonAsync<HereGeocodeResponse>( cancellationToken );
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning( ex, "HERE geocoding HTTP failure" );
            return GeocodeResult.Failed( "here_http_error" );
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning( ex, "HERE geocoding timed out" );
            return GeocodeResult.Failed( "here_timeout" );
        }

        var items = payload?.Items ?? Array.Empty<HereItem>();
        var candidates = items
            .Where( i => i.Position is not null )
            .Select( ToCandidate )
            .OrderByDescending( c => c.Confidence )
            .ToList();

        if (candidates.Count == 0)
        {
            return GeocodeResult.NotFound();
        }

        var top = candidates[ 0 ];
        if (candidates.Count == 1
            || (top.Confidence >= HighConfidence
                && top.Confidence - candidates[ 1 ].Confidence >= AmbiguityMargin))
        {
            return GeocodeResult.Found( top );
        }

        return GeocodeResult.Ambiguous( candidates );
    }

    private static GeocodeCandidate ToCandidate( HereItem item )
    {
        return new GeocodeCandidate(
            Name: item.Title ?? string.Empty,
            Latitude: item.Position!.Lat,
            Longitude: item.Position.Lng,
            Address: item.Address?.Label,
            ProviderPlaceId: item.Id,
            Confidence: item.Scoring?.QueryScore ?? 0d );
    }

    private sealed record HereGeocodeResponse(
        [property: JsonPropertyName( "items" )] IReadOnlyList<HereItem>? Items );

    private sealed record HereItem(
        [property: JsonPropertyName( "id" )] string? Id,
        [property: JsonPropertyName( "title" )] string? Title,
        [property: JsonPropertyName( "address" )] HereAddress? Address,
        [property: JsonPropertyName( "position" )] HerePosition? Position,
        [property: JsonPropertyName( "scoring" )] HereScoring? Scoring );

    private sealed record HereAddress(
        [property: JsonPropertyName( "label" )] string? Label );

    private sealed record HerePosition(
        [property: JsonPropertyName( "lat" )] double Lat,
        [property: JsonPropertyName( "lng" )] double Lng );

    private sealed record HereScoring(
        [property: JsonPropertyName( "queryScore" )] double? QueryScore );
}
