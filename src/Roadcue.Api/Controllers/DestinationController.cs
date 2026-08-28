using Microsoft.AspNetCore.Mvc;
using Roadcue.Application.Destinations;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route( "api/drivers/{driverId:guid}/destination" )]
public class DestinationController : ControllerBase
{
    private readonly IDestinationService _destinations;

    public DestinationController( IDestinationService destinations )
    {
        _destinations = destinations;
    }

    public sealed record SetDestinationRequest(
        string Query,
        string? Country = null );

    public sealed record AmbiguousResponse(
        string Reason,
        IReadOnlyList<DestinationCandidateDto> Candidates );

    [HttpGet]
    [ProducesResponseType( typeof( ActiveDestinationDto ), StatusCodes.Status200OK )]
    [ProducesResponseType( StatusCodes.Status404NotFound )]
    public async Task<ActionResult<ActiveDestinationDto>> Get(
        Guid driverId,
        CancellationToken cancellationToken )
    {
        var dto = await _destinations.GetActiveDestinationAsync(
            driverId,
            cancellationToken );

        if (dto is null)
        {
            return NotFound();
        }

        return Ok( dto );
    }

    [HttpPut]
    [ProducesResponseType( typeof( ActiveDestinationDto ), StatusCodes.Status200OK )]
    [ProducesResponseType( typeof( AmbiguousResponse ), StatusCodes.Status409Conflict )]
    [ProducesResponseType( StatusCodes.Status404NotFound )]
    [ProducesResponseType( StatusCodes.Status502BadGateway )]
    public async Task<IActionResult> Put(
        Guid driverId,
        [FromBody] SetDestinationRequest request,
        CancellationToken cancellationToken )
    {
        if (request is null || string.IsNullOrWhiteSpace( request.Query ))
        {
            return BadRequest( new { error = "query_required" } );
        }

        var result = await _destinations.SetActiveDestinationAsync(
            driverId,
            request.Query,
            request.Country,
            cancellationToken );

        return result.Status switch
        {
            SetDestinationStatus.Set =>
                Ok( result.Destination ),
            SetDestinationStatus.Ambiguous =>
                Conflict( new AmbiguousResponse( "ambiguous", result.Candidates! ) ),
            SetDestinationStatus.NotFound =>
                NotFound( new { error = "destination_not_found" } ),
            SetDestinationStatus.ProviderUnavailable =>
                StatusCode(
                    StatusCodes.Status502BadGateway,
                    new { error = "geocoder_unavailable", detail = result.FailureReason } ),
            _ => StatusCode( StatusCodes.Status500InternalServerError ),
        };
    }
}
