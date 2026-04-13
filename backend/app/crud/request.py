from sqlalchemy.orm import Session
from app.models.request import ItemRequest

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