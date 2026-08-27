from fastapi import FastAPI    
from sqlalchemy import text
from app.core.config import setting

from app.database.connection import engine 
app = FastAPI(
    title="Trust Connect API",
    description="A platform connecting customers with verified service professionals.",
    version="1.0.0",
)

from app.api.auth import router as auth_router
from app.api.professional import router as professional_router
from app.api.admin import router as admin_router
from app.api.booking import router as booking_router
from app.api.category import router as category_router
from app.api.review import router as Review_router

app.include_router(auth_router)
app.include_router(professional_router)
app.include_router(admin_router)
app.include_router(booking_router)
app.include_router(category_router)
app.include_router(Review_router)

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

