"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, ComposedChart,
} from "recharts";
import { Edit2, Check, TrendingDown, TrendingUp, Award } from "lucide-react";
import { VendorInfoFeature, type VendorInfo } from "@/components/vendor-info";

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
        window: "Feb – Mar 2025", qty: 500, color: "var(--color-chart-1)",
        rationale: "Price trending upward +8% over 6 months. PCL requirement of 500 MT due Mar. Lock in now before Q2 surge.",
    },
    {
        id: "al-1",
        metal: "Aluminium", symbol: "AL", urgency: "low", confidence: 72,
        basePrice: 2287, currentPrice: 2287, projectedPrice: 2235, priceRisk: "−2.3%",
        window: "Apr 2025", qty: 200, color: "var(--color-chart-2)",
        rationale: "Forecast shows a dip in Mar–Apr. Defer order by 6–8 weeks to capitalize on lower prices.",
    },
    {
        id: "ni-1",
        metal: "Nickel", symbol: "NI", urgency: "medium", confidence: 61,
        basePrice: 15840, currentPrice: 15840, projectedPrice: 16200, priceRisk: "+2.3%",
        window: "Mar – Apr 2025", qty: 80, color: "var(--color-chart-3)",
        rationale: "High volatility. Watch geopolitical signals. Set price alert at $15,500 to trigger buy.",
    },
];

/* ─── VENDOR PRICE DATA (hardcoded for POC) ─────────────────────────────────── */

type VendorPriceEntry = {
    price: number;       // $/MT
    moq: string;         // Minimum order qty
    leadTime: string;    // Delivery lead time
    terms: string;       // Payment terms
};

// Hardcoded vendor prices keyed by vendor index (order they appear) per metal
const VENDOR_PRICES: Record<string, VendorPriceEntry[]> = {
    copper: [
        { price: 9280, moq: "50 MT", leadTime: "14 days", terms: "LC 60 days" },
        { price: 9350, moq: "25 MT", leadTime: "7 days", terms: "TT Advance" },
        { price: 9190, moq: "100 MT", leadTime: "21 days", terms: "LC 90 days" },
        { price: 9440, moq: "10 MT", leadTime: "5 days", terms: "TT 30 days" },
        { price: 9310, moq: "75 MT", leadTime: "18 days", terms: "LC 45 days" },
    ],
    aluminium: [
        { price: 2240, moq: "100 MT", leadTime: "10 days", terms: "LC 30 days" },
        { price: 2310, moq: "50 MT", leadTime: "7 days", terms: "TT Advance" },
        { price: 2195, moq: "200 MT", leadTime: "28 days", terms: "LC 90 days" },
        { price: 2275, moq: "25 MT", leadTime: "5 days", terms: "TT 15 days" },
        { price: 2260, moq: "75 MT", leadTime: "14 days", terms: "LC 60 days" },
    ],
    nickel: [
        { price: 15600, moq: "20 MT", leadTime: "21 days", terms: "LC 60 days" },
        { price: 15950, moq: "10 MT", leadTime: "10 days", terms: "TT Advance" },
        { price: 15400, moq: "50 MT", leadTime: "30 days", terms: "LC 90 days" },
        { price: 16100, moq: "5 MT", leadTime: "7 days", terms: "TT 30 days" },
        { price: 15750, moq: "30 MT", leadTime: "14 days", terms: "LC 45 days" },
    ],
    zinc: [
        { price: 2700, moq: "100 MT", leadTime: "14 days", terms: "LC 60 days" },
        { price: 2770, moq: "50 MT", leadTime: "7 days", terms: "TT Advance" },
        { price: 2660, moq: "200 MT", leadTime: "25 days", terms: "LC 90 days" },
        { price: 2790, moq: "25 MT", leadTime: "5 days", terms: "TT 15 days" },
        { price: 2720, moq: "75 MT", leadTime: "14 days", terms: "LC 45 days" },
    ],
};

function readVendors(): VendorInfo[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem("vendorInfo.v2");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (x: Partial<VendorInfo>) =>
                typeof x?.vendorName === "string" &&
                typeof x?.vendorWebsiteUrl === "string" &&
                typeof x?.materialId === "string"
        ) as VendorInfo[];
    } catch {
        return [];
    }
}

/* ─── HELPERS ────────────────────────────────────────────────────────────────── */
const fmt = (n: number | null | undefined): string => n?.toLocaleString("en-US") ?? "—";

const CustomTooltip = (props: unknown) => {
    const typed = props as {
        active?: boolean;
        payload?: Array<{ name?: string; value?: number | null; color?: string }>;
        label?: string;
    };
    const isActive = typed.active;
    const items = typed.payload;
    const title = typed.label;
    if (!isActive || !items?.length) return null;
    return (
        <div
            style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-surface-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-10) var(--space-15)",
                fontSize: "var(--text-sm)",
                fontFamily: "var(--font-sans)",
                color: "var(--color-text-muted)",
            }}
        >
            <div style={{ color: "var(--color-text-strong)", fontWeight: 700, marginBottom: 6 }}>{title}</div>
            {items.map((p) => p.value != null && (
                <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}:{" "}
                    <strong style={{ color: "var(--color-text-strong)" }}>
                        {typeof p.value === "number" && p.value > 100 ? "$" : ""}
                        {fmt(p.value as number)}
                        {typeof p.value === "number" && p.value < 100 ? " MT" : ""}
                    </strong>
                </div>
            ))}
        </div>
    );
};

/* ─── MAIN ───────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
    const [sel, setSel] = useState("copper");
    const [recs, setRecs] = useState<Recommendation[]>(RECS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [vendors, setVendors] = useState<VendorInfo[]>([]);

    // Poll localStorage for vendor changes (so adding a vendor updates the comparison live)
    const refreshVendors = useCallback(() => setVendors(readVendors()), []);
    useEffect(() => {
        refreshVendors();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "vendorInfo.v2") refreshVendors();
        };
        window.addEventListener("storage", onStorage);
        // Also poll because same-tab localStorage writes don't fire "storage"
        const poll = setInterval(refreshVendors, 1500);
        return () => {
            window.removeEventListener("storage", onStorage);
            clearInterval(poll);
        };
    }, [refreshVendors]);

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
        const t = setInterval(() => {
            // Intentionally no-op: keeps subtle motion/updates aligned with original UX
        }, 3000);
        return () => clearInterval(t);
    }, []);

    const metal = METALS.find(m => m.id === sel) as Metal;
    const currentRec = recs.find(r => r.symbol === metal.symbol);
    const effectivePrice = currentRec ? currentRec.currentPrice : metal.price;

    const chartData = CHART_DATA[sel];
    const diff = effectivePrice - metal.prev;
    const up = diff >= 0;

    const urgencyStyle: Record<string, { bg: string; border: string; color: string; label: string }> = {
        high: { bg: "var(--overlay-danger-10)", border: "color-mix(in srgb, var(--color-danger) 45%, transparent)", color: "var(--color-danger)", label: "● BUY NOW" },
        medium: { bg: "var(--color-warn-soft)", border: "color-mix(in srgb, var(--color-warning) 45%, transparent)", color: "var(--color-warning)", label: "◉ MONITOR" },
        low: { bg: "var(--overlay-primary-05)", border: "color-mix(in srgb, var(--color-primary) 35%, transparent)", color: "var(--color-primary)", label: "○ WAIT" },
    };

    return (
        <>
            <div
                style={{
                    background: "var(--color-bg)",
                    minHeight: "100vh",
                    padding: "var(--space-24)",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text)",
                }}
            >
                {/* HEADER */}
                <div
                    className="dashboard-fade dashboard-fade1"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-24)" }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "var(--text-3xl)",
                                fontWeight: 700,
                                letterSpacing: "-0.02em",
                                color: "var(--color-text-strong)",
                            }}
                        >
                            Dashboard
                        </div>
                    </div>
                </div>

                <VendorInfoFeature
                    materialOptions={METALS.map((m) => ({ id: m.id, label: m.label, symbol: m.symbol }))}
                    className="mb-[var(--space-20)]"
                />

                {/* TICKER ROW */}
                <div
                    className="dashboard-fade dashboard-fade1"
                    style={{
                        display: "flex",
                        gap: "var(--space-8)",
                        marginBottom: "var(--space-20)",
                        overflowX: "auto",
                        paddingBottom: 4,
                    }}
                >
                    {METALS.map(m => {
                        const d = m.price - m.prev;
                        const p = (d / m.prev) * 100;
                        const u = d >= 0;
                        return (
                            <div
                                key={m.id}
                                className={`dashboard-ticker ticker ${sel === m.id ? "on" : ""}`}
                                onClick={() => setSel(m.id)}
                                style={{
                                    flex: "1 1 170px",
                                    minWidth: 170,
                                    background: "var(--color-surface-raised)",
                                    border: "1px solid var(--color-surface-border)",
                                    borderRadius: "var(--radius-lg)",
                                    padding: "var(--space-15) var(--space-16)",
                                    cursor: "pointer",
                                    transition: "var(--transition-fast)",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily: "var(--font-sans)",
                                                fontSize: "var(--text-2xs)",
                                                fontWeight: 700,
                                                letterSpacing: 2,
                                                color: "var(--color-text-muted)",
                                            }}
                                        >
                                            {m.symbol}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "var(--text-label)",
                                                fontWeight: 600,
                                                color: "var(--color-text)",
                                                margin: "2px 0",
                                            }}
                                        >
                                            {m.label}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "var(--text-2xs)",
                                            fontWeight: 700,
                                            fontFamily: "var(--font-sans)",
                                            color: u ? "var(--color-success)" : "var(--color-danger)",
                                            background: u ? "var(--color-success-soft)" : "var(--overlay-danger-10)",
                                            border: `1px solid ${u ? "color-mix(in srgb, var(--color-success) 35%, transparent)" : "color-mix(in srgb, var(--color-danger) 35%, transparent)"}`,
                                            borderRadius: 4,
                                            padding: "2px 6px",
                                        }}
                                    >
                                        {u ? "▲" : "▼"} {Math.abs(p).toFixed(2)}%
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: "var(--text-lead)",
                                        fontWeight: 700,
                                        color: "var(--color-text-strong)",
                                    }}
                                >
                                    ${fmt(recs.find((r) => r.symbol === m.symbol)?.currentPrice || m.price)}
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "var(--color-text-tertiary)" }}>
                                        LME: ${fmt(m.src1)}
                                    </span>
                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "var(--color-text-tertiary)" }}>
                                        Kitco: ${fmt(m.src2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ROW 1: Chart + Side Panel */}
                <div
                    className="dashboard-fade dashboard-fade2"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr",
                        gap: "var(--space-15)",
                        marginBottom: "var(--space-15)",
                    }}
                >
                    {/* Price Chart */}
                    <div
                        style={{
                            background: "var(--color-surface-raised)",
                            border: "1px solid var(--color-surface-border)",
                            borderRadius: "var(--radius-xl)",
                            padding: "var(--space-20)",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-16)" }}>
                            <div
                                style={{
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "var(--color-text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-8)",
                                }}
                            >
                                <span style={{ color: "var(--color-primary)" }}>◆</span> {metal.label} · Price Trend &amp; 6-Month Forecast
                            </div>
                            <div style={{ display: "flex", gap: "var(--space-15)" }}>
                                {(
                                    [
                                        ["var(--color-chart-1)", "Actual", false],
                                        ["var(--color-chart-2)", "Forecast", true],
                                    ] as const
                                ).map(([c, l, dashed]) => (
                                    <span
                                        key={l}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                            fontSize: "var(--text-2xs)",
                                            color: "var(--color-text-muted)",
                                            fontFamily: "var(--font-sans)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 18,
                                                height: 2,
                                                background: dashed ? "transparent" : c,
                                                borderTop: dashed ? `2px dashed ${c}` : "none",
                                            }}
                                        />
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, minHeight: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-sans)" }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-sans)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(v > 5000 ? 0 : 1)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <ReferenceLine
                                        x="Feb '25"
                                        stroke="var(--color-text-tertiary)"
                                        strokeDasharray="4 4"
                                        label={{
                                            value: "TODAY",
                                            position: "top",
                                            fill: "var(--color-text-tertiary)",
                                            fontSize: 9,
                                            fontFamily: "var(--font-sans)",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="high" stroke="none" fill="url(#gBlue)" name="Upper Band" connectNulls />
                                    <Area type="monotone" dataKey="low" stroke="none" fill="var(--color-bg)" name="Lower Band" connectNulls />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="var(--color-chart-1)"
                                        strokeWidth={2.5}
                                        fill="url(#gGold)"
                                        dot={false}
                                        name="Actual Price"
                                        connectNulls
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        stroke="var(--color-chart-2)"
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={false}
                                        name="Forecast Price"
                                        connectNulls
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right: Source + Stats */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
                        {/* Source Compare */}
                        <div
                            style={{
                                background: "var(--color-surface-raised)",
                                border: "1px solid var(--color-surface-border)",
                                borderRadius: "var(--radius-xl)",
                                padding: "var(--space-18)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "var(--color-text-muted)",
                                    marginBottom: "var(--space-15)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-8)",
                                }}
                            >
                                <span style={{ color: "var(--color-primary)" }}>◆</span> Source Comparison · {metal.label}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
                                {([["LME.com", metal.src1], ["Kitco", metal.src2]] as [string, number][]).map(([name, price]) => (
                                    <div
                                        key={name}
                                        style={{
                                            background: "var(--color-bg)",
                                            borderRadius: "var(--radius-md)",
                                            padding: "var(--space-12)",
                                            textAlign: "center",
                                            border: "1px solid var(--color-surface-border)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 9,
                                                letterSpacing: 2,
                                                textTransform: "uppercase",
                                                color: "var(--color-text-tertiary)",
                                                fontWeight: 700,
                                                marginBottom: 6,
                                                fontFamily: "var(--font-sans)",
                                            }}
                                        >
                                            {name}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily: "var(--font-sans)",
                                                fontSize: "var(--text-lead)",
                                                fontWeight: 700,
                                                color: "var(--color-text-strong)",
                                            }}
                                        >
                                            ${fmt(price as number)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "var(--text-2xs)",
                                                color: "var(--color-text-muted)",
                                                marginTop: 3,
                                                fontFamily: "var(--font-sans)",
                                            }}
                                        >
                                            {metal.unit}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    marginTop: "var(--space-10)",
                                    padding: "var(--space-10) var(--space-15)",
                                    background: "var(--color-bg)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "1px solid var(--color-surface-border)",
                                }}
                            >
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                                    Spread
                                </span>
                                <span
                                    style={{
                                        fontSize: "var(--text-label)",
                                        fontWeight: 700,
                                        fontFamily: "var(--font-sans)",
                                        color:
                                            Math.abs(metal.src1 - metal.src2) < 15 ? "var(--color-success)" : "var(--color-warning)",
                                    }}
                                >
                                    ${Math.abs(metal.src1 - metal.src2)} {Math.abs(metal.src1 - metal.src2) < 15 ? "✓ Tight" : "⚠ Wide"}
                                </span>
                            </div>
                        </div>

                        {/* Price Stats */}
                        <div
                            style={{
                                background: "var(--color-surface-raised)",
                                border: "1px solid var(--color-surface-border)",
                                borderRadius: "var(--radius-xl)",
                                padding: "var(--space-18)",
                                flex: 1,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "var(--color-text-muted)",
                                    marginBottom: "var(--space-15)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-8)",
                                }}
                            >
                                <span style={{ color: "var(--color-primary)" }}>◆</span> Price Statistics
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
                                {[
                                    { l: "Current Price", v: `$${fmt(effectivePrice)}`, c: null },
                                    {
                                        l: "Day Change",
                                        v: `${diff >= 0 ? "+" : ""}$${fmt(Math.abs(diff))}`,
                                        c: up ? "var(--color-success)" : "var(--color-danger)",
                                    },
                                    { l: "3M Forecast", v: `$${fmt(chartData[9]?.forecast)}`, c: null },
                                    { l: "6M Forecast", v: `$${fmt(chartData[11]?.forecast)}`, c: null },
                                    { l: "6M High", v: `$${fmt(chartData[11]?.high)}`, c: "var(--color-danger)" },
                                    { l: "6M Low", v: `$${fmt(chartData[9]?.low)}`, c: "var(--color-success)" },
                                ].map((s) => (
                                    <div key={s.l} className="dashboard-stat-block">
                                        <div
                                            style={{
                                                fontSize: 9,
                                                color: "var(--color-text-tertiary)",
                                                letterSpacing: 1.5,
                                                fontFamily: "var(--font-sans)",
                                                textTransform: "uppercase",
                                                fontWeight: 700,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {s.l}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "var(--text-base)",
                                                fontWeight: 700,
                                                fontFamily: "var(--font-sans)",
                                                color: s.c || "var(--color-text-strong)",
                                            }}
                                        >
                                            {s.v}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* VENDOR PRICE COMPARISON — all sources */}
                {(() => {
                    const metalVendors = vendors.filter(v => v.materialId === sel);
                    if (metalVendors.length === 0) return null;

                    const vendorPrices = VENDOR_PRICES[sel] || [];

                    // Build unified list: LME, Kitco, then each vendor
                    type SourceCard = {
                        key: string;
                        label: string;
                        type: "global" | "vendor";
                        price: number;
                        moq?: string;
                        leadTime?: string;
                        terms?: string;
                    };

                    const allSources: SourceCard[] = [
                        { key: "lme", label: "LME.com", type: "global", price: metal.src1 },
                        { key: "kitco", label: "Kitco", type: "global", price: metal.src2 },
                        ...metalVendors.map((v, i) => {
                            const pd = vendorPrices[i % vendorPrices.length];
                            return {
                                key: v.id,
                                label: v.vendorName || `Vendor ${i + 1}`,
                                type: "vendor" as const,
                                price: pd.price,
                                moq: pd.moq,
                                leadTime: pd.leadTime,
                                terms: pd.terms,
                            };
                        }),
                    ];

                    const lowestPrice = Math.min(...allSources.map(s => s.price));
                    const highestPrice = Math.max(...allSources.map(s => s.price));
                    const cheapestSource = allSources.find(s => s.price === lowestPrice)!;
                    const lmePrice = metal.src1;

                    return (
                        <div
                            className="dashboard-fade dashboard-fade2"
                            style={{
                                background: "var(--color-surface-raised)",
                                border: "1px solid var(--color-surface-border)",
                                borderRadius: "var(--radius-xl)",
                                padding: "var(--space-20)",
                                marginBottom: "var(--space-15)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "var(--text-xs)",
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: "uppercase",
                                    color: "var(--color-text-muted)",
                                    marginBottom: "var(--space-16)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-8)",
                                }}
                            >
                                <span style={{ color: "var(--color-primary)" }}>◆</span> Price Comparison · {metal.label} · All Sources
                                <span
                                    style={{
                                        marginLeft: "auto",
                                        fontSize: "var(--text-2xs)",
                                        color: "var(--color-text-tertiary)",
                                        fontFamily: "var(--font-sans)",
                                        fontWeight: 400,
                                        letterSpacing: 0,
                                    }}
                                >
                                    {allSources.length} sources · Spread ${fmt(highestPrice - lowestPrice)}
                                </span>
                            </div>

                            {/* All source cards in one grid */}
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(allSources.length, 4)}, 1fr)`, gap: "var(--space-10)" }}>
                                {allSources.map((src) => {
                                    const isCheapest = src.price === lowestPrice;
                                    const diffFromLme = src.price - lmePrice;
                                    const pctFromLme = ((diffFromLme / lmePrice) * 100).toFixed(1);
                                    const isBelow = diffFromLme < 0;
                                    const isGlobal = src.type === "global";

                                    return (
                                        <div
                                            key={src.key}
                                            style={{
                                                background: isCheapest ? "var(--overlay-primary-05)" : "var(--color-bg)",
                                                borderRadius: "var(--radius-lg)",
                                                padding: "var(--space-16)",
                                                border: `1px solid ${isCheapest ? "color-mix(in srgb, var(--color-primary) 45%, transparent)" : "var(--color-surface-border)"}`,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "var(--space-8)",
                                                position: "relative",
                                            }}
                                        >
                                            {isCheapest && (
                                                <div style={{
                                                    position: "absolute", top: 8, right: 8,
                                                    display: "flex", alignItems: "center", gap: 3,
                                                    fontSize: 9, fontWeight: 700, letterSpacing: 1,
                                                    color: "var(--color-primary)", fontFamily: "var(--font-sans)",
                                                }}>
                                                    <Award style={{ width: 12, height: 12 }} /> BEST
                                                </div>
                                            )}

                                            {/* Source label + type badge */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{
                                                    fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                                                    color: "var(--color-text-tertiary)", fontWeight: 700, fontFamily: "var(--font-sans)",
                                                    maxWidth: "calc(100% - 60px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>
                                                    {src.label}
                                                </div>
                                                <span style={{
                                                    fontSize: 8, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--font-sans)",
                                                    padding: "1px 5px", borderRadius: 3,
                                                    background: isGlobal ? "var(--color-chart-2)" : "var(--color-primary)",
                                                    color: "var(--color-bg)",
                                                    textTransform: "uppercase",
                                                    flexShrink: 0,
                                                }}>
                                                    {isGlobal ? "GLOBAL" : "VENDOR"}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div style={{
                                                fontFamily: "var(--font-sans)", fontSize: "var(--text-2xl)",
                                                fontWeight: 700, color: "var(--color-text-strong)",
                                            }}>
                                                ${fmt(src.price)}
                                            </div>

                                            {/* Diff vs LME (skip for LME itself) */}
                                            {src.key !== "lme" ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                    {isBelow ? (
                                                        <TrendingDown style={{ width: 12, height: 12, color: "var(--color-success)" }} />
                                                    ) : diffFromLme > 0 ? (
                                                        <TrendingUp style={{ width: 12, height: 12, color: "var(--color-danger)" }} />
                                                    ) : null}
                                                    <span style={{
                                                        fontSize: "var(--text-2xs)", fontWeight: 700, fontFamily: "var(--font-sans)",
                                                        color: isBelow ? "var(--color-success)" : diffFromLme > 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                                                    }}>
                                                        {diffFromLme === 0 ? "Same as LME" : `${isBelow ? "" : "+"}${pctFromLme}% vs LME`}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: "var(--text-2xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                                                    {metal.unit} · Reference
                                                </div>
                                            )}

                                            {/* Vendor-specific details */}
                                            {!isGlobal && src.moq && (
                                                <>
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 2 }}>
                                                        <div>
                                                            <div style={{ fontSize: 8, color: "var(--color-text-tertiary)", letterSpacing: 1, fontWeight: 700, fontFamily: "var(--font-sans)", textTransform: "uppercase" }}>MOQ</div>
                                                            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600, marginTop: 1 }}>{src.moq}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 8, color: "var(--color-text-tertiary)", letterSpacing: 1, fontWeight: 700, fontFamily: "var(--font-sans)", textTransform: "uppercase" }}>LEAD TIME</div>
                                                            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600, marginTop: 1 }}>{src.leadTime}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: "var(--text-2xs)", color: "var(--color-text-tertiary)",
                                                        fontFamily: "var(--font-sans)",
                                                    }}>
                                                        {src.terms}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ── Ranked comparison table ── */}
                            {(() => {
                                const sorted = [...allSources].sort((a, b) => a.price - b.price);
                                return (
                                    <div style={{ marginTop: "var(--space-16)" }}>
                                        <div style={{
                                            fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: 2,
                                            textTransform: "uppercase", color: "var(--color-text-muted)",
                                            marginBottom: "var(--space-10)", display: "flex", alignItems: "center", gap: "var(--space-8)",
                                        }}>
                                            <span style={{ color: "var(--color-primary)" }}>◆</span> Ranked Price Table
                                        </div>

                                        {/* Header */}
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "32px 1.2fr 0.8fr 0.7fr 0.7fr 1.5fr",
                                            gap: "var(--space-8)",
                                            padding: "var(--space-8) var(--space-12)",
                                            borderBottom: "1px solid var(--color-surface-border)",
                                        }}>
                                            {["#", "SOURCE", "PRICE", "VS LME", "VS BEST", "PRICE RANGE"].map(h => (
                                                <div key={h} style={{
                                                    fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
                                                    color: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)",
                                                    textTransform: "uppercase",
                                                }}>
                                                    {h}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Rows */}
                                        {sorted.map((src, rank) => {
                                            const diffLme = src.price - lmePrice;
                                            const pctLme = ((diffLme / lmePrice) * 100).toFixed(1);
                                            const diffBest = src.price - lowestPrice;
                                            const pctBest = ((diffBest / lowestPrice) * 100).toFixed(1);
                                            // Bar width: 0% at cheapest, 100% at most expensive
                                            const barPct = highestPrice === lowestPrice ? 100 : ((src.price - lowestPrice) / (highestPrice - lowestPrice)) * 100;
                                            const isBest = rank === 0;

                                            return (
                                                <div
                                                    key={src.key}
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "32px 1.2fr 0.8fr 0.7fr 0.7fr 1.5fr",
                                                        gap: "var(--space-8)",
                                                        padding: "var(--space-10) var(--space-12)",
                                                        borderBottom: "1px solid var(--color-surface-border)",
                                                        background: isBest ? "var(--overlay-primary-05)" : "transparent",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    {/* Rank */}
                                                    <div style={{
                                                        fontSize: "var(--text-sm)", fontWeight: 700,
                                                        fontFamily: "var(--font-sans)",
                                                        color: isBest ? "var(--color-primary)" : "var(--color-text-muted)",
                                                    }}>
                                                        {rank + 1}
                                                    </div>

                                                    {/* Source name + badge */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <span style={{
                                                            fontSize: "var(--text-sm)", fontWeight: 600,
                                                            color: "var(--color-text-strong)", fontFamily: "var(--font-sans)",
                                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                        }}>
                                                            {src.label}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 7, fontWeight: 700, letterSpacing: 1, fontFamily: "var(--font-sans)",
                                                            padding: "1px 4px", borderRadius: 3, flexShrink: 0,
                                                            background: src.type === "global" ? "var(--color-chart-2)" : "var(--color-primary)",
                                                            color: "var(--color-bg)", textTransform: "uppercase",
                                                        }}>
                                                            {src.type === "global" ? "GLB" : "VND"}
                                                        </span>
                                                    </div>

                                                    {/* Price */}
                                                    <div style={{
                                                        fontSize: "var(--text-sm)", fontWeight: 700,
                                                        fontFamily: "var(--font-sans)", color: "var(--color-text-strong)",
                                                    }}>
                                                        ${fmt(src.price)}
                                                    </div>

                                                    {/* vs LME */}
                                                    <div style={{
                                                        fontSize: "var(--text-2xs)", fontWeight: 700, fontFamily: "var(--font-sans)",
                                                        color: diffLme < 0 ? "var(--color-success)" : diffLme > 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                                                    }}>
                                                        {src.key === "lme" ? "—" : `${diffLme < 0 ? "" : "+"}${pctLme}%`}
                                                    </div>

                                                    {/* vs Best */}
                                                    <div style={{
                                                        fontSize: "var(--text-2xs)", fontWeight: 700, fontFamily: "var(--font-sans)",
                                                        color: diffBest === 0 ? "var(--color-primary)" : "var(--color-text-muted)",
                                                    }}>
                                                        {diffBest === 0 ? "BEST" : `+$${fmt(diffBest)}`}
                                                    </div>

                                                    {/* Visual bar */}
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div style={{
                                                            flex: 1, height: 6, background: "var(--color-bg)",
                                                            borderRadius: 3, overflow: "hidden",
                                                            border: "1px solid var(--color-surface-border)",
                                                        }}>
                                                            <div style={{
                                                                height: "100%",
                                                                width: `${Math.max(barPct, 4)}%`,
                                                                borderRadius: 3,
                                                                background: isBest
                                                                    ? "var(--color-primary)"
                                                                    : barPct > 60
                                                                        ? "var(--color-danger)"
                                                                        : "var(--color-chart-2)",
                                                                transition: "width 0.3s ease",
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* ── Cross-comparison matrix (vendor vs vendor) ── */}
                            {allSources.length > 2 && (() => {
                                const vendorOnly = allSources.filter(s => s.type === "vendor");
                                if (vendorOnly.length < 2) return null;
                                const all = allSources; // include globals too
                                return (
                                    <div style={{ marginTop: "var(--space-16)" }}>
                                        <div style={{
                                            fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: 2,
                                            textTransform: "uppercase", color: "var(--color-text-muted)",
                                            marginBottom: "var(--space-10)", display: "flex", alignItems: "center", gap: "var(--space-8)",
                                        }}>
                                            <span style={{ color: "var(--color-primary)" }}>◆</span> Cross-Source Price Difference ($/MT)
                                        </div>

                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{
                                                width: "100%", borderCollapse: "collapse",
                                                fontSize: "var(--text-xs)", fontFamily: "var(--font-sans)",
                                            }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{
                                                            padding: "var(--space-8) var(--space-10)", textAlign: "left",
                                                            fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
                                                            color: "var(--color-text-tertiary)", textTransform: "uppercase",
                                                            borderBottom: "1px solid var(--color-surface-border)",
                                                        }}>
                                                        </th>
                                                        {all.map(s => (
                                                            <th key={s.key} style={{
                                                                padding: "var(--space-8) var(--space-10)", textAlign: "center",
                                                                fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
                                                                color: "var(--color-text-tertiary)", textTransform: "uppercase",
                                                                borderBottom: "1px solid var(--color-surface-border)",
                                                                maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                            }}>
                                                                {s.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {all.map(row => (
                                                        <tr key={row.key}>
                                                            <td style={{
                                                                padding: "var(--space-8) var(--space-10)",
                                                                fontWeight: 600, color: "var(--color-text-strong)",
                                                                borderBottom: "1px solid var(--color-surface-border)",
                                                                whiteSpace: "nowrap", fontSize: "var(--text-xs)",
                                                            }}>
                                                                {row.label}
                                                            </td>
                                                            {all.map(col => {
                                                                if (row.key === col.key) {
                                                                    return (
                                                                        <td key={col.key} style={{
                                                                            padding: "var(--space-8) var(--space-10)",
                                                                            textAlign: "center",
                                                                            borderBottom: "1px solid var(--color-surface-border)",
                                                                            background: "var(--color-surface-raised)",
                                                                            color: "var(--color-text-tertiary)",
                                                                        }}>
                                                                            —
                                                                        </td>
                                                                    );
                                                                }
                                                                const diff = row.price - col.price;
                                                                const isNeg = diff < 0;
                                                                return (
                                                                    <td key={col.key} style={{
                                                                        padding: "var(--space-8) var(--space-10)",
                                                                        textAlign: "center", fontWeight: 700,
                                                                        borderBottom: "1px solid var(--color-surface-border)",
                                                                        color: isNeg ? "var(--color-success)" : diff > 0 ? "var(--color-danger)" : "var(--color-text-muted)",
                                                                    }}>
                                                                        {isNeg ? "−" : "+"}${fmt(Math.abs(diff))}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Summary bar */}
                            <div
                                style={{
                                    marginTop: "var(--space-16)",
                                    padding: "var(--space-10) var(--space-15)",
                                    background: "var(--color-bg)",
                                    borderRadius: "var(--radius-md)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    border: "1px solid var(--color-surface-border)",
                                }}
                            >
                                <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-sans)" }}>
                                    Best price across all sources
                                </span>
                                <span
                                    style={{
                                        fontSize: "var(--text-label)",
                                        fontWeight: 700,
                                        fontFamily: "var(--font-sans)",
                                        color: "var(--color-primary)",
                                    }}
                                >
                                    ${fmt(lowestPrice)}/MT · {cheapestSource.label}
                                    {cheapestSource.key !== "lme" && (() => {
                                        const saving = lmePrice - lowestPrice;
                                        return saving > 0
                                            ? ` · Save $${fmt(saving)} vs LME`
                                            : "";
                                    })()}
                                </span>
                            </div>
                        </div>
                    );
                })()}

                {/* ROW 2: Procurement */}
                <div
                    className="dashboard-fade dashboard-fade3"
                    style={{
                        background: "var(--color-surface-raised)",
                        border: "1px solid var(--color-surface-border)",
                        borderRadius: "var(--radius-xl)",
                        padding: "var(--space-20)",
                        marginBottom: "var(--space-15)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-16)" }}>
                        <div
                            style={{
                                fontSize: "var(--text-xs)",
                                fontWeight: 700,
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                color: "var(--color-text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--space-8)",
                            }}
                        >
                            <span style={{ color: "var(--color-primary)" }}>◆</span> PCL Procurement Trend · Actuals vs Requirement vs Recommended Order
                        </div>
                        <div style={{ display: "flex", gap: "var(--space-15)" }}>
                            {(
                                [
                                    ["var(--color-chart-1)", "Actual"],
                                    ["var(--color-success)", "Recommended"],
                                    ["var(--color-chart-3)", "Required"],
                                ] as const
                            ).map(([c, l]) => (
                                <span
                                    key={l}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        fontSize: "var(--text-2xs)",
                                        color: "var(--color-text-muted)",
                                        fontFamily: "var(--font-sans)",
                                    }}
                                >
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: c, opacity: 0.8 }} /> {l}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={PROCUREMENT} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-sans)" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fill: "var(--color-text-muted)", fontSize: 10, fontFamily: "var(--font-sans)" }}
                                tickLine={false}
                                axisLine={false}
                                unit=" MT"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                                x="Feb '25"
                                stroke="var(--color-text-tertiary)"
                                strokeDasharray="4 4"
                                label={{
                                    value: "TODAY",
                                    position: "top",
                                    fill: "var(--color-text-tertiary)",
                                    fontSize: 9,
                                    fontFamily: "var(--font-sans)",
                                }}
                            />
                            <Bar dataKey="actual" fill="var(--color-chart-1)" fillOpacity={0.75} radius={[3, 3, 0, 0]} name="Actual (MT)" />
                            <Bar dataKey="recommended" fill="var(--color-success)" fillOpacity={0.65} radius={[3, 3, 0, 0]} name="Recommended (MT)" />
                            <Line
                                type="monotone"
                                dataKey="required"
                                stroke="var(--color-chart-3)"
                                strokeWidth={2}
                                strokeDasharray="5 3"
                                dot={false}
                                name="Required (MT)"
                                connectNulls
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* ROW 3: Recommendations */}
                <div className="dashboard-fade dashboard-fade4">
                    <div
                        style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: 700,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            color: "var(--color-text-muted)",
                            marginBottom: "var(--space-15)",
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-8)",
                        }}
                    >
                        <span style={{ color: "var(--color-primary)" }}>◆</span> AI Order Timing Recommendations
                        <span
                            style={{
                                marginLeft: "auto",
                                fontSize: "var(--text-2xs)",
                                color: "var(--color-text-tertiary)",
                                fontFamily: "var(--font-sans)",
                                fontWeight: 400,
                                letterSpacing: 0,
                            }}
                        >
                            Based on price forecast + PCL requirements
                        </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-12)" }}>
                        {recs.map((r) => {
                            const us = urgencyStyle[r.urgency];
                            const isEditing = editingId === r.id;
                            const highBorder =
                                r.urgency === "high"
                                    ? "color-mix(in srgb, var(--color-danger) 35%, transparent)"
                                    : "var(--color-surface-border)";

                            return (
                                <div
                                    key={r.id}
                                    className="dashboard-rec-card rec-card"
                                    style={{
                                        background: "var(--color-surface-raised)",
                                        border: `1px solid ${highBorder}`,
                                        borderRadius: "var(--radius-xl)",
                                        padding: "var(--space-18)",
                                        transition: "var(--transition-fast)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "var(--space-12)",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontFamily: "var(--font-sans)",
                                                    fontSize: "var(--text-2xs)",
                                                    fontWeight: 700,
                                                    letterSpacing: 2,
                                                    color: "var(--color-text-muted)",
                                                }}
                                            >
                                                {r.symbol}
                                            </div>
                                            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: r.color }}>{r.metal}</div>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "var(--text-xs)",
                                                fontWeight: 700,
                                                fontFamily: "var(--font-sans)",
                                                letterSpacing: 1,
                                                padding: "4px 10px",
                                                borderRadius: "var(--radius-sm)",
                                                background: us.bg,
                                                border: `1px solid ${us.border}`,
                                                color: us.color,
                                                minWidth: 80,
                                                textAlign: "center",
                                            }}
                                        >
                                            {us.label}
                                        </span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                                        {[
                                            { l: "Current Price", v: `$${fmt(r.currentPrice)}`, c: null as string | null },
                                            {
                                                l: "6M Forecast",
                                                v: `$${fmt(r.projectedPrice)}`,
                                                c: r.priceRisk.startsWith("+") ? "var(--color-danger)" : "var(--color-success)",
                                            },
                                            {
                                                l: "Price Risk",
                                                v: r.priceRisk,
                                                c: r.priceRisk.startsWith("+") ? "var(--color-warning)" : "var(--color-success)",
                                            },
                                            { l: "Qty Needed", v: r.qty, c: null as string | null, editable: true },
                                        ].map((s) => (
                                            <div key={s.l} className="dashboard-stat-block">
                                                <div
                                                    style={{
                                                        fontSize: 9,
                                                        color: "var(--color-primary)",
                                                        letterSpacing: 1.5,
                                                        fontFamily: "var(--font-sans)",
                                                        textTransform: "uppercase",
                                                        fontWeight: 700,
                                                        marginBottom: 3,
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    {s.l}
                                                    {s.editable && !isEditing && (
                                                        <Edit2
                                                            className="h-2.5 w-2.5 cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                                            onClick={() => setEditingId(r.id)}
                                                        />
                                                    )}
                                                    {s.editable && isEditing && (
                                                        <Check
                                                            className="h-2.5 w-2.5 cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                                                            onClick={() => setEditingId(null)}
                                                        />
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "var(--text-label)",
                                                        fontWeight: 700,
                                                        fontFamily: "var(--font-sans)",
                                                        color: s.c || "var(--color-text-strong)",
                                                    }}
                                                >
                                                    {s.editable && isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={r.qty}
                                                            onChange={(e) => handleUpdateQty(r.id, parseInt(e.target.value) || 0)}
                                                            autoFocus
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                borderBottom: "1px solid var(--color-surface-border)",
                                                                color: "var(--color-text-strong)",
                                                                width: "100%",
                                                                fontSize: "var(--text-label)",
                                                                outline: "none",
                                                                fontFamily: "var(--font-sans)",
                                                            }}
                                                        />
                                                    ) : s.editable ? (
                                                        `${fmt(r.qty)} MT`
                                                    ) : (
                                                        s.v
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <p
                                        style={{
                                            fontSize: "var(--text-sm)",
                                            color: "var(--color-text-muted)",
                                            lineHeight: 1.6,
                                            marginTop: "var(--space-12)",
                                        }}
                                    >
                                        {r.rationale}
                                    </p>

                                    <div style={{ marginTop: "var(--space-12)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    color: "var(--color-text-muted)",
                                                fontFamily: "var(--font-sans)",
                                                    fontWeight: 700,
                                                    letterSpacing: 1.5,
                                                }}
                                            >
                                                MODEL CONFIDENCE
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "var(--text-2xs)",
                                                fontFamily: "var(--font-sans)",
                                                    color: "var(--color-text-muted)",
                                                }}
                                            >
                                                {r.confidence}%
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 3,
                                                background: "var(--color-bg)",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                border: "1px solid var(--color-surface-border)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${r.confidence}%`,
                                                    background: r.color,
                                                    borderRadius: 2,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "var(--space-12)",
                                            padding: "var(--space-8) var(--space-12)",
                                            background: "var(--color-bg)",
                                            borderRadius: "var(--radius-sm)",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            border: "1px solid var(--color-surface-border)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: 9,
                                                color: "var(--color-text-muted)",
                                                fontFamily: "var(--font-sans)",
                                                fontWeight: 700,
                                                letterSpacing: 1,
                                            }}
                                        >
                                            ORDER WINDOW
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "var(--text-xs)",
                                                fontFamily: "var(--font-sans)",
                                                color: "var(--color-text-muted)",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {r.window}
                                        </span>
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