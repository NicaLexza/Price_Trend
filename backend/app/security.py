import os

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader


API_KEY = os.getenv("API_KEY", "dev-key")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def get_api_key(x_api_key: str = Depends(api_key_header)):
    """
    Simple API key validation using the X-API-Key header.
    If API_KEY env var is empty, auth is effectively disabled.
    """
    if not API_KEY:
        # Auth disabled; allow all requests
        return None

    if x_api_key == API_KEY:
        return x_api_key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key",
    )


