from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class ItemImage(Base):
    __tablename__ = "item_images"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False, index=True)
    uploaded_by_user_id = Column(String, ForeignKey("profiles.id"), nullable=False, index=True)

    storage_bucket = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    public_url = Column(String, nullable=False)

    is_primary = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    listing = relationship("Listing", back_populates="images")