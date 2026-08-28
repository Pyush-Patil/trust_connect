from sqlalchemy.orm import Session
from fastapi import APIRouter,Depends

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user_models import User

from app.schemas.notification_schema import NotificationResponse

from app.services.notification_service import (get_user_notification_service,mark_notification_as_read_service)

router=APIRouter(
    tags=["Notifications"]
)

@router.get("/notification",response_model=list[NotificationResponse])
def get_user_notification_api(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return get_user_notification_service(db,current_user)

@router.patch("/notification/{notification_id}/read",response_model=NotificationResponse)
def mark_notification_as_read_api(notification_id:int,db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    return mark_notification_as_read_service(db,current_user,notification_id)
