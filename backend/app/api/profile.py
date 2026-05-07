from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.security import validate_token
from app.schemas.profile import (
    PostedListingListResponse,
    PostedListingSummaryResponse,
    LocationSchema,
    ItemSchema
)
from app.schemas.listing import RequestedItemsResponse, RequestedItemSummary
from app.services.profile_listing_service import ProfileListingService

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


def get_primary_image_url(listing):
    """
    Return the primary image URL for a listing.
    - If there are no images, return None
    - If an image is marked is_primary=True, use that
    - Otherwise, use the first image
    """
    if not getattr(listing, "images", None):
        return None

    for image in listing.images:
        if image.is_primary:
            return image.public_url

    return listing.images[0].public_url


def to_posted_listing_summary_response(listing) -> PostedListingSummaryResponse:
    loc = getattr(listing, "location", None)
    return PostedListingSummaryResponse(
        id=str(listing.id),
        item=ItemSchema(
            title=listing.title,
            description=listing.description,
            condition_level=listing.condition_level,
            origin_type=listing.origin_type,
            status=listing.status,
            category=listing.category,
        ),
        location=LocationSchema(
            address_line_1=loc.address_line_1 if loc else None,
            address_line_2=loc.address_line_2 if loc else None,
            city=loc.city if loc else listing.city,
            state=loc.state if loc else None,
            postal_code=loc.postal_code if loc else None,
            country=loc.country if loc else None,
            latitude=float(loc.latitude) if loc and loc.latitude is not None else None,
            longitude=float(loc.longitude) if loc and loc.longitude is not None else None,
        ),
        primary_image_url=get_primary_image_url(listing),
        created_at=listing.created_at,
    )



@router.get("/posted_items", response_model=PostedListingListResponse)
def get_posted_listings(
    auth_user: str = Depends(validate_token),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None),
    db: Session = Depends(get_db),
):
    service = ProfileListingService(db)

    user_id = auth_user.get("sub")

    result = service.list_posted_listings(user_id=user_id, page=page, page_size=page_size, q=q)

    return PostedListingListResponse(
        items=[to_posted_listing_summary_response(listing) for listing in result["items"]],
        page=result["page"],
        page_size=result["page_size"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.get("/requested_items", response_model=RequestedItemsResponse)
def get_requested_items(
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    """
    Get all items that the current user has requested.
    Returns the listing details along with request status and message.
    """
    from app.crud.request import get_requests_by_user
    
    user_id = auth_user.get("sub")
    
    # Get all requests by this user
    requests = get_requests_by_user(db, user_id)
    
    # Build response with listing details
    items = []
    for req in requests:
        listing = req.listing
        loc = getattr(listing, "location", None)
        items.append(
            RequestedItemSummary(
                id=str(listing.id),
                title=listing.title,
                category=listing.category,
                condition_level=listing.condition_level,
                address_line_1=loc.address_line_1 if loc else None,
                address_line_2=loc.address_line_2 if loc else None,
                city=loc.city if loc else listing.city,
                state=loc.state if loc else None,
                primary_image_url=get_primary_image_url(listing),
                request_id=str(req.id),
                request_status=req.status,
                request_message=req.message,
                requested_at=req.created_at,
            )
        )
    
    return RequestedItemsResponse(items=items)


