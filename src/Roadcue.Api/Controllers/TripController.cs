using Microsoft.AspNetCore.Mvc;
using Roadcue.Application.Locations;
using Roadcue.Application.Trips;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route("api/trips/current")]
public sealed class TripController : ControllerBase
{
    private readonly ICurrentDriverContext _currentDriver;
    private readonly ITripService _trips;

    public TripController(ICurrentDriverContext currentDriver, ITripService trips)
    {
        _currentDriver = currentDriver;
        _trips = trips;
    }

    [HttpGet]
    public async Task<ActionResult<ActiveTripDto>> Get(CancellationToken cancellationToken)
    {
        var driverId = await _currentDriver.GetCurrentDriverIdAsync(cancellationToken);
        if (!driverId.HasValue) return Unauthorized(new { error = "current_driver_not_configured" });
        var trip = await _trips.GetActiveAsync(driverId.Value, cancellationToken);
        return trip is null ? NotFound(new { error = "active_trip_not_found" }) : Ok(trip);
    }

    [HttpPost("end")]
    public async Task<ActionResult<ActiveTripDto>> End(CancellationToken cancellationToken) =>
        await Close(_trips.EndActiveAsync, cancellationToken);

    [HttpPost("cancel")]
    public async Task<ActionResult<ActiveTripDto>> Cancel(CancellationToken cancellationToken) =>
        await Close(_trips.CancelActiveAsync, cancellationToken);

    private async Task<ActionResult<ActiveTripDto>> Close(
        Func<Guid, CancellationToken, Task<ActiveTripDto?>> action,
        CancellationToken cancellationToken)
    {
        var driverId = await _currentDriver.GetCurrentDriverIdAsync(cancellationToken);
        if (!driverId.HasValue) return Unauthorized(new { error = "current_driver_not_configured" });
        var trip = await action(driverId.Value, cancellationToken);
        return trip is null ? NotFound(new { error = "active_trip_not_found" }) : Ok(trip);
    }
}
