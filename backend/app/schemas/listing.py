from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class LocationSchema(BaseModel):
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

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
    user_request: Optional["UserRequestSummary"] = None
    images: List[ListingImageSchema] = []
    pickup_type: Optional[str] = None
    pickup_notes: Optional[str] = None

class UserRequestSummary(BaseModel):
    """The current user's request for a listing (if any)"""
    id: str
    message: Optional[str] = None
    status: str
    created_at: datetime

class ListingSummaryResponse(BaseModel):
    id: str
    item: ItemSchema
    location: LocationSchema
    primary_image_url: Optional[str] = None
    created_at: datetime
    request_status_for_current_user: Optional[str] = None

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
    full_name: Optional[str] = None

class ItemRequestResponse(BaseModel):
    id: str
    listing_id: str
    requester: RequesterSummary
    message: Optional[str] = ""
    status: str
    created_at: datetime

class ListingRequestsResponse(BaseModel):
    """Response for GET /api/v1/listings/{id}/requests"""
    requests: List[ItemRequestResponse]

class RequestedItemSummary(BaseModel):
    """A listing that the current user has requested"""
    id: str
    title: str
    category: Optional[str] = None
    condition_level: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    primary_image_url: Optional[str] = None
    request_id: str
    request_status: str
    request_message: Optional[str] = None
    requested_at: datetime

class RequestedItemsResponse(BaseModel):
    """Response for GET /api/v1/profile/requested_items"""
    items: List[RequestedItemSummary]

class CreateListingPayload(BaseModel):
    title: str
    category: str
    condition_level: str
    origin_type: str
    city: str
    description: Optional[str] = None
    pickup_type: Optional[str] = None
    pickup_notes: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    longitude: Optional[float] = None

class CreateListingResponse(BaseModel):
    id: str
    message: str = "Listing created successfully"

