from datetime import datetime
from uuid import UUID
from typing import Literal

from pydantic import BaseModel, ConfigDict


NotificationType = Literal[
    "pickup_requested",
    "pickup_request_accepted",
    "pickup_request_rejected",
    "listing_completed",
]


class NotificationCreate(BaseModel):
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    related_listing_id: UUID | None = None
    related_request_id: UUID | None = None
    actor_user_id: UUID | None = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime