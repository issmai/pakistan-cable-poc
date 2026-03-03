"use client";

import { useState, useEffect } from "react";
import {
    Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, ComposedChart,
} from "recharts";
import { Edit2, Check } from "lucide-react";

/* ─── TYPES ────────────────────────────────────────────────────────────────── */

interface Metal {
    id: string;
    symbol: string;
    label: string;
    price: number;
    prev: number;
    unit: string;
    src1: number;
    src2: number;
}

interface ChartDataItem {
    month: string;
    price: number | null;
    forecast: number | null;
    low: number | null;
    high: number | null;
}

interface ProcurementItem {
    month: string;
    actual: number | null;
    required: number;
    recommended: number | null;
}

interface Recommendation {
    id: string;
    metal: string;
    symbol: string;
    urgency: "high" | "medium" | "low";
    confidence: number;
    basePrice: number;
    currentPrice: number;
    projectedPrice: number;
    priceRisk: string;
    window: string;
    qty: number;
    color: string;
    rationale: string;
}

/* ─── MOCK DATA ──────────────────────────────────────────────────────────────── */

const METALS: Metal[] = [
    { id: "copper", symbol: "CU", label: "Copper", price: 9412, prev: 9245, unit: "$/MT", src1: 9412, src2: 9408 },
    { id: "aluminium", symbol: "AL", label: "Aluminium", price: 2287, prev: 2301, unit: "$/MT", src1: 2287, src2: 2289 },
    { id: "nickel", symbol: "NI", label: "Nickel", price: 15840, prev: 15360, unit: "$/MT", src1: 15840, src2: 15855 },
    { id: "zinc", symbol: "ZN", label: "Zinc", price: 2741, prev: 2774, unit: "$/MT", src1: 2741, src2: 2738 },
];

const CHART_DATA: Record<string, ChartDataItem[]> = {
    copper: [
        { month: "Aug '24", price: 8750, forecast: null, low: null, high: null },
        { month: "Sep '24", price: 8940, forecast: null, low: null, high: null },
        { month: "Oct '24", price: 9120, forecast: null, low: null, high: null },
        { month: "Nov '24", price: 9050, forecast: null, low: null, high: null },
        { month: "Dec '24", price: 9210, forecast: null, low: null, high: null },
        { month: "Jan '25", price: 9350, forecast: null, low: null, high: null },
        { month: "Feb '25", price: 9412, forecast: 9412, low: 9412, high: 9412 },
        { month: "Mar '25", price: null, forecast: 9580, low: 9300, high: 9860 },
        { month: "Apr '25", price: null, forecast: 9740, low: 9380, high: 10100 },
        { month: "May '25", price: null, forecast: 9820, low: 9300, high: 10340 },
        { month: "Jun '25", price: null, forecast: 9680, low: 9150, high: 10210 },
        { month: "Jul '25", price: null, forecast: 9900, low: 9250, high: 10550 },
    ],
    aluminium: [
        { month: "Aug '24", price: 2080, forecast: null, low: null, high: null },
        { month: "Sep '24", price: 2120, forecast: null, low: null, high: null },
        { month: "Oct '24", price: 2190, forecast: null, low: null, high: null },
        { month: "Nov '24", price: 2210, forecast: null, low: null, high: null },
        { month: "Dec '24", price: 2240, forecast: null, low: null, high: null },
        { month: "Jan '25", price: 2268, forecast: null, low: null, high: null },
        { month: "Feb '25", price: 2287, forecast: 2287, low: 2287, high: 2287 },
        { month: "Mar '25", price: null, forecast: 2260, low: 2200, high: 2320 },
        { month: "Apr '25", price: null, forecast: 2235, low: 2160, high: 2310 },
        { month: "May '25", price: null, forecast: 2250, low: 2150, high: 2350 },
        { month: "Jun '25", price: null, forecast: 2290, low: 2180, high: 2400 },
        { month: "Jul '25", price: null, forecast: 2320, low: 2190, high: 2450 },
    ],
    nickel: [
        { month: "Aug '24", price: 14200, forecast: null, low: null, high: null },
        { month: "Sep '24", price: 14800, forecast: null, low: null, high: null },
        { month: "Oct '24", price: 15100, forecast: null, low: null, high: null },
        { month: "Nov '24", price: 15400, forecast: null, low: null, high: null },
        { month: "Dec '24", price: 15600, forecast: null, low: null, high: null },
        { month: "Jan '25", price: 15720, forecast: null, low: null, high: null },
        { month: "Feb '25", price: 15840, forecast: 15840, low: 15840, high: 15840 },
        { month: "Mar '25", price: null, forecast: 16100, low: 15200, high: 17000 },
        { month: "Apr '25", price: null, forecast: 16400, low: 15000, high: 17800 },
        { month: "May '25", price: null, forecast: 16200, low: 14800, high: 17600 },
        { month: "Jun '25", price: null, forecast: 16800, low: 15100, high: 18500 },
        { month: "Jul '25", price: null, forecast: 17200, low: 15400, high: 19000 },
    ],
    zinc: [
        { month: "Aug '24", price: 2620, forecast: null, low: null, high: null },
        { month: "Sep '24", price: 2670, forecast: null, low: null, high: null },
        { month: "Oct '24", price: 2700, forecast: null, low: null, high: null },
        { month: "Nov '24", price: 2720, forecast: null, low: null, high: null },
        { month: "Dec '24", price: 2755, forecast: null, low: null, high: null },
        { month: "Jan '25", price: 2770, forecast: null, low: null, high: null },
        { month: "Feb '25", price: 2741, forecast: 2741, low: 2741, high: 2741 },
        { month: "Mar '25", price: null, forecast: 2710, low: 2640, high: 2780 },
        { month: "Apr '25", price: null, forecast: 2680, low: 2590, high: 2770 },
        { month: "May '25", price: null, forecast: 2700, low: 2580, high: 2820 },
        { month: "Jun '25", price: null, forecast: 2730, low: 2600, high: 2860 },
        { month: "Jul '25", price: null, forecast: 2760, low: 2610, high: 2910 },
    ],
};

const PROCUREMENT: ProcurementItem[] = [
    { month: "Aug '24", actual: 320, required: 300, recommended: null },
    { month: "Sep '24", actual: 410, required: 380, recommended: null },
    { month: "Oct '24", actual: 280, required: 310, recommended: null },
    { month: "Nov '24", actual: 490, required: 450, recommended: null },
    { month: "Dec '24", actual: 370, required: 360, recommended: null },
    { month: "Jan '25", actual: 430, required: 400, recommended: null },
    { month: "Feb '25", actual: 310, required: 340, recommended: null },
    { month: "Mar '25", actual: null, required: 420, recommended: 500 },
    { month: "Apr '25", actual: null, required: 380, recommended: 380 },
    { month: "May '25", actual: null, required: 460, recommended: 180 },
];

const RECS: Recommendation[] = [
    {
        id: "cu-1",
        metal: "Copper", symbol: "CU", urgency: "high", confidence: 87,
        basePrice: 9412, currentPrice: 9412, projectedPrice: 9820, priceRisk: "+4.3%",
        window: "Feb – Mar 2025", qty: 500, color: "#f0a500",
        rationale: "Price trending upward +8% over 6 months. PCL requirement of 500 MT due Mar. Lock in now before Q2 surge.",
    },
    {
        id: "al-1",
        metal: "Aluminium", symbol: "AL", urgency: "low", confidence: 72,
        basePrice: 2287, currentPrice: 2287, projectedPrice: 2235, priceRisk: "−2.3%",
        window: "Apr 2025", qty: 200, color: "#38bdf8",
        rationale: "Forecast shows a dip in Mar–Apr. Defer order by 6–8 weeks to capitalize on lower prices.",
    },
    {
        id: "ni-1",
        metal: "Nickel", symbol: "NI", urgency: "medium", confidence: 61,
        basePrice: 15840, currentPrice: 15840, projectedPrice: 16200, priceRisk: "+2.3%",
        window: "Mar – Apr 2025", qty: 80, color: "#a78bfa",
        rationale: "High volatility. Watch geopolitical signals. Set price alert at $15,500 to trigger buy.",
    },
];

/* ─── HELPERS ────────────────────────────────────────────────────────────────── */
const fmt = (n: number | null | undefined): string => n?.toLocaleString("en-US") ?? "—";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#94a3b8" }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 6 }}>{label}</div>
            {payload.map((p: any) => p.value != null && (
                <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>{p.name}: <strong style={{ color: "#e2e8f0" }}>{typeof p.value === "number" && p.value > 100 ? "$" : ""}{fmt(p.value as number)}{typeof p.value === "number" && p.value < 100 ? " MT" : ""}</strong></div>
            ))}
        </div>
    );
};

/* ─── MAIN ───────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const [sel, setSel] = useState("copper");
    const [tick, setTick] = useState(0);
    const [recs, setRecs] = useState<Recommendation[]>(RECS);
    const [editingId, setEditingId] = useState<string | null>(null);

    const calculateAdjustedPrice = (base: number, qty: number) => {
        // Bulk discount: 1% for every 200 units above 100, max 10%
        const discountFactor = Math.min(0.1, Math.max(0, Math.floor((qty - 100) / 200) * 0.01));
        return Math.round(base * (1 - discountFactor));
    };

    const getUrgency = (qty: number): "high" | "medium" | "low" => {
        if (qty >= 100 && qty <= 1000) return "high"; // Target range
        if (qty > 1000) return "medium";
        return "low";
    };

    const handleUpdateQty = (id: string, newQty: number) => {
        setRecs(prev => prev.map(r => {
            if (r.id !== id) return r;
            const urgency = getUrgency(newQty);
            const currentPrice = calculateAdjustedPrice(r.basePrice, newQty);
            return { ...r, qty: newQty, urgency, currentPrice };
        }));
    };

    useEffect(() => {
        const t = setInterval(() => setTick(x => x + 1), 3000);
        return () => clearInterval(t);
    }, []);

    const metal = METALS.find(m => m.id === sel) as Metal;
    const currentRec = recs.find(r => r.symbol === metal.symbol);
    const effectivePrice = currentRec ? currentRec.currentPrice : metal.price;

    const chartData = CHART_DATA[sel];
    const diff = effectivePrice - metal.prev;
    const up = diff >= 0;

    const urgencyStyle: Record<string, { bg: string; border: string; color: string; label: string }> = {
        high: { bg: "rgba(239,68,68,.15)", border: "rgba(239,68,68,.4)", color: "#f87171", label: "● BUY NOW" },
        medium: { bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.35)", color: "#fbbf24", label: "◉ MONITOR" },
        low: { bg: "rgba(56,189,248,.12)", border: "rgba(56,189,248,.35)", color: "#38bdf8", label: "○ WAIT" },
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap%27);
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px}
        body{background:#070d1a}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeUp .4s ease both}
        .fade1{animation-delay:.05s}.fade2{animation-delay:.12s}.fade3{animation-delay:.2s}.fade4{animation-delay:.28s}
        .ticker:hover,.ticker.on{border-color:#f0a500!important;background:#0f1e30!important;box-shadow:0 0 18px rgba(240,165,0,.15)!important}
        .rec-card:hover{border-color:#2a3a50!important}
        .stat-block{background:#0a1120;border-radius:6px;padding:10px 12px}
      `}</style>

            <div style={{ background: "#070d1a", minHeight: "100vh", padding: 24, fontFamily: "Syne, sans-serif", color: "#e2e8f0" }}>

                {/* HEADER */}
                <div className="fade fade1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: "#f1f5f9" }}>Dashboard</div>
                    </div>

                </div>

                {/* TICKER ROW */}
                <div className="fade fade1" style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                    {METALS.map(m => {
                        const d = m.price - m.prev;
                        const p = (d / m.prev) * 100;
                        const u = d >= 0;
                        return (
                            <div
                                key={m.id}
                                className={`ticker ${sel === m.id ? "on" : ""}`}
                                onClick={() => setSel(m.id)}
                                style={{ flex: "1 1 170px", minWidth: 170, background: "#0d1829", border: "1px solid #1a2a3a", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all .2s" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#475569" }}>{m.symbol}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "2px 0" }}>{m.label}</div>
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: u ? "#34d399" : "#f87171", background: u ? "rgba(52,211,153,.1)" : "rgba(248,113,113,.1)", border: `1px solid ${u ? "rgba(52,211,153,.2)" : "rgba(248,113,113,.2)"}`, borderRadius: 4, padding: "2px 6px" }}>
                                        {u ? "▲" : "▼"} {Math.abs(p).toFixed(2)}%
                                    </span>
                                </div>
                                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>
                                    ${fmt(recs.find(r => r.symbol === m.symbol)?.currentPrice || m.price)}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#334155" }}>LME: ${fmt(m.src1)}</span>
                                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#334155" }}>Kitco: ${fmt(m.src2)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ROW 1: Chart + Side Panel */}
                <div className="fade fade2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>

                    {/* Price Chart */}
                    <div style={{ background: "#0d1829", border: "1px solid #1a2a3a", borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#f0a500" }}>◆</span> {metal.label} · Price Trend &amp; 6-Month Forecast
                            </div>
                            <div style={{ display: "flex", gap: 14 }}>
                                {([["#f0a500", "Actual", false], ["#38bdf8", "Forecast", true]] as const).map(([c, l, dashed]) => (
                                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                                        <div style={{ width: 18, height: 2, background: dashed ? "transparent" : c, borderTop: dashed ? `2px dashed ${c}` : "none" }} />
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={230}>
                            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f0a500" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(v > 5000 ? 0 : 1)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x="Feb '25" stroke="#334155" strokeDasharray="4 4" label={{ value: "TODAY", position: "top", fill: "#334155", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                                <Area type="monotone" dataKey="high" stroke="none" fill="url(#gBlue)" name="Upper Band" connectNulls />
                                <Area type="monotone" dataKey="low" stroke="none" fill="#070d1a" name="Lower Band" connectNulls />
                                <Area type="monotone" dataKey="price" stroke="#f0a500" strokeWidth={2.5} fill="url(#gGold)" dot={false} name="Actual Price" connectNulls />
                                <Line type="monotone" dataKey="forecast" stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast Price" connectNulls />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Right: Source + Stats */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                        {/* Source Compare */}
                        <div style={{ background: "#0d1829", border: "1px solid #1a2a3a", borderRadius: 12, padding: 18 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#475569", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#f0a500" }}>◆</span> Source Comparison · {metal.label}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {([["LME.com", metal.src1], ["Kitco", metal.src2]] as [string, number][]).map(([name, price]) => (
                                    <div key={name} style={{ background: "#0a1120", borderRadius: 8, padding: 12, textAlign: "center" }}>
                                        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#334155", fontWeight: 700, marginBottom: 6, fontFamily: "JetBrains Mono, monospace" }}>{name}</div>
                                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>${fmt(price as number)}</div>
                                        <div style={{ fontSize: 10, color: "#475569", marginTop: 3, fontFamily: "JetBrains Mono, monospace" }}>{metal.unit}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 10, padding: "10px 14px", background: "#0a1120", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>Spread</span>
                                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: Math.abs(metal.src1 - metal.src2) < 15 ? "#34d399" : "#fbbf24" }}>
                                    ${Math.abs(metal.src1 - metal.src2)} {Math.abs(metal.src1 - metal.src2) < 15 ? "✓ Tight" : "⚠ Wide"}
                                </span>
                            </div>
                        </div>

                        {/* Price Stats */}
                        <div style={{ background: "#0d1829", border: "1px solid #1a2a3a", borderRadius: 12, padding: 18, flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#475569", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#f0a500" }}>◆</span> Price Statistics
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {[
                                    { l: "Current Price", v: `$${fmt(effectivePrice)}`, c: null },
                                    { l: "Day Change", v: `${diff >= 0 ? "+" : ""}$${fmt(Math.abs(diff))}`, c: up ? "#34d399" : "#f87171" },
                                    { l: "3M Forecast", v: `$${fmt(chartData[9]?.forecast)}`, c: null },
                                    { l: "6M Forecast", v: `$${fmt(chartData[11]?.forecast)}`, c: null },
                                    { l: "6M High", v: `$${fmt(chartData[11]?.high)}`, c: "#f87171" },
                                    { l: "6M Low", v: `$${fmt(chartData[9]?.low)}`, c: "#34d399" },
                                ].map(s => (
                                    <div key={s.l} className="stat-block">
                                        <div style={{ fontSize: 9, color: "#334155", letterSpacing: 1.5, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{s.l}</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: s.c || "#e2e8f0" }}>{s.v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ROW 2: Procurement */}
                <div className="fade fade3" style={{ background: "#0d1829", border: "1px solid #1a2a3a", borderRadius: 12, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#f0a500" }}>◆</span> PCL Procurement Trend · Actuals vs Requirement vs Recommended Order
                        </div>
                        <div style={{ display: "flex", gap: 14 }}>
                            {[["#f0a500", "Actual"], ["#34d399", "Recommended"], ["#64748b", "Required"]].map(([c, l]) => (
                                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#475569", fontFamily: "JetBrains Mono, monospace" }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: .8 }} /> {l}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={PROCUREMENT} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3a" />
                            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} unit=" MT" />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine x="Feb '25" stroke="#334155" strokeDasharray="4 4" label={{ value: "TODAY", position: "top", fill: "#334155", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                            <Bar dataKey="actual" fill="#f0a500" fillOpacity={0.75} radius={[3, 3, 0, 0]} name="Actual (MT)" />
                            <Bar dataKey="recommended" fill="#34d399" fillOpacity={0.65} radius={[3, 3, 0, 0]} name="Recommended (MT)" />
                            <Line type="monotone" dataKey="required" stroke="#64748b" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Required (MT)" connectNulls />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* ROW 3: Recommendations */}
                <div className="fade fade4">
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#475569", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#f0a500" }}>◆</span> AI Order Timing Recommendations
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace", fontWeight: 400, letterSpacing: 0 }}>Based on price forecast + PCL requirements</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                        {recs.map(r => {
                            const us = urgencyStyle[r.urgency];
                            const isEditing = editingId === r.id;

                            return (
                                <div key={r.id} className="rec-card" style={{ background: "#0d1829", border: `1px solid ${r.urgency === "high" ? "rgba(239,68,68,.25)" : "#1a2a3a"}`, borderRadius: 12, padding: 18, transition: "border-color .2s" }}>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#475569" }}>{r.symbol}</div>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: r.color }}>{r.metal}</div>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1, padding: "4px 10px", borderRadius: 4, background: us.bg, border: `1px solid ${us.border}`, color: us.color, minWidth: 80, textAlign: "center" }}>
                                            {us.label}
                                        </span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                                        {[
                                            { l: "Current Price", v: `$${fmt(r.currentPrice)}`, c: null as string | null },
                                            { l: "6M Forecast", v: `$${fmt(r.projectedPrice)}`, c: r.priceRisk.startsWith("+") ? "#f87171" : "#34d399" },
                                            { l: "Price Risk", v: r.priceRisk, c: r.priceRisk.startsWith("+") ? "#fbbf24" : "#34d399" },
                                            { l: "Qty Needed", v: r.qty, c: null as string | null, editable: true },
                                        ].map(s => (
                                            <div key={s.l} className="stat-block">
                                                <div style={{ fontSize: 9, color: "#334155", letterSpacing: 1.5, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", fontWeight: 700, marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
                                                    {s.l}
                                                    {s.editable && !isEditing && (
                                                        <Edit2
                                                            className="w-2.5 h-2.5 cursor-pointer hover:text-blue-400"
                                                            onClick={() => setEditingId(r.id)}
                                                        />
                                                    )}
                                                    {s.editable && isEditing && (
                                                        <Check
                                                            className="w-2.5 h-2.5 cursor-pointer text-green-400 hover:text-green-300"
                                                            onClick={() => setEditingId(null)}
                                                        />
                                                    )}
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: s.c || "#e2e8f0" }}>
                                                    {s.editable && isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={r.qty}
                                                            onChange={(e) => handleUpdateQty(r.id, parseInt(e.target.value) || 0)}
                                                            autoFocus
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                borderBottom: "1px solid #1e3a5f",
                                                                color: "#e2e8f0",
                                                                width: "100%",
                                                                fontSize: 13,
                                                                outline: "none",
                                                                fontFamily: "inherit"
                                                            }}
                                                        />
                                                    ) : (
                                                        s.editable ? `${fmt(r.qty)} MT` : s.v
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 12 }}>{r.rationale}</p>

                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span style={{ fontSize: 9, color: "#334155", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: 1.5 }}>MODEL CONFIDENCE</span>
                                            <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#64748b" }}>{r.confidence}%</span>
                                        </div>
                                        <div style={{ height: 3, background: "#1a2a3a", borderRadius: 2, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${r.confidence}%`, background: r.color, borderRadius: 2 }} />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 12, padding: "8px 12px", background: "#0a1120", borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: 9, color: "#334155", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: 1 }}>ORDER WINDOW</span>
                                        <span style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#94a3b8", fontWeight: 700 }}>{r.window}</span>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>


            </div>
        </>
    );
}