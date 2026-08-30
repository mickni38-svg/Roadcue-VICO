using Microsoft.AspNetCore.Mvc;
using Roadcue.Application.Locations;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route( "api/location" )]
public sealed class LocationController : ControllerBase
{
    private readonly ICurrentDriverContext _currentDriverContext;
    private readonly ILocationService _locationService;

    public LocationController(
        ICurrentDriverContext currentDriverContext,
        ILocationService locationService )
    {
        _currentDriverContext = currentDriverContext;
        _locationService = locationService;
    }

    [HttpPost( "current" )]
    public async Task<ActionResult<LocationResult>> RegisterCurrent(
        RegisterLocationRequest request,
        CancellationToken cancellationToken )
    {
        var driverId = await _currentDriverContext.GetCurrentDriverIdAsync( cancellationToken );
        if (!driverId.HasValue)
            return Unauthorized( new { error = "current_driver_not_configured" } );

        try
        {
            var result = await _locationService.RegisterAsync(
                driverId.Value,
                request,
                cancellationToken );
            return Ok( result );
        }
        catch (LocationValidationException ex)
        {
            return BadRequest( new { error = ex.Message } );
        }
    }

    [HttpGet( "current" )]
    public async Task<ActionResult<LocationResult>> GetCurrent(
        CancellationToken cancellationToken )
    {
        var driverId = await _currentDriverContext.GetCurrentDriverIdAsync( cancellationToken );
        if (!driverId.HasValue)
            return Unauthorized( new { error = "current_driver_not_configured" } );

        var result = await _locationService.GetCurrentAsync(
            driverId.Value,
            cancellationToken );

        return result is null
            ? NotFound( new { error = "location_not_found" } )
            : Ok( result );
    }
}
