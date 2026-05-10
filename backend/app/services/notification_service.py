from uuid import uuid4
from math import ceil

from app.models.notification import Notification


class NotificationService:
    def __init__(self, repo):
        self.repo = repo

    def create_notification(
        self,
        user_id,
        notification_type: str,
        title: str,
        message: str,
        listing_id=None,
        request_id=None,
        message_id=None,
    ):
        notification = Notification(
            id=uuid4(),
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            listing_id=listing_id,
            request_id=request_id,
            message_id=message_id,
            is_read=False,
        )

        return self.repo.create(notification)

    def list_notifications(self, user_id, page: int, page_size: int):
        total, items = self.repo.list_by_user(user_id, page, page_size)
        unread_count = self.repo.unread_count(user_id)
        total_pages = ceil(total / page_size) if total else 1

        return {
            "items": [
                {
                    "id": str(item.id),
                    "type": item.type,
                    "title": item.title,
                    "message": item.message,
                    "listing_id": str(item.listing_id) if item.listing_id else None,
                    "request_id": str(item.request_id) if item.request_id else None,
                    "message_id": str(item.message_id) if item.message_id else None,
                    "is_read": item.is_read,
                    "created_at": item.created_at,
                }
                for item in items
            ],
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "unread_count": unread_count,
        }