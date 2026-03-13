"""
agents/orienta_agent.py
Agent ORIENTA — dialogue guidé pour collecter le profil étudiant.
"""
import logging
from services.llm_client import LLMClient
from services.ragie_service import RagieService
from services.profile_builder import ProfileBuilder, extract_profil_from_text
from utils.prompts import SYSTEM_ORIENTA

logger = logging.getLogger(__name__)


class OrientaAgent:
    """
    Guide l'étudiant à travers des questions structurées [CHOICES],
    enrichit les recommandations via Ragie RAG,
    et produit un profil JSON [PROFIL_COMPLET] quand assez d'infos sont collectées.
    """

    def __init__(self, llm: LLMClient, ragie: RagieService):
        self.llm             = llm
        self.ragie           = ragie
        self.profile_builder = ProfileBuilder(llm)

    def chat(
        self,
        messages: list[dict],
        system_override: str | None = None,
        max_tokens: int = 1200,
    ) -> dict:
        """
        Retourne : {content, profil, progress, rag_active}
        """
        # Enrichir le system prompt avec le contexte RAG si pertinent
        system = system_override or SYSTEM_ORIENTA
        if self.ragie.is_ragie_active and len(messages) >= 2:
            query       = " ".join(m["content"] for m in messages[-3:] if m["role"] == "user")[:200]
            rag_context = self.ragie.retrieve(query, top_k=4)
            system = system + f"\n\nContexte base universités (via Ragie RAG) :\n{rag_context}"

        text = self.llm.chat(
            messages=messages,
            system=system,
            max_tokens=max_tokens,
            temperature=0.7,
        )

        profil = extract_profil_from_text(text)
        return {
            "content":    text,
            "profil":     profil,
            "progress":   self.profile_builder.calc_progress(messages),
            "rag_active": self.ragie.is_ragie_active,
        }

    def extract_profile(self, messages: list[dict]) -> dict:
        return self.profile_builder.extract_from_history(messages)
