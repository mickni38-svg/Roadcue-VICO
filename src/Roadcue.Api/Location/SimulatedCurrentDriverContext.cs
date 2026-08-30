using Microsoft.EntityFrameworkCore;
using Roadcue.Application.Locations;
using Roadcue.Infrastructure.Persistence;

namespace Roadcue.Api.Location;

public sealed class SimulatedCurrentDriverOptions
{
    public const string SectionName = "SimulatedCurrentDriver";

    public Guid? DriverId { get; set; }
}

public sealed class SimulatedCurrentDriverContext : ICurrentDriverContext
{
    private readonly IConfiguration _configuration;
    private readonly RoadcueDbContext _db;

    public SimulatedCurrentDriverContext(
        IConfiguration configuration,
        RoadcueDbContext db )
    {
        _configuration = configuration;
        _db = db;
    }

    public async Task<Guid?> GetCurrentDriverIdAsync(
        CancellationToken cancellationToken = default )
    {
        var raw = _configuration[$"{SimulatedCurrentDriverOptions.SectionName}:DriverId"];
        if (!Guid.TryParse( raw, out var driverId ))
            return null;

        var exists = await _db.Drivers
            .AsNoTracking()
            .AnyAsync( x => x.Id == driverId, cancellationToken );

        return exists ? driverId : null;
    }
}
