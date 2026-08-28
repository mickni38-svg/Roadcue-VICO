using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roadcue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripsAndDestination : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DriverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Destination_Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Destination_Latitude = table.Column<double>(type: "float", nullable: true),
                    Destination_Longitude = table.Column<double>(type: "float", nullable: true),
                    Destination_Address = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Destination_ProviderPlaceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Destination_SetAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Trips_Drivers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "Drivers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_DriverId_Status",
                table: "Trips",
                columns: new[] { "DriverId", "Status" },
                unique: true,
                filter: "[Status] = 'Active'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Trips");
        }
    }
}
