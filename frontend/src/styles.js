export const COLORS = {
  bg: "#080B14", bg2: "#0D1117", bg3: "#1E293B",
  border: "rgba(255,255,255,.07)", border2: "rgba(255,255,255,.15)",
  indigo: "#4F46E5", blue: "#7EB8F7", purple: "#7C3AED",
  green: "#10B981", yellow: "#F59E0B", red: "#EF4444",
  slate: "#475569", muted: "#334155",
  text: "#E2E8F0", textMid: "#CBD5E1", textDim: "#94A3B8",
};

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; background: #080B14; font-family: 'DM Sans', sans-serif; color: #E2E8F0; overscroll-behavior: none; }
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin   { to { transform: rotate(360deg); } }
@keyframes bar    { 0% { width:0;margin-left:0; } 50% { width:65%;margin-left:18%; } 100% { width:0;margin-left:100%; } }
@keyframes slideR { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes popUp  { from { opacity:0;transform:scale(.92) translateY(8px); } to { opacity:1;transform:scale(1) translateY(0); } }
@keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.4; } }
textarea { resize: none; outline: none; font-family: 'DM Sans', sans-serif; }
input    { outline: none; }
button   { -webkit-tap-highlight-color: transparent; cursor: pointer; }
a        { -webkit-tap-highlight-color: transparent; }
.scr::-webkit-scrollbar       { width: 3px; }
.scr::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }
`;
