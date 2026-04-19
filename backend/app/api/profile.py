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
            city=listing.city,
            state=None,
        ),
        primary_image_url=get_primary_image_url(listing),
        created_at=listing.created_at,
    )



@router.get("/posted_items", response_model=PostedListingListResponse)
def get_posted_listings(
    user_id: str = Depends(validate_token),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None),
    db: Session = Depends(get_db),
):
    service = ProfileListingService(db)
    result = service.list_posted_listings(user_id=user_id, page=page, page_size=page_size, q=q)

    return PostedListingSummaryResponse(
        items=[to_posted_listing_summary_response(listing) for listing in result["items"]],
        page=result["page"],
        page_size=result["page_size"],
        total=result["total"],
        total_pages=result["total_pages"],
    )

