using Roadcue.Application.Destinations;
using Roadcue.Application.Locations;
using Roadcue.Application.Trips;
using Roadcue.Domain.Trips;

namespace Roadcue.Application.Tests.Trips;

public class TripServiceTests
{
    private static readonly Guid DriverId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly DateTime Now = new(2026, 8, 30, 20, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task GetActive_includes_destination_and_current_location()
    {
        var repo = new FakeTrips(NewTrip());
        var location = new LocationResult(55, 10, new DateTimeOffset(Now), 8, 80, 180, true, 2, true);
        var service = new TripService(repo, new FakeLocations(location), new FixedClock(Now));
        var result = await service.GetActiveAsync(DriverId);
        Assert.NotNull(result);
        Assert.Equal("active", result!.Status);
        Assert.Equal("Hamburg", result.Destination!.Name);
        Assert.Equal(location, result.CurrentLocation);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task Close_removes_trip_from_active_query(bool cancel)
    {
        var trip = NewTrip();
        var repo = new FakeTrips(trip);
        var service = new TripService(repo, new FakeLocations(null), new FixedClock(Now));
        var closed = cancel ? await service.CancelActiveAsync(DriverId) : await service.EndActiveAsync(DriverId);
        Assert.NotNull(closed);
        Assert.Equal(cancel ? TripStatus.Cancelled : TripStatus.Ended, trip.Status);
        Assert.Equal(Now, cancel ? trip.CancelledAt : trip.CompletedAt);
        Assert.Null(await repo.GetActiveTripAsync(DriverId));
        Assert.Equal(1, repo.SaveCount);
    }

    [Fact]
    public async Task Close_without_active_trip_does_not_write()
    {
        var repo = new FakeTrips();
        var service = new TripService(repo, new FakeLocations(null), new FixedClock(Now));
        Assert.Null(await service.EndActiveAsync(DriverId));
        Assert.Null(await service.CancelActiveAsync(DriverId));
        Assert.Equal(0, repo.SaveCount);
    }

    private static Trip NewTrip() => new() { Id = Guid.NewGuid(), DriverId = DriverId, Status = TripStatus.Active, StartedAt = Now.AddHours(-1), LastChangedAt = Now.AddHours(-1), Destination = new Destination { Name = "Hamburg", Latitude = 53.55, Longitude = 9.99, SetAt = Now.AddHours(-1) } };

    private sealed class FakeTrips : IActiveTripRepository
    {
        private readonly List<Trip> _trips;
        public int SaveCount { get; private set; }
        public FakeTrips(params Trip[] trips) => _trips = trips.ToList();
        public Task<Trip?> GetActiveTripAsync(Guid driverId, CancellationToken cancellationToken = default) => Task.FromResult(_trips.FirstOrDefault(x => x.DriverId == driverId && x.Status == TripStatus.Active));
        public Task AddAsync(Trip trip, CancellationToken cancellationToken = default) { _trips.Add(trip); return Task.CompletedTask; }
        public Task SaveChangesAsync(CancellationToken cancellationToken = default) { SaveCount++; return Task.CompletedTask; }
    }

    private sealed class FakeLocations : ILocationService
    {
        private readonly LocationResult? _result;
        public FakeLocations(LocationResult? result) => _result = result;
        public Task<LocationResult?> GetCurrentAsync(Guid driverId, CancellationToken cancellationToken = default) => Task.FromResult(_result);
        public Task<LocationResult> RegisterAsync(Guid driverId, RegisterLocationRequest request, CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class FixedClock : TimeProvider
    {
        private readonly DateTimeOffset _now;
        public FixedClock(DateTime now) => _now = new DateTimeOffset(now);
        public override DateTimeOffset GetUtcNow() => _now;
    }
}
