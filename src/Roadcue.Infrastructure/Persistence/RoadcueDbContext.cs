using Microsoft.EntityFrameworkCore;
using Roadcue.Domain.Drivers;
using Roadcue.Domain.Places;
using Roadcue.Domain.Trips;

namespace Roadcue.Infrastructure.Persistence;

public class RoadcueDbContext : DbContext
{
    public RoadcueDbContext(DbContextOptions<RoadcueDbContext> options) : base(options) { }
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<DriverLocation> DriverLocations => Set<DriverLocation>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<Trip> Trips => Set<Trip>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<DriverLocation>(location =>
        {
            location.HasKey(x => x.Id);
            location.Property(x => x.Latitude).IsRequired();
            location.Property(x => x.Longitude).IsRequired();
            location.Property(x => x.RecordedAt).IsRequired();
            location.Property(x => x.AccuracyMeters).IsRequired(false);
            location.Property(x => x.SpeedKmh).IsRequired(false);
            location.Property(x => x.Heading).IsRequired(false);
            location.HasIndex(x => new { x.DriverId, x.RecordedAt });
        });
        modelBuilder.Entity<Trip>(trip =>
        {
            trip.HasKey(t => t.Id);
            trip.Property(t => t.Status).HasConversion<string>().HasMaxLength(16).IsRequired();
            trip.Property(t => t.StartedAt).IsRequired();
            trip.Property(t => t.LastChangedAt).IsRequired();
            trip.Property(t => t.CompletedAt).IsRequired(false);
            trip.Property(t => t.CancelledAt).IsRequired(false);
            trip.OwnsOne(t => t.Destination, dest =>
            {
                dest.Property(d => d.Name).HasMaxLength(256).IsRequired();
                dest.Property(d => d.Address).HasMaxLength(512);
                dest.Property(d => d.ProviderPlaceId).HasMaxLength(128);
                dest.Property(d => d.Latitude).IsRequired();
                dest.Property(d => d.Longitude).IsRequired();
                dest.Property(d => d.SetAt).IsRequired();
            });
            trip.HasIndex(t => new { t.DriverId, t.Status }).HasFilter("[Status] = 'Active'").IsUnique();
            trip.HasOne(t => t.Driver).WithMany().HasForeignKey(t => t.DriverId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
