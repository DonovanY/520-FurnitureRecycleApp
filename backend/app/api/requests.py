from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.security import validate_token
from app.crud import request as request_crud
from app.crud import listing as listing_crud
from app.schemas.request import RequestUpdateSchema, RequestDetailResponse
from app.models.profile import Profile
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService


router = APIRouter(tags=["requests"])


@router.patch("/requests/{request_id}", response_model=RequestDetailResponse)
def update_request_status(
    request_id: str,
    update_data: RequestUpdateSchema,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db),
):
    """
    Accept or decline a request.

    Only the listing owner can perform this action.
    When accepting, this endpoint:
    - accepts the selected request;
    - declines all other pending requests for the same listing;
    - marks the listing as reserved;
    - creates a notification for the requester.
    """
    user_id = auth_user.get("sub")

    request_obj = request_crud.get_request_by_id(db, request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    listing = listing_crud.get_listing_by_id(db, request_obj.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if str(listing.poster_user_id) != str(user_id):
        raise HTTPException(
            status_code=403,
            detail="Only the listing owner can accept or decline requests",
        )

    if update_data.status not in ["accepted", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'accepted' or 'rejected'",
        )

    previous_status = request_obj.status

    updated_request = request_crud.update_request_status(
        db,
        request_id,
        update_data.status,
    )

    notification_service = NotificationService(NotificationRepository(db))

    if update_data.status == "accepted":
        request_crud.decline_other_requests(
            db,
            request_obj.listing_id,
            request_id,
        )

        listing_crud.update_listing_status(
            db,
            request_obj.listing_id,
            "reserved",
        )

        if previous_status != "accepted":
            notification_service.create_notification(
                user_id=updated_request.requester_user_id,
                notification_type="request_accepted",
                title="Request accepted",
                message=f"Your request for '{listing.title}' has been accepted.",
                listing_id=updated_request.listing_id,
                request_id=updated_request.id,
            )

    elif update_data.status == "rejected":
        if previous_status != "rejected":
            notification_service.create_notification(
                user_id=updated_request.requester_user_id,
                notification_type="request_rejected",
                title="Request declined",
                message=f"Your request for '{listing.title}' was declined.",
                listing_id=updated_request.listing_id,
                request_id=updated_request.id,
            )

    requester = (
        db.query(Profile)
        .filter(Profile.id == updated_request.requester_user_id)
        .first()
    )

    return RequestDetailResponse(
        id=str(updated_request.id),
        listing_id=str(updated_request.listing_id),
        requester_user_id=str(updated_request.requester_user_id),
        requester_email=requester.email if requester else "",
        requester_name=requester.full_name if requester else None,
        message=updated_request.message,
        status=updated_request.status,
        created_at=updated_request.created_at,
    )