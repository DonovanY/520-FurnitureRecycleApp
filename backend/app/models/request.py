from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class ItemRequest(Base):
    __tablename__ = "item_requests"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False, index=True)
    requester_user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)

    message = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    listing = relationship("Listing", back_populates="requests")