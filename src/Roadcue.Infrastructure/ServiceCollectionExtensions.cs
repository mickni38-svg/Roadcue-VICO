using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Roadcue.Application.Destinations;
using Roadcue.Application.Speech;
using Roadcue.Infrastructure.Geocoding;
using Roadcue.Infrastructure.Persistence;
using Roadcue.Infrastructure.Speech;

namespace Roadcue.Infrastructure;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registrerer UC-36 destination-stakken: repository,
    /// application-service og geocoder-adapter. Hvis
    /// <c>Here:ApiKey</c> mangler, falder vi tilbage til den
    /// deterministiske stub (dev/POC uden nøgle + tests).
    /// </summary>
    public static IServiceCollection AddRoadcueDestinations(
        this IServiceCollection services,
        IConfiguration configuration )
    {
        services.AddSingleton( TimeProvider.System );

        services.Configure<HereOptions>(
            configuration.GetSection( HereOptions.SectionName ) );

        services.AddScoped<IActiveTripRepository, ActiveTripRepository>();
        services.AddScoped<IDestinationService, DestinationService>();

        var apiKey = configuration[ $"{HereOptions.SectionName}:ApiKey" ];
        if (string.IsNullOrWhiteSpace( apiKey ))
        {
            services.AddSingleton<IDestinationGeocoder, StubDestinationGeocoder>();
        }
        else
        {
            services.AddHttpClient<IDestinationGeocoder, HereDestinationGeocoder>(
                ( sp, client ) =>
                {
                    var baseUrl = configuration[
                        $"{HereOptions.SectionName}:GeocodingBaseUrl" ]
                        ?? "https://geocode.search.hereapi.com";
                    client.BaseAddress = new Uri( baseUrl );
                    client.Timeout = TimeSpan.FromSeconds( 10 );
                } );
        }

        return services;
    }

    /// <summary>
    /// Registrerer UC-40 speech-stakken: application-service og
    /// TTS-adapter. Hvis <c>AzureSpeech:Key</c> eller
    /// <c>AzureSpeech:Region</c> mangler, falder vi tilbage til
    /// <see cref="StubSpeechSynthesizer"/>, som altid returnerer
    /// <c>Failed("azure_key_missing")</c>. Det tillader appen at
    /// starte uden nøgle, mens API'et svarer 502 og Angular kan
    /// bruge browser-TTS-fallback.
    /// </summary>
    public static IServiceCollection AddRoadcueSpeech(
        this IServiceCollection services,
        IConfiguration configuration )
    {
        services.Configure<SpeechOptions>(
            configuration.GetSection( SpeechOptions.SectionName ) );

        services.Configure<AzureSpeechOptions>(
            configuration.GetSection( AzureSpeechOptions.SectionName ) );

        services.AddScoped<ISpeechOutputService, SpeechOutputService>();

        var key = configuration[ $"{AzureSpeechOptions.SectionName}:Key" ];
        var region = configuration[ $"{AzureSpeechOptions.SectionName}:Region" ];

        if (string.IsNullOrWhiteSpace( key ) || string.IsNullOrWhiteSpace( region ))
        {
            services.AddSingleton<ISpeechSynthesizer, StubSpeechSynthesizer>();
        }
        else
        {
            services.AddSingleton<IAzureSpeechClient, AzureSpeechClient>();
            services.AddSingleton<ISpeechSynthesizer>( sp =>
                new AzureSpeechSynthesizer(
                    sp.GetRequiredService<IAzureSpeechClient>(),
                    sp.GetRequiredService<ILogger<AzureSpeechSynthesizer>>() ) );
        }

        return services;
    }
}
