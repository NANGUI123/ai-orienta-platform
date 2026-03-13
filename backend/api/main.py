"""
api/main.py — FastAPI ORIENTA × PATHWAYS
LLM : Groq (Llama 3.3-70B) + fallback OpenAI GPT-4o-mini
RAG : Ragie sur universités françaises
"""
import os
import sys
import json
import logging
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BASE_DIR))
load_dotenv(BASE_DIR.parent / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from services import LLMClient, RagieService
from agents  import OrientaAgent, PathwaysAgent

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ORIENTA × PATHWAYS API",
    description="Orientation étudiante IA — Groq Llama + OpenAI + Ragie RAG",
    version="2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ── Initialisation des services (une seule fois) ──────────────────────────────

_llm     = LLMClient()
_ragie   = RagieService()
_orienta  = OrientaAgent(_llm, _ragie)
_pathways = PathwaysAgent(_llm, _ragie)

logger.info(f"Provider LLM actif : {_llm.active_provider}")
logger.info(f"Ragie RAG actif    : {_ragie.is_ragie_active}")

# ── Schémas ───────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    system: Optional[str] = None
    max_tokens: Optional[int] = 1200

class RoadmapRequest(BaseModel):
    messages: list[Message]
    profil: Optional[dict] = None

class PathwaysRequest(BaseModel):
    messages: list[Message]
    roadmap_titre: Optional[str] = None
    profil_domaine: Optional[str] = None

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":         "ok",
        "llm_provider":   _llm.active_provider,
        "ragie_active":   _ragie.is_ragie_active,
    }


@app.post("/api/chat/orienta")
def chat_orienta(req: ChatRequest):
    """Agent ORIENTA — dialogue collecte profil."""
    try:
        msgs   = [{"role": m.role, "content": m.content} for m in req.messages]
        result = _orienta.chat(msgs, system_override=req.system, max_tokens=req.max_tokens)
        return result
    except Exception as e:
        logger.error(f"/api/chat/orienta : {e}")
        raise HTTPException(500, str(e))


@app.post("/api/roadmap/generate")
def generate_roadmap(req: RoadmapRequest):
    """Agent PATHWAYS — génère la roadmap enrichie Ragie."""
    try:
        msgs    = [{"role": m.role, "content": m.content} for m in req.messages]
        roadmap = _pathways.generate_roadmap(msgs, profil=req.profil)
        return {"roadmap": roadmap}
    except ValueError as e:
        raise HTTPException(422, f"Erreur JSON : {e}")
    except Exception as e:
        logger.error(f"/api/roadmap/generate : {e}")
        raise HTTPException(500, str(e))


@app.post("/api/chat/pathways")
def chat_pathways(req: PathwaysRequest):
    """Agent PATHWAYS — Q&A sur la roadmap."""
    try:
        msgs = [{"role": m.role, "content": m.content} for m in req.messages]
        text = _pathways.chat(msgs, req.roadmap_titre or "", req.profil_domaine or "")
        return {"content": text}
    except Exception as e:
        logger.error(f"/api/chat/pathways : {e}")
        raise HTTPException(500, str(e))


@app.post("/api/extract/profile")
def extract_profile(req: ChatRequest):
    """Extrait le profil structuré depuis l'historique."""
    try:
        msgs   = [{"role": m.role, "content": m.content} for m in req.messages]
        profil = _orienta.extract_profile(msgs)
        return {"profil": profil}
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        logger.error(f"/api/extract/profile : {e}")
        raise HTTPException(500, str(e))


@app.get("/api/universities")
def get_universities(domaine: str = None, ville: str = None):
    """Base universités locale + recherche sémantique via Ragie."""
    try:
        if domaine or ville:
            query = f"{domaine or ''} {ville or ''}".strip()
            ctx   = _ragie.retrieve(query, top_k=5)
            return {"context": ctx, "source": "ragie" if _ragie.is_ragie_active else "local"}

        data_path = BASE_DIR / "data" / "universities.json"
        data  = json.loads(data_path.read_text(encoding="utf-8"))
        etabs = data.get("etablissements", [])
        return {"etablissements": etabs, "total": len(etabs)}
    except Exception as e:
        raise HTTPException(500, str(e))


# ── Serve Frontend buildé (prod) ──────────────────────────────────────────────

dist_path = BASE_DIR.parent / "frontend" / "dist"
if dist_path.exists():
    assets = dist_path / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=str(assets)), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(str(dist_path / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
