#!/usr/bin/env bash
set -e
RED='\033[0;31m'; GRN='\033[0;32m'; YEL='\033[1;33m'; BLU='\033[0;34m'; NC='\033[0m'

echo ""
echo -e "${BLU}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLU}║   ORIENTA × PATHWAYS  —  Groq + Ragie + GPT-4   ║${NC}"
echo -e "${BLU}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# .env
if [ ! -f ".env" ]; then
  echo -e "${RED}✗ Fichier .env introuvable${NC}"
  echo -e "  ${YEL}cp .env.example .env${NC}  puis ajoute GROQ_API_KEY"
  exit 1
fi
grep -q "GROQ_API_KEY=gsk_" .env && echo -e "${GRN}✓ Groq OK${NC}" || echo -e "${YEL}⚠  GROQ_API_KEY non détectée${NC}"
grep -q "OPENAI_API_KEY=sk-" .env && echo -e "${GRN}✓ OpenAI OK (fallback)${NC}" || echo -e "${YEL}   OpenAI : non configuré${NC}"
grep -q "RAGIE_API_KEY=ragie_" .env && echo -e "${GRN}✓ Ragie RAG OK${NC}" || echo -e "${YEL}   Ragie : non configuré (fallback local)${NC}"
echo ""

# Python
echo -e "${YEL}► Installation backend Python…${NC}"
[ ! -d ".venv" ] && python3 -m venv .venv
source .venv/bin/activate
pip install -q --upgrade pip
pip install -q -r backend/requirements.txt
echo -e "${GRN}✓ Backend prêt${NC}"

# Node
echo -e "${YEL}► Installation frontend Node.js…${NC}"
cd frontend && [ ! -d "node_modules" ] && npm install --silent; cd ..
echo -e "${GRN}✓ Frontend prêt${NC}"

echo ""
echo -e "${GRN}═══════════════════════════════════════════════════${NC}"
echo -e "${GRN}  Backend  → http://localhost:8000  (Groq + Ragie) ${NC}"
echo -e "${GRN}  Frontend → http://localhost:3000  ← OUVRIR       ${NC}"
echo -e "${GRN}═══════════════════════════════════════════════════${NC}"
echo ""

source .venv/bin/activate
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload &
BPID=$!
sleep 2
cd frontend && npm run dev &
FPID=$!; cd ..

echo -e "${GRN}✓ Serveurs démarrés — Ctrl+C pour arrêter${NC}"
trap "kill $BPID $FPID 2>/dev/null; exit" INT TERM
wait
