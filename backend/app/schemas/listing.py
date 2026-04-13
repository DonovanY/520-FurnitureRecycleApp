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

class OwnerSchema(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

class ListingImageSchema(BaseModel):
    id: str
    public_url: str
    is_primary: bool
    sort_order: int
    created_at: datetime

class ListingDetailResponse(BaseModel):
    id: str
    item: ItemSchema
    location: LocationSchema
    primary_image_url: Optional[str] = None
    owner: OwnerSchema
    created_at: datetime
    request_status_for_current_user: Optional[str] = None
    images: List[ListingImageSchema] = []

class ListingSummaryResponse(BaseModel):
    id: str
    item: ItemSchema
    location: LocationSchema
    primary_image_url: Optional[str] = None
    created_at: datetime

class ListingListResponse(BaseModel):
    items: list[ListingSummaryResponse]
    page: int
    page_size: int
    total: int
    total_pages: int

class RequestItemPayload(BaseModel):
    message: Optional[str] = ""

class RequesterSummary(BaseModel):
    id: str
    email: str

class ItemRequestResponse(BaseModel):
    id: str
    listing_id: str
    requester: RequesterSummary
    message: Optional[str] = ""
    status: str
    created_at: datetime

