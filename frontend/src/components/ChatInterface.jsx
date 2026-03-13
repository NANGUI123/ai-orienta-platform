import { useState, useRef, useEffect } from "react";
import { COLORS } from "../styles.js";

// ─── Utils ────────────────────────────────────────────────────────────────────
export function parseChoices(text) {
  const m = text.match(/\[CHOICES\]\s*([\s\S]*?)\s*\[\/CHOICES\]/);
  if (!m) return null;
  try { return JSON.parse(m[1].trim()); } catch { return null; }
}
export function stripMeta(text) {
  return text
    .replace(/\[CHOICES\][\s\S]*?\[\/CHOICES\]/g, "")
    .replace(/\[PROFIL_COMPLET\]/g, "")
    .replace(/<profil>[\s\S]*?<\/profil>/g, "")
    .trim();
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 14 }) {
  return <span style={{ display:"inline-block", width:size, height:size, border:"2px solid rgba(255,255,255,.25)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}
export function Dot({ delay = 0 }) {
  return <div style={{ width:7, height:7, borderRadius:"50%", background:COLORS.blue, animation:`bounce 1.2s ${delay}s infinite` }} />;
}
export function ExtLink({ href, children }) {
  const ok = href && href.startsWith("http") && !href.includes("v.fr") && !href.includes("lien1");
  if (!ok) return <span style={{ color:COLORS.slate, fontSize:11 }}>{children}</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color:COLORS.blue, fontSize:11, textDecoration:"none" }}>{children} ↗</a>;
}

// ─── Choices ──────────────────────────────────────────────────────────────────
function Choices({ data, onSelect, disabled }) {
  const [other,  setOther]  = useState(false);
  const [val,    setVal]    = useState("");
  const [chosen, setChosen] = useState(null);

  function pick(v) { if (disabled || chosen) return; setChosen(v); onSelect(v); }
  function submitOther() { if (!val.trim() || chosen) return; pick(val.trim()); }

  return (
    <div style={{ marginTop:10 }}>
      <div style={{ fontSize:12, color:COLORS.slate, marginBottom:8, fontWeight:600 }}>{data.question}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {data.options.map((opt,i) => (
          <button key={i} onClick={() => pick(opt)} disabled={!!chosen||disabled}
            style={{ padding:"8px 14px", borderRadius:20, fontSize:13, fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
              border:`1.5px solid ${chosen===opt ? COLORS.indigo : "rgba(255,255,255,.15)"}`,
              background: chosen===opt ? `linear-gradient(135deg,${COLORS.indigo},${COLORS.purple})` : "rgba(255,255,255,.07)",
              color: chosen===opt ? "#fff" : chosen ? COLORS.muted : COLORS.textMid,
              opacity: chosen && chosen!==opt ? .35 : 1 }}>
            {opt}
          </button>
        ))}
        {data.allowOther && !chosen && (
          <button onClick={() => setOther(o=>!o)}
            style={{ padding:"8px 14px", borderRadius:20, border:"1.5px dashed rgba(126,184,247,.5)", background:"transparent", color:COLORS.blue, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
            ✏️ Autre
          </button>
        )}
      </div>
      {other && !chosen && (
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <input autoFocus value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitOther()} placeholder="Ta réponse…"
            style={{ flex:1, padding:"9px 13px", borderRadius:10, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.15)", color:"#fff", fontSize:13, fontFamily:"'DM Sans',sans-serif" }} />
          <button onClick={submitOther}
            style={{ padding:"9px 16px", borderRadius:10, background: val.trim() ? `linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})` : "rgba(255,255,255,.08)", border:"none", color:"#fff", fontWeight:600, fontSize:13 }}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ msg, isUser, onChoose, active }) {
  const text    = stripMeta(msg.content);
  const choices = isUser ? null : parseChoices(msg.content);
  const done    = msg.content.includes("[PROFIL_COMPLET]");
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:14, animation:"fadeUp .3s ease" }}>
      {!isUser && (
        <div style={{ width:32, height:32, borderRadius:"50%", marginRight:8, flexShrink:0, background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:12, color:"#fff", alignSelf:"flex-end", marginBottom:2 }}>O</div>
      )}
      <div style={{ maxWidth:"82%" }}>
        <div style={{ padding:"11px 14px", borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",
          background:isUser?`linear-gradient(135deg,${COLORS.indigo},${COLORS.purple})`:"rgba(255,255,255,.08)",
          color:"#fff", fontSize:14, lineHeight:1.65, border:isUser?"none":"1px solid rgba(255,255,255,.1)", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
          {text}
        </div>
        {choices && <div style={{ paddingTop:10, paddingLeft:4 }}><Choices data={choices} onSelect={onChoose} disabled={!active} /></div>}
        {done && (
          <div style={{ marginTop:8, padding:"7px 12px", borderRadius:10, background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)", color:COLORS.green, fontSize:12, fontWeight:600 }}>
            ✅ Profil complet — clique sur Générer ma Roadmap !
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <div style={{ display:"flex", marginBottom:14 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", marginRight:8, background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:"#fff", alignSelf:"flex-end", flexShrink:0 }}>O</div>
      <div style={{ display:"flex", gap:5, padding:"12px 16px", background:"rgba(255,255,255,.07)", borderRadius:"18px 18px 18px 4px", border:"1px solid rgba(255,255,255,.1)", alignItems:"center" }}>
        <Dot delay={0}/><Dot delay={.2}/><Dot delay={.4}/>
      </div>
    </div>
  );
}

// ─── ProfileBar ───────────────────────────────────────────────────────────────
export function ProfileBar({ progress }) {
  const pct = Math.round(progress.filter(f=>f.ok).length / progress.length * 100);
  return (
    <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"10px 13px", marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:11, color:COLORS.slate, fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Profil collecté</span>
        <span style={{ fontSize:11, fontWeight:700, color:pct>=80?COLORS.green:pct>=50?COLORS.yellow:COLORS.slate }}>{pct}%</span>
      </div>
      <div style={{ height:3, background:"rgba(255,255,255,.07)", borderRadius:2, marginBottom:8, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, borderRadius:2, transition:"width .6s", background:pct>=80?"linear-gradient(90deg,#10B981,#34D399)":`linear-gradient(90deg,${COLORS.indigo},${COLORS.blue})` }} />
      </div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        {progress.map(f => (
          <span key={f.label} style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:f.ok?"rgba(16,185,129,.12)":"rgba(255,255,255,.04)", color:f.ok?COLORS.green:COLORS.muted, border:`1px solid ${f.ok?"rgba(16,185,129,.25)":"rgba(255,255,255,.06)"}` }}>
            {f.ok?"✓":"○"} {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── ChatInterface ────────────────────────────────────────────────────────────
export default function ChatInterface({ messages, loading, progress=[], profil, roadmap, error, onSend, onGenerate, onViewRoadmap }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const userCount = messages.filter(m=>m.role==="user").length;
  const lastAiIdx = messages.reduce((acc,m,i)=>m.role==="assistant"?i:acc,-1);

  useEffect(() => { setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100); }, [messages, loading]);

  function handleSend(text) {
    const t = text?.trim() || input.trim();
    if (!t || loading) return;
    setInput(""); onSend(t);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="scr" style={{ flex:1, overflowY:"auto", padding:"14px 16px 6px" }}>
        {messages.map((msg,i) => <Bubble key={i} msg={msg} isUser={msg.role==="user"} onChoose={handleSend} active={!loading && i===lastAiIdx} />)}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:"8px 16px 12px", borderTop:"1px solid rgba(255,255,255,.07)", background:"rgba(8,11,20,.97)", backdropFilter:"blur(12px)", flexShrink:0 }}>
        {userCount>=1 && progress.length>0 && !profil && <ProfileBar progress={progress} />}
        {error && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.27)", borderRadius:9, padding:"7px 11px", marginBottom:8, color:"#FCA5A5", fontSize:11, wordBreak:"break-all" }}>⚠️ {error}</div>}
        {userCount>=1 && !roadmap && (
          <button onClick={onGenerate} style={{ width:"100%", marginBottom:8, padding:12, background:`linear-gradient(135deg,${COLORS.indigo},${COLORS.purple})`, border:"1px solid rgba(126,184,247,.25)", borderRadius:12, color:"#fff", fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            🗺️ Générer ma Roadmap
            <span style={{ opacity:.5, fontSize:11, fontWeight:400 }}>{profil?"· Profil ✓":`· ${userCount} échange${userCount>1?"s":""}`}</span>
          </button>
        )}
        {roadmap && (
          <button onClick={onViewRoadmap} style={{ width:"100%", marginBottom:8, padding:10, background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.3)", borderRadius:12, color:COLORS.green, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:13 }}>
            📍 Voir ma Roadmap →
          </button>
        )}
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", borderRadius:14, padding:"9px 11px" }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSend(input); } }}
            placeholder="Ou tape ta réponse ici…" rows={1}
            style={{ flex:1, background:"transparent", border:"none", color:"#fff", fontSize:14, lineHeight:1.5, maxHeight:80 }} />
          <button onClick={()=>handleSend(input)} disabled={loading||!input.trim()}
            style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:loading||!input.trim()?"rgba(79,70,229,.15)":`linear-gradient(135deg,${COLORS.indigo},${COLORS.blue})`, border:"none", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
            ↑
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:5, fontSize:9, color:COLORS.muted }}>ORIENTA × PATHWAYS · Groq Llama + GPT-4o-mini + Ragie RAG</div>
      </div>
    </div>
  );
}
