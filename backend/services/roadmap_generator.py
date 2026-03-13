"""
services/roadmap_generator.py
Génère la roadmap en 2 appels LLM (meta + phases) enrichis par Ragie.
"""
import logging
from services.llm_client import LLMClient
from services.profile_builder import repair_json
from utils.prompts import SYSTEM_PATHWAYS, ROADMAP_META_TEMPLATE, ROADMAP_PHASES_TEMPLATE

logger = logging.getLogger(__name__)


class RoadmapGenerator:
    def __init__(self, llm: LLMClient):
        self.llm = llm

    def generate_meta(self, context: str, rag_context: str = "") -> dict:
        prompt = ROADMAP_META_TEMPLATE.format(context=context, rag_context=rag_context or "Aucun contexte RAG disponible")
        raw    = self.llm.chat(
            [{"role": "user", "content": prompt}],
            system=SYSTEM_PATHWAYS,
            max_tokens=600,
            temperature=0.5,
            json_mode=True,
        )
        return repair_json(raw)

    def generate_phases(self, context: str, rag_context: str = "") -> list:
        prompt = ROADMAP_PHASES_TEMPLATE.format(context=context, rag_context=rag_context or "Aucun contexte RAG disponible")
        raw    = self.llm.chat(
            [{"role": "user", "content": prompt}],
            system=SYSTEM_PATHWAYS,
            max_tokens=1500,
            temperature=0.6,
        )
        return repair_json(raw, is_array=True)

    def generate(self, context: str, rag_context: str = "") -> dict:
        meta   = self.generate_meta(context, rag_context)
        phases = self.generate_phases(context, rag_context)
        return {**meta, "phases": phases}
