import os
from typing import List

class Settings:
    PROJECT_NAME: str = "CPLMS AI & Intelligence Service"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api/ai"
    
    # Optional LLM API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",") 
        if origin.strip()
    ]

settings = Settings()
