using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Roadcue.Infrastructure.Migrations
{
    public partial class AddLocationQuality : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AccuracyMeters",
                table: "DriverLocations",
                type: "float",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "SpeedKmh",
                table: "DriverLocations",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "Heading",
                table: "DriverLocations",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.CreateIndex(
                name: "IX_DriverLocations_DriverId_RecordedAt",
                table: "DriverLocations",
                columns: new[] { "DriverId", "RecordedAt" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DriverLocations_DriverId_RecordedAt",
                table: "DriverLocations");

            migrationBuilder.DropColumn(
                name: "AccuracyMeters",
                table: "DriverLocations");

            migrationBuilder.AlterColumn<double>(
                name: "SpeedKmh",
                table: "DriverLocations",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Heading",
                table: "DriverLocations",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);
        }
    }
}
