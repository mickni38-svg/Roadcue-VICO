using Microsoft.EntityFrameworkCore;
using Roadcue.Domain.Drivers;
using Roadcue.Domain.Places;

namespace Roadcue.Infrastructure.Persistence;

public static class RoadcueSeed
{
    public static async Task SeedAsync(
        RoadcueDbContext db )
    {
        if (await db.Drivers.AnyAsync())
            return;

        var michaelId = Guid.NewGuid();
        var peterId = Guid.NewGuid();
        var thomasId = Guid.NewGuid();

        var michael = new Driver
        {
            Id = michaelId,
            Name = "Michael",
            CountryCode = "DK",
            LanguageCode = "da",
            Status = "Driving"
        };

        var peter = new Driver
        {
            Id = peterId,
            Name = "Peter",
            CountryCode = "DK",
            LanguageCode = "da",
            Status = "Resting"
        };

        var thomas = new Driver
        {
            Id = thomasId,
            Name = "Thomas",
            CountryCode = "DK",
            LanguageCode = "da",
            Status = "Driving"
        };

        db.Drivers.AddRange(
            michael,
            peter,
            thomas );

        db.Friendships.AddRange(
            new Friendship
            {
                Id = Guid.NewGuid(),
                DriverId = michaelId,
                FriendDriverId = peterId
            },
            new Friendship
            {
                Id = Guid.NewGuid(),
                DriverId = michaelId,
                FriendDriverId = thomasId
            } );

        db.DriverLocations.AddRange(
            new DriverLocation
            {
                Id = Guid.NewGuid(),
                DriverId = michaelId,
                Latitude = 53.5511,
                Longitude = 9.9937,
                SpeedKmh = 82,
                Heading = 180,
                RecordedAt = DateTime.UtcNow
            },
            new DriverLocation
            {
                Id = Guid.NewGuid(),
                DriverId = peterId,
                Latitude = 53.4300,
                Longitude = 10.0500,
                SpeedKmh = 0,
                Heading = 180,
                RecordedAt = DateTime.UtcNow
            } );

        db.Places.Add(
            new Place
            {
                Id = Guid.NewGuid(),
                Name = "Test Truck Stop",
                Latitude = 53.4302,
                Longitude = 10.0501,
                Type = "TruckStop",
                HasFuel = true,
                HasFood = true
            } );

        await db.SaveChangesAsync();
    }
}