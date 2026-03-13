import { useState, useRef, useEffect } from "react";
import { api } from "../api.js";
import { COLORS } from "../styles.js";
import { Spinner, Dot } from "../components/ChatInterface.jsx";
import ChatInterface from "../components/ChatInterface.jsx";
import RoadmapView   from "../components/RoadmapView.jsx";

// ─── GenScreen ────────────────────────────────────────────────────────────────
const GEN_STEPS = [
  { icon:"🔍", label:"Analyse du profil",   hint:"Lecture des informations…" },
  { icon:"🧠", label:"Ragie RAG — contexte", hint:"Recherche sémantique universités…" },
  { icon:"✨", label:"Titre et alertes",    hint:"Génération du résumé…" },
  { icon:"🗺️", label:"Plan en 5 phases",   hint:"Création des étapes concrètes…" },
  { icon:"🎉", label:"Roadmap prête !",     hint:"Finalisation…" },
];

function GenScreen({ step }) {
  return (
    <div style={{ padding:"32px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:20, marginBottom:8 }}>✨ Génération de ta Roadmap</div>
        <div style={{ fontSize:13, color:COLORS.slate }}>PATHWAYS AI + Ragie RAG analyse ton profil…</div>
      </div>
      {GEN_STEPS.map((s,i) => {
        const state = i<step?"done":i===step?"active":"pending";
        return (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, position:"relative" }}>
            {i<GEN_STEPS.length-1 && <div style={{ position:"absolute", left:17, top:38, width:2, height:32, background:state==="done"?COLORS.green:"rgba(255,255,255,.06)", transition:"background .5s" }} />}
            <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:state==="active"?14:16,
              background:state==="done"?COLORS.green:state==="active"?`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`:"rgba(255,255,255,.05)",
              border:`2px solid ${state==="done"?COLORS.green:state==="active"?COLORS.indigo:"rgba(255,255,255,.08)"}`, transition:"all .4s" }}>
              {state==="done"?"✓":state==="active"?<Spinner/>:s.icon}
            </div>
            <div style={{ paddingTop:7, paddingBottom:28 }}>
              <div style={{ fontWeight:600, fontSize:13, color:state==="pending"?COLORS.muted:"#fff" }}>{s.label}</div>
              <div style={{ fontSize:11, marginTop:2, color:state==="active"?COLORS.blue:state==="done"?COLORS.green:"#1E293B" }}>
                {state==="done"?"✓ Terminé":state==="active"?s.hint:"En attente"}
              </div>
              {state==="active" && (
                <div style={{ marginTop:8, height:3, width:120, background:"rgba(255,255,255,.07)", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:`linear-gradient(90deg,${COLORS.indigo},${COLORS.blue})`, borderRadius:2, animation:"bar 1.8s ease-in-out infinite" }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RemindersPanel ───────────────────────────────────────────────────────────
function RemindersPanel({ list, onToggle, onRemove, onClose }) {
  const done = list.filter(r=>r.done).length;
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(320px,100vw)", background:COLORS.bg2, borderLeft:`1px solid ${COLORS.border}`, zIndex:100, display:"flex", flexDirection:"column", animation:"slideR .3s ease" }}>
      <div style={{ padding:16, borderBottom:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15 }}>⏰ Rappels</div>
          <div style={{ fontSize:11, color:COLORS.slate, marginTop:2 }}>{done}/{list.length} complétés</div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"none", color:"#fff", width:30, height:30, borderRadius:8, fontSize:14 }}>✕</button>
      </div>
      <div className="scr" style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:9 }}>
        {list.length===0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:COLORS.muted, gap:10, paddingTop:60 }}>
            <span style={{ fontSize:36 }}>🔔</span>
            <span style={{ fontSize:13 }}>Aucun rappel</span>
            <span style={{ fontSize:11, textAlign:"center" }}>Ajoute des actions depuis la roadmap</span>
          </div>
        ) : list.map(r => (
          <div key={r.id} style={{ background:r.done?"rgba(16,185,129,.07)":"rgba(255,255,255,.04)", border:`1px solid ${r.done?"rgba(16,185,129,.2)":COLORS.border}`, borderRadius:12, padding:"12px 13px" }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <button onClick={()=>onToggle(r.id)} style={{ width:20, height:20, borderRadius:6, border:`2px solid ${r.done?COLORS.green:"rgba(255,255,255,.2)"}`, background:r.done?COLORS.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                {r.done && <span style={{ fontSize:10, color:"#fff" }}>✓</span>}
              </button>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:r.done?COLORS.slate:"#fff", textDecoration:r.done?"line-through":"none", marginBottom:3 }}>{r.title}</div>
                <div style={{ fontSize:11, color:COLORS.muted }}>{r.phase} · {r.duree}</div>
              </div>
              <button onClick={()=>onRemove(r.id)} style={{ background:"none", border:"none", color:COLORS.muted, fontSize:13 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AIChat flottant ──────────────────────────────────────────────────────────
function AIChat({ roadmap, profil, onClose }) {
  const [q,setQ]       = useState("");
  const [loading,setL] = useState(false);
  const [conv,setConv] = useState([{ role:"assistant", content:"Bonjour ! Je suis PATHWAYS 🤖\nPose-moi n'importe quelle question sur ton plan !" }]);
  const ref = useRef(null);

  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[conv]);

  async function ask() {
    if (!q.trim()||loading) return;
    const text=q.trim(); setQ(""); setL(true);
    const next=[...conv,{role:"user",content:text}]; setConv(next);
    try {
      const data = await api.pathways(next.map(m=>({role:m.role,content:m.content})), roadmap?.titre, profil?.domaine);
      setConv(p=>[...p,{role:"assistant",content:data.content}]);
    } catch { setConv(p=>[...p,{role:"assistant",content:"Désolé, une erreur s'est produite !"}]); }
    setL(false);
  }

  return (
    <div style={{ position:"fixed", bottom:84, right:20, width:"min(340px,calc(100vw - 32px))", background:COLORS.bg2, border:"1px solid rgba(99,102,241,.4)", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,.6)", zIndex:200, display:"flex", flexDirection:"column", maxHeight:"55vh", animation:"popUp .3s ease" }}>
      <div style={{ padding:"13px 15px 10px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
          <div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13 }}>PATHWAYS</div>
            <div style={{ fontSize:10, color:COLORS.green }}>● En ligne</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"none", color:"#fff", width:26, height:26, borderRadius:7, fontSize:12 }}>✕</button>
      </div>
      <div className="scr" style={{ flex:1, overflowY:"auto", padding:"10px 13px", display:"flex", flexDirection:"column", gap:8 }}>
        {conv.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"85%", padding:"8px 11px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?`linear-gradient(135deg,${COLORS.indigo},${COLORS.purple})`:"rgba(255,255,255,.07)", color:"#fff", fontSize:12, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ display:"flex", gap:4, padding:"8px 12px", background:"rgba(255,255,255,.07)", borderRadius:"14px 14px 14px 4px", width:"fit-content", alignItems:"center" }}><Dot delay={0}/><Dot delay={.2}/><Dot delay={.4}/></div>}
        <div ref={ref} />
      </div>
      <div style={{ padding:"9px 12px", borderTop:`1px solid ${COLORS.border}`, display:"flex", gap:7 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Ta question…"
          style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:9, padding:"7px 11px", color:"#fff", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
        <button onClick={ask} disabled={loading||!q.trim()} style={{ width:32, height:32, borderRadius:8, background:q.trim()&&!loading?`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`:"rgba(255,255,255,.07)", border:"none", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>↑</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const INITIAL_MSG = {
  role:"assistant",
  content:`Bonjour ! 👋 Je suis ORIENTA, ton agent d'orientation personnalisé.\n\nJe vais t'aider à trouver la meilleure ville, établissements publics 🏫, bourses 💰, logement 🏠 et jobs 💼.\n\nCommençons !\n[CHOICES]\n{"question":"Quel est ton domaine ?","options":["Informatique Tech","Commerce Gestion","Droit Sciences Po","Sante Medecine","Arts Design","Sciences Ingenierie","Lettres Humaines"],"allowOther":true}\n[/CHOICES]`,
};

export default function Dashboard() {
  const [messages,  setMessages]  = useState([INITIAL_MSG]);
  const [loading,   setLoading]   = useState(false);
  const [profil,    setProfil]    = useState(null);
  const [progress,  setProgress]  = useState([]);
  const [roadmap,   setRoadmap]   = useState(null);
  const [genStep,   setGenStep]   = useState(-1);
  const [view,      setView]      = useState("chat");
  const [error,     setError]     = useState(null);
  const [showChat,      setShowChat]      = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [reminders,  setReminders]  = useState([]);
  const [addedSet,   setAddedSet]   = useState(new Set());

  const pendingCount = reminders.filter(r=>!r.done).length;

  async function handleSend(text) {
    if (!text||loading) return;
    const msgs = [...messages, {role:"user",content:text}];
    setMessages(msgs); setLoading(true); setError(null);
    try {
      const data = await api.orienta(msgs.map(m=>({role:m.role,content:m.content})));
      setMessages(prev=>[...prev,{role:"assistant",content:data.content}]);
      if (data.profil)   setProfil(data.profil);
      if (data.progress) setProgress(data.progress);
    } catch(e) { setError("Erreur : "+e.message); }
    setLoading(false);
  }

  async function handleGenerate() {
    setView("generating"); setGenStep(0); setError(null);
    try {
      let p = profil;
      if (!p) {
        try {
          const ex = await api.extractProfile(messages.map(m=>({role:m.role,content:m.content})));
          p = ex.profil; setProfil(p);
        } catch {}
      }
      setGenStep(1); await new Promise(r=>setTimeout(r,800));  // Ragie step visible
      setGenStep(2);
      const data = await api.generateRoadmap(messages.map(m=>({role:m.role,content:m.content})), p);
      setGenStep(4);
      await new Promise(r=>setTimeout(r,500));
      setRoadmap(data.roadmap); setView("roadmap");
    } catch(e) { setError("Erreur roadmap : "+e.message); setView("chat"); }
    setGenStep(-1);
  }

  function addReminder(action, phase, key) {
    if (addedSet.has(key)) return;
    setReminders(prev=>[...prev,{id:Date.now(),title:action.titre,phase,duree:action.duree_estimee||"-",done:false}]);
    setAddedSet(prev=>new Set([...prev,key]));
  }

  return (
    <div style={{ height:"100dvh", background:COLORS.bg, backgroundImage:"radial-gradient(ellipse at 15% 15%,rgba(79,70,229,.15) 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,rgba(126,184,247,.1) 0%,transparent 55%)", display:"flex", flexDirection:"column", maxWidth:700, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ padding:"12px 16px 10px", borderBottom:`1px solid ${COLORS.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"rgba(8,11,20,.97)", backdropFilter:"blur(16px)" }}>
        <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>
          {view==="roadmap"?"🗺️":view==="generating"?"✨":"🎓"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:15 }}>
            {view==="roadmap"?"PATHWAYS":view==="generating"?"PATHWAYS":"ORIENTA"}
            <span style={{ background:`linear-gradient(90deg,${COLORS.indigo},${COLORS.blue})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginLeft:5 }}>AI</span>
          </div>
          <div style={{ fontSize:10, color:COLORS.muted }}>
            {view==="roadmap"?"Roadmap · Groq + Ragie RAG":view==="generating"?"Génération en cours…":"Orientation étudiante · France"}
          </div>
        </div>
        <div style={{ padding:"3px 8px", borderRadius:20, fontSize:10, background:"rgba(16,185,129,.1)", color:COLORS.green, border:"1px solid rgba(16,185,129,.22)", display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:COLORS.green, animation:"pulse 2s infinite" }} /> En ligne
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${COLORS.border}`, background:"rgba(8,11,20,.9)", flexShrink:0 }}>
        {[{id:"chat",icon:"💬",label:"Chat"},{id:"roadmap",icon:"🗺️",label:"Roadmap",disabled:!roadmap}].map(t => (
          <button key={t.id} onClick={()=>!t.disabled&&setView(t.id)} disabled={t.disabled}
            style={{ flex:1, padding:"10px 8px", background:"transparent", border:"none", borderBottom:`2px solid ${view===t.id?COLORS.indigo:"transparent"}`, color:view===t.id?"#fff":t.disabled?"#1E293B":COLORS.slate, fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:view===t.id?600:400, display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"all .2s" }}>
            {t.icon} {t.label}
            {t.id==="roadmap" && pendingCount>0 && <span style={{ background:COLORS.red, borderRadius:"50%", width:14, height:14, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8 }}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="scr" style={{ flex:1, overflowY:"auto", minHeight:0 }}>
        {view==="generating" && <GenScreen step={genStep} />}
        {view==="roadmap" && roadmap && (
          <RoadmapView roadmap={roadmap} profil={profil} reminders={reminders} addedSet={addedSet}
            onAddReminder={addReminder} onShowChat={()=>setShowChat(true)} onShowReminders={()=>setShowReminders(true)} />
        )}
        {view==="chat" && (
          <ChatInterface messages={messages} loading={loading} progress={progress} profil={profil} roadmap={roadmap} error={error}
            onSend={handleSend} onGenerate={handleGenerate} onViewRoadmap={()=>setView("roadmap")} />
        )}
      </div>

      {/* FAB */}
      {view==="roadmap" && !showChat && (
        <button onClick={()=>setShowChat(true)} style={{ position:"fixed", bottom:24, right:20, width:54, height:54, borderRadius:"50%", background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, border:"none", color:"#fff", fontSize:22, boxShadow:`0 8px 30px rgba(79,70,229,.5)`, animation:"pulse 3s infinite", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>🤖</button>
      )}

      {showChat && <AIChat roadmap={roadmap} profil={profil} onClose={()=>setShowChat(false)} />}
      {showReminders && (
        <RemindersPanel list={reminders}
          onToggle={id=>setReminders(prev=>prev.map(r=>r.id===id?{...r,done:!r.done}:r))}
          onRemove={id=>setReminders(prev=>prev.filter(r=>r.id!==id))}
          onClose={()=>setShowReminders(false)} />
      )}
    </div>
  );
}
