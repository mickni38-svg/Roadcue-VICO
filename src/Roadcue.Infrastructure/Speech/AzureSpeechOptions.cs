namespace Roadcue.Infrastructure.Speech;

/// <summary>
/// Bundet til konfigurationsafsnittet <c>AzureSpeech</c>.
/// Nøgle må aldrig committes – kommer fra env/user-secrets.
/// </summary>
public sealed class AzureSpeechOptions
{
    public const string SectionName = "AzureSpeech";

    public string? Key { get; set; }

    public string? Region { get; set; }

    /// <summary>
    /// Azure SDK output-format navn. Låst til et MP3-format som kan
    /// afspilles direkte af browserens <c>HTMLAudioElement</c>.
    /// </summary>
    public string OutputFormat { get; set; }
        = "Audio16Khz32KBitRateMonoMp3";
}
