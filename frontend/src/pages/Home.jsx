import { COLORS } from "../styles.js";

const FEATURES = [
  { icon:"💬", title:"ORIENTA",        desc:"Agent conversationnel qui collecte ton profil via questions guidées." },
  { icon:"🗺️", title:"PATHWAYS",      desc:"Génère un plan d'action en 5 phases avec actions concrètes." },
  { icon:"🧠", title:"Llama 3.3-70B",  desc:"Propulsé par Groq — le LLM open source le plus rapide du marché." },
  { icon:"🔍", title:"Ragie RAG",       desc:"Recherche sémantique sur 8 universités publiques françaises." },
  { icon:"💰", title:"Bourses CROUS",   desc:"Bourses et aides régionales identifiées selon ton profil." },
  { icon:"⏰", title:"Rappels",         desc:"Ajoute les actions de ta roadmap et coche-les au fur et à mesure." },
];

export default function Home({ onStart }) {
  return (
    <div style={{ minHeight:"100dvh", background:COLORS.bg, backgroundImage:"radial-gradient(ellipse at 20% 20%,rgba(79,70,229,.18) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(126,184,247,.12) 0%,transparent 55%)", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 20px 60px" }}>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🎓</div>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:22, color:"#fff", letterSpacing:-.5 }}>
            ORIENTA
            <span style={{ background:`linear-gradient(90deg,${COLORS.indigo},${COLORS.blue})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}> × </span>
            PATHWAYS
          </div>
          <div style={{ fontSize:11, color:COLORS.slate, letterSpacing:2, textTransform:"uppercase" }}>AI Student Platform · 100% Open Source</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:"center", maxWidth:560, marginBottom:48 }}>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:30, lineHeight:1.2, color:"#fff", marginBottom:16 }}>
          Ton orientation étudiante,{" "}
          <span style={{ background:`linear-gradient(90deg,${COLORS.indigo},${COLORS.blue})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>guidée par l'IA</span>
        </h1>
        <p style={{ fontSize:15, color:COLORS.textMid, lineHeight:1.7, marginBottom:32 }}>
          Deux agents IA collaborent pour t'aider à choisir ta ville, tes études et construire un plan d'action — sans clé Anthropic, 100% open.
        </p>
        <button onClick={onStart} style={{ padding:"14px 36px", background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.purple})`, border:"none", borderRadius:14, color:"#fff", fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:`0 8px 30px rgba(79,70,229,.4)`, letterSpacing:.3 }}>
          Commencer mon orientation →
        </button>
      </div>

      {/* Stack badges */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom:56 }}>
        {["Groq (gratuit)","Llama 3.3-70B","GPT-4o-mini (fallback)","Ragie RAG","FastAPI","React"].map(t => (
          <span key={t} style={{ fontSize:11, padding:"4px 10px", borderRadius:20, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:COLORS.textDim }}>{t}</span>
        ))}
      </div>

      {/* Features */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, width:"100%", maxWidth:720 }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"18px 16px" }}>
            <div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:"#fff", marginBottom:6 }}>{f.title}</div>
            <div style={{ fontSize:12, color:COLORS.textDim, lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:60, fontSize:10, color:COLORS.muted, textAlign:"center" }}>
        ORIENTA × PATHWAYS · Groq + OpenAI + Ragie · Pour les étudiants en France
      </div>
    </div>
  );
}
