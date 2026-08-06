from fastapi import FastAPI    
from sqlalchemy import text
from app.core.config import setting

from app.database.connection import engine 
app=FastAPI()

@app.get("/")
def root():
    return {
        "host":setting.db_host,
        "DB_name":setting.db_name
    }

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

