using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Roadcue.Domain.Drivers;
using Roadcue.Infrastructure.Persistence;

namespace Roadcue.Api.Controllers;

[ApiController]
[Route( "api/drivers" )]
public class DriversController : ControllerBase
{
    private readonly RoadcueDbContext _db;

    public DriversController(
        RoadcueDbContext db )
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Driver>>> GetDrivers()
    {
        var drivers = await _db.Drivers
            .AsNoTracking()
            .ToListAsync();

        return Ok( drivers );
    }

    [HttpGet( "{driverId:guid}/friends" )]
    public async Task<ActionResult<List<Driver>>> GetFriends( Guid driverId )
    {
        var friendIds = await _db.Friendships
            .Where( x => x.DriverId == driverId )
            .Select( x => x.FriendDriverId )
            .ToListAsync();

        var friends = await _db.Drivers
            .Where( x => friendIds.Contains( x.Id ) )
            .AsNoTracking()
            .ToListAsync();

        return Ok( friends );
    }
}