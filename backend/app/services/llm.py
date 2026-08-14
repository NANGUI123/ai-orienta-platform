import os
import json
import httpx
import os
import json
import httpx

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "mock")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

def extraire_profil_llm(narratif: str) -> dict:
    if LLM_PROVIDER == "mock":
        return _mock(narratif)
    if LLM_PROVIDER == "local":
        return _local(narratif)
    raise ValueError(f"Fournisseur inconnu : {LLM_PROVIDER}")

def _local(narratif: str) -> dict:
    prompt = (
        "Extrais un profil de ce récit d'étudiant. "
        "Réponds UNIQUEMENT en JSON avec les clés : domaine, niveau, pays_origine. "
        f"Récit : {narratif}"
    )
    reponse = httpx.post(
        f"{OLLAMA_URL}/api/generate",
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
        timeout=60,
    )
    reponse.raise_for_status()
    texte = reponse.json()["response"]   # Ollama renvoie le texte du modèle ici
    return json.loads(texte)              # que l'on transforme en dictionnaire

def _mock(narratif: str) -> dict:
    t = narratif.lower()
    return {
        "domaine": "intelligence artificielle" if "ia" in t else "informatique",
        "niveau": "master" if "master" in t else "licence",
        "pays_origine": "Cameroun" if "cameroun" in t else "non précisé",
    }
