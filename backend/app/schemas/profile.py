from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class LocationSchema(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None

class ItemSchema(BaseModel):
    title: str
    description: Optional[str] = None
    condition_level: str
    origin_type: str
    status: str
    category: Optional[str] = None


class PostedListingSummaryResponse(BaseModel):
    id: str
    item: ItemSchema
    location: LocationSchema
    primary_image_url: Optional[str] = None
    created_at: datetime

class PostedListingListResponse(BaseModel):
    items: list[PostedListingSummaryResponse]
    page: int
    page_size: int
    total: int
    total_pages: int