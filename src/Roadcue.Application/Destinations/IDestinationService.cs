namespace Roadcue.Application.Destinations;

public interface IDestinationService
{
    Task<SetDestinationResult> SetActiveDestinationAsync(
        Guid driverId,
        string query,
        string? countryHint,
        CancellationToken cancellationToken = default );

    Task<ActiveDestinationDto?> GetActiveDestinationAsync(
        Guid driverId,
        CancellationToken cancellationToken = default );
}
