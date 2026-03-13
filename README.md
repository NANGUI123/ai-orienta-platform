# ORIENTA × PATHWAYS AI

> Plateforme d'orientation étudiante à deux agents IA — **aucune clé Anthropic requise**.

---

## Stack

| Couche | Technologie | Coût |
|--------|-------------|------|
| LLM principal | **Groq — Llama 3.3-70B** | ✅ Gratuit |
| LLM fallback  | **OpenAI GPT-4o-mini** | ~$0.001/req |
| RAG           | **Ragie** (universités FR) | Freemium |
| Backend       | FastAPI + Python 3.11 | Open source |
| Frontend      | React 18 + Vite | Open source |

---

## Architecture

```
ai-orienta-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx     ← Chat ORIENTA, bulles, [CHOICES], ProfileBar
│   │   │   ├── RoadmapView.jsx       ← Timeline 5 phases, alertes, motivation
│   │   │   └── ProfileSummary.jsx    ← Onglets Établissements/Bourses/Logements/Jobs
│   │   ├── pages/
│   │   │   ├── Home.jsx              ← Landing page
│   │   │   └── Dashboard.jsx         ← Orchestrateur principal
│   │   └── App.jsx                   ← Routeur Home ↔ Dashboard
│   └── package.json
├── backend/
│   ├── agents/
│   │   ├── orienta_agent.py          ← Collecte profil + enrichissement Ragie
│   │   └── pathways_agent.py         ← Génération roadmap + Q&A
│   ├── api/
│   │   └── main.py                   ← FastAPI — 5 routes REST
│   ├── services/
│   │   ├── llm_client.py             ← Groq Llama + fallback OpenAI GPT-4o-mini
│   │   ├── ragie_service.py          ← RAG sémantique + fallback local
│   │   ├── profile_builder.py        ← repair_json (4 passes) + extraction
│   │   └── roadmap_generator.py      ← Génération meta + phases (2 appels LLM)
│   ├── data/
│   │   └── universities.json         ← 8 universités + bourses + logements
│   └── utils/
│       └── prompts.py                ← Tous les prompts centralisés
├── .env.example
├── start.sh
└── README.md
```

---

## Démarrage rapide

### 1. Clés API nécessaires

| Service | Lien | Obligatoire |
|---------|------|-------------|
| Groq (Llama) | https://console.groq.com | ✅ OUI (gratuit) |
| OpenAI       | https://platform.openai.com | ⚡ Fallback |
| Ragie        | https://app.ragie.ai | ⭕ Optionnel |

### 2. Installation

```bash
cp .env.example .env
# Remplir GROQ_API_KEY (et optionnellement OPENAI_API_KEY, RAGIE_API_KEY)

bash start.sh
```

Ouvrir **http://localhost:3000** 🎉

### 3. Lancement manuel

```bash
# Terminal 1 — Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.api.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

---

## Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET`  | `/health` | Provider LLM actif + Ragie status |
| `POST` | `/api/chat/orienta` | Dialogue collecte profil |
| `POST` | `/api/roadmap/generate` | Génère roadmap (Groq + Ragie) |
| `POST` | `/api/chat/pathways` | Q&A sur la roadmap |
| `POST` | `/api/extract/profile` | Extraction profil depuis historique |
| `GET`  | `/api/universities` | Base + recherche sémantique Ragie |

---

## Fonctionnement LLM

```
Requête utilisateur
      ↓
  Groq (Llama 3.3-70B) ──── OK ──→ Réponse
      │
    Erreur / Rate-limit
      ↓
  OpenAI (GPT-4o-mini) ──── OK ──→ Réponse
```

## Fonctionnement RAG

```
Profil étudiant → query Ragie
      ↓
Ragie actif ? ──── OUI ──→ retrieve() sémantique → chunks → contexte LLM
      │
     NON
      ↓
 Recherche locale JSON → mots-clés → contexte LLM
```

---

## Production (tout-en-un)

```bash
cd frontend && npm run build    # → frontend/dist/
cd ..
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000
# FastAPI sert l'app React sur http://localhost:8000
```

*ORIENTA × PATHWAYS AI · Groq + OpenAI + Ragie · Pour les étudiants en France*
