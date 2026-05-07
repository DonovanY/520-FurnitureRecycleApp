from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4

from app.database.session import get_db
from app.middleware.security import validate_token
from app.crud import request as request_crud
from app.crud import listing as listing_crud
from app.schemas.request import RequestUpdateSchema, RequestDetailResponse
from app.models.request import ItemRequest

router = APIRouter()

@router.patch("/requests/{request_id}", response_model=RequestDetailResponse)
def update_request_status(
    request_id: str,
    update_data: RequestUpdateSchema,
    auth_user: dict = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Accept or decline a request.
    Only the listing owner can perform this action.
    When accepting, auto-declines all other pending requests.
    """
    user_id = auth_user.get("sub")
    
    # Get the request
    request_obj = request_crud.get_request_by_id(db, request_id)
    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Get the listing to verify ownership
    listing = listing_crud.get_listing_by_id(db, request_obj.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if str(listing.poster_user_id) != str(user_id):
        raise HTTPException(
            status_code=403, 
            detail="Only the listing owner can accept or decline requests"
        )
    
    # Validate status
    if update_data.status not in ["accepted", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'accepted' or 'rejected'"
        )
    
    # Update request status
    updated_request = request_crud.update_request_status(
        db, request_id, update_data.status
    )
    
    # If accepting, decline all other pending requests and mark listing as reserved
    if update_data.status == "accepted":
        request_crud.decline_other_requests(db, request_obj.listing_id, request_id)
        listing_crud.update_listing_status(db, request_obj.listing_id, "reserved")
    
    # Build response - get requester profile
    from app.models.profile import Profile
    requester = db.query(Profile).filter(Profile.id == updated_request.requester_user_id).first()
    
    return RequestDetailResponse(
        id=updated_request.id,
        listing_id=updated_request.listing_id,
        requester_user_id=updated_request.requester_user_id,
        requester_email=requester.email if requester else "",
        requester_name=requester.full_name if requester else None,
        message=updated_request.message,
        status=updated_request.status,
        created_at=updated_request.created_at
    )
