from fastapi import APIRouter, Depends, Query, HTTPException
from uuid import UUID
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user_id
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_service(db: Session = Depends(get_db)):
    return NotificationService(NotificationRepository(db))


@router.get("")
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_service),
):
    return service.list_notifications(user_id, page, page_size)


@router.get("/unread-count")
def get_unread_count(
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_service),
):
    count = service.repo.unread_count(user_id)
    return {"unread_count": count}


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_service),
):
    notification = service.repo.get_by_id(notification_id)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if str(notification.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Not allowed to update this notification")

    updated = service.repo.mark_as_read(notification_id)

    return {
        "id": str(updated.id),
        "is_read": updated.is_read,
    }


@router.patch("/read-all")
def mark_all_notifications_as_read(
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_service),
):
    updated_count = service.repo.mark_all_as_read(user_id)

    return {
        "updated_count": updated_count,
    }