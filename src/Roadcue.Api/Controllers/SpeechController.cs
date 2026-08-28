using Microsoft.AspNetCore.Mvc;
using Roadcue.Application.Speech;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route( "api/speech" )]
public class SpeechController : ControllerBase
{
    private readonly ISpeechOutputService _speech;

    public SpeechController( ISpeechOutputService speech )
    {
        _speech = speech;
    }

    public sealed record TtsRequest(
        string Text,
        string? Voice = null );

    [HttpPost( "tts" )]
    [ProducesResponseType( StatusCodes.Status200OK )]
    [ProducesResponseType( StatusCodes.Status400BadRequest )]
    [ProducesResponseType( StatusCodes.Status502BadGateway )]
    public async Task<IActionResult> Tts(
        [FromBody] TtsRequest request,
        CancellationToken cancellationToken )
    {
        if (request is null || string.IsNullOrWhiteSpace( request.Text ))
        {
            return BadRequest( new { error = "text_required" } );
        }

        var result = await _speech.SpeakAsync(
            request.Text,
            request.Voice,
            cancellationToken );

        if (result.Status == SpeechSynthesisStatus.Ok
            && result.Audio is not null
            && !string.IsNullOrWhiteSpace( result.ContentType ))
        {
            Response.Headers[ "X-Voice" ] = result.Voice;
            return File( result.Audio, result.ContentType );
        }

        return StatusCode(
            StatusCodes.Status502BadGateway,
            new { error = result.FailureReason ?? "speech_unavailable" } );
    }
}
