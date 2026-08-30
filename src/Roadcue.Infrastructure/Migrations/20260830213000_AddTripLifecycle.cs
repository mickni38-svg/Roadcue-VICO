using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Roadcue.Infrastructure.Persistence;

#nullable disable

namespace Roadcue.Infrastructure.Migrations;

[DbContext(typeof(RoadcueDbContext))]
[Migration("20260830213000_AddTripLifecycle")]
public partial class AddTripLifecycle : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(name: "CancelledAt", table: "Trips", type: "datetime2", nullable: true);
        migrationBuilder.AddColumn<DateTime>(name: "CompletedAt", table: "Trips", type: "datetime2", nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "CancelledAt", table: "Trips");
        migrationBuilder.DropColumn(name: "CompletedAt", table: "Trips");
    }
}
