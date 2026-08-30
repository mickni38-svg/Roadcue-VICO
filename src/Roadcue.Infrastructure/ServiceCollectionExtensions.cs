using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Roadcue.Application.Destinations;
using Roadcue.Application.Locations;
using Roadcue.Application.Speech;
using Roadcue.Infrastructure.Geocoding;
using Roadcue.Infrastructure.Persistence;
using Roadcue.Infrastructure.Speech;

namespace Roadcue.Infrastructure;

public static class ServiceCollectionExtensions
{
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

    public static IServiceCollection AddRoadcueLocation(
        this IServiceCollection services,
        IConfiguration configuration )
    {
        services.AddSingleton( TimeProvider.System );
        services.Configure<LocationOptions>(
            configuration.GetSection( LocationOptions.SectionName ) );
        services.AddScoped<IDriverLocationRepository, DriverLocationRepository>();
        services.AddScoped<ILocationService, LocationService>();
        return services;
    }

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
