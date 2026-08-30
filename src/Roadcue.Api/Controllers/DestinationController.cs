using Microsoft.AspNetCore.Mvc;
using Roadcue.Application.Destinations;
using Roadcue.Application.Locations;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route("api/drivers/{driverId:guid}/destination")]
public class DestinationController : ControllerBase
{
    private readonly IDestinationService _destinations;
    private readonly ICurrentDriverContext _currentDriver;

    public DestinationController(IDestinationService destinations, ICurrentDriverContext currentDriver)
    {
        _destinations = destinations;
        _currentDriver = currentDriver;
    }

    public sealed record SetDestinationRequest(string Query, string? Country = null);
    public sealed record AmbiguousResponse(string Reason, IReadOnlyList<DestinationCandidateDto> Candidates);

    [HttpGet]
    public async Task<ActionResult<ActiveDestinationDto>> Get(Guid driverId, CancellationToken cancellationToken)
    {
        var guard = await GuardCurrentDriver(driverId, cancellationToken);
        if (guard is not null) return guard;
        var dto = await _destinations.GetActiveDestinationAsync(driverId, cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPut]
    public async Task<IActionResult> Put(Guid driverId, [FromBody] SetDestinationRequest request, CancellationToken cancellationToken)
    {
        var guard = await GuardCurrentDriver(driverId, cancellationToken);
        if (guard is not null) return guard;
        if (request is null || string.IsNullOrWhiteSpace(request.Query)) return BadRequest(new { error = "query_required" });
        var result = await _destinations.SetActiveDestinationAsync(driverId, request.Query, request.Country, cancellationToken);
        return result.Status switch
        {
            SetDestinationStatus.Set => Ok(result.Destination),
            SetDestinationStatus.Ambiguous => Conflict(new AmbiguousResponse("ambiguous", result.Candidates!)),
            SetDestinationStatus.NotFound => NotFound(new { error = "destination_not_found" }),
            SetDestinationStatus.ProviderUnavailable => StatusCode(StatusCodes.Status502BadGateway, new { error = "geocoder_unavailable", detail = result.FailureReason }),
            _ => StatusCode(StatusCodes.Status500InternalServerError),
        };
    }

    private async Task<ActionResult?> GuardCurrentDriver(Guid driverId, CancellationToken cancellationToken)
    {
        var current = await _currentDriver.GetCurrentDriverIdAsync(cancellationToken);
        if (!current.HasValue) return Unauthorized(new { error = "current_driver_not_configured" });
        return current.Value == driverId ? null : StatusCode(StatusCodes.Status403Forbidden, new { error = "driver_mismatch" });
    }
}
