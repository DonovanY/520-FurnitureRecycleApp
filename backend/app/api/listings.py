from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.security import validate_token, optional_validate_token
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
    CreateListingPayload,
    CreateListingResponse,
    ListingRequestsResponse,
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


def to_listing_summary_response(listing, request_status=None) -> ListingSummaryResponse:
    loc = getattr(listing, "location", None)
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
        request_status_for_current_user=request_status,
    )


def to_listing_detail_response(listing, user_request=None) -> ListingDetailResponse:
    from app.schemas.listing import UserRequestSummary
    
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
            full_name=listing.poster.full_name,
        ),
        created_at=listing.created_at,
        request_status_for_current_user=user_request.status if user_request else None,
        user_request=UserRequestSummary(
            id=str(user_request.id),
            message=user_request.message,
            status=user_request.status,
            created_at=user_request.created_at,
        ) if user_request else None,
        pickup_type=listing.pickup_type,
        pickup_notes=listing.pickup_notes,
    )


@router.get("", response_model=ListingListResponse)
def get_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None),
    auth_user: Optional[dict] = Depends(optional_validate_token),
    db: Session = Depends(get_db),
):
    service = ListingService(db)
    result = service.list_listings(
        page=page,
        page_size=page_size,
        q=q,
        current_user=auth_user,
    )

    request_status_map = result.get("request_status_map", {})

    return ListingListResponse(
        items=[
            to_listing_summary_response(
                listing,
                request_status=request_status_map.get(str(listing.id))
            )
            for listing in result["items"]
        ],
        page=result["page"],
        page_size=result["page_size"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=CreateListingResponse, status_code=201)
def create_listing(
    payload: CreateListingPayload,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    """
    Create a new listing.
    Requires authentication.
    """
    from app.crud.listing import create_listing as create_listing_crud
    
    user_id = auth_user.get("sub")
    
    listing = create_listing_crud(
        db=db,
        user_id=user_id,
        payload=payload.model_dump(),
        image_url=payload.image_url,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    # Note: address fields (address_line_1/2, state, postal_code, country) are
    # already in payload.model_dump() and read directly by create_listing_crud
    
    return CreateListingResponse(id=str(listing.id))


@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(
    listing_id: str,
    auth_user: Optional[dict] = Depends(optional_validate_token),
    db: Session = Depends(get_db),
):
    service = ListingService(db)
    listing, user_request = service.get_listing_detail(listing_id, current_user=auth_user)
    return to_listing_detail_response(listing, user_request)


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


@router.get("/{listing_id}/requests", response_model=ListingRequestsResponse)
def get_listing_requests(
    listing_id: str,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    """
    Get all requests for a specific listing.
    Only the poster can view requests for their listing.
    """
    from app.crud.listing import get_listing_by_id
    from app.crud.request import get_requests_for_listing
    from app.models.profile import Profile
    
    user_id = auth_user.get("sub")
    
    # Verify the listing exists and user is the poster
    listing = get_listing_by_id(db, listing_id)
    if not listing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if str(listing.poster_user_id) != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only the poster can view requests")
    
    # Get all requests with requester details
    requests = get_requests_for_listing(db, listing_id)
    
    # Build response
    request_responses = []
    for req in requests:
        requester = db.query(Profile).filter(Profile.id == req.requester_user_id).first()
        request_responses.append(
            ItemRequestResponse(
                id=str(req.id),
                listing_id=str(req.listing_id),
                requester=RequesterSummary(
                    id=str(requester.id),
                    email=requester.email,
                    full_name=requester.full_name,
                ),
                message=req.message,
                status=req.status,
                created_at=req.created_at,
            )
        )
    
    return ListingRequestsResponse(requests=request_responses)