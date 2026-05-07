from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Request Schemas
class RequestUpdateSchema(BaseModel):
    """Schema for updating a request status"""
    status: str  # "accepted" or "rejected"

class RequestDetailResponse(BaseModel):
    """Detailed request information"""
    id: str
    listing_id: str
    requester_user_id: str
    requester_email: str
    requester_name: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime

# Message Schemas
class MessageCreateSchema(BaseModel):
    """Schema for creating a new message"""
    listing_id: str
    recipient_user_id: str
    content: str

class MessageResponse(BaseModel):
    """Message response schema"""
    id: str
    listing_id: str
    sender_user_id: str
    sender_name: Optional[str] = None
    recipient_user_id: str
    recipient_name: Optional[str] = None
    content: str
    is_read: str
    created_at: datetime

class ConversationResponse(BaseModel):
    """Conversation response with all messages"""
    listing_id: str
    listing_title: str
    other_user_id: str
    other_user_name: Optional[str] = None
    messages: list[MessageResponse]
