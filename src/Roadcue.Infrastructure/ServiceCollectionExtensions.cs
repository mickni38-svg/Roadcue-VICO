using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Roadcue.Application.Destinations;
using Roadcue.Infrastructure.Geocoding;
using Roadcue.Infrastructure.Persistence;

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
}
