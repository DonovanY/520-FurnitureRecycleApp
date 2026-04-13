import json
from urllib.request import urlopen

from fastapi import Header, HTTPException
from jose import JWTError, jwt

from app.dependencies.config import get_settings


def _get_jwks() -> dict:
    settings = get_settings()
    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"

    try:
        with urlopen(jwks_url) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Supabase JWKS: {exc}",
        )


async def validate_token(authorization: str = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization header",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format",
        )

    token = authorization.split(" ", 1)[1].strip()

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token header: {exc}",
        )

    kid = unverified_header.get("kid")
    alg = unverified_header.get("alg", "ES256")

    if not kid:
        raise HTTPException(
            status_code=401,
            detail="Token missing key id",
        )

    jwks = _get_jwks()
    keys = jwks.get("keys", [])

    matching_key = next((key for key in keys if key.get("kid") == kid), None)
    if not matching_key:
        raise HTTPException(
            status_code=401,
            detail="Unable to find matching signing key",
        )

    try:
        payload = jwt.decode(
            token,
            matching_key,
            algorithms=[alg],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid or expired token: {exc}",
        )