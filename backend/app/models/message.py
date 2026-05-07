from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False, index=True)
    sender_user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    recipient_user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    message_type = Column(String, nullable=True)
    is_read = Column(String, nullable=False, default="false")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    listing = relationship("Listing", foreign_keys=[listing_id])
    sender = relationship("Profile", foreign_keys=[sender_user_id])
    recipient = relationship("Profile", foreign_keys=[recipient_user_id])
