using Microsoft.EntityFrameworkCore;
using Roadcue.Api.Location;
using Roadcue.Application.Locations;
using Roadcue.Infrastructure;
using Roadcue.Infrastructure.Persistence;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<RoadcueDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("Roadcue")));
builder.Services.AddRoadcueDestinations(builder.Configuration);
builder.Services.AddRoadcueLocation(builder.Configuration);
builder.Services.AddRoadcueTrips();
builder.Services.AddRoadcueSpeech(builder.Configuration);
builder.Services.AddScoped<ICurrentDriverContext, SimulatedCurrentDriverContext>();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
if (!app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.MapControllers();
app.MapGet("/", () => Results.Ok(new { service = "Roadcue.Api", status = "running" }));
app.MapGet("/health", () => Results.Ok("healthy"));
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RoadcueDbContext>();
    await RoadcueSeed.SeedAsync(db);
}
app.Run();