from fastapi import APIRouter, Depends, Query
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
    page_size: int = Query(10, le=50),
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_service),
):
    return service.list_notifications(user_id, page, page_size)