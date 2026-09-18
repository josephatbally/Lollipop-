from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./lollipop.db"
    jwt_secret: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    media_storage_path: str = "./private_media"
    max_media_size_bytes: int = 524288000
    # Development mode: authenticated users may view published media without a subscription.
    # Set LOLLIPOP_FREE_MEDIA_ACCESS=false before real monetized distribution.
    free_media_access: bool = True
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
