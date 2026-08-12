from fastapi import FastAPI    
from sqlalchemy import text
from app.core.config import setting

from app.database.connection import engine 
app=FastAPI()

from app.api.auth import router as auth_router
from app.api.professional import router as professional_router
from app.api.admin import router as admin_router
from app.api.booking import router as booking_router

app.include_router(auth_router)
app.include_router(professional_router)
app.include_router(admin_router)
app.include_router(booking_router)

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

