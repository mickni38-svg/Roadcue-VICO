-- =============================================================================
-- Roadcue - Initial database schema + seed data
-- Target: Microsoft SQL Server (Simply.com MSSQL)
--
-- Kør dette script på din eksterne database via SSMS, Azure Data Studio
-- eller Simply.com's SQL-værktøj.
--
-- Scriptet er idempotent: kan køres flere gange uden fejl.
-- Matcher EF Core migration 20260821120655_InitialCreate2 (RoadcueDbContext).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. (VALGFRIT) Opret database
--    Simply.com opretter typisk databasen via kontrolpanelet. Fjern kommentar
--    hvis du kører lokalt eller på en server hvor du selv styrer databaser.
-- -----------------------------------------------------------------------------
-- IF DB_ID(N'Roadcue') IS NULL
--     CREATE DATABASE [Roadcue];
-- GO
-- USE [Roadcue];
-- GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- -----------------------------------------------------------------------------
-- 2. Tabel: Drivers
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[Drivers]', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[Drivers] (
		[Id]           uniqueidentifier NOT NULL,
		[Name]         nvarchar(max)    NOT NULL,
		[CountryCode]  nvarchar(max)    NOT NULL,
		[LanguageCode] nvarchar(max)    NOT NULL,
		[Status]       nvarchar(max)    NOT NULL,
		CONSTRAINT [PK_Drivers] PRIMARY KEY CLUSTERED ([Id] ASC)
	);
END
GO

-- -----------------------------------------------------------------------------
-- 3. Tabel: Friendships
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[Friendships]', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[Friendships] (
		[Id]             uniqueidentifier NOT NULL,
		[DriverId]       uniqueidentifier NOT NULL,
		[FriendDriverId] uniqueidentifier NOT NULL,
		CONSTRAINT [PK_Friendships] PRIMARY KEY CLUSTERED ([Id] ASC)
	);
END
GO

-- -----------------------------------------------------------------------------
-- 4. Tabel: Places
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[Places]', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[Places] (
		[Id]        uniqueidentifier NOT NULL,
		[Name]      nvarchar(max)    NOT NULL,
		[Latitude]  float            NOT NULL,
		[Longitude] float            NOT NULL,
		[Type]      nvarchar(max)    NOT NULL,
		[HasFuel]   bit              NOT NULL,
		[HasFood]   bit              NOT NULL,
		CONSTRAINT [PK_Places] PRIMARY KEY CLUSTERED ([Id] ASC)
	);
END
GO

-- -----------------------------------------------------------------------------
-- 5. Tabel: DriverLocations (FK -> Drivers)
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[DriverLocations]', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[DriverLocations] (
		[Id]         uniqueidentifier NOT NULL,
		[DriverId]   uniqueidentifier NOT NULL,
		[Latitude]   float            NOT NULL,
		[Longitude]  float            NOT NULL,
		[SpeedKmh]   float            NOT NULL,
		[Heading]    float            NOT NULL,
		[RecordedAt] datetime2        NOT NULL,
		CONSTRAINT [PK_DriverLocations] PRIMARY KEY CLUSTERED ([Id] ASC),
		CONSTRAINT [FK_DriverLocations_Drivers_DriverId]
			FOREIGN KEY ([DriverId])
			REFERENCES [dbo].[Drivers] ([Id])
			ON DELETE CASCADE
	);

	CREATE INDEX [IX_DriverLocations_DriverId]
		ON [dbo].[DriverLocations] ([DriverId]);
END
GO

-- -----------------------------------------------------------------------------
-- 6. EF Core migrations history
--    Vigtigt: markerer at InitialCreate + InitialCreate2 er kørt, så
--    fremtidige `dotnet ef database update` fortsætter fra næste migration
--    uden at forsøge at genoprette tabellerne.
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[__EFMigrationsHistory] (
		[MigrationId]    nvarchar(150) NOT NULL,
		[ProductVersion] nvarchar(32)  NOT NULL,
		CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId] ASC)
	);
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260821120519_InitialCreate')
	INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
	VALUES (N'20260821120519_InitialCreate', N'10.0.11');
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260821120655_InitialCreate2')
	INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
	VALUES (N'20260821120655_InitialCreate2', N'10.0.11');
GO

-- =============================================================================
-- 7. Seed-data (matcher Roadcue.Infrastructure.Persistence.RoadcueSeed)
--    Bruger faste GUIDs så scriptet er idempotent — kan køres flere gange.
-- =============================================================================

DECLARE @MichaelId uniqueidentifier = 'AAAAAAAA-0000-0000-0000-000000000001';
DECLARE @PeterId   uniqueidentifier = 'AAAAAAAA-0000-0000-0000-000000000002';
DECLARE @ThomasId  uniqueidentifier = 'AAAAAAAA-0000-0000-0000-000000000003';

-- Drivers ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Drivers] WHERE [Id] = @MichaelId)
	INSERT INTO [dbo].[Drivers] ([Id], [Name], [CountryCode], [LanguageCode], [Status])
	VALUES (@MichaelId, N'Michael', N'DK', N'da', N'Driving');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Drivers] WHERE [Id] = @PeterId)
	INSERT INTO [dbo].[Drivers] ([Id], [Name], [CountryCode], [LanguageCode], [Status])
	VALUES (@PeterId, N'Peter', N'DK', N'da', N'Resting');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Drivers] WHERE [Id] = @ThomasId)
	INSERT INTO [dbo].[Drivers] ([Id], [Name], [CountryCode], [LanguageCode], [Status])
	VALUES (@ThomasId, N'Thomas', N'DK', N'da', N'Driving');

-- Friendships -----------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Friendships]
			   WHERE [DriverId] = @MichaelId AND [FriendDriverId] = @PeterId)
	INSERT INTO [dbo].[Friendships] ([Id], [DriverId], [FriendDriverId])
	VALUES (NEWID(), @MichaelId, @PeterId);

IF NOT EXISTS (SELECT 1 FROM [dbo].[Friendships]
			   WHERE [DriverId] = @MichaelId AND [FriendDriverId] = @ThomasId)
	INSERT INTO [dbo].[Friendships] ([Id], [DriverId], [FriendDriverId])
	VALUES (NEWID(), @MichaelId, @ThomasId);

-- DriverLocations -------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[DriverLocations] WHERE [DriverId] = @MichaelId)
	INSERT INTO [dbo].[DriverLocations]
		([Id], [DriverId], [Latitude], [Longitude], [SpeedKmh], [Heading], [RecordedAt])
	VALUES
		(NEWID(), @MichaelId, 53.5511, 9.9937, 82, 180, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [dbo].[DriverLocations] WHERE [DriverId] = @PeterId)
	INSERT INTO [dbo].[DriverLocations]
		([Id], [DriverId], [Latitude], [Longitude], [SpeedKmh], [Heading], [RecordedAt])
	VALUES
		(NEWID(), @PeterId, 53.4300, 10.0500, 0, 180, SYSUTCDATETIME());

-- Places ----------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Places] WHERE [Name] = N'Test Truck Stop')
	INSERT INTO [dbo].[Places]
		([Id], [Name], [Latitude], [Longitude], [Type], [HasFuel], [HasFood])
	VALUES
		(NEWID(), N'Test Truck Stop', 53.4302, 10.0501, N'TruckStop', 1, 1);
GO

-- =============================================================================
-- Færdig. Verificer med:
--   SELECT COUNT(*) FROM Drivers;         -- 3
--   SELECT COUNT(*) FROM Friendships;     -- 2
--   SELECT COUNT(*) FROM DriverLocations; -- 2
--   SELECT COUNT(*) FROM Places;          -- 1
-- =============================================================================
