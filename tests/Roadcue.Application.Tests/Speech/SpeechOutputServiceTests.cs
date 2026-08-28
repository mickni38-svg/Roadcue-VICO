using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Roadcue.Application.Speech;

namespace Roadcue.Application.Tests.Speech;

public class SpeechOutputServiceTests
{
    [Fact]
    public async Task Empty_text_returns_failed_without_calling_synthesizer()
    {
        var synth = new RecordingSynthesizer( SpeechSynthesisResult.Ok(
            new byte[] { 1 }, "audio/mpeg", "da-DK-JeppeNeural" ) );
        var service = CreateService( synth );

        var result = await service.SpeakAsync( "   ", voice: null );

        Assert.Equal( SpeechSynthesisStatus.Failed, result.Status );
        Assert.Equal( "empty_text", result.FailureReason );
        Assert.Null( synth.LastRequest );
    }

    [Fact]
    public async Task Uses_configured_default_voice_when_none_given()
    {
        var synth = new RecordingSynthesizer( SpeechSynthesisResult.Ok(
            new byte[] { 1, 2, 3 }, "audio/mpeg", "da-DK-JeppeNeural" ) );
        var service = CreateService( synth,
            new SpeechOptions { DefaultVoice = "da-DK-ChristelNeural", Language = "da-DK" } );

        var result = await service.SpeakAsync( "Hej", voice: null );

        Assert.Equal( SpeechSynthesisStatus.Ok, result.Status );
        Assert.NotNull( synth.LastRequest );
        Assert.Equal( "da-DK-ChristelNeural", synth.LastRequest!.VoiceName );
        Assert.Equal( "da-DK", synth.LastRequest.Language );
    }

    [Fact]
    public async Task Explicit_voice_overrides_default()
    {
        var synth = new RecordingSynthesizer( SpeechSynthesisResult.Ok(
            new byte[] { 1 }, "audio/mpeg", "da-DK-JeppeNeural" ) );
        var service = CreateService( synth );

        await service.SpeakAsync( "Hej", voice: "da-DK-JeppeNeural" );

        Assert.Equal( "da-DK-JeppeNeural", synth.LastRequest!.VoiceName );
    }

    [Fact]
    public async Task Failed_result_is_propagated()
    {
        var synth = new RecordingSynthesizer( SpeechSynthesisResult.Failed( "azure_unavailable" ) );
        var service = CreateService( synth );

        var result = await service.SpeakAsync( "Hej", voice: null );

        Assert.Equal( SpeechSynthesisStatus.Failed, result.Status );
        Assert.Equal( "azure_unavailable", result.FailureReason );
    }

    private static SpeechOutputService CreateService(
        ISpeechSynthesizer synth,
        SpeechOptions? options = null )
    {
        return new SpeechOutputService(
            synth,
            Options.Create( options ?? new SpeechOptions() ),
            NullLogger<SpeechOutputService>.Instance );
    }

    private sealed class RecordingSynthesizer : ISpeechSynthesizer
    {
        private readonly SpeechSynthesisResult _result;

        public RecordingSynthesizer( SpeechSynthesisResult result )
        {
            _result = result;
        }

        public SpeechSynthesisRequest? LastRequest { get; private set; }

        public Task<SpeechSynthesisResult> SynthesizeAsync(
            SpeechSynthesisRequest request,
            CancellationToken cancellationToken = default )
        {
            LastRequest = request;
            return Task.FromResult( _result );
        }
    }
}
