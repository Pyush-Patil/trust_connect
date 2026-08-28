from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.notification_model import Notification

def create_notification(db:Session,notification:Notification)->Notification:

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification

#get notification for a user
#We'll also need this because the customer/professional needs to see their notifications
def get_user_notifications(db:Session,user_id:int):
    statement=(
        select(Notification)
        .where(Notification.user_id==user_id)
        .order_by(Notification.created_at.desc())
    )
    return list(db.scalars(statement).all())

#Find a specific notification
#We'll need this later for the mark-as-read API.
def get_notification_by_id(db:Session,notification_id:int):
    return db.get(Notification,notification_id)

#Update notification
def update_notification(
    db: Session,
    notification: Notification
) -> Notification:

    db.commit()
    db.refresh(notification)

    return notification