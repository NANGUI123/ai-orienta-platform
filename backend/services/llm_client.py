"""
services/llm_client.py
Client LLM multi-provider avec fallback automatique.

Ordre de priorité :
  1. Groq  — Llama 3.3-70B  (gratuit, ultra-rapide)
  2. OpenAI — GPT-4o-mini    (fallback si Groq rate-limite)
"""
import os
import time
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

# ── Modèles ───────────────────────────────────────────────────────────────────

GROQ_MODEL   = "llama-3.3-70b-versatile"
OPENAI_MODEL = "gpt-4o-mini"

# ── Clients ───────────────────────────────────────────────────────────────────

def _make_groq_client() -> OpenAI | None:
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return None
    return OpenAI(
        api_key=key,
        base_url="https://api.groq.com/openai/v1",
    )

def _make_openai_client() -> OpenAI | None:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    return OpenAI(api_key=key)


# ── Classe principale ─────────────────────────────────────────────────────────

class LLMClient:
    """
    Client unifié qui essaie Groq (Llama) en premier,
    puis bascule sur OpenAI (GPT-4o-mini) en cas d'erreur.
    Compatible avec l'interface OpenAI chat completions.
    """

    def __init__(self):
        self._groq   = _make_groq_client()
        self._openai = _make_openai_client()

        if not self._groq and not self._openai:
            raise RuntimeError(
                "Aucune clé API disponible. "
                "Définis GROQ_API_KEY et/ou OPENAI_API_KEY dans ton .env"
            )

        provider = "Groq (Llama)" if self._groq else "OpenAI (GPT-4o-mini)"
        logger.info(f"LLMClient initialisé — provider principal : {provider}")

    def chat(
        self,
        messages: list[dict],
        system: str | None = None,
        max_tokens: int = 1200,
        temperature: float = 0.7,
        json_mode: bool = False,
    ) -> str:
        """
        Envoie une requête au LLM et retourne le texte de la réponse.

        Args:
            messages    : historique [{"role": ..., "content": ...}]
            system      : prompt système (prepend automatique)
            max_tokens  : max tokens en sortie
            temperature : créativité (0 = déterministe)
            json_mode   : force le modèle à retourner du JSON valide
        """
        # Construire la liste de messages avec system
        full_msgs = []
        if system:
            full_msgs.append({"role": "system", "content": system})
        full_msgs.extend(messages)

        kwargs = dict(
            messages=full_msgs,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        # Essai 1 — Groq
        if self._groq:
            try:
                resp = self._groq.chat.completions.create(
                    model=GROQ_MODEL,
                    **kwargs,
                )
                return resp.choices[0].message.content
            except Exception as e:
                logger.warning(f"Groq erreur ({e}), bascule sur OpenAI…")

        # Essai 2 — OpenAI fallback
        if self._openai:
            resp = self._openai.chat.completions.create(
                model=OPENAI_MODEL,
                **kwargs,
            )
            return resp.choices[0].message.content

        raise RuntimeError("Les deux providers LLM ont échoué.")

    @property
    def active_provider(self) -> str:
        return "Groq (Llama 3.3-70B)" if self._groq else "OpenAI (GPT-4o-mini)"
