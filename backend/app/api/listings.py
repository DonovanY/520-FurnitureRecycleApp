from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.security import validate_token
from app.schemas.listing import (
    ListingListResponse,
    ListingSummaryResponse,
    ListingDetailResponse,
    LocationSchema,
    ItemSchema,
    OwnerSchema,
    RequestItemPayload,
    ItemRequestResponse,
    RequesterSummary,
    ListingImageSchema,
)
from app.services.listing_service import ListingService

router = APIRouter(prefix="/api/v1/listings", tags=["listings"])


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


def to_listing_summary_response(listing) -> ListingSummaryResponse:
    return ListingSummaryResponse(
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


def to_listing_detail_response(listing, request_status_for_current_user=None) -> ListingDetailResponse:
    return ListingDetailResponse(
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
        images=[
            ListingImageSchema(
                id=str(image.id),
                public_url=image.public_url,
                is_primary=image.is_primary,
                sort_order=image.sort_order,
                created_at=image.created_at,
            )
            for image in (listing.images or [])
        ],
        owner=OwnerSchema(
            id=str(listing.poster.id),
            email=listing.poster.email,
            full_name=None,
        ),
        created_at=listing.created_at,
        request_status_for_current_user=request_status_for_current_user,
    )


@router.get("", response_model=ListingListResponse)
def get_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None),
    db: Session = Depends(get_db),
):
    service = ListingService(db)
    result = service.list_listings(page=page, page_size=page_size, q=q)

    return ListingListResponse(
        items=[to_listing_summary_response(listing) for listing in result["items"]],
        page=result["page"],
        page_size=result["page_size"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(
    listing_id: str,
    db: Session = Depends(get_db),
):
    service = ListingService(db)
    listing, request_status = service.get_listing_detail(listing_id)
    return to_listing_detail_response(listing, request_status)


@router.post("/{listing_id}/request", response_model=ItemRequestResponse)
def request_listing(
    listing_id: str,
    payload: RequestItemPayload,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    service = ListingService(db)
    request_obj = service.request_item(listing_id, auth_user, payload.message or "")

    return ItemRequestResponse(
        id=str(request_obj.id),
        listing_id=str(request_obj.listing_id),
        requester=RequesterSummary(
            id=str(auth_user.get("sub")),
            email=auth_user.get("email"),
        ),
        message=request_obj.message,
        status=request_obj.status,
        created_at=request_obj.created_at,
    )