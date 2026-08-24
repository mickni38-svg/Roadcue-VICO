FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/Roadcue.Api/Roadcue.Api.csproj", "src/Roadcue.Api/"]
COPY ["src/Roadcue.Application/Roadcue.Application.csproj", "src/Roadcue.Application/"]
COPY ["src/Roadcue.Domain/Roadcue.Domain.csproj", "src/Roadcue.Domain/"]
COPY ["src/Roadcue.Infrastructure/Roadcue.Infrastructure.csproj", "src/Roadcue.Infrastructure/"]
RUN dotnet restore "src/Roadcue.Api/Roadcue.Api.csproj"

COPY src/ src/
RUN dotnet publish "src/Roadcue.Api/Roadcue.Api.csproj" \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
USER $APP_UID
ENTRYPOINT ["dotnet", "Roadcue.Api.dll"]
