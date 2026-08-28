using Roadcue.Application.Destinations;
using Roadcue.Domain.Trips;

namespace Roadcue.Application.Tests.Destinations;

public class DestinationServiceTests
{
    private static readonly Guid DriverId = Guid.Parse( "11111111-1111-1111-1111-111111111111" );
    private static readonly DateTime FixedUtc = new( 2026, 8, 25, 12, 0, 0, DateTimeKind.Utc );

    [Fact]
    public async Task Found_creates_trip_and_persists_destination_when_no_active_trip()
    {
        var repo = new FakeTripRepository();
        var geocoder = new FakeGeocoder( GeocodeResult.Found(
            new GeocodeCandidate( "Hamburg", 53.5, 9.9, "Hamburg, DE", "here:1", 0.95 ) ) );
        var service = new DestinationService( repo, geocoder, new FixedClock( FixedUtc ) );

        var result = await service.SetActiveDestinationAsync( DriverId, "Hamburg", null );

        Assert.Equal( SetDestinationStatus.Set, result.Status );
        Assert.NotNull( result.Destination );
        Assert.Equal( "Hamburg", result.Destination!.Name );
        Assert.Equal( DriverId, result.Destination.DriverId );
        Assert.Single( repo.Trips );
        Assert.Equal( 1, repo.SaveCount );
        Assert.Equal( FixedUtc, repo.Trips[ 0 ].Destination!.SetAt );
    }

    [Fact]
    public async Task Found_updates_existing_active_trip_without_creating_new()
    {
        var existing = new Trip
        {
            Id = Guid.NewGuid(),
            DriverId = DriverId,
            Status = TripStatus.Active,
            StartedAt = FixedUtc.AddHours( -1 ),
            LastChangedAt = FixedUtc.AddHours( -1 ),
            Destination = new Destination
            {
                Name = "Padborg",
                Latitude = 54.8,
                Longitude = 9.3,
                SetAt = FixedUtc.AddHours( -1 ),
            },
        };
        var repo = new FakeTripRepository( existing );
        var geocoder = new FakeGeocoder( GeocodeResult.Found(
            new GeocodeCandidate( "Hamburg", 53.5, 9.9, null, null, 0.9 ) ) );
        var service = new DestinationService( repo, geocoder, new FixedClock( FixedUtc ) );

        var result = await service.SetActiveDestinationAsync( DriverId, "Hamburg", null );

        Assert.Equal( SetDestinationStatus.Set, result.Status );
        Assert.Single( repo.Trips );
        Assert.Equal( "Hamburg", existing.Destination!.Name );
        Assert.Equal( FixedUtc, existing.LastChangedAt );
    }

    [Fact]
    public async Task Ambiguous_returns_candidates_and_does_not_touch_repository()
    {
        var repo = new FakeTripRepository();
        var candidates = new[]
        {
            new GeocodeCandidate( "København", 55.6, 12.5, null, null, 0.8 ),
            new GeocodeCandidate( "Københavns Lufthavn", 55.6, 12.6, null, null, 0.75 ),
        };
        var geocoder = new FakeGeocoder( GeocodeResult.Ambiguous( candidates ) );
        var service = new DestinationService( repo, geocoder, new FixedClock( FixedUtc ) );

        var result = await service.SetActiveDestinationAsync( DriverId, "København", null );

        Assert.Equal( SetDestinationStatus.Ambiguous, result.Status );
        Assert.Equal( 2, result.Candidates!.Count );
        Assert.Empty( repo.Trips );
        Assert.Equal( 0, repo.SaveCount );
    }

    [Fact]
    public async Task ProviderFailure_preserves_existing_destination()
    {
        var existing = new Trip
        {
            Id = Guid.NewGuid(),
            DriverId = DriverId,
            Status = TripStatus.Active,
            StartedAt = FixedUtc,
            LastChangedAt = FixedUtc,
            Destination = new Destination
            {
                Name = "Padborg",
                Latitude = 54.8,
                Longitude = 9.3,
                SetAt = FixedUtc,
            },
        };
        var repo = new FakeTripRepository( existing );
        var geocoder = new FakeGeocoder( GeocodeResult.Failed( "here_timeout" ) );
        var service = new DestinationService( repo, geocoder, new FixedClock( FixedUtc ) );

        var result = await service.SetActiveDestinationAsync( DriverId, "Hamburg", null );

        Assert.Equal( SetDestinationStatus.ProviderUnavailable, result.Status );
        Assert.Equal( "here_timeout", result.FailureReason );
        Assert.Equal( "Padborg", existing.Destination!.Name );
        Assert.Equal( 0, repo.SaveCount );
    }

    [Fact]
    public async Task NotFound_returns_status_without_persisting()
    {
        var repo = new FakeTripRepository();
        var geocoder = new FakeGeocoder( GeocodeResult.NotFound() );
        var service = new DestinationService( repo, geocoder, new FixedClock( FixedUtc ) );

        var result = await service.SetActiveDestinationAsync( DriverId, "asdfghjkl", null );

        Assert.Equal( SetDestinationStatus.NotFound, result.Status );
        Assert.Empty( repo.Trips );
    }

    [Fact]
    public async Task GetActive_returns_null_when_no_trip()
    {
        var service = new DestinationService(
            new FakeTripRepository(),
            new FakeGeocoder( GeocodeResult.NotFound() ),
            new FixedClock( FixedUtc ) );

        var dto = await service.GetActiveDestinationAsync( DriverId );

        Assert.Null( dto );
    }

    private sealed class FakeTripRepository : IActiveTripRepository
    {
        public List<Trip> Trips { get; } = new();
        public int SaveCount { get; private set; }

        public FakeTripRepository( params Trip[] seed )
        {
            Trips.AddRange( seed );
        }

        public Task<Trip?> GetActiveTripAsync( Guid driverId, CancellationToken cancellationToken = default )
        {
            var trip = Trips.FirstOrDefault(
                t => t.DriverId == driverId && t.Status == TripStatus.Active );
            return Task.FromResult( trip );
        }

        public Task AddAsync( Trip trip, CancellationToken cancellationToken = default )
        {
            Trips.Add( trip );
            return Task.CompletedTask;
        }

        public Task SaveChangesAsync( CancellationToken cancellationToken = default )
        {
            SaveCount++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeGeocoder : IDestinationGeocoder
    {
        private readonly GeocodeResult _result;

        public FakeGeocoder( GeocodeResult result )
        {
            _result = result;
        }

        public Task<GeocodeResult> GeocodeAsync(
            GeocodeRequest request,
            CancellationToken cancellationToken = default )
        {
            return Task.FromResult( _result );
        }
    }

    private sealed class FixedClock : TimeProvider
    {
        private readonly DateTimeOffset _now;

        public FixedClock( DateTime nowUtc )
        {
            _now = new DateTimeOffset( nowUtc, TimeSpan.Zero );
        }

        public override DateTimeOffset GetUtcNow() => _now;
    }
}
