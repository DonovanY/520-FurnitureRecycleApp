from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud.listing import get_listings_by_user_id, get_listings_paginated


from app.crud.listing import get_listing_by_id, get_available_listings_paginated

class ProfileListingService:
    def __init__(self, db: Session):
        self.db = db

    def list_posted_listings(self, user_id: str, page: int = 1, page_size: int = 12, q: str | None = None):

        query_result = get_listings_by_user_id(self.db, user_id=user_id)

        return get_listings_paginated(self.db, query_result, page=page, page_size=page_size, q=q)
    

    def list_requested_listings():
        return 




    
