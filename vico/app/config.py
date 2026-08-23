# pydantic-settings læser automatisk værdier fra .env-filen og miljøvariabler.
# BaseSettings svarer til IOptions<T> / IConfiguration i .NET.
from pydantic_settings import BaseSettings, SettingsConfigDict


# Settings-klassen definerer alle konfigurationsværdier som typede felter.
# Pydantic validerer typerne ved opstart – mangler en variabel i .env, kaster den en fejl.
class Settings(BaseSettings):
    roadcue_api_base_url: str          # URL til Roadcue's backend-API
    openai_api_key: str                # Hemmelig API-nøgle til OpenAI
    openai_model: str = "gpt-4.1-mini" # Model-navn med standardværdi

    model_config = SettingsConfigDict(
        env_file=".env",           # Læs værdier fra denne fil
        env_file_encoding="utf-8",
        extra="ignore",            # Ignorer ukendte variabler i .env i stedet for at fejle
    )


# Singleton-instans – importeres af alle moduler der har brug for konfiguration.
settings = Settings()