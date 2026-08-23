using Microsoft.EntityFrameworkCore;
using Roadcue.Domain.Drivers;
using Roadcue.Domain.Places;

namespace Roadcue.Infrastructure.Persistence;

public class RoadcueDbContext : DbContext
{
    public RoadcueDbContext(
        DbContextOptions<RoadcueDbContext> options )
        : base( options )
    {
    }

    public DbSet<Driver> Drivers => Set<Driver>();

    public DbSet<DriverLocation> DriverLocations => Set<DriverLocation>();

    public DbSet<Friendship> Friendships => Set<Friendship>();

    public DbSet<Place> Places => Set<Place>();
}
