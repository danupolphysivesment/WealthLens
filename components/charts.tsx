"use client";
import React from "react";
import {
  Area, AreaChart, Bar, BarChart, Cell, ComposedChart, Line, LineChart, Pie, PieChart,
  ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { COLORS } from "@/lib/types";
import { money, moneyShort, pct } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "#9a958a" };
const grid = "#ece6da";

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e7e1d5", borderRadius: 10,
      padding: "8px 11px", boxShadow: "0 4px 16px rgba(45,52,84,.12)", fontSize: 12.5 }}>
      {children}
    </div>
  );
}
const yearTick = (d: string) => (d && d.slice(5) === "01" ? d.slice(0, 4) : "");

/* ---------------- Donut ---------------- */
export function Donut({ weights, height = 240 }: { weights: Record<string, number>; height?: number }) {
  const data = Object.entries(weights).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%"
          paddingAngle={2} stroke="none">
          {data.map((d) => <Cell key={d.name} fill={(COLORS as any)[d.name]} />)}
        </Pie>
        <Tooltip content={({ payload }) => payload && payload[0] ? (
          <Box><b>{payload[0].name}</b><br />{pct(payload[0].value as number)}</Box>) : null} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Fan chart ---------------- */
export function FanChart({ band, base, height = 380 }:
  { band: any[]; base: number; height?: number }) {
  const data = band.map((b) => ({
    date: b.date, p50: b.p50,
    base: b.p5, b1: b.p25 - b.p5, b2: b.p50 - b.p25, b3: b.p75 - b.p50, b4: b.p95 - b.p75,
    raw: b,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="date" tickFormatter={yearTick} tick={AXIS} minTickGap={20} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={moneyShort} tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Area dataKey="base" stackId="f" stroke="none" fill="transparent" isAnimationActive={false} />
        <Area dataKey="b1" stackId="f" stroke="none" fill={COLORS.purple} fillOpacity={0.12} isAnimationActive={false} />
        <Area dataKey="b2" stackId="f" stroke="none" fill={COLORS.purple} fillOpacity={0.28} isAnimationActive={false} />
        <Area dataKey="b3" stackId="f" stroke="none" fill={COLORS.purple} fillOpacity={0.28} isAnimationActive={false} />
        <Area dataKey="b4" stackId="f" stroke="none" fill={COLORS.purple} fillOpacity={0.12} isAnimationActive={false} />
        <Line dataKey="p50" stroke={COLORS.purple} strokeWidth={2.6} dot={false} isAnimationActive={false} />
        <ReferenceLine y={base} stroke="#71747E" strokeDasharray="4 4" />
        <Tooltip content={({ payload, label }) => {
          if (!payload || !payload.length) return null;
          const r = payload[0].payload.raw;
          return <Box><b>{label}</b><br />
            Median {money(r.p50)}<br />
            <span style={{ color: COLORS.muted }}>9-in-10 range {moneyShort(r.p5)} – {moneyShort(r.p95)}</span>
          </Box>;
        }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Histogram ---------------- */
export function Histogram({ data, base, height = 320 }:
  { data: { x: number; n: number }[]; base: number; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="x" tickFormatter={moneyShort} tick={AXIS} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
        <Bar dataKey="n" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => <Cell key={i} fill={d.x < base ? "#aeb7c6" : COLORS.purple} />)}
        </Bar>
        <ReferenceLine x={data.reduce((a, b) => Math.abs(b.x - base) < Math.abs(a.x - base) ? b : a).x}
          stroke={COLORS.red} strokeDasharray="4 4" />
        <Tooltip content={({ payload }) => payload && payload[0] ?
          <Box>{moneyShort(payload[0].payload.x)} · {payload[0].value} sims</Box> : null} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Stress comparison bars ---------------- */
export function StressBars({ stress, profile, height = 360 }:
  { stress: any[]; profile: string; height?: number }) {
  const data = stress.map((s) => ({
    name: s.name.replace(/ \(.*\)/, ""), current: s.currentImpact * 100, target: s.targetImpact * 100,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }} barGap={2}>
        <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#5a564e" }} width={150} axisLine={false} tickLine={false} />
        <Bar dataKey="current" name="Current" fill={COLORS.blue} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        <Bar dataKey="target" name={`Recommended (${profile})`} fill={COLORS.pink} radius={[0, 4, 4, 0]} isAnimationActive={false} />
        <ReferenceLine x={0} stroke="#cabfa8" />
        <Tooltip content={({ payload, label }) => payload && payload.length ?
          <Box><b>{label}</b><br />
            Current {payload[0].value.toFixed(1)}%<br />Recommended {payload[1]?.value.toFixed(1)}%</Box> : null} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Waterfall ---------------- */
export function Waterfall({ value, contribs, assets, height = 320 }:
  { value: number; contribs: Record<string, number>; assets: string[]; height?: number }) {
  let run = value;
  const rows: any[] = [{ name: "Today", base: 0, h: value, color: COLORS.blue }];
  for (const a of assets) {
    const c = contribs[a];
    const start = c < 0 ? run + c : run;
    rows.push({ name: a, base: start, h: Math.abs(c), color: c < 0 ? COLORS.coral : COLORS.green });
    run += c;
  }
  rows.push({ name: "After shock", base: 0, h: run, color: COLORS.blue });
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#5a564e" }} axisLine={false} tickLine={false} interval={0} />
        <YAxis tickFormatter={moneyShort} tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="h" stackId="w" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {rows.map((r, i) => <Cell key={i} fill={r.color} />)}
        </Bar>
        <Tooltip content={({ payload, label }) => payload && payload[1] ?
          <Box><b>{label}</b><br />{moneyShort(payload[1].payload.h)}</Box> : null} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Growth line ---------------- */
export function GrowthChart({ dates, current, target, profile, height = 360 }:
  { dates: string[]; current: number[]; target: number[]; profile: string; height?: number }) {
  const data = dates.map((d, i) => ({ date: d, current: current[i], target: target[i] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="date" tickFormatter={yearTick} tick={AXIS} minTickGap={28} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={moneyShort} tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Line dataKey="current" name="Current" stroke={COLORS.blue} strokeWidth={2.4} dot={false} isAnimationActive={false} />
        <Line dataKey="target" name={`Recommended (${profile})`} stroke={COLORS.pink} strokeWidth={2.2}
          strokeDasharray="6 4" dot={false} isAnimationActive={false} />
        <Tooltip content={({ payload, label }) => payload && payload.length ?
          <Box><b>{label}</b><br />Current {money(payload[0].value as number)}<br />
            Recommended {money(payload[1]?.value as number)}</Box> : null} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Drawdown ---------------- */
export function DrawdownChart({ dates, drawdown, height = 300 }:
  { dates: string[]; drawdown: number[]; height?: number }) {
  const data = dates.map((d, i) => ({ date: d, dd: drawdown[i] * 100 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="date" tickFormatter={yearTick} tick={AXIS} minTickGap={28} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} width={40} />
        <Area dataKey="dd" stroke={COLORS.coral} fill={COLORS.coral} fillOpacity={0.22} strokeWidth={1.8} isAnimationActive={false} />
        <Tooltip content={({ payload, label }) => payload && payload[0] ?
          <Box><b>{label}</b><br />{(payload[0].value as number).toFixed(1)}%</Box> : null} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Annual returns ---------------- */
export function AnnualBars({ annual, profile, height = 300 }:
  { annual: { year: number; current: number; target: number }[]; profile: string; height?: number }) {
  const data = annual.map((a) => ({ year: a.year, current: a.current * 100, target: a.target * 100 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="year" tick={AXIS} axisLine={false} tickLine={false} minTickGap={10} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} width={40} />
        <Bar dataKey="current" name="Current" fill={COLORS.blue} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        <Bar dataKey="target" name="Recommended" fill={COLORS.pink} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        <ReferenceLine y={0} stroke="#cabfa8" />
        <Tooltip content={({ payload, label }) => payload && payload.length ?
          <Box><b>{label}</b><br />Current {(payload[0].value as number).toFixed(1)}%<br />
            Recommended {(payload[1]?.value as number)?.toFixed(1)}%</Box> : null} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Diversification ---------------- */
export function DiversificationChart({ data, height = 300 }:
  { data: { date: string; equity: number; balanced: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="date" tickFormatter={yearTick} tick={AXIS} minTickGap={28} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={34} />
        <Line dataKey="equity" name="100% Equity" stroke={COLORS.Equity} strokeWidth={1.8} dot={false} isAnimationActive={false} />
        <Line dataKey="balanced" name="Balanced 50/35/15" stroke={COLORS.green} strokeWidth={2.4} dot={false} isAnimationActive={false} />
        <Tooltip content={({ payload, label }) => payload && payload.length ?
          <Box><b>{label}</b><br />100% Equity ×{(payload[0].value as number).toFixed(1)}<br />
            Balanced ×{(payload[1]?.value as number)?.toFixed(1)}</Box> : null} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Loss-by-horizon bars ---------------- */
export function LossBars({ data, height = 300 }:
  { data: { horizon: string; chanceLoss: number }[]; height?: number }) {
  const d = data.map((x) => ({ horizon: x.horizon, v: x.chanceLoss * 100 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={d} margin={{ top: 18, right: 12, left: 6, bottom: 0 }}>
        <XAxis dataKey="horizon" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} axisLine={false} tickLine={false} width={36} domain={[0, "dataMax + 8"]} />
        <Bar dataKey="v" fill={COLORS.purple} radius={[4, 4, 0, 0]} isAnimationActive={false}
          label={{ position: "top", formatter: (v: number) => `${v.toFixed(0)}%`, fontSize: 11, fill: "#71747E" }} />
        <Tooltip content={({ payload, label }) => payload && payload[0] ?
          <Box><b>{label}</b><br />{(payload[0].value as number).toFixed(0)}% chance below today</Box> : null} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------- Risk gauge (SVG) ---------------- */
export function Gauge({ score, height = 180 }: { score: number; height?: number }) {
  const cx = 130, cy = 130, r = 100, sw = 18;
  const zones = [
    { from: 0, to: 30, color: "#e6e1d5" }, { from: 30, to: 45, color: "#d7dbcf" },
    { from: 45, to: 62, color: "#c6d0c2" }, { from: 62, to: 78, color: "#e0cfa3" },
    { from: 78, to: 100, color: "#cfa98a" },
  ];
  const ang = (v: number) => (180 - v * 1.8) * Math.PI / 180;
  const pt = (v: number, rr = r) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(a), [x2, y2] = pt(b);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  const [nx, ny] = pt(Math.max(0, Math.min(100, score)), r - 14);
  return (
    <svg viewBox="0 0 260 150" width="100%" height={height} role="img" aria-label={`Risk score ${score}`}>
      {zones.map((z, i) => (
        <path key={i} d={arc(z.from, z.to)} stroke={z.color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      ))}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={COLORS.purple} strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill={COLORS.purple} />
      <text x={cx} y={cy - 26} textAnchor="middle" fontSize="34" fontWeight="800" fill="#1B2030">{score}</text>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="12" fill="#71747E">/ 100</text>
    </svg>
  );
}
