/**
 * api.js — couche fetch centralisée
 * En dev  : Vite proxifie /api → localhost:8000
 * En prod : même origine (FastAPI sert le build)
 */
async function request(endpoint, body) {
  const res  = await fetch("/api" + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || `Erreur ${res.status}`);
  return data;
}

export const api = {
  orienta:        (messages, system = null, maxTokens = 1200) =>
    request("/chat/orienta", { messages, system, max_tokens: maxTokens }),
  generateRoadmap: (messages, profil = null) =>
    request("/roadmap/generate", { messages, profil }),
  pathways:       (messages, roadmap_titre = "", profil_domaine = "") =>
    request("/chat/pathways", { messages, roadmap_titre, profil_domaine }),
  extractProfile: (messages) =>
    request("/extract/profile", { messages }),
};
