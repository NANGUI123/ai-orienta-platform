"""
services/ragie_service.py
Recherche sémantique sur les universités françaises via Ragie RAG.

Flux :
  1. Au démarrage : upload du fichier universities.json dans Ragie
  2. À chaque requête : retrieve(query) → chunks pertinents → contexte pour le LLM
"""
import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Import optionnel de Ragie ─────────────────────────────────────────────────

try:
    from ragie import Ragie as RagieClient
    RAGIE_AVAILABLE = True
except ImportError:
    RAGIE_AVAILABLE = False
    logger.warning("Package 'ragie' non installé — fallback sur données JSON locales")


DATA_PATH = Path(__file__).parent.parent / "data" / "universities.json"


# ── Service ───────────────────────────────────────────────────────────────────

class RagieService:
    """
    Wrapper autour de l'API Ragie pour la recherche sémantique.
    Fallback automatique sur la recherche locale si Ragie est indisponible.
    """

    def __init__(self):
        self._client      = None
        self._doc_id      = None
        self._local_data  = self._load_local()

        key = os.getenv("RAGIE_API_KEY")
        if not key:
            logger.info("RAGIE_API_KEY non définie — mode local uniquement")
            return
        if not RAGIE_AVAILABLE:
            logger.info("Package ragie absent — mode local uniquement")
            return

        try:
            self._client = RagieClient(auth=key)
            self._doc_id = self._ensure_document_uploaded()
            logger.info(f"Ragie connecté — document_id={self._doc_id}")
        except Exception as e:
            logger.warning(f"Ragie init erreur ({e}) — fallback local")
            self._client = None

    # ── Données locales ───────────────────────────────────────────────────────

    def _load_local(self) -> dict:
        try:
            return json.loads(DATA_PATH.read_text(encoding="utf-8"))
        except Exception:
            return {"etablissements": [], "bourses": [], "logements": []}

    # ── Upload vers Ragie ────────────────────────────────────────────────────

    def _ensure_document_uploaded(self) -> str | None:
        """
        Upload universities.json vers Ragie si pas déjà fait.
        Retourne le document_id.
        """
        try:
            # Vérifier si déjà indexé (via metadata name)
            docs = self._client.documents.list()
            for doc in (docs.results if hasattr(docs, "results") else []):
                meta = getattr(doc, "metadata", {}) or {}
                if meta.get("source") == "universities_fr":
                    return doc.id

            # Upload du JSON comme texte brut
            content = DATA_PATH.read_text(encoding="utf-8")
            res = self._client.documents.create_raw(
                request={
                    "data": content,
                    "metadata": {"source": "universities_fr", "type": "knowledge_base"},
                    "name": "Universités françaises — ORIENTA",
                }
            )
            return res.id
        except Exception as e:
            logger.warning(f"Upload Ragie échoué : {e}")
            return None

    # ── Retrieve ──────────────────────────────────────────────────────────────

    def retrieve(self, query: str, top_k: int = 5) -> str:
        """
        Recherche sémantique sur la base universités.
        Retourne un contexte texte prêt à injecter dans un prompt.

        Args:
            query  : ex. "université informatique Lyon budget 700 EUR"
            top_k  : nombre de chunks à récupérer

        Returns:
            Chaîne de contexte à injecter dans le prompt LLM.
        """
        # Priorité 1 — Ragie
        if self._client and self._doc_id:
            try:
                result = self._client.retrievals.retrieve(request={
                    "query": query,
                    "rerank": True,
                    "top_k": top_k,
                    "filter": {"document_ids": [self._doc_id]},
                })
                chunks = getattr(result, "scored_chunks", []) or []
                if chunks:
                    texts = [getattr(c, "text", str(c)) for c in chunks]
                    return "\n---\n".join(texts)
            except Exception as e:
                logger.warning(f"Ragie retrieve erreur ({e}) — fallback local")

        # Priorité 2 — Recherche locale par mots-clés
        return self._local_search(query)

    def _local_search(self, query: str) -> str:
        """Recherche simple par mots-clés dans les données locales."""
        q = query.lower()
        etabs = self._local_data.get("etablissements", [])

        scored = []
        for e in etabs:
            score = 0
            text  = f"{e.get('nom','')} {e.get('ville','')} {' '.join(e.get('domaines',[]))} {e.get('description','')}".lower()
            for word in q.split():
                if len(word) > 3 and word in text:
                    score += 1
            if score > 0:
                scored.append((score, e))

        scored.sort(key=lambda x: -x[0])
        top = [e for _, e in scored[:5]] or etabs[:5]

        lines = ["Établissements pertinents :"]
        for e in top:
            lines.append(
                f"- {e['nom']} ({e['ville']}) | {', '.join(e.get('domaines',[]))} | {e.get('description','')}"
            )

        bourses = self._local_data.get("bourses", [])
        if bourses:
            lines.append("\nBourses disponibles :")
            for b in bourses:
                lines.append(f"- {b['nom']} : {b.get('montant_min','')}–{b.get('montant_max','')} EUR/mois")

        logements = self._local_data.get("logements", [])
        if logements:
            lines.append("\nLogements :")
            for l in logements:
                lines.append(f"- {l['plateforme']} : {l.get('prix_min','')}–{l.get('prix_max','')} EUR/mois")

        return "\n".join(lines)

    @property
    def is_ragie_active(self) -> bool:
        return self._client is not None and self._doc_id is not None
