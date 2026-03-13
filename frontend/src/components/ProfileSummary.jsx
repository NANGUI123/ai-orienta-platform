import { useState } from "react";
import { COLORS } from "../styles.js";
import { ExtLink } from "./ChatInterface.jsx";

const TABS = [
  { id:"etablissements", label:"🏫 Établissements", key:"etablissements_suggeres" },
  { id:"bourses",        label:"💰 Bourses",         key:"bourses" },
  { id:"logements",      label:"🏠 Logements",       key:"logements" },
  { id:"jobs",           label:"💼 Jobs",            key:"jobs" },
];

export default function ProfileSummary({ profil }) {
  const [tab, setTab] = useState("etablissements");
  const cur   = TABS.find(t=>t.id===tab);
  const data  = profil[cur.key] || [];

  return (
    <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, overflow:"hidden", marginBottom:20 }}>
      <div style={{ padding:"12px 16px 0", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <div style={{ fontSize:10, color:COLORS.blue, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>📊 Propositions ORIENTA</div>
        <div style={{ display:"flex", overflowX:"auto" }}>
          {TABS.map(t => {
            const count = (profil[t.key]||[]).length;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{ padding:"8px 13px", background:"transparent", border:"none", borderBottom:`2px solid ${tab===t.id?COLORS.indigo:"transparent"}`, color:tab===t.id?"#fff":COLORS.slate, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif", fontWeight:tab===t.id?600:400 }}>
                {t.label}
                {count>0 && <span style={{ fontSize:10, background:tab===t.id?COLORS.indigo:"rgba(255,255,255,.08)", color:tab===t.id?"#fff":"#64748B", borderRadius:10, padding:"1px 5px", marginLeft:4 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="scr" style={{ padding:14, maxHeight:260, overflowY:"auto" }}>
        {data.length===0 ? (
          <div style={{ color:COLORS.muted, fontSize:13, textAlign:"center", padding:20 }}>Aucune donnée disponible</div>
        ) : tab==="etablissements" ? data.map((e,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"11px 13px", marginBottom:8, borderLeft:`3px solid ${e.type==="public"?COLORS.green:COLORS.yellow}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:4 }}>
              <div style={{ fontWeight:600, fontSize:13 }}>{e.nom}</div>
              <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:e.type==="public"?"rgba(16,185,129,.15)":"rgba(245,158,11,.15)", color:e.type==="public"?COLORS.green:COLORS.yellow, flexShrink:0 }}>{e.type==="public"?"Public":"Privé"}</span>
            </div>
            <div style={{ fontSize:11, color:"#64748B", marginBottom:5 }}>📍 {e.ville}</div>
            {e.description && <div style={{ fontSize:12, color:COLORS.textDim, marginBottom:6, lineHeight:1.5 }}>{e.description}</div>}
            <ExtLink href={e.lien}>Voir le site</ExtLink>
          </div>
        )) : tab==="bourses" ? data.map((b,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"11px 13px", marginBottom:8, borderLeft:`3px solid ${COLORS.indigo}` }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{b.nom}</div>
            <div style={{ fontSize:13, color:COLORS.green, fontWeight:700, marginBottom:6 }}>{b.montant}</div>
            <ExtLink href={b.lien}>Postuler →</ExtLink>
          </div>
        )) : tab==="logements" ? data.map((l,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"11px 13px", marginBottom:8, borderLeft:"3px solid #3B82F6" }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{l.plateforme}</div>
            <div style={{ fontSize:12, color:COLORS.yellow, marginBottom:6 }}>{l.prix_moyen}</div>
            <ExtLink href={l.lien}>Chercher →</ExtLink>
          </div>
        )) : data.map((j,i)=>(
          <div key={i} style={{ background:"rgba(255,255,255,.04)", borderRadius:10, padding:"11px 13px", marginBottom:8, borderLeft:"3px solid #8B5CF6" }}>
            <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{j.type}</div>
            <div style={{ fontSize:12, color:COLORS.textDim, marginBottom:6 }}>{j.plateforme}</div>
            <ExtLink href={j.lien}>Voir les offres →</ExtLink>
          </div>
        ))}
      </div>
    </div>
  );
}
