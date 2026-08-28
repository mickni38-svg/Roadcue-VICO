using Roadcue.Application.Speech;

namespace Roadcue.Infrastructure.Speech;

/// <summary>
/// Deterministisk fallback-syntese som bruges når
/// <c>AzureSpeech:Key</c> mangler (dev/POC uden nøgle) og i
/// automatiske tests. Returnerer altid <c>Failed("azure_key_missing")</c>
/// så API-laget kan svare 502 og Angular kan falde tilbage til
/// browser-TTS uden at bryde samtalen.
/// </summary>
public sealed class StubSpeechSynthesizer : ISpeechSynthesizer
{
    public Task<SpeechSynthesisResult> SynthesizeAsync(
        SpeechSynthesisRequest request,
        CancellationToken cancellationToken = default )
    {
        return Task.FromResult( SpeechSynthesisResult.Failed( "azure_key_missing" ) );
    }
}
