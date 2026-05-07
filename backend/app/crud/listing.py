from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm import Query
from app.models.listing import Listing
from app.models.location import Location
from app.models.item_image import ItemImage
from sqlalchemy import func
from math import ceil
import uuid

def get_listing_by_id(db: Session, listing_id: str):
    return (
        db.query(Listing)
        .options(
            joinedload(Listing.poster),
            joinedload(Listing.requests),
            joinedload(Listing.images),
            joinedload(Listing.location),
        )
        .filter(Listing.id == listing_id)
        .first()
    )

def get_listings_by_user_id(db: Session, user_id: str):
    return (
        db.query(Listing)
        .options(
            joinedload(Listing.poster),
            joinedload(Listing.requests),
            joinedload(Listing.images),
            joinedload(Listing.location),
        )
        .filter(Listing.poster_user_id == user_id)
        .order_by(Listing.created_at.desc())
    )

# Helper function to apply pagination and optional search filtering to a query list of listings
def get_listings_paginated(db: Session, search_result: Query, page: int, page_size: int, q: str | None = None):

    query = search_result

    if q:
        like_pattern = f"%{q.strip()}%"
        query = query.filter(
            (Listing.title.ilike(like_pattern)) |
            (Listing.description.ilike(like_pattern)) |
            (Listing.category.ilike(like_pattern)) |
            (Listing.city.ilike(like_pattern))
        )

    total = query.count()

    items = (
        query.order_by(Listing.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


def get_all_available_listings(db: Session):
    return (
        db.query(Listing)
        .options(
            joinedload(Listing.poster),
            joinedload(Listing.images),
        )
        .order_by(Listing.created_at.desc())
        .all()
    )

def get_available_listings_paginated(
    db: Session,
    *,
    page: int,
    page_size: int,
    q: str | None = None,
):
    query = db.query(Listing).options(
        joinedload(Listing.images),
        joinedload(Listing.location),
    ).filter(Listing.status == "available")

    if q:
        like_pattern = f"%{q.strip()}%"
        query = query.filter(
            (Listing.title.ilike(like_pattern)) |
            (Listing.description.ilike(like_pattern)) |
            (Listing.category.ilike(like_pattern)) |
            (Listing.city.ilike(like_pattern))
        )

    total = query.count()

    items = (
        query.order_by(Listing.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }

def create_listing(db: Session, user_id: str, payload: dict, image_url: str | None = None, latitude: float | None = None, longitude: float | None = None):
    """
    Create a new listing in the database.
    If image_url is provided, also create an item_image record.
    """
    listing_id = str(uuid.uuid4())
    
    listing = Listing(
        id=listing_id,
        poster_user_id=user_id,
        title=payload["title"],
        description=payload.get("description"),
        category=payload["category"],
        condition_level=payload["condition_level"],
        origin_type=payload["origin_type"],
        city=payload["city"],
        pickup_type=payload.get("pickup_type"),
        pickup_notes=payload.get("pickup_notes"),
        status="available",  # Default status
        is_public=True,
    )
    
    db.add(listing)
    db.flush()  # Flush to get the listing ID before adding image/location

    # Create a Location row when we have coordinates or any address fields
    has_coords = latitude is not None and longitude is not None
    has_address = any(payload.get(f) for f in ("address_line_1", "city", "state", "postal_code", "country"))
    if has_coords or has_address:
        location = Location(
            id=str(uuid.uuid4()),
            latitude=latitude if has_coords else None,
            longitude=longitude if has_coords else None,
            address_line_1=payload.get("address_line_1"),
            address_line_2=payload.get("address_line_2"),
            city=payload.get("city"),
            state=payload.get("state"),
            postal_code=payload.get("postal_code"),
            country=payload.get("country"),
        )
        db.add(location)
        db.flush()
        listing.location_id = location.id
    
    # If image URL provided, create item_image record
    # Skip base64 data URLs and overly long URLs (database index limit is ~2700 chars)
    if image_url and image_url.strip():
        if image_url.startswith("data:"):
            # Skip base64 data URLs - they're too long for the database index
            pass
        elif len(image_url) > 2000:
            # Skip URLs longer than 2000 chars (safety margin under index limit)
            pass
        else:
            image = ItemImage(
                id=str(uuid.uuid4()),
                listing_id=listing_id,
                uploaded_by_user_id=user_id,
                storage_bucket="external",  # Indicate it's an external URL
                storage_path=image_url,
                public_url=image_url,
                is_primary=True,
                sort_order=0,
            )
            db.add(image)
    
    db.commit()
    db.refresh(listing)
    
    return listing

def update_listing_status(db: Session, listing_id: str, status: str):
    """Update the status of a listing"""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing:
        listing.status = status
        db.commit()
        db.refresh(listing)
    return listing