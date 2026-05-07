from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.message import Message
from app.models.profile import Profile

def create_message(db: Session, message_obj: Message):
    """Create a new message"""
    db.add(message_obj)
    db.commit()
    db.refresh(message_obj)
    return message_obj

def get_messages_for_listing(db: Session, listing_id: str, user_id: str):
    """Get all messages for a listing where the user is sender or recipient"""
    return (
        db.query(Message)
        .filter(
            Message.listing_id == listing_id,
            or_(
                Message.sender_user_id == user_id,
                Message.recipient_user_id == user_id
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

def mark_messages_as_read(db: Session, listing_id: str, user_id: str):
    """Mark all messages in a conversation as read for the recipient"""
    db.query(Message).filter(
        Message.listing_id == listing_id,
        Message.recipient_user_id == user_id,
        Message.is_read == "false"
    ).update({"is_read": "true"})
    db.commit()
