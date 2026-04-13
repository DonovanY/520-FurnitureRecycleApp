import uuid
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.crud.listing import get_listing_by_id, get_all_available_listings
from app.crud.request import get_request_by_listing_and_user, create_item_request
from app.crud.profile import get_profile_by_id, create_profile
from app.models.profile import Profile
from app.models.request import ItemRequest


class ListingService:
    def __init__(self, db: Session):
        self.db = db

    def ensure_business_profile(self, auth_user: dict) -> Profile:
        """
        Ensure the authenticated Supabase user also exists in our business table: profiles.
        """
        profile_id = auth_user.get("sub")
        email = auth_user.get("email")

        if not profile_id or not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid authenticated user payload",
            )

        existing_profile = get_profile_by_id(self.db, profile_id)
        if existing_profile:
            return existing_profile

        new_profile = Profile(
            id=profile_id,
            email=email,
        )
        return create_profile(self.db, new_profile)

    def list_listings(self):
        """
        Return all listings for dashboard display.
        """
        return get_all_available_listings(self.db)

    def get_listing_detail(
        self,
        listing_id: str,
        current_user: Optional[dict] = None,
    ):
        """
        Return one listing plus the current user's request status for this listing, if any.
        """
        listing = get_listing_by_id(self.db, listing_id)
        if not listing:
            raise HTTPException(
                status_code=404,
                detail="Listing not found",
            )

        request_status = None

        if current_user:
            requester_user_id = current_user.get("sub")
            if requester_user_id:
                existing_request = get_request_by_listing_and_user(
                    self.db,
                    listing_id,
                    requester_user_id,
                )
                if existing_request:
                    request_status = existing_request.status

        return listing, request_status

    def request_item(
        self,
        listing_id: str,
        auth_user: dict,
        message: str = "",
    ) -> ItemRequest:
        """
        Create a new request for a listing.

        Business rules:
        - user must be authenticated
        - listing must exist
        - listing must be available
        - poster cannot request their own item
        - duplicate requests are not allowed
        """
        business_profile = self.ensure_business_profile(auth_user)

        listing = get_listing_by_id(self.db, listing_id)
        if not listing:
            raise HTTPException(
                status_code=404,
                detail="Listing not found",
            )

        if listing.status != "available":
            raise HTTPException(
                status_code=400,
                detail="This item is not available for request",
            )

        if listing.poster_user_id == business_profile.id:
            raise HTTPException(
                status_code=400,
                detail="You cannot request your own item",
            )

        existing_request = get_request_by_listing_and_user(
            self.db,
            listing_id,
            business_profile.id,
        )
        if existing_request:
            raise HTTPException(
                status_code=400,
                detail="You have already requested this item",
            )

        request_obj = ItemRequest(
            id=str(uuid.uuid4()),
            listing_id=listing_id,
            requester_user_id=business_profile.id,
            message=message.strip() if message else "I'm interested in this item.",
            status="pending",
        )

        return create_item_request(self.db, request_obj)