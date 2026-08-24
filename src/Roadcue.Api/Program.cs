using Microsoft.EntityFrameworkCore;
using Roadcue.Infrastructure.Persistence;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder( args );

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var allowedOrigins = builder.Configuration
    .GetSection( "Cors:AllowedOrigins" )
    .Get<string[]>() ?? [];

builder.Services.AddCors( options =>
{
    options.AddPolicy( "AngularClient", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins( allowedOrigins )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    } );
} );

builder.Services.AddDbContext<RoadcueDbContext>( options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString( "Roadcue" ) );
} );

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

if (allowedOrigins.Length > 0)
{
    app.UseCors( "AngularClient" );
}

app.MapHealthChecks( "/health" );
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<RoadcueDbContext>();

    await RoadcueSeed.SeedAsync( db );
}

app.Run();
