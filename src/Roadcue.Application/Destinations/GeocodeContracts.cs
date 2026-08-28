namespace Roadcue.Application.Destinations;

/// <summary>
/// Anmodning til geocoder. <paramref name="RawText"/> er den råtekst
/// chaufføren har sagt/tastet. Hints er valgfrie (fx landekode)
/// og må ikke lække provider-detaljer.
/// </summary>
public sealed record GeocodeRequest(
    string RawText,
    string? CountryHint = null,
    string? LanguageHint = null );

public sealed record GeocodeCandidate(
    string Name,
    double Latitude,
    double Longitude,
    string? Address,
    string? ProviderPlaceId,
    double Confidence );

public enum GeocodeOutcome
{
    Found = 0,
    Ambiguous = 1,
    NotFound = 2,
    Failed = 3,
}

/// <summary>
/// Provider-agnostisk resultat af et geocoding-kald.
/// Præcis ét felt er meningsfuldt pr. <see cref="Outcome"/>:
/// Found → <see cref="Match"/>, Ambiguous → <see cref="Candidates"/>,
/// Failed → <see cref="FailureReason"/>.
/// </summary>
public sealed record GeocodeResult(
    GeocodeOutcome Outcome,
    GeocodeCandidate? Match = null,
    IReadOnlyList<GeocodeCandidate>? Candidates = null,
    string? FailureReason = null )
{
    public static GeocodeResult Found( GeocodeCandidate match ) =>
        new( GeocodeOutcome.Found, Match: match );

    public static GeocodeResult Ambiguous( IReadOnlyList<GeocodeCandidate> candidates ) =>
        new( GeocodeOutcome.Ambiguous, Candidates: candidates );

    public static GeocodeResult NotFound() =>
        new( GeocodeOutcome.NotFound );

    public static GeocodeResult Failed( string reason ) =>
        new( GeocodeOutcome.Failed, FailureReason: reason );
}
