namespace Roadcue.Application.Destinations;

/// <summary>
/// Provider-agnostisk kontrakt for at opløse en rå tekststreng
/// til strukturerede destinationskandidater. Implementeres i
/// Infrastructure af den godkendte HERE-adapter samt en stub
/// som bruges når nøglen mangler og i tests.
/// </summary>
public interface IDestinationGeocoder
{
    Task<GeocodeResult> GeocodeAsync(
        GeocodeRequest request,
        CancellationToken cancellationToken = default );
}
