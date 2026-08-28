using Microsoft.CognitiveServices.Speech;

namespace Roadcue.Infrastructure.Speech;

/// <summary>
/// Internt adapter-interface omkring Azure Speech SDK'et. Formålet er
/// at gøre <see cref="AzureSpeechSynthesizer"/> testbar uden at
/// ramme Azure. Produktions-implementationen bruger
/// <see cref="SpeechSynthesizer"/> og returnerer råt SDK-resultat.
/// </summary>
internal interface IAzureSpeechClient
{
    Task<AzureSpeechClientResult> SynthesizeAsync(
        string text,
        string voice,
        string language,
        CancellationToken cancellationToken );
}

internal sealed record AzureSpeechClientResult(
    ResultReason Reason,
    byte[]? Audio,
    string? ErrorDetails );
