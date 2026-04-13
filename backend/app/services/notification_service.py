from uuid import UUID
from math import ceil

from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationResponse


class NotificationService:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo

    def list_notifications(self, user_id: UUID, page: int, page_size: int):
        items = self.repo.list(user_id, page, page_size)
        total = self.repo.count(user_id)
        unread = self.repo.unread_count(user_id)

        return {
            "items": [NotificationResponse.model_validate(i) for i in items],
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": ceil(total / page_size) if total else 1,
            "unread_count": unread,
        }