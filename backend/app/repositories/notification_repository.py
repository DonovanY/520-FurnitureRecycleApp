from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification):
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def list(self, user_id: UUID, page: int, page_size: int):
        offset = (page - 1) * page_size

        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(self.db.scalars(stmt))

    def count(self, user_id: UUID):
        stmt = select(func.count()).where(Notification.user_id == user_id)
        return self.db.scalar(stmt)

    def unread_count(self, user_id: UUID):
        stmt = select(func.count()).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        return self.db.scalar(stmt)