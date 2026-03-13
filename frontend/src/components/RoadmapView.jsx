import { useState } from "react";
import { COLORS } from "../styles.js";
import { ExtLink } from "./ChatInterface.jsx";
import ProfileSummary from "./ProfileSummary.jsx";

function Phase({ phase, idx, onAddReminder, addedSet }) {
  const [open, setOpen] = useState(idx===0);
  const pc = { haute:COLORS.red, moyenne:COLORS.yellow, basse:COLORS.green };

  return (
    <div style={{ marginBottom:8, position:"relative", paddingLeft:48 }}>
      <div style={{ position:"absolute", left:9, top:12, width:18, height:18, borderRadius:"50%", background:phase.couleur||COLORS.indigo, boxShadow:`0 0 10px ${phase.couleur||COLORS.indigo}88`, border:"2px solid rgba(255,255,255,.25)", zIndex:1 }} />
      <div style={{ background:"rgba(255,255,255,.04)", border:`1px solid ${open?(phase.couleur||COLORS.indigo)+"55":"rgba(255,255,255,.07)"}`, borderRadius:14, overflow:"hidden", transition:"border-color .3s" }}>
        <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"13px 15px", background:"transparent", border:"none", color:"#fff", display:"flex", alignItems:"center", gap:11, textAlign:"left" }}>
          <span style={{ fontSize:20 }}>{phase.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, fontFamily:"'Sora',sans-serif", marginBottom:2 }}>{phase.label}</div>
            <div style={{ fontSize:11, color:COLORS.slate }}>⏱ {phase.duree} · {phase.actions?.length||0} actions</div>
          </div>
          <span style={{ fontSize:10, color:COLORS.slate }}>{open?"▲":"▼"}</span>
        </button>
        {open && (
          <div style={{ padding:"0 15px 15px" }}>
            <div style={{ height:1, background:"rgba(255,255,255,.06)", marginBottom:13 }} />
            {phase.actions?.map((a,ai) => {
              const key   = `${idx}-${ai}`;
              const added = addedSet.has(key);
              return (
                <div key={ai} style={{ background:"rgba(255,255,255,.04)", borderRadius:12, padding:"12px 13px", marginBottom:9, borderLeft:`3px solid ${pc[a.priorite]||COLORS.indigo}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:5 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{a.titre}</div>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:`${pc[a.priorite]||COLORS.indigo}22`, color:pc[a.priorite]||COLORS.indigo, flexShrink:0 }}>
                      {a.priorite==="haute"?"🔴 Urgent":a.priorite==="moyenne"?"🟡 Important":"🟢 Optionnel"}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:COLORS.textDim, lineHeight:1.6, marginBottom:8 }}>{a.detail}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:7 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      {a.duree_estimee && <span style={{ fontSize:11, color:COLORS.slate }}>⏱ {a.duree_estimee}</span>}
                      {a.ressource && <ExtLink href={a.lien}>{a.ressource}</ExtLink>}
                    </div>
                    <button onClick={()=>onAddReminder(a, phase.label, key)} disabled={added}
                      style={{ padding:"4px 11px", borderRadius:20, background:added?"rgba(16,185,129,.15)":"rgba(99,102,241,.15)", border:`1px solid ${added?"rgba(16,185,129,.3)":"rgba(99,102,241,.3)"}`, color:added?COLORS.green:"#818CF8", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>
                      {added?"✓ Rappel ajouté":"+ Rappel"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapView({ roadmap, profil, reminders, addedSet, onAddReminder, onShowChat, onShowReminders }) {
  const ac = { warning:COLORS.yellow, info:"#3B82F6", success:COLORS.green };
  const ai = { warning:"⚠️", info:"ℹ️", success:"✅" };
  const pending = reminders.filter(r=>!r.done).length;

  return (
    <div style={{ padding:"16px 16px 100px" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,rgba(79,70,229,.4),rgba(126,184,247,.2))", border:"1px solid rgba(126,184,247,.3)", borderRadius:20, padding:"20px 18px 18px", marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:12, flexWrap:"wrap" }}>
          <div style={{ fontSize:10, color:COLORS.blue, letterSpacing:2, textTransform:"uppercase" }}>PATHWAYS AI · Roadmap personnalisée</div>
          <div style={{ display:"flex", gap:7 }}>
            <button onClick={onShowReminders} style={{ padding:"5px 10px", borderRadius:20, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)", color:"#fff", fontSize:11, display:"flex", alignItems:"center", gap:5 }}>
              ⏰ Rappels {pending>0 && <span style={{ background:COLORS.red, borderRadius:"50%", width:15, height:15, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>{pending}</span>}
            </button>
            <button onClick={onShowChat} style={{ padding:"5px 10px", borderRadius:20, background:"linear-gradient(135deg,rgba(99,102,241,.5),rgba(126,184,247,.3))", border:"1px solid rgba(99,102,241,.4)", color:"#fff", fontSize:11 }}>🤖 Demander</button>
          </div>
        </div>
        <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:19, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom:8 }}>{roadmap.titre}</h2>
        <p style={{ color:COLORS.textMid, fontSize:13, lineHeight:1.6, marginBottom:14 }}>{roadmap.accroche}</p>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:COLORS.slate }}>Faisabilité</span>
          <div style={{ flex:1, height:7, background:"rgba(255,255,255,.1)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${roadmap.score_faisabilite||75}%`, background:`linear-gradient(90deg,${COLORS.indigo},${COLORS.green})`, borderRadius:4 }} />
          </div>
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:17, color:COLORS.blue }}>{roadmap.score_faisabilite||75}%</span>
        </div>
      </div>

      {/* Alertes */}
      {roadmap.alertes?.map((a,i) => (
        <div key={i} style={{ background:`${ac[a.type]||COLORS.blue}12`, border:`1px solid ${ac[a.type]||COLORS.blue}33`, borderRadius:9, padding:"8px 12px", marginBottom:7, color:ac[a.type]||COLORS.blue, fontSize:12, display:"flex", gap:7 }}>
          {ai[a.type]||"ℹ️"} {a.message}
        </div>
      ))}

      {/* Propositions */}
      {profil && <ProfileSummary profil={profil} />}

      {/* Timeline */}
      <div style={{ fontSize:11, color:COLORS.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:13, fontFamily:"'Sora',sans-serif" }}>Plan d'action</div>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", left:17, top:0, bottom:0, width:2, background:`linear-gradient(to bottom,${COLORS.indigo},${COLORS.green},${COLORS.yellow})`, opacity:.25, borderRadius:1 }} />
        {roadmap.phases?.map((p,i) => <Phase key={p.id||i} phase={p} idx={i} onAddReminder={onAddReminder} addedSet={addedSet} />)}
      </div>

      {/* Plan B */}
      {roadmap.alternative && (
        <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.22)", borderRadius:13, padding:15, marginTop:16, marginBottom:12 }}>
          <div style={{ fontWeight:700, color:COLORS.yellow, marginBottom:5, fontSize:12 }}>🔄 Plan B</div>
          <div style={{ color:COLORS.textMid, fontSize:13, lineHeight:1.6 }}>{roadmap.alternative}</div>
        </div>
      )}

      {/* Motivation */}
      {roadmap.message_motivation && (
        <div style={{ background:"linear-gradient(135deg,rgba(79,70,229,.25),rgba(16,185,129,.15))", border:"1px solid rgba(16,185,129,.25)", borderRadius:13, padding:18, textAlign:"center" }}>
          <div style={{ fontSize:22, marginBottom:8 }}>💫</div>
          <div style={{ color:"#fff", fontSize:13, fontStyle:"italic", lineHeight:1.7 }}>{roadmap.message_motivation}</div>
        </div>
      )}
    </div>
  );
}
