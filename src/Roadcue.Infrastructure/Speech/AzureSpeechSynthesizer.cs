using Microsoft.CognitiveServices.Speech;
using Microsoft.Extensions.Logging;
using Roadcue.Application.Speech;

namespace Roadcue.Infrastructure.Speech;

/// <summary>
/// Adapter til Azure AI Speech. Wrapper det interne
/// <see cref="IAzureSpeechClient"/> så SDK-detaljer holdes ude af
/// <see cref="ISpeechSynthesizer"/>-kontrakten og tests ikke rammer
/// Azure.
/// </summary>
public sealed class AzureSpeechSynthesizer : ISpeechSynthesizer
{
    private const string Mp3ContentType = "audio/mpeg";

    private readonly IAzureSpeechClient _client;
    private readonly ILogger<AzureSpeechSynthesizer> _logger;

    internal AzureSpeechSynthesizer(
        IAzureSpeechClient client,
        ILogger<AzureSpeechSynthesizer> logger )
    {
        _client = client;
        _logger = logger;
    }

    public async Task<SpeechSynthesisResult> SynthesizeAsync(
        SpeechSynthesisRequest request,
        CancellationToken cancellationToken = default )
    {
        var voice = request.VoiceName ?? SpeechOptions.DefaultDanishVoice;
        var language = request.Language ?? "da-DK";

        AzureSpeechClientResult raw;
        try
        {
            raw = await _client.SynthesizeAsync(
                request.Text,
                voice,
                language,
                cancellationToken );
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning( ex, "Azure Speech synthesis threw" );
            return SpeechSynthesisResult.Failed( "azure_exception" );
        }

        if (raw.Reason == ResultReason.SynthesizingAudioCompleted && raw.Audio is { Length: > 0 })
        {
            return SpeechSynthesisResult.Ok( raw.Audio, Mp3ContentType, voice );
        }

        _logger.LogWarning(
            "Azure Speech synthesis failed: {Reason} {Details}",
            raw.Reason,
            raw.ErrorDetails );

        return SpeechSynthesisResult.Failed( "azure_unavailable" );
    }
}
