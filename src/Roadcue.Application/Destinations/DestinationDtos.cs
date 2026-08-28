namespace Roadcue.Application.Destinations;

public sealed record ActiveDestinationDto(
    Guid TripId,
    Guid DriverId,
    string Name,
    double Latitude,
    double Longitude,
    string? Address,
    string? ProviderPlaceId,
    DateTime SetAt );

public sealed record DestinationCandidateDto(
    string Name,
    double Latitude,
    double Longitude,
    string? Address,
    string? ProviderPlaceId );

public enum SetDestinationStatus
{
    Set = 0,
    Ambiguous = 1,
    NotFound = 2,
    ProviderUnavailable = 3,
}

/// <summary>
/// Diskrimineret resultat fra <see cref="IDestinationService"/>.
/// API-laget mapper dette til HTTP-statuskoder.
/// </summary>
public sealed record SetDestinationResult(
    SetDestinationStatus Status,
    ActiveDestinationDto? Destination = null,
    IReadOnlyList<DestinationCandidateDto>? Candidates = null,
    string? FailureReason = null );
