from sqlalchemy.orm import Session
from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification):
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_by_id(self, notification_id):
        return (
            self.db.query(Notification)
            .filter(Notification.id == notification_id)
            .first()
        )

    def unread_count(self, user_id):
        return (
            self.db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .count()
        )

    def mark_as_read(self, notification_id):
        notification = self.get_by_id(notification_id)

        if not notification:
            return None

        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id):
        updated_count = (
            self.db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .update({"is_read": True}, synchronize_session=False)
        )

        self.db.commit()
        return updated_count

    def list_by_user(self, user_id, page: int, page_size: int):
        query = (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )

        total = query.count()
        items = (
            query.offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return total, items