from sqlalchemy.orm import Session, joinedload
from app.models.request import ItemRequest
from app.models.profile import Profile
from app.models.listing import Listing
from app.models.location import Location

def get_request_by_listing_and_user(db: Session, listing_id: str, requester_user_id: str):
    return (
        db.query(ItemRequest)
        .filter(
            ItemRequest.listing_id == listing_id,
            ItemRequest.requester_user_id == requester_user_id,
        )
        .first()
    )

def create_item_request(db: Session, request_obj: ItemRequest):
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)
    return request_obj

def get_requests_for_listing(db: Session, listing_id: str):
    """Get all requests for a specific listing with requester details"""
    return (
        db.query(ItemRequest)
        .join(Profile, ItemRequest.requester_user_id == Profile.id)
        .filter(ItemRequest.listing_id == listing_id)
        .order_by(ItemRequest.created_at.desc())
        .all()
    )

def get_requests_by_user(db: Session, user_id: str):
    """Get all requests made by a specific user with listing details"""
    return (
        db.query(ItemRequest)
        .join(Listing, ItemRequest.listing_id == Listing.id)
        .options(joinedload(ItemRequest.listing).joinedload(Listing.location))
        .filter(ItemRequest.requester_user_id == user_id)
        .order_by(ItemRequest.created_at.desc())
        .all()
    )

def get_request_by_id(db: Session, request_id: str):
    """Get a single request by ID"""
    return db.query(ItemRequest).filter(ItemRequest.id == request_id).first()

def update_request_status(db: Session, request_id: str, status: str):
    """Update the status of a request"""
    request = db.query(ItemRequest).filter(ItemRequest.id == request_id).first()
    if request:
        request.status = status
        db.commit()
        db.refresh(request)
    return request

def decline_other_requests(db: Session, listing_id: str, accepted_request_id: str):
    """Auto-decline all other pending requests for a listing when one is accepted"""
    db.query(ItemRequest).filter(
        ItemRequest.listing_id == listing_id,
        ItemRequest.id != accepted_request_id,
        ItemRequest.status == "pending"
    ).update({"status": "rejected"})
    db.commit()