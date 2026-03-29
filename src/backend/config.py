from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-change-in-production"
    DATABASE_URL: str = "sqlite:///./nutrition_app.db"
    MODELSCOPE_API_KEY: str = "ms-c81078dc-06a3-4e13-9283-6b018b363da9"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 168

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
