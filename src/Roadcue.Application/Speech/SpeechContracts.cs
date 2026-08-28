namespace Roadcue.Application.Speech;

public sealed record SpeechSynthesisRequest(
    string Text,
    string? VoiceName = null,
    string? Language = null );

public enum SpeechSynthesisStatus
{
    Ok = 0,
    Failed = 1,
}

/// <summary>
/// Provider-agnostisk resultat af et TTS-kald. Ved
/// <see cref="SpeechSynthesisStatus.Ok"/> er <see cref="Audio"/> og
/// <see cref="ContentType"/> udfyldt. Ved
/// <see cref="SpeechSynthesisStatus.Failed"/> er
/// <see cref="FailureReason"/> udfyldt.
/// </summary>
public sealed record SpeechSynthesisResult(
    SpeechSynthesisStatus Status,
    byte[]? Audio = null,
    string? ContentType = null,
    string? Voice = null,
    string? FailureReason = null )
{
    public static SpeechSynthesisResult Ok( byte[] audio, string contentType, string voice ) =>
        new( SpeechSynthesisStatus.Ok, Audio: audio, ContentType: contentType, Voice: voice );

    public static SpeechSynthesisResult Failed( string reason ) =>
        new( SpeechSynthesisStatus.Failed, FailureReason: reason );
}
