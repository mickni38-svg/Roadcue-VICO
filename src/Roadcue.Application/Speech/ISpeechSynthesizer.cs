namespace Roadcue.Application.Speech;

/// <summary>
/// Provider-agnostisk kontrakt for text-to-speech. Implementeres i
/// Infrastructure af den godkendte Azure Speech-adapter samt en stub
/// som bruges når nøglen mangler og i tests.
/// </summary>
public interface ISpeechSynthesizer
{
    Task<SpeechSynthesisResult> SynthesizeAsync(
        SpeechSynthesisRequest request,
        CancellationToken cancellationToken = default );
}
