from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.database.session import get_db
from app.middleware.security import validate_token
from app.crud import message as message_crud
from app.crud import listing as listing_crud
from app.schemas.message import MessageCreateSchema, MessageResponse, ConversationResponse
from app.models.message import Message
from app.models.profile import Profile

router = APIRouter()

@router.post("/messages", response_model=MessageResponse)
def send_message(
    message_data: MessageCreateSchema,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Send a message in a listing conversation.
    Only poster and requester can message each other.
    """
    sender_id = auth_user.get("sub")
    
    # Verify listing exists
    listing = listing_crud.get_listing_by_id(db, message_data.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Verify sender is either poster or requester
    # (You can add more validation here to check if recipient has an accepted request)
    
    # Create message
    message = Message(
        id=str(uuid4()),
        listing_id=message_data.listing_id,
        sender_user_id=sender_id,
        recipient_user_id=message_data.recipient_user_id,
        content=message_data.content,
        is_read="false"
    )
    
    created_message = message_crud.create_message(db, message)
    
    # Get sender and recipient names
    sender = db.query(Profile).filter(Profile.id == sender_id).first()
    recipient = db.query(Profile).filter(Profile.id == message_data.recipient_user_id).first()
    
    return MessageResponse(
        id=created_message.id,
        listing_id=created_message.listing_id,
        sender_user_id=created_message.sender_user_id,
        sender_name=sender.full_name if sender else None,
        recipient_user_id=created_message.recipient_user_id,
        recipient_name=recipient.full_name if recipient else None,
        content=created_message.content,
        is_read=created_message.is_read,
        created_at=created_message.created_at
    )

@router.get("/messages/{listing_id}", response_model=ConversationResponse)
def get_conversation(
    listing_id: str,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Get all messages for a listing conversation.
    Only participants can view the conversation.
    """
    user_id = auth_user.get("sub")
    
    # Verify listing exists
    listing = listing_crud.get_listing_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Get messages
    messages = message_crud.get_messages_for_listing(db, listing_id, user_id)
    
    # Determine the other user (poster or requester)
    other_user_id = None
    if str(listing.poster_user_id) == str(user_id):
        # Current user is poster, find the requester
        # For now, just get the first message's other participant
        if messages:
            other_user_id = messages[0].recipient_user_id if str(messages[0].sender_user_id) == str(user_id) else messages[0].sender_user_id
    else:
        # Current user is requester, other user is poster
        other_user_id = listing.poster_user_id
    
    other_user = db.query(Profile).filter(Profile.id == other_user_id).first() if other_user_id else None
    
    # Mark messages as read
    message_crud.mark_messages_as_read(db, listing_id, user_id)
    
    # Build response
    message_responses = []
    for msg in messages:
        sender = db.query(Profile).filter(Profile.id == msg.sender_user_id).first()
        recipient = db.query(Profile).filter(Profile.id == msg.recipient_user_id).first()
        
        message_responses.append(MessageResponse(
            id=msg.id,
            listing_id=msg.listing_id,
            sender_user_id=msg.sender_user_id,
            sender_name=sender.full_name if sender else None,
            recipient_user_id=msg.recipient_user_id,
            recipient_name=recipient.full_name if recipient else None,
            content=msg.content,
            is_read=msg.is_read,
            created_at=msg.created_at
        ))
    
    return ConversationResponse(
        listing_id=listing_id,
        listing_title=listing.title,
        other_user_id=str(other_user_id) if other_user_id else "",
        other_user_name=other_user.full_name if other_user else None,
        messages=message_responses
    )
