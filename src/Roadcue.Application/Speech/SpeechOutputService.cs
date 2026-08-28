using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Roadcue.Application.Speech;

public interface ISpeechOutputService
{
    Task<SpeechSynthesisResult> SpeakAsync(
        string text,
        string? voice,
        CancellationToken cancellationToken = default );
}

public sealed class SpeechOutputService : ISpeechOutputService
{
    private readonly ISpeechSynthesizer _synthesizer;
    private readonly SpeechOptions _options;
    private readonly ILogger<SpeechOutputService> _logger;

    public SpeechOutputService(
        ISpeechSynthesizer synthesizer,
        IOptions<SpeechOptions> options,
        ILogger<SpeechOutputService> logger )
    {
        _synthesizer = synthesizer;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<SpeechSynthesisResult> SpeakAsync(
        string text,
        string? voice,
        CancellationToken cancellationToken = default )
    {
        if (string.IsNullOrWhiteSpace( text ))
        {
            return SpeechSynthesisResult.Failed( "empty_text" );
        }

        var chosenVoice = !string.IsNullOrWhiteSpace( voice )
            ? voice
            : (!string.IsNullOrWhiteSpace( _options.DefaultVoice )
                ? _options.DefaultVoice
                : SpeechOptions.DefaultDanishVoice);

        var request = new SpeechSynthesisRequest(
            Text: text.Trim(),
            VoiceName: chosenVoice,
            Language: _options.Language );

        var result = await _synthesizer.SynthesizeAsync( request, cancellationToken );

        if (result.Status == SpeechSynthesisStatus.Failed)
        {
            _logger.LogWarning(
                "Speech synthesis failed: {Reason}",
                result.FailureReason );
        }

        return result;
    }
}
