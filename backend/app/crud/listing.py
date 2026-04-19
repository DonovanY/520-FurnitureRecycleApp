from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm import Query
from app.models.listing import Listing
from sqlalchemy import func
from math import ceil

def get_listing_by_id(db: Session, listing_id: str):
    return (
        db.query(Listing)
        .options(
            joinedload(Listing.poster),
            joinedload(Listing.requests),
            joinedload(Listing.images),
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
        )
        .filter(Listing.poster_id == user_id)
        .order_by(Listing.created_at.desc())
        .all()
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
    query = db.query(Listing).filter(Listing.status == "available")

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