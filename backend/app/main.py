from fastapi import FastAPI    
from sqlalchemy import text
from app.core.config import setting
from fastapi.staticfiles import StaticFiles

from app.database.connection import engine 
app = FastAPI(
    title="Trust Connect API",
    description="A platform connecting customers with verified service professionals.",
    version="1.0.0",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.auth import router as auth_router
from app.api.professional import router as professional_router
from app.api.admin import router as admin_router
from app.api.booking import router as booking_router
from app.api.category import router as category_router
from app.api.review import router as Review_router
from app.api.notification import router as Notification_router
from app.api.ai import router as ai_router

app.include_router(auth_router)
app.include_router(professional_router)
app.include_router(admin_router)
app.include_router(booking_router)
app.include_router(category_router)
app.include_router(Review_router)
app.include_router(Notification_router)
app.include_router(ai_router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            result=connection.execute(text("SELECT VERSION()"))
            version=result.scalar()
        return {"status": "Database Connected Successfully","db_version":version}
    except Exception as e:
        return {
            "error": str(e),
            "status":"Failed"}

