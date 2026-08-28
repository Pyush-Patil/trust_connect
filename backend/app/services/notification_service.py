from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user_models import User
from app.models.notification_model import Notification
from app.schemas.notification_schema import NotificationResponse
from app.repositores.notification_repository import(
    create_notification,
    get_notification_by_id,
    get_user_notifications,
    update_notification
)

def create_notificaton_service(
        db:Session,
        user_id:int,
        title: str,
        message: str
)->NotificationResponse:

    notification=Notification(
        user_id=user_id,
        title=title,
        message=message
    )

    notification=create_notification(db,notification)

    return NotificationResponse.model_validate(notification)

def get_user_notification_service(db:Session,current_user:User)->NotificationResponse:

    notifications=get_user_notifications(db,current_user.id)

    return [
        NotificationResponse.model_validate(notification)
        for notification in notifications
    ]

def mark_notification_as_read_service(db:Session,current_user:User,notification_id:int)->NotificationResponse:
    notification=get_notification_by_id(db,notification_id)

    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Notification not found")

    if notification.user_id!=current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="You are not authorized to access this notification")

    notification.is_read=True

    notification=update_notification(db,notification)

    return NotificationResponse.model_validate(
        notification
    )
