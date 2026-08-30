using Microsoft.Extensions.Options;
using Roadcue.Application.Locations;
using Roadcue.Domain.Drivers;

namespace Roadcue.Application.Tests.Locations;

public sealed class LocationServiceTests
{
    private static readonly Guid DriverId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly DateTimeOffset Now = new(2026, 8, 30, 17, 30, 0, TimeSpan.Zero);

    [Fact]
    public async Task Register_valid_sample_stores_and_returns_current_precise_location()
    {
        var repo = new FakeRepository();
        var service = CreateService(repo);

        var result = await service.RegisterAsync(
            DriverId,
            new RegisterLocationRequest(55.6761, 12.5683, Now.AddSeconds(-10), 12, null, null));

        Assert.Single(repo.Items);
        Assert.True(result.IsCurrent);
        Assert.True(result.IsSuitableForPreciseRouteComparison);
        Assert.Null(result.SpeedKmh);
        Assert.Null(result.Heading);
    }

    [Theory]
    [InlineData(91, 12, "latitude_out_of_range")]
    [InlineData(55, 181, "longitude_out_of_range")]
    public async Task Register_invalid_coordinates_are_rejected(double latitude, double longitude, string error)
    {
        var repo = new FakeRepository();
        var service = CreateService(repo);

        var ex = await Assert.ThrowsAsync<LocationValidationException>(() => service.RegisterAsync(
            DriverId,
            new RegisterLocationRequest(latitude, longitude, Now, 10, 50, 90)));

        Assert.Equal(error, ex.Message);
        Assert.Empty(repo.Items);
    }

    [Fact]
    public async Task Register_future_timestamp_is_rejected()
    {
        var repo = new FakeRepository();
        var service = CreateService(repo);

        await Assert.ThrowsAsync<LocationValidationException>(() => service.RegisterAsync(
            DriverId,
            new RegisterLocationRequest(55, 12, Now.AddMinutes(2), 10, null, null)));

        Assert.Empty(repo.Items);
    }

    [Fact]
    public async Task Poor_accuracy_is_stored_but_not_precise()
    {
        var repo = new FakeRepository();
        var service = CreateService(repo);

        var result = await service.RegisterAsync(
            DriverId,
            new RegisterLocationRequest(55, 12, Now, 125, null, null));

        Assert.Single(repo.Items);
        Assert.True(result.IsCurrent);
        Assert.False(result.IsSuitableForPreciseRouteComparison);
    }

    [Fact]
    public async Task Stale_sample_is_not_current_even_when_accuracy_is_good()
    {
        var repo = new FakeRepository();
        var service = CreateService(repo);

        var result = await service.RegisterAsync(
            DriverId,
            new RegisterLocationRequest(55, 12, Now.AddMinutes(-5), 5, null, null));

        Assert.False(result.IsCurrent);
        Assert.False(result.IsSuitableForPreciseRouteComparison);
    }

    [Fact]
    public async Task GetCurrent_uses_latest_recorded_at_not_insert_order()
    {
        var repo = new FakeRepository();
        repo.Items.AddRange(new[]
        {
            new DriverLocation { Id = Guid.NewGuid(), DriverId = DriverId, Latitude = 1, Longitude = 1, RecordedAt = Now.UtcDateTime },
            new DriverLocation { Id = Guid.NewGuid(), DriverId = DriverId, Latitude = 2, Longitude = 2, RecordedAt = Now.AddMinutes(-10).UtcDateTime }
        });
        var service = CreateService(repo);

        var result = await service.GetCurrentAsync(DriverId);

        Assert.NotNull(result);
        Assert.Equal(1, result.Latitude);
    }

    private static LocationService CreateService(FakeRepository repo)
    {
        var options = Options.Create(new LocationOptions
        {
            CurrentMaxAgeSeconds = 120,
            PreciseRouteMaxAccuracyMeters = 50,
            FutureTimestampToleranceSeconds = 30
        });
        return new LocationService(repo, options, new FixedTimeProvider(Now));
    }

    private sealed class FakeRepository : IDriverLocationRepository
    {
        public List<DriverLocation> Items { get; } = new();

        public Task AddAsync(DriverLocation location, CancellationToken cancellationToken = default)
        {
            Items.Add(location);
            return Task.CompletedTask;
        }

        public Task<DriverLocation?> GetLatestAsync(Guid driverId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Items
                .Where(x => x.DriverId == driverId)
                .OrderByDescending(x => x.RecordedAt)
                .FirstOrDefault());
        }
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _utcNow;

        public FixedTimeProvider(DateTimeOffset utcNow) => _utcNow = utcNow;

        public override DateTimeOffset GetUtcNow() => _utcNow;
    }
}
