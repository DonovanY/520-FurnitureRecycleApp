from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from uuid import uuid4

from app.models.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)

    listing_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    request_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    message_id = Column(UUID(as_uuid=True), nullable=True, index=True)

    is_read = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)