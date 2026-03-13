"""
services/profile_builder.py
Construction et extraction du profil étudiant.
"""
import re
import json
import logging
from services.llm_client import LLMClient
from utils.prompts import SYSTEM_ORIENTA_EXTRACT, PROFILE_EXTRACT_TEMPLATE

logger = logging.getLogger(__name__)


# ── JSON Repair — 4 passes ────────────────────────────────────────────────────

def repair_json(raw: str, is_array: bool = False):
    """Parse du JSON potentiellement malformé en 4 passes."""
    s = re.sub(r"```[\s\S]*?```", "", raw).strip()
    # Retirer tout texte avant le début du JSON
    start = s.find("[" if is_array else "{")
    if start < 0:
        raise ValueError(f"Pas de JSON dans : {s[:120]}")
    s = s[start:]

    # Passe 1 — parse direct
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        pass

    # Passe 2 — guillemets parasites
    out, in_str, esc = [], False, False
    for i, c in enumerate(s):
        if esc: out.append(c); esc = False; continue
        if c == "\\": out.append(c); esc = True; continue
        if c == '"':
            if not in_str:
                in_str = True; out.append(c); continue
            rest = s[i+1:].lstrip()
            if not rest or rest[0] in (',', ':', '}', ']'):
                in_str = False; out.append(c)
            else:
                out.append('\\"')
            continue
        out.append(c)
    fixed = "".join(out)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Passe 3 — auto-fermeture
    b = br = 0; in_s = es = False
    for c in fixed:
        if es: es = False; continue
        if c == "\\": es = True; continue
        if c == '"': in_s = not in_s; continue
        if in_s: continue
        b  += (c == "{") - (c == "}")
        br += (c == "[") - (c == "]")
    if in_s: fixed += '"'
    fixed = re.sub(r",\s*([}\]])", r"\1", fixed)
    fixed += "]" * max(0, br) + "}" * max(0, b)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Passe 4 — troncature
    for i in range(len(fixed)-1, 0, -1):
        if fixed[i] in ('}', ']'):
            try:
                return json.loads(fixed[:i+1])
            except json.JSONDecodeError:
                continue

    raise ValueError("JSON invalide après 4 passes de réparation")


# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_profil_from_text(text: str) -> dict | None:
    if "[PROFIL_COMPLET]" not in text:
        return None
    m = re.search(r"<profil>([\s\S]*?)</profil>", text)
    if not m:
        return None
    try:
        return repair_json(m.group(1).strip())
    except ValueError:
        return None


def build_context_from_messages(messages: list[dict]) -> str:
    lines = []
    for m in messages[-10:]:
        role = "Étudiant" if m["role"] == "user" else "Orienta"
        lines.append(f"{role}: {m['content'][:200]}")
    return " | ".join(lines)


def build_context_from_profil(profil: dict) -> str:
    keys = ["domaine", "niveau", "budget_mensuel", "villes_cibles", "projet_pro"]
    return json.dumps({k: profil.get(k) for k in keys}, ensure_ascii=False)


def build_ragie_query(profil: dict | None, messages: list[dict]) -> str:
    """Construit la query RAG optimale depuis le profil ou les messages."""
    if profil:
        domaine = profil.get("domaine", "")
        villes  = " ".join(profil.get("villes_cibles", []))
        budget  = profil.get("budget_mensuel", "")
        return f"université {domaine} {villes} budget {budget} bourses logements"
    # Fallback : extraire les mots-clés des messages
    text = " ".join(m["content"] for m in messages[-5:])
    return text[:200]


# ── ProfileBuilder ────────────────────────────────────────────────────────────

class ProfileBuilder:
    def __init__(self, llm: LLMClient):
        self.llm = llm

    def extract_from_history(self, messages: list[dict]) -> dict:
        history = "\n".join(
            ("Étudiant" if m["role"] == "user" else "Orienta") + ": " + m["content"]
            for m in messages
        )
        prompt = PROFILE_EXTRACT_TEMPLATE.format(history=history)
        raw = self.llm.chat(
            [{"role": "user", "content": prompt}],
            system=SYSTEM_ORIENTA_EXTRACT,
            max_tokens=700,
            temperature=0.2,
            json_mode=True,
        )
        return repair_json(raw)

    def calc_progress(self, messages: list[dict]) -> list[dict]:
        text = " ".join(m["content"] for m in messages).lower()
        return [
            {"label": "Domaine", "ok": bool(re.search(r"info|droit|medecin|commerce|art|science|ingenieur|bts|licence|master|lettre", text))},
            {"label": "Niveau",  "ok": bool(re.search(r"terminale|bac|bac\+|licence|master|bts|diplome", text))},
            {"label": "Budget",  "ok": bool(re.search(r"euro|eur|budget|\d{3,}", text))},
            {"label": "Ville",   "ok": bool(re.search(r"paris|lyon|marseille|bordeaux|toulouse|nantes|lille|montpellier|rennes|ville", text))},
            {"label": "Projet",  "ok": bool(re.search(r"travail|metier|carriere|emploi|projet|futur", text))},
        ]
