import { useState, useMemo } from "react";

const pmt = (r, n, pv) => r === 0 ? pv / n : (r * pv) / (1 - Math.pow(1 + r, -n));
const eur = n => new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const pct = n => `${(n * 100).toFixed(1)}%`;
const nb = (n, d = 1) => new Intl.NumberFormat("fr-BE", { maximumFractionDigits: d }).format(n);

const BG = "#070D18", PANEL = "#0C1524", CARD = "#101D2E", BDR = "#18293D", TXT = "#C8DCF0", MUT = "#4A6070";
const PURPLE = "#9B8BFF", GREEN = "#3DD6A0", YELLOW = "#FFB830", BLUE = "#5B9FFF", RED = "#EF4444", ORANGE = "#FB923C";

function verdict(rd, cf, inv) {
  const g = (inv * 0.12) / 12 - (inv * rd / 12);
  if (rd >= 0.12 && cf > 0) return { l: "EXCELLENT", i: "✦", c: GREEN, bg: "rgba(61,214,160,0.10)", bdr: "rgba(61,214,160,0.40)" };
  if (rd >= 0.08 && cf > 0) return { l: "RENTABLE", i: "✓", c: "#A3E635", bg: "rgba(163,230,53,0.08)", bdr: "rgba(163,230,53,0.35)" };
  if (rd >= 0.05 && cf > -600) return { l: "LIMITE", i: "⚠", c: YELLOW, bg: "rgba(255,184,48,0.08)", bdr: "rgba(255,184,48,0.35)" };
  return { l: "NON RENTABLE", i: "✗", c: RED, bg: "rgba(239,68,68,0.08)", bdr: "rgba(239,68,68,0.35)" };
}

function Gauge({ rd, size = 180 }) {
  const cx = size / 2, cy = size * 0.52, r = size * 0.38;
  const p = Math.min(Math.max(rd / 0.20, 0), 0.9998);
  const pt = q => { const a = (1 - q) * Math.PI; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const [ex, ey] = pt(p);
  const col = rd < 0.06 ? RED : rd < 0.08 ? ORANGE : rd < 0.10 ? "#FACC15" : rd < 0.12 ? "#A3E635" : GREEN;
  const lbl = rd < 0.06 ? "Faible" : rd < 0.08 ? "Acceptable" : rd < 0.10 ? "Bon" : rd < 0.12 ? "Très bon" : "Excellent ✦";
  const bgA = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
  const fgA = p > 0.002 ? `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)}` : null;
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox={`0 0 ${size} ${size * 0.65}`} style={{ width: "100%", overflow: "visible" }}>
        <defs>
          <filter id="gw"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="gg" x1="0%" x2="100%">
            <stop offset="0%" stopColor={RED} stopOpacity=".25" />
            <stop offset="50%" stopColor="#FACC15" stopOpacity=".25" />
            <stop offset="100%" stopColor={GREEN} stopOpacity=".25" />
          </linearGradient>
        </defs>
        <path d={bgA} fill="none" stroke="url(#gg)" strokeWidth="11" strokeLinecap="round" />
        <path d={bgA} fill="none" stroke="#162338" strokeWidth="9" strokeLinecap="round" />
        {fgA && <path d={fgA} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round" filter="url(#gw)" />}
        {p > 0.01 && <circle cx={ex.toFixed(1)} cy={ey.toFixed(1)} r="6" fill={col} filter="url(#gw)" />}
        <text x={cx - r - 3} y={cy + 14} fill="#334" fontSize="8" textAnchor="middle">0%</text>
        <text x={cx} y={cy - r - 7} fill="#334" fontSize="8" textAnchor="middle">10%</text>
        <text x={cx + r + 3} y={cy + 14} fill="#334" fontSize="8" textAnchor="middle">20%</text>
      </svg>
      <div style={{ marginTop: -8, fontSize: 44, fontWeight: 800, color: col, fontFamily: "monospace", lineHeight: 1 }}>{pct(rd)}</div>
      <div style={{ fontSize: 10, color: col, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 5, opacity: .9 }}>{lbl}</div>
    </div>
  );
}

function Sld({ label, value, onChange, min, max, step, fmt, color, icon, highlight }) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 13, padding: highlight ? "10px 12px" : 0, background: highlight ? `${color}0A` : "transparent", borderRadius: highlight ? 9 : 0, border: highlight ? `1px solid ${color}30` : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: highlight ? color : MUT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{icon} {label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{fmt(value)}</span>
      </div>
      <div style={{ position: "relative", height: 16, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 3, background: "#162338", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${p}%`, background: color }} />
        </div>
        <div style={{ position: "absolute", left: `${p}%`, top: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: color, pointerEvents: "none", boxShadow: `0 0 0 3px ${color}44` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
      </div>
    </div>
  );
}

function Num({ value, onChange, min = 0, max = 999, color, suffix }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input type="number" value={value} min={min} max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
        style={{ width: 52, background: `${color}12`, border: "none", borderBottom: `2px solid ${color}66`, color, fontFamily: "monospace", fontSize: 15, fontWeight: 700, textAlign: "right", outline: "none", padding: "3px 5px", borderRadius: "4px 4px 0 0" }} />
      {suffix && <span style={{ color: MUT, fontSize: 10 }}>{suffix}</span>}
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: CARD, borderRadius: 12, padding: "14px 16px", border: `1px solid ${BDR}` }}>
      <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: MUT, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

function VerdictBanner({ rd, cf, inv, loyer }) {
  const v = verdict(rd, cf, inv);
  return (
    <div style={{ padding: "13px 18px", borderRadius: 13, background: v.bg, border: `2px solid ${v.bdr}`, display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: `${v.c}20`, border: `2px solid ${v.c}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: v.c, flexShrink: 0 }}>{v.i}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: v.c }}>{v.l}</div>
        <div style={{ fontSize: 10, color: v.c, opacity: .7, marginTop: 2 }}>
          Rendement {pct(rd)} · Cash flow {eur(cf)}/mois · Payback {rd > 0 ? nb(1 / rd) : "—"} ans
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
        {[[pct(rd), "Rendement"], [eur(loyer) + "/mois", "Loyer"], [rd > 0 ? nb(1 / rd) + " ans" : "—", "Payback"]].map(([val, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: v.c }}>{val}</div>
            <div style={{ fontSize: 9, color: v.c, opacity: .55, textTransform: "uppercase", marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitTable({ surface, lm, tx_prct, ms, charges }) {
  const [rows, setRows] = useState([
    { id: 0, label: "Studio", icon: "🛏", color: PURPLE, surf: 28, nb: 1 },
    { id: 1, label: "1 chambre", icon: "🛏🛏", color: BLUE, surf: 48, nb: 2 },
    { id: 2, label: "2 chambres", icon: "🛏🛏🛏", color: GREEN, surf: 68, nb: 1 },
    { id: 3, label: "3 chambres", icon: "🏠", color: YELLOW, surf: 90, nb: 0 },
  ]);
  const [pctCom, setPctCom] = useState(15);

  const cfg = useMemo(() => {
    const r = rows.map(row => ({ ...row, stot: row.surf * row.nb, lunit: row.surf * lm, rev: row.nb * row.surf * lm }));
    const sTot = r.reduce((a, x) => a + x.stot, 0);
    const ntot = r.reduce((a, x) => a + x.nb, 0);
    const rev = r.reduce((a, x) => a + x.rev, 0);
    const sComM2 = Math.round(surface * pctCom / 100);
    const used = sTot + sComM2;
    const cf = rev - ms - rev * (charges / 100);
    const inv_est = surface * tx_prct; // dummy for verdict
    const rd = inv_est > 0 ? (rev * 12) / inv_est : 0;
    return { r, sTot, ntot, rev, sComM2, used, rest: surface - used, cf, rd };
  }, [rows, pctCom, surface, lm, ms, charges]);

  const upd = (id, f, v) => setRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));

  return (
    <div>
      <div style={{ border: `1px solid ${BDR}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "150px 115px 120px 95px 120px 140px", background: "#090F1A", borderBottom: `2px solid ${BDR}` }}>
          {["Type", "Surf./unité", "Nb unités", "Surf. tot.", "Loyer/unité", "Revenus/mois"].map((h, i) => (
            <div key={h} style={{ padding: "9px 12px", fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, textAlign: i === 0 ? "left" : "right" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {cfg.r.map(row => {
          const on = row.nb > 0;
          return (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "150px 115px 120px 95px 120px 140px", borderBottom: `1px solid ${BDR}`, background: on ? `${row.color}07` : "transparent" }}>
              <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{row.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: on ? row.color : MUT }}>{row.label}</span>
              </div>
              <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Num value={row.surf} onChange={v => upd(row.id, "surf", v)} min={10} max={300} color={BLUE} suffix="m²" />
              </div>
              <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Num value={row.nb} onChange={v => upd(row.id, "nb", v)} min={0} max={30} color={YELLOW} suffix="u." />
              </div>
              <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? TXT : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? `${row.stot} m²` : "—"}</div>
              <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? GREEN : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.lunit) : "—"}</div>
              <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: on ? GREEN : MUT, background: on ? "rgba(61,214,160,0.05)" : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.rev) + "/mois" : "—"}</div>
            </div>
          );
        })}
        {/* Communs */}
        <div style={{ display: "grid", gridTemplateColumns: "150px 115px 120px 95px 120px 140px", borderBottom: `1px solid ${BDR}`, background: "rgba(255,184,48,0.04)" }}>
          <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🚪</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: YELLOW }}>Parties communes</span>
          </div>
          <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Num value={pctCom} onChange={setPctCom} min={0} max={50} color={YELLOW} suffix="%" />
          </div>
          <div style={{ padding: "11px 12px", fontSize: 11, color: MUT, display: "flex", alignItems: "center", justifyContent: "flex-end", fontStyle: "italic" }}>de la surf. tot.</div>
          <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{cfg.sComM2} m²</div>
          <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
          <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
        </div>
        {/* Total */}
        <div style={{ display: "grid", gridTemplateColumns: "150px 115px 120px 95px 120px 140px", background: "#090F1A" }}>
          <div style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: TXT, display: "flex", alignItems: "center" }}>TOTAL</div>
          <div style={{ padding: "12px", fontSize: 11, color: MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{cfg.ntot} unité{cfg.ntot > 1 ? "s" : ""}</div>
          <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
          <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: cfg.used > surface ? RED : TXT }}>{cfg.used} m²</span>
          </div>
          <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
          <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: GREEN }}>{eur(cfg.rev)}/mois</span>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ padding: "11px 14px", borderRadius: 10, background: cfg.rest < 0 ? "rgba(239,68,68,0.08)" : "rgba(61,214,160,0.07)", border: `1px solid ${cfg.rest < 0 ? "rgba(239,68,68,0.3)" : "rgba(61,214,160,0.25)"}`, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 11, color: MUT }}>Utilisation surface</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.rest < 0 ? RED : GREEN, fontFamily: "monospace" }}>
            {cfg.used} / {surface} m² {cfg.rest < 0 ? `⚠ +${Math.abs(cfg.rest)} m²` : `· ${cfg.rest} m² libres`}
          </span>
        </div>
        <div style={{ height: 8, background: "#162338", borderRadius: 4, overflow: "hidden", display: "flex" }}>
          {cfg.r.filter(r => r.nb > 0).map(r => (
            <div key={r.id} title={r.label} style={{ height: "100%", width: `${(r.stot / surface) * 100}%`, background: r.color, transition: "width .3s" }} />
          ))}
          <div style={{ height: "100%", width: `${(cfg.sComM2 / surface) * 100}%`, background: YELLOW }} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap" }}>
          {cfg.r.filter(r => r.nb > 0).map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
              {r.label} : {r.stot} m²
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: MUT }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: YELLOW }} />
            Communs : {cfg.sComM2} m² ({pctCom}%)
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <KpiCard label="Revenus/mois" value={eur(cfg.rev)} color={GREEN} sub={`${cfg.ntot} unité${cfg.ntot > 1 ? "s" : ""}`} />
        <KpiCard label="Cash flow net" value={eur(cfg.cf)} color={cfg.cf >= 0 ? GREEN : RED} sub="après charges et emprunt" />
        <KpiCard label="Surface utilisée" value={`${Math.min(100, Math.round((cfg.used / surface) * 100))}%`} color={cfg.rest < 0 ? RED : YELLOW} sub={`${cfg.rest >= 0 ? cfg.rest + " m² libres" : "dépassement"}`} />
      </div>
    </div>
  );
}

// ═══════════════ SCÉNARIO : APPARTEMENTS ═══════════════
function ScenarioAppartements({ shared }) {
  const { tx, dr, tv, ch } = shared;
  const [s, setS] = useState(250);
  const [pm, setPm] = useState(1400);
  const [cm, setCm] = useState(800);
  const [lm, setLm] = useState(14);
  const [view, setView] = useState("config");

  const inv = useMemo(() => {
    const ac = s * pm, no = ac * 0.03;
    const tr = s * cm, tva = tr * (tv / 100), rv = tr + tva;
    return ac + no + rv;
  }, [s, pm, cm, tv]);
  const ms = useMemo(() => inv > 0 ? pmt(tx / 100 / 12, dr * 12, inv) : 0, [inv, tx, dr]);
  const ac = s * pm, no = ac * 0.03, tr = s * cm, tva = tr * (tv / 100), rv = tr + tva;

  return (
    <div style={{ display: "flex", gap: 14 }}>
      {/* Left config */}
      <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: BLUE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>🏢 Paramètres du bien</div>
          <Sld label="Surface disponible" value={s} onChange={setS} min={50} max={800} step={10} fmt={v => `${v} m²`} icon="📐" color={BLUE} />
          <Sld label="Prix achat / m²" value={pm} onChange={setPm} min={300} max={4000} step={50} fmt={v => `${v} €`} icon="🏠" color={BLUE} />
          <Sld label="Coût rénovation / m²" value={cm} onChange={setCm} min={100} max={2500} step={50} fmt={v => `${v} €`} icon="🔨" color={BLUE} />
          <Sld label="Loyer marché / m² / mois" value={lm} onChange={setLm} min={5} max={30} step={0.5} fmt={v => `${v} €`} icon="🏷️" color={BLUE} />
        </div>
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "14px" }}>
          <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>💰 Investissement</div>
          {[["Achat brut", eur(ac)], ["Notaire (3%)", eur(no)], ["Réno TTC", eur(rv)], ["TOTAL", eur(inv)]].map(([l, v], i) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}`, fontSize: i === 3 ? 13 : 11, fontWeight: i === 3 ? 700 : 400 }}>
              <span style={{ color: MUT }}>{l}</span>
              <span style={{ fontFamily: "monospace", color: i === 3 ? YELLOW : TXT }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(155,139,255,0.08)", borderRadius: 8, border: `1px solid rgba(155,139,255,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: PURPLE, opacity: .8 }}>Mensualité ({tx.toFixed(1)}%, {dr}a)</span>
            <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: PURPLE }}>{eur(ms)}/mois</span>
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["config", "🏗️ Config. Unités"], ["detail", "📋 Résultats"]].map(([id, lbl]) => (
            <button key={id} onClick={() => setView(id)} style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", background: view === id ? BLUE : "transparent", border: `1.5px solid ${view === id ? BLUE : BDR}`, color: view === id ? "#090F1A" : MUT, fontWeight: 700, fontSize: 11, transition: "all .15s" }}>{lbl}</button>
          ))}
        </div>
        {view === "config" && <UnitTable surface={s} lm={lm} tx_prct={inv / s} ms={ms} charges={ch} />}
        {view === "detail" && (() => {
          const lt = s * lm, rd = inv > 0 ? (lt * 12) / inv : 0, cf = lt - ms - lt * (ch / 100);
          return (
            <div>
              <VerdictBanner rd={rd} cf={cf} inv={inv} loyer={lt} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                <KpiCard label="Rendement brut" value={pct(rd)} color={rd < 0.06 ? RED : rd < 0.08 ? ORANGE : rd < 0.12 ? YELLOW : GREEN} sub="annuel sur investissement" />
                <KpiCard label="Payback" value={rd > 0 ? nb(1 / rd) + " ans" : "—"} color={YELLOW} sub="récupération de l'investissement" />
                <KpiCard label="Cash flow" value={eur(cf)} color={cf >= 0 ? GREEN : RED} sub="mensuel net" />
                <KpiCard label="Loyer total" value={eur(lt)} color={BLUE} sub="mensuel brut" />
              </div>
              <Gauge rd={rd} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ═══════════════ SCÉNARIO : KOTS ═══════════════
function ScenarioKots({ shared }) {
  const { tx, dr, tv, ch } = shared;
  const [s, setS] = useState(200);
  const [pm, setPm] = useState(1200);
  const [cm, setCm] = useState(700);
  const [lm, setLm] = useState(22);

  const [rows, setRows] = useState([
    { id: 0, label: "Kot 16 m²", surf: 16, nb: 4 },
    { id: 1, label: "Kot 20 m²", surf: 20, nb: 2 },
    { id: 2, label: "Suite 25 m²", surf: 25, nb: 0 },
  ]);
  const [pctCom, setPctCom] = useState(25);

  const inv = useMemo(() => {
    const ac = s * pm, no = ac * 0.03, tr = s * cm, tva = tr * (tv / 100), rv = tr + tva;
    return ac + no + rv;
  }, [s, pm, cm, tv]);
  const ms = useMemo(() => inv > 0 ? pmt(tx / 100 / 12, dr * 12, inv) : 0, [inv, tx, dr]);

  const cfg = useMemo(() => {
    const r = rows.map(row => ({ ...row, stot: row.surf * row.nb, lunit: row.surf * lm, rev: row.nb * row.surf * lm }));
    const sTot = r.reduce((a, x) => a + x.stot, 0);
    const ntot = r.reduce((a, x) => a + x.nb, 0);
    const rev = r.reduce((a, x) => a + x.rev, 0);
    const sComM2 = Math.round(s * pctCom / 100);
    const used = sTot + sComM2;
    const cf = rev - ms - rev * (ch / 100);
    const rd = inv > 0 ? (rev * 12) / inv : 0;
    return { r, sTot, ntot, rev, sComM2, used, rest: s - used, cf, rd };
  }, [rows, pctCom, s, lm, inv, ms, ch]);

  const upd = (id, f, v) => setRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const colors = [YELLOW, ORANGE, PURPLE];

  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ width: 260, flexShrink: 0 }}>
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: YELLOW, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>📚 Paramètres kots</div>
          <Sld label="Surface disponible" value={s} onChange={setS} min={50} max={600} step={10} fmt={v => `${v} m²`} icon="📐" color={YELLOW} />
          <Sld label="Prix achat / m²" value={pm} onChange={setPm} min={300} max={4000} step={50} fmt={v => `${v} €`} icon="🏠" color={YELLOW} />
          <Sld label="Coût rénovation / m²" value={cm} onChange={setCm} min={100} max={2500} step={50} fmt={v => `${v} €`} icon="🔨" color={YELLOW} />
          <Sld label="Loyer marché / m² / mois" value={lm} onChange={setLm} min={10} max={40} step={0.5} fmt={v => `${v} €`} icon="🏷️" color={YELLOW} />
        </div>
        <VerdictBanner rd={cfg.rd} cf={cfg.cf} inv={inv} loyer={cfg.rev} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <KpiCard label="Revenus/mois" value={eur(cfg.rev)} color={GREEN} sub={`${cfg.ntot} kots`} />
          <KpiCard label="Cash flow" value={eur(cfg.cf)} color={cfg.cf >= 0 ? GREEN : RED} sub="mensuel net" />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: MUT, marginBottom: 12 }}>Surface : <strong style={{ color: TXT }}>{s} m²</strong> · Loyer : <strong style={{ color: YELLOW }}>{lm} €/m²/mois</strong> · Communs : <strong style={{ color: YELLOW }}>{pctCom}%</strong></div>
        <div style={{ border: `1px solid ${BDR}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 115px 115px 90px 120px 140px", background: "#090F1A", borderBottom: `2px solid ${BDR}` }}>
            {["Type de kot", "Surf./kot", "Nb kots", "Surf. tot.", "Loyer/kot", "Revenus/mois"].map((h, i) => (
              <div key={h} style={{ padding: "9px 12px", fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, textAlign: i === 0 ? "left" : "right" }}>{h}</div>
            ))}
          </div>
          {cfg.r.map((row, i) => {
            const on = row.nb > 0, c = colors[i];
            return (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "160px 115px 115px 90px 120px 140px", borderBottom: `1px solid ${BDR}`, background: on ? `${c}07` : "transparent" }}>
                <div style={{ padding: "11px 12px", fontSize: 12, fontWeight: 700, color: on ? c : MUT, display: "flex", alignItems: "center" }}>🛏 {row.label}</div>
                <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Num value={row.surf} onChange={v => upd(row.id, "surf", v)} min={10} max={50} color={BLUE} suffix="m²" />
                </div>
                <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Num value={row.nb} onChange={v => upd(row.id, "nb", v)} min={0} max={30} color={YELLOW} suffix="u." />
                </div>
                <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? TXT : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? `${row.stot} m²` : "—"}</div>
                <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? GREEN : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.lunit) : "—"}</div>
                <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: on ? GREEN : MUT, background: on ? "rgba(61,214,160,0.05)" : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.rev) + "/mois" : "—"}</div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "160px 115px 115px 90px 120px 140px", borderBottom: `1px solid ${BDR}`, background: `${YELLOW}06` }}>
            <div style={{ padding: "11px 12px", fontSize: 12, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center" }}>🚪 Parties communes</div>
            <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Num value={pctCom} onChange={setPctCom} min={0} max={60} color={YELLOW} suffix="%" />
            </div>
            <div style={{ padding: "11px 12px", fontSize: 11, color: MUT, display: "flex", alignItems: "center", justifyContent: "flex-end", fontStyle: "italic" }}>de la surf.</div>
            <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{cfg.sComM2} m²</div>
            <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "160px 115px 115px 90px 120px 140px", background: "#090F1A" }}>
            <div style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: TXT, display: "flex", alignItems: "center" }}>TOTAL</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11, color: MUT }}>{cfg.ntot} kots</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: cfg.used > s ? RED : TXT }}>{cfg.used} m²</span>
            </div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: GREEN }}>{eur(cfg.rev)}/mois</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: cfg.rest < 0 ? "rgba(239,68,68,0.08)" : "rgba(61,214,160,0.07)", border: `1px solid ${cfg.rest < 0 ? "rgba(239,68,68,0.3)" : "rgba(61,214,160,0.25)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: MUT }}>Surface utilisée</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.rest < 0 ? RED : GREEN, fontFamily: "monospace" }}>{cfg.used}/{s} m² {cfg.rest < 0 ? `⚠ +${Math.abs(cfg.rest)} m²` : `· ${cfg.rest} m² libres`}</span>
          </div>
          <div style={{ height: 7, background: "#162338", borderRadius: 4, overflow: "hidden", display: "flex" }}>
            {cfg.r.filter(r => r.nb > 0).map((r, i) => <div key={r.id} style={{ height: "100%", width: `${(r.stot / s) * 100}%`, background: colors[i] }} />)}
            <div style={{ height: "100%", width: `${(cfg.sComM2 / s) * 100}%`, background: YELLOW }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ SCÉNARIO : MIX APPT + KOTS ═══════════════
function ScenarioMix({ shared }) {
  const { tx, dr, tv, ch } = shared;
  const [s, setS] = useState(400);
  const [pm, setPm] = useState(1300);
  const [cm, setCm] = useState(850);
  const [rows, setRows] = useState([
    { id: 0, label: "Appartement 1ch", type: "appt", icon: "🏢", color: BLUE, surf: 48, lm: 14, nb: 2 },
    { id: 1, label: "Appartement 2ch", type: "appt", icon: "🏢", color: PURPLE, surf: 68, lm: 13, nb: 1 },
    { id: 2, label: "Kot 16m²", type: "kot", icon: "📚", color: YELLOW, surf: 16, lm: 22, nb: 3 },
    { id: 3, label: "Kot 20m²", type: "kot", icon: "📚", color: ORANGE, surf: 20, lm: 21, nb: 2 },
  ]);
  const [pctCom, setPctCom] = useState(18);

  const inv = useMemo(() => {
    const ac = s * pm, no = ac * 0.03, tr = s * cm, tva = tr * (tv / 100), rv = tr + tva;
    return ac + no + rv;
  }, [s, pm, cm, tv]);
  const ms = useMemo(() => inv > 0 ? pmt(tx / 100 / 12, dr * 12, inv) : 0, [inv, tx, dr]);

  const cfg = useMemo(() => {
    const r = rows.map(row => ({ ...row, stot: row.surf * row.nb, lunit: row.surf * row.lm, rev: row.nb * row.surf * row.lm }));
    const sTot = r.reduce((a, x) => a + x.stot, 0);
    const ntot = r.reduce((a, x) => a + x.nb, 0);
    const rev = r.reduce((a, x) => a + x.rev, 0);
    const sComM2 = Math.round(s * pctCom / 100);
    const used = sTot + sComM2;
    const cf = rev - ms - rev * (ch / 100);
    const rd = inv > 0 ? (rev * 12) / inv : 0;
    return { r, ntot, rev, sComM2, used, rest: s - used, cf, rd };
  }, [rows, pctCom, s, inv, ms, ch]);

  const upd = (id, f, v) => setRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));

  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ width: 255, flexShrink: 0 }}>
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "16px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>🏘️ Paramètres mix</div>
          <Sld label="Surface totale" value={s} onChange={setS} min={100} max={1000} step={10} fmt={v => `${v} m²`} icon="📐" color={GREEN} />
          <Sld label="Prix achat / m²" value={pm} onChange={setPm} min={300} max={4000} step={50} fmt={v => `${v} €`} icon="🏠" color={GREEN} />
          <Sld label="Coût rénovation / m²" value={cm} onChange={setCm} min={100} max={2500} step={50} fmt={v => `${v} €`} icon="🔨" color={GREEN} />
        </div>
        <VerdictBanner rd={cfg.rd} cf={cfg.cf} inv={inv} loyer={cfg.rev} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <KpiCard label="Total revenus" value={eur(cfg.rev)} color={GREEN} sub={`${cfg.ntot} unités`} />
          <KpiCard label="Cash flow" value={eur(cfg.cf)} color={cfg.cf >= 0 ? GREEN : RED} sub="mensuel net" />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: MUT, marginBottom: 12 }}>Surface : <strong style={{ color: TXT }}>{s} m²</strong> · Loyer variable par type · Communs : <strong style={{ color: YELLOW }}>{pctCom}%</strong></div>
        <div style={{ border: `1px solid ${BDR}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "170px 105px 80px 120px 85px 110px 130px", background: "#090F1A", borderBottom: `2px solid ${BDR}` }}>
            {["Unité", "Surf.", "Nb", "Loyer/m²/mois", "Surf.tot.", "Loyer/u.", "Revenus/mois"].map((h, i) => (
              <div key={h} style={{ padding: "9px 10px", fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, textAlign: i === 0 ? "left" : "right" }}>{h}</div>
            ))}
          </div>
          {cfg.r.map(row => {
            const on = row.nb > 0;
            return (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "170px 105px 80px 120px 85px 110px 130px", borderBottom: `1px solid ${BDR}`, background: on ? `${row.color}07` : "transparent" }}>
                <div style={{ padding: "10px", display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{row.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: on ? row.color : MUT }}>{row.label}</span>
                </div>
                <div style={{ padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Num value={row.surf} onChange={v => upd(row.id, "surf", v)} min={10} max={300} color={BLUE} suffix="m²" />
                </div>
                <div style={{ padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Num value={row.nb} onChange={v => upd(row.id, "nb", v)} min={0} max={30} color={YELLOW} suffix="" />
                </div>
                <div style={{ padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <Num value={row.lm} onChange={v => upd(row.id, "lm", v)} min={4} max={40} color={GREEN} suffix="€/m²" />
                </div>
                <div style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: on ? TXT : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? `${row.stot}m²` : "—"}</div>
                <div style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: on ? GREEN : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.lunit) : "—"}</div>
                <div style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: on ? GREEN : MUT, background: on ? "rgba(61,214,160,0.05)" : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.rev) + "/m" : "—"}</div>
              </div>
            );
          })}
          <div style={{ display: "grid", gridTemplateColumns: "170px 105px 80px 120px 85px 110px 130px", borderBottom: `1px solid ${BDR}`, background: `${YELLOW}06` }}>
            <div style={{ padding: "10px", fontSize: 12, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center" }}>🚪 Communs</div>
            <div style={{ padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Num value={pctCom} onChange={setPctCom} min={0} max={50} color={YELLOW} suffix="%" />
            </div>
            <div style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT, fontStyle: "italic", fontSize: 10 }}>de la surf.</div>
            <div style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "10px", textAlign: "right", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{cfg.sComM2}m²</div>
            <div style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "10px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "170px 105px 80px 120px 85px 110px 130px", background: "#090F1A" }}>
            <div style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: TXT, display: "flex", alignItems: "center" }}>TOTAL</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "12px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>{cfg.ntot}</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: cfg.used > s ? RED : TXT }}>{cfg.used}m²</span>
            </div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
            <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: GREEN }}>{eur(cfg.rev)}/m</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", borderRadius: 10, background: cfg.rest < 0 ? "rgba(239,68,68,0.08)" : "rgba(61,214,160,0.07)", border: `1px solid ${cfg.rest < 0 ? "rgba(239,68,68,0.3)" : "rgba(61,214,160,0.25)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: MUT }}>Surface utilisée</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.rest < 0 ? RED : GREEN, fontFamily: "monospace" }}>{cfg.used}/{s} m² {cfg.rest < 0 ? `⚠ +${Math.abs(cfg.rest)} m²` : `· ${cfg.rest} m² libres`}</span>
          </div>
          <div style={{ height: 7, background: "#162338", borderRadius: 4, overflow: "hidden", display: "flex" }}>
            {cfg.r.filter(r => r.nb > 0).map(r => <div key={r.id} style={{ height: "100%", width: `${(r.stot / s) * 100}%`, background: r.color }} />)}
            <div style={{ height: "100%", width: `${(cfg.sComM2 / s) * 100}%`, background: YELLOW }} />
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════ SCÉNARIO : TERRAIN VIERGE ═══════════════
function ScenarioTerrain({ shared }) {
  const { tx, dr, tv, ch } = shared;
  const [mode, setMode] = useState("locatif");
  const [sTerrain, setST] = useState(500);
  const [pTerrain, setPT] = useState(150);
  const [sCons, setSC] = useState(400);
  const [cCons, setCC] = useState(1400);
  const [archi, setArchi] = useState(10);
  const [pctCom, setPctCom] = useState(15);
  const [lm, setLm] = useState(14);
  const [pmVente, setPmVente] = useState(2800);
  const [fraisVente, setFraisVente] = useState(3);
  const [taxePV, setTaxePV] = useState(16.5);
  const [dureeChantier, setDC] = useState(18);
  const [rows, setRows] = useState([
    { id: 0, label: "Appartement 1ch", icon: "🏢", color: BLUE, surf: 48, nb: 2 },
    { id: 1, label: "Appartement 2ch", icon: "🏢", color: PURPLE, surf: 68, nb: 2 },
    { id: 2, label: "Appartement 3ch", icon: "🏢", color: GREEN, surf: 90, nb: 0 },
  ]);
  const upd = (id, f, v) => setRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));

  const breakdown = useMemo(() => {
    const terrain = sTerrain * pTerrain;
    const noTerrain = terrain * 0.12;
    const construction = sCons * cCons;
    const tva_cons = construction * (tv / 100);
    const archiAmt = (construction + tva_cons) * (archi / 100);
    const total = terrain + noTerrain + construction + tva_cons + archiAmt;
    return { terrain, noTerrain, construction, tva_cons, archiAmt, total };
  }, [sTerrain, pTerrain, sCons, cCons, tv, archi]);

  const inv = breakdown.total;
  const ms = useMemo(() => inv > 0 ? pmt(tx / 100 / 12, dr * 12, inv) : 0, [inv, tx, dr]);

  const cfgLoc = useMemo(() => {
    const r = rows.map(row => ({ ...row, stot: row.surf * row.nb, lunit: row.surf * lm, rev: row.nb * row.surf * lm }));
    const ntot = r.reduce((a, x) => a + x.nb, 0);
    const rev = r.reduce((a, x) => a + x.rev, 0);
    const sComM2 = Math.round(sCons * pctCom / 100);
    const used = r.reduce((a, x) => a + x.stot, 0) + sComM2;
    const cf = rev - ms - rev * (ch / 100);
    const rd = inv > 0 ? (rev * 12) / inv : 0;
    return { r, ntot, rev, sComM2, used, rest: sCons - used, cf, rd };
  }, [rows, pctCom, sCons, lm, inv, ms, ch]);

  const cfgRev = useMemo(() => {
    const r = rows.map(row => ({ ...row, stot: row.surf * row.nb, pvUnit: row.surf * pmVente, pvTot: row.nb * row.surf * pmVente }));
    const ntot = r.reduce((a, x) => a + x.nb, 0);
    const caTotal = r.reduce((a, x) => a + x.pvTot, 0);
    const fraisAmt = caTotal * (fraisVente / 100);
    const caNet = caTotal - fraisAmt;
    const interetsChantier = inv * (tx / 100) * (dureeChantier / 12);
    const beneficeAvantTaxe = caNet - inv - interetsChantier;
    const taxeAmt = beneficeAvantTaxe > 0 ? beneficeAvantTaxe * (taxePV / 100) : 0;
    const beneficeNet = beneficeAvantTaxe - taxeAmt;
    const roi = inv > 0 ? beneficeNet / inv : 0;
    const sComM2 = Math.round(sCons * pctCom / 100);
    const used = r.reduce((a, x) => a + x.stot, 0) + sComM2;
    const surfVendue = r.reduce((a, x) => a + x.stot, 0);
    return { r, ntot, caTotal, fraisAmt, caNet, interetsChantier, taxeAmt, beneficeNet, roi, sComM2, used, rest: sCons - used, surfVendue };
  }, [rows, pctCom, sCons, pmVente, fraisVente, taxePV, dureeChantier, inv, tx]);

  const SharedTable = ({ renderExtraCols, extraHeaders, totalExtra }) => {
    const sComM2 = Math.round(sCons * pctCom / 100);
    const cols = ["1fr", "105px", "110px", "85px", ...extraHeaders.map(() => "130px")];
    const gridCols = cols.join(" ");
    return (
      <div style={{ border: `1px solid ${BDR}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: gridCols, background: "#090F1A", borderBottom: `2px solid ${BDR}` }}>
          {["Type de logement", "Surf./unité", "Nb unités", "Surf. tot.", ...extraHeaders].map((h, i) => (
            <div key={h} style={{ padding: "9px 12px", fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, textAlign: i === 0 ? "left" : "right" }}>{h}</div>
          ))}
        </div>
        {rows.map(row => { const on = row.nb > 0; return (
          <div key={row.id} style={{ display: "grid", gridTemplateColumns: gridCols, borderBottom: `1px solid ${BDR}`, background: on ? `${row.color}07` : "transparent" }}>
            <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>{row.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: on ? row.color : MUT }}>{row.label}</span>
            </div>
            <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Num value={row.surf} onChange={v => upd(row.id, "surf", v)} min={20} max={300} color={BLUE} suffix="m²" />
            </div>
            <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <Num value={row.nb} onChange={v => upd(row.id, "nb", v)} min={0} max={30} color={YELLOW} suffix="u." />
            </div>
            <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? TXT : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? `${row.surf * row.nb} m²` : "—"}</div>
            {renderExtraCols(row, on)}
          </div>
        );})}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, borderBottom: `1px solid ${BDR}`, background: `${YELLOW}06` }}>
          <div style={{ padding: "11px 12px", fontSize: 12, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center" }}>🚪 Parties communes</div>
          <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Num value={pctCom} onChange={setPctCom} min={0} max={50} color={YELLOW} suffix="%" />
          </div>
          <div style={{ padding: "11px 12px", fontSize: 10, color: MUT, display: "flex", alignItems: "center", justifyContent: "flex-end", fontStyle: "italic" }}>de la surf.</div>
          <div style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: YELLOW, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{sComM2} m²</div>
          {extraHeaders.map((_, i) => <div key={i} style={{ padding: "11px 12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>)}
        </div>
        {totalExtra}
      </div>
    );
  };

  const SurfBar = (cfg) => (
    <div style={{ padding: "10px 14px", borderRadius: 10, background: cfg.rest < 0 ? "rgba(239,68,68,0.08)" : "rgba(61,214,160,0.07)", border: `1px solid ${cfg.rest < 0 ? "rgba(239,68,68,0.3)" : "rgba(61,214,160,0.25)"}`, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: MUT }}>Surface construite utilisée</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.rest < 0 ? RED : GREEN, fontFamily: "monospace" }}>{cfg.used} / {sCons} m² {cfg.rest < 0 ? `⚠ +${Math.abs(cfg.rest)} m²` : `· ${cfg.rest} m² libres`}</span>
      </div>
      <div style={{ height: 7, background: "#162338", borderRadius: 4, overflow: "hidden", display: "flex" }}>
        {rows.filter(r => r.nb > 0).map(r => <div key={r.id} style={{ height: "100%", width: `${(r.surf * r.nb / sCons) * 100}%`, background: r.color }} />)}
        <div style={{ height: "100%", width: `${(cfg.sComM2 / sCons) * 100}%`, background: YELLOW }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 14 }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 275, flexShrink: 0 }}>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 14, background: CARD, borderRadius: 11, padding: 4, border: `1px solid ${BDR}` }}>
          {[["locatif", "🏠", "Revenus Locatifs", GREEN], ["revente", "💸", "Revente des Biens", ORANGE]].map(([id, icon, lbl, col]) => {
            const a = mode === id;
            return (
              <button key={id} onClick={() => setMode(id)} style={{ flex: 1, padding: "10px 6px", borderRadius: 8, cursor: "pointer", background: a ? `${col}18` : "transparent", border: `1.5px solid ${a ? col : "transparent"}`, color: a ? col : MUT, fontWeight: a ? 700 : 500, fontSize: 11, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{lbl}</span>
              </button>
            );
          })}
        </div>

        {/* Terrain */}
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "14px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🌿 Terrain</div>
          <Sld label="Surface terrain" value={sTerrain} onChange={setST} min={100} max={5000} step={50} fmt={v => `${v} m²`} icon="📏" color={ORANGE} />
          <Sld label="Prix terrain / m²" value={pTerrain} onChange={setPT} min={20} max={500} step={10} fmt={v => `${v} €`} icon="🌿" color={ORANGE} />
          <div style={{ height: 1, background: BDR, margin: "10px 0" }} />
          <div style={{ fontSize: 9, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🏗️ Construction</div>
          <Sld label="Surface construite" value={sCons} onChange={setSC} min={50} max={2000} step={10} fmt={v => `${v} m²`} icon="📐" color={GREEN} />
          <Sld label="Coût construction / m²" value={cCons} onChange={setCC} min={800} max={3000} step={50} fmt={v => `${v} €`} icon="🏗️" color={GREEN} />
          <Sld label="Honoraires architecte" value={archi} onChange={setArchi} min={5} max={20} step={0.5} fmt={v => `${v}%`} icon="✏️" color={GREEN} />
        </div>

        {/* Mode-specific params */}
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "14px", marginBottom: 12 }}>
          {mode === "locatif" ? (
            <>
              <div style={{ fontSize: 9, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🏠 Paramètres locatifs</div>
              <Sld label="Loyer marché / m² / mois" value={lm} onChange={setLm} min={5} max={30} step={0.5} fmt={v => `${v} €`} icon="🏷️" color={GREEN} />
            </>
          ) : (
            <>
              <div style={{ fontSize: 9, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>💸 Paramètres revente</div>
              <Sld label="Prix de vente / m² (neuf)" value={pmVente} onChange={setPmVente} min={1500} max={6000} step={50} fmt={v => `${v} €`} icon="🏷️" color={ORANGE} highlight />
              <Sld label="Frais de vente (agence + acte)" value={fraisVente} onChange={setFraisVente} min={1} max={8} step={0.5} fmt={v => `${v}%`} icon="📄" color={ORANGE} />
              <Sld label="Durée chantier (financement)" value={dureeChantier} onChange={setDC} min={6} max={48} step={1} fmt={v => `${v} mois`} icon="📅" color={PURPLE} />
              <Sld label="Taxe plus-value (pers. phys.)" value={taxePV} onChange={setTaxePV} min={0} max={33} step={0.5} fmt={v => `${v}%`} icon="🏛️" color={RED} />
            </>
          )}
        </div>

        {/* Investissement breakdown */}
        <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "14px" }}>
          <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>💰 Investissement total</div>
          {[
            ["Terrain", eur(breakdown.terrain)],
            ["Droits enreg. terrain (12%)", eur(breakdown.noTerrain)],
            ["Construction HTVA", eur(breakdown.construction)],
            [`TVA ${tv}%`, eur(breakdown.tva_cons)],
            [`Architecte ${archi}%`, eur(breakdown.archiAmt)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${BDR}`, fontSize: 11 }}>
              <span style={{ color: MUT }}>{l}</span><span style={{ fontFamily: "monospace", color: TXT }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, fontWeight: 700 }}>
            <span>TOTAL INVESTI</span>
            <span style={{ fontFamily: "monospace", color: YELLOW }}>{eur(inv)}</span>
          </div>
          {mode === "locatif" && (
            <div style={{ padding: "8px 10px", background: "rgba(155,139,255,0.08)", borderRadius: 8, border: `1px solid rgba(155,139,255,0.2)`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: PURPLE, opacity: .8 }}>Mensualité ({tx.toFixed(1)}%, {dr}a)</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: PURPLE }}>{eur(ms)}/mois</span>
            </div>
          )}
          {mode === "revente" && (
            <div style={{ padding: "8px 10px", background: "rgba(251,146,60,0.08)", borderRadius: 8, border: `1px solid rgba(251,146,60,0.2)`, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: ORANGE, opacity: .8 }}>Prix revient / m² construit</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: ORANGE }}>{eur(inv / sCons)}/m²</span>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1 }}>

        {/* ════ VARIANTE LOCATIVE ════ */}
        {mode === "locatif" && (
          <>
            <VerdictBanner rd={cfgLoc.rd} cf={cfgLoc.cf} inv={inv} loyer={cfgLoc.rev} />
            <div style={{ fontSize: 11, color: MUT, marginBottom: 12 }}>
              Surface : <strong style={{ color: TXT }}>{sCons} m²</strong> · Loyer : <strong style={{ color: GREEN }}>{lm} €/m²/mois</strong> · Communs : <strong style={{ color: YELLOW }}>{pctCom}%</strong>
            </div>
            <SharedTable
              extraHeaders={["Loyer / unité", "Revenus / mois"]}
              renderExtraCols={(row, on) => [
                <div key="l" style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? GREEN : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.surf * lm) : "—"}</div>,
                <div key="r" style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: on ? GREEN : MUT, background: on ? "rgba(61,214,160,0.05)" : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.nb * row.surf * lm) + "/mois" : "—"}</div>,
              ]}
              totalExtra={
                <div style={{ display: "grid", gridTemplateColumns: "1fr 105px 110px 85px 130px 130px", background: "#090F1A" }}>
                  <div style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: TXT, display: "flex", alignItems: "center" }}>TOTAL</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11, color: MUT }}>{cfgLoc.ntot} u.</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: cfgLoc.used > sCons ? RED : TXT }}>{cfgLoc.used} m²</span></div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}><span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: GREEN }}>{eur(cfgLoc.rev)}/mois</span></div>
                </div>
              }
            />
            {SurfBar(cfgLoc)}
          </>
        )}

        {/* ════ VARIANTE REVENTE ════ */}
        {mode === "revente" && (
          <>
            {/* Verdict revente */}
            {(() => {
              const bpct = cfgRev.roi;
              const col = bpct < 0 ? RED : bpct < 0.10 ? YELLOW : bpct < 0.20 ? "#A3E635" : GREEN;
              const lbl = bpct < 0 ? "DÉFICITAIRE" : bpct < 0.10 ? "MARGE FAIBLE" : bpct < 0.20 ? "BONNE MARGE" : "EXCELLENTE MARGE";
              const icon = bpct < 0 ? "✗" : bpct < 0.10 ? "⚠" : bpct < 0.20 ? "✓" : "✦";
              return (
                <div style={{ padding: "13px 18px", borderRadius: 13, background: `${col}10`, border: `2px solid ${col}44`, display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${col}22`, border: `2px solid ${col}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: col, flexShrink: 0 }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: col }}>{lbl}</div>
                    <div style={{ fontSize: 10, color: col, opacity: .72, marginTop: 2 }}>Bénéfice net {eur(cfgRev.beneficeNet)} · ROI {pct(bpct)} · CA total {eur(cfgRev.caTotal)} · {cfgRev.ntot} unité{cfgRev.ntot > 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                    {[[eur(cfgRev.beneficeNet), "Bénéfice net"], [pct(bpct), "ROI"], [eur(cfgRev.caTotal), "CA brut"]].map(([val, l]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: col }}>{val}</div>
                        <div style={{ fontSize: 9, color: col, opacity: .55, textTransform: "uppercase", marginTop: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ fontSize: 11, color: MUT, marginBottom: 12 }}>
              Prix de vente : <strong style={{ color: ORANGE }}>{pmVente} €/m²</strong> · Frais : <strong style={{ color: ORANGE }}>{fraisVente}%</strong> · Taxe PV : <strong style={{ color: RED }}>{taxePV}%</strong> · Chantier : <strong style={{ color: PURPLE }}>{dureeChantier} mois</strong>
            </div>

            <SharedTable
              extraHeaders={["Prix vente / unité", "CA / type"]}
              renderExtraCols={(row, on) => [
                <div key="pu" style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: on ? ORANGE : MUT, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.surf * pmVente) : "—"}</div>,
                <div key="ca" style={{ padding: "11px 12px", textAlign: "right", fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: on ? ORANGE : MUT, background: on ? "rgba(251,146,60,0.05)" : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{on ? eur(row.nb * row.surf * pmVente) : "—"}</div>,
              ]}
              totalExtra={
                <div style={{ display: "grid", gridTemplateColumns: "1fr 105px 110px 85px 130px 130px", background: "#090F1A" }}>
                  <div style={{ padding: "12px", fontSize: 13, fontWeight: 800, color: TXT, display: "flex", alignItems: "center" }}>TOTAL</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 11, color: MUT }}>{cfgRev.ntot} u.</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}><span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: cfgRev.used > sCons ? RED : TXT }}>{cfgRev.used} m²</span></div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", color: MUT }}>—</div>
                  <div style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}><span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: ORANGE }}>{eur(cfgRev.caTotal)}</span></div>
                </div>
              }
            />
            {SurfBar(cfgRev)}

            {/* Compte de résultat */}
            <div style={{ background: PANEL, borderRadius: 12, border: `1px solid ${BDR}`, padding: "16px" }}>
              <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>📊 Compte de résultat — Opération de promotion immobilière</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 9, color: GREEN, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>✚ Produits</div>
                  {[["CA brut (prix × surface)", eur(cfgRev.caTotal), GREEN], [`− Frais de vente (${fraisVente}%)`, `(${eur(cfgRev.fraisAmt)})`, RED], ["= CA net", eur(cfgRev.caNet), TXT]].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}`, fontSize: 12 }}>
                      <span style={{ color: MUT }}>{l}</span><span style={{ fontFamily: "monospace", color: c, fontWeight: c === TXT ? 700 : 400 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: RED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>✖ Charges</div>
                  {[
                    ["Investissement total", `(${eur(inv)})`, RED],
                    [`Intérêts chantier (${dureeChantier} mois)`, `(${eur(cfgRev.interetsChantier)})`, RED],
                    [`Taxe plus-value (${taxePV}%)`, `(${eur(cfgRev.taxeAmt)})`, RED],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BDR}`, fontSize: 12 }}>
                      <span style={{ color: MUT }}>{l}</span><span style={{ fontFamily: "monospace", color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Bottom KPIs */}
              <div style={{ padding: "14px 16px", background: cfgRev.beneficeNet >= 0 ? "rgba(61,214,160,0.10)" : "rgba(239,68,68,0.10)", borderRadius: 10, border: `2px solid ${cfgRev.beneficeNet >= 0 ? "rgba(61,214,160,0.4)" : "rgba(239,68,68,0.4)"}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {[
                    ["Bénéfice net", eur(cfgRev.beneficeNet), cfgRev.beneficeNet >= 0 ? GREEN : RED],
                    ["ROI sur investissement", pct(cfgRev.roi), cfgRev.roi >= 0.15 ? GREEN : cfgRev.roi >= 0.08 ? YELLOW : RED],
                    ["Marge / m² vendu", cfgRev.surfVendue > 0 ? eur(cfgRev.beneficeNet / cfgRev.surfVendue) : "—", TXT],
                    ["Prix revient / m²", eur(inv / sCons), MUT],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ textAlign: "center", padding: "10px 6px", background: `${cfgRev.beneficeNet >= 0 ? GREEN : RED}10`, borderRadius: 9 }}>
                      <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.07em" }}>{l}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 800, color: c, marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 9.5, color: MUT, padding: "8px 10px", background: CARD, borderRadius: 7, border: `1px solid ${BDR}` }}>
                ⚠️ La taxe sur plus-value dépend du régime fiscal (personne physique vs société, durée de détention terrain). Consultez un comptable ou notaire pour votre situation.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// ═══════════════ APP PRINCIPALE ═══════════════
export default function App() {
  const [scenario, setScenario] = useState("appt");
  const [tx, setTx] = useState(3.5);
  const [dr, setDr] = useState(25);
  const [tv, setTv] = useState(6);
  const [ch, setCh] = useState(15);

  const shared = { tx, dr, tv, ch };

  const TABS = [
    { id: "appt", label: "Appartements", icon: "🏢", color: BLUE },
    { id: "kots", label: "Kots Étudiants", icon: "📚", color: YELLOW },
    { id: "mix", label: "Mix Appt + Kots", icon: "🏘️", color: GREEN },
    { id: "terrain", label: "Terrain Vierge", icon: "🌿", color: ORANGE },
  ];
  const activeTab = TABS.find(t => t.id === scenario);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: "system-ui, sans-serif", color: TXT, overflow: "hidden" }}>

      {/* ── HEADER ── */}
      <div style={{ background: PANEL, borderBottom: `1px solid ${BDR}`, height: 48, display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>🏘️</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.05em" }}>SIMULATEUR IMMOBILIER — WALLONIE</div>
          <div style={{ fontSize: 8.5, color: MUT, letterSpacing: "0.12em" }}>RENDEMENT · FINANCEMENT · TVA · BELGIQUE</div>
        </div>
        {/* Shared params */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: "0.1em" }}>Paramètres globaux :</span>
          {[
            { label: "Taux", value: tx, set: setTx, min: 0.5, max: 9, step: 0.1, fmt: v => `${v.toFixed(1)}%`, color: PURPLE },
            { label: "Durée", value: dr, set: setDr, min: 5, max: 30, step: 1, fmt: v => `${v}a`, color: PURPLE },
            { label: "TVA", value: tv, set: setTv, min: 6, max: 21, step: 15, fmt: v => `${v}%`, color: "#9B8BFF" },
            { label: "Charges", value: ch, set: setCh, min: 5, max: 40, step: 1, fmt: v => `${v}%`, color: MUT },
          ].map(({ label, value, set, min, max, step, fmt, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", background: CARD, borderRadius: 6, border: `1px solid ${BDR}` }}>
              <span style={{ fontSize: 9, color: MUT }}>{label}</span>
              <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)}
                style={{ width: 50, cursor: "pointer", accentColor: color }} />
              <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }}>
        {scenario === "appt" && <ScenarioAppartements shared={shared} />}
        {scenario === "kots" && <ScenarioKots shared={shared} />}
        {scenario === "mix" && <ScenarioMix shared={shared} />}
        {scenario === "terrain" && <ScenarioTerrain shared={shared} />}
      </div>

      {/* ── BOTTOM TABS ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: PANEL, borderTop: `1px solid ${BDR}`, display: "flex", height: 60, flexShrink: 0, zIndex: 100 }}>
        {TABS.map(tab => {
          const active = scenario === tab.id;
          return (
            <button key={tab.id} onClick={() => setScenario(tab.id)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", background: active ? `${tab.color}12` : "transparent", border: "none", borderTop: `3px solid ${active ? tab.color : "transparent"}`, transition: "all .15s", padding: 0 }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? tab.color : MUT, letterSpacing: "0.02em" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
