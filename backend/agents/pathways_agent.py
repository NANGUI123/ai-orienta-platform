"""
agents/pathways_agent.py
Agent PATHWAYS — génère et explique la roadmap personnalisée.
"""
import logging
from services.llm_client import LLMClient
from services.ragie_service import RagieService
from services.roadmap_generator import RoadmapGenerator
from services.profile_builder import (
    build_context_from_profil,
    build_context_from_messages,
    build_ragie_query,
)
from utils.prompts import PATHWAYS_CHAT_SYSTEM

logger = logging.getLogger(__name__)


class PathwaysAgent:
    """
    Génère la roadmap en 2 appels LLM enrichis par Ragie.
    Répond aux questions contextuelles sur le plan d'action.
    """

    def __init__(self, llm: LLMClient, ragie: RagieService):
        self.llm       = llm
        self.ragie     = ragie
        self.generator = RoadmapGenerator(llm)

    def generate_roadmap(
        self,
        messages: list[dict],
        profil: dict | None = None,
    ) -> dict:
        context     = build_context_from_profil(profil) if profil else build_context_from_messages(messages)
        ragie_query = build_ragie_query(profil, messages)
        rag_context = self.ragie.retrieve(ragie_query, top_k=5)

        logger.info(f"Génération roadmap — RAG actif={self.ragie.is_ragie_active}, query={ragie_query[:60]}")
        return self.generator.generate(context, rag_context)

    def chat(
        self,
        messages: list[dict],
        roadmap_titre: str = "",
        profil_domaine: str = "",
        max_tokens: int = 500,
    ) -> str:
        system = PATHWAYS_CHAT_SYSTEM.format(
            roadmap_titre=roadmap_titre or "non défini",
            profil_domaine=profil_domaine or "non défini",
        )
        return self.llm.chat(
            messages=messages,
            system=system,
            max_tokens=max_tokens,
            temperature=0.6,
        )
