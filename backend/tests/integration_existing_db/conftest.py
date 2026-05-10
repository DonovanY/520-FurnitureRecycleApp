import os
import sys
from pathlib import Path
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

# Make backend/ importable.
BACKEND_ROOT = Path(__file__).resolve().parents[2]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from main import app
from app.database.session import SessionLocal
from app.middleware.security import validate_token
from app.dependencies.auth import get_current_user_id


PYTEST_LISTING_TITLE_PREFIX = "Pytest Integration"


@pytest.fixture(scope="session")
def require_database_url():
    database_url = os.environ.get("DATABASE_URL")
    assert database_url, "DATABASE_URL must be set before running existing DB integration tests."
    return database_url


@pytest.fixture
def db(require_database_url):
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


@pytest.fixture
def existing_profile_users(db):
    """
    Use two existing users from the current Supabase database.

    This avoids inserting into auth.users / public.users and avoids touching
    real profile rows. The test will only create and clean up temporary listing,
    request, message, and notification rows.
    """
    rows = db.execute(
        text(
            """
            select id, email, full_name
            from profiles
            where id is not null
              and email is not null
            order by created_at asc
            limit 2
            """
        )
    ).mappings().all()

    if len(rows) < 2:
        pytest.skip(
            "Need at least two existing profiles in the database to run this integration test."
        )

    return rows


@pytest.fixture
def owner_user(existing_profile_users):
    owner = existing_profile_users[0]
    return {
        "sub": str(owner["id"]),
        "email": owner["email"],
    }


@pytest.fixture
def requester_user(existing_profile_users):
    requester = existing_profile_users[1]
    return {
        "sub": str(requester["id"]),
        "email": requester["email"],
    }


def set_auth_user(user):
    """
    Switch mocked authenticated user for API requests.

    validate_token is used by listings / requests / messages.
    get_current_user_id is used by notifications.
    """
    app.dependency_overrides[validate_token] = lambda: user
    app.dependency_overrides[get_current_user_id] = lambda: UUID(user["sub"])


@pytest.fixture
def auth_as():
    def _set_auth_user(user):
        set_auth_user(user)

    return _set_auth_user


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def seeded_users(db, owner_user, requester_user):
    """
    Compatibility fixture name.

    It does not seed users anymore. It only performs cleanup after the test.
    Cleanup is restricted to test-created rows identified by listing title prefix.
    """
    yield

    owner_id = owner_user["sub"]
    requester_id = requester_user["sub"]

    listing_rows = db.execute(
        text(
            """
            select id, location_id
            from listings
            where title like :title_prefix
              and poster_user_id in (:owner_id, :requester_id)
            """
        ),
        {
            "title_prefix": f"{PYTEST_LISTING_TITLE_PREFIX}%",
            "owner_id": owner_id,
            "requester_id": requester_id,
        },
    ).mappings().all()

    listing_ids = [str(row["id"]) for row in listing_rows]
    location_ids = [row["location_id"] for row in listing_rows if row["location_id"]]

    for listing_id in listing_ids:
        # notifications.listing_id is uuid in your schema, while listings.id is text.
        db.execute(
            text(
                """
                delete from notifications
                where listing_id = cast(:listing_id as uuid)
                """
            ),
            {"listing_id": listing_id},
        )

        db.execute(
            text("delete from messages where listing_id = :listing_id"),
            {"listing_id": listing_id},
        )

        db.execute(
            text("delete from item_requests where listing_id = :listing_id"),
            {"listing_id": listing_id},
        )

        db.execute(
            text("delete from item_images where listing_id = :listing_id"),
            {"listing_id": listing_id},
        )

        db.execute(
            text("delete from listings where id = :listing_id"),
            {"listing_id": listing_id},
        )

    for location_id in location_ids:
        db.execute(
            text("delete from locations where id = :location_id"),
            {"location_id": location_id},
        )

    db.commit()