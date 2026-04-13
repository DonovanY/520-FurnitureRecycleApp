from sqlalchemy.orm import Session, joinedload
from app.models.listing import Listing

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