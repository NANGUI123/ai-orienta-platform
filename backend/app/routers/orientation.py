from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.agent1.intake import extraire_profil

router = APIRouter(prefix="/orientation", tags=["Agent 1"])

class IntakeRequest(BaseModel):
    narratif: str

@router.post("/intake")
def intake(req: IntakeRequest):
    return extraire_profil(req.narratif)
