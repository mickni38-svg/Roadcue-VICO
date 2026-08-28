using Microsoft.CognitiveServices.Speech;
using Microsoft.Extensions.Options;

namespace Roadcue.Infrastructure.Speech;

internal sealed class AzureSpeechClient : IAzureSpeechClient
{
    private readonly AzureSpeechOptions _options;

    public AzureSpeechClient( IOptions<AzureSpeechOptions> options )
    {
        _options = options.Value;
    }

    public async Task<AzureSpeechClientResult> SynthesizeAsync(
        string text,
        string voice,
        string language,
        CancellationToken cancellationToken )
    {
        var config = SpeechConfig.FromSubscription( _options.Key, _options.Region );
        config.SpeechSynthesisLanguage = language;
        config.SpeechSynthesisVoiceName = voice;
        config.SetSpeechSynthesisOutputFormat( ResolveFormat( _options.OutputFormat ) );

        using var synthesizer = new SpeechSynthesizer( config, audioConfig: null );

        cancellationToken.ThrowIfCancellationRequested();

        using var result = await synthesizer
            .SpeakTextAsync( text )
            .ConfigureAwait( false );

        if (result.Reason == ResultReason.SynthesizingAudioCompleted)
        {
            return new AzureSpeechClientResult(
                Reason: result.Reason,
                Audio: result.AudioData,
                ErrorDetails: null );
        }

        var details = SpeechSynthesisCancellationDetails.FromResult( result );
        return new AzureSpeechClientResult(
            Reason: result.Reason,
            Audio: null,
            ErrorDetails: $"{details.Reason}:{details.ErrorCode}:{details.ErrorDetails}" );
    }

    private static SpeechSynthesisOutputFormat ResolveFormat( string name )
    {
        if (Enum.TryParse<SpeechSynthesisOutputFormat>( name, ignoreCase: true, out var value ))
        {
            return value;
        }

        return SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    }
}
