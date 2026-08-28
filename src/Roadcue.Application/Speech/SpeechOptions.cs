namespace Roadcue.Application.Speech;

/// <summary>
/// Konfiguration bundet til <c>Speech</c>-afsnittet i appsettings.
/// Application-laget ejer selve indstillingerne så
/// <see cref="SpeechOutputService"/> kan vælge en stemme uden at
/// kende Azure-detaljer.
/// </summary>
public sealed class SpeechOptions
{
    public const string SectionName = "Speech";

    public const string DefaultDanishVoice = "da-DK-JeppeNeural";

    public string DefaultVoice { get; set; } = DefaultDanishVoice;

    public string Language { get; set; } = "da-DK";
}
