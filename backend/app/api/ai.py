from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.rag_langchain import answer_query


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


class ProblemRequest(BaseModel):
    problem: str


@router.post("/troubleshoot")
def troubleshoot(request: ProblemRequest):

    answer = answer_query(request.problem)

    return {
        "problem": request.problem,
        "answer": answer
    }