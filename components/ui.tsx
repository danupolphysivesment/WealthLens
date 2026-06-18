"use client";
import React from "react";

export function Card({ title, sub, accent, color, children, className = "", style }:
  { title?: string; sub?: string; accent?: boolean; color?: string;
    children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`card ${accent ? "card-accent" : ""} ${className}`}
      style={{ ...(accent && color ? { borderTopColor: color } : {}), ...style }}>
      {title && <h3>{title}</h3>}
      {sub && <p className="sub">{sub}</p>}
      {(title || sub) && <div style={{ height: 12 }} />}
      {children}
    </div>
  );
}

export function Metric({ label, value, delta, deltaType }:
  { label: string; value: React.ReactNode; delta?: string;
    deltaType?: "up" | "down" | "warn" }) {
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${deltaType || ""}`}>{delta}</div>}
    </div>
  );
}

export function Hero({ name, value, profile, score }:
  { name: string; value: string; profile: string; score: number }) {
  return (
    <div className="hero">
      <h1>🧭 Welcome back, {name}</h1>
      <p>Portfolio intelligence for {value} under advice — powered by real market data.</p>
      <span className="pill">Recommended profile: {profile} · risk score {score}/100</span>
    </div>
  );
}

export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Loading({ label = "Crunching real market data…" }: { label?: string }) {
  return (
    <div className="center" style={{ flexDirection: "column", gap: 14, padding: "80px 0" }}>
      <div className="spinner" />
      <div className="muted" style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
}

export function Pill({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill-tag ${tone}`}>{children}</span>;
}

export function Alert({ kind, children }: { kind: "warn" | "ok" | "info"; children: React.ReactNode }) {
  const icon = kind === "warn" ? "⚠️" : kind === "ok" ? "✅" : "ℹ️";
  return <div className={`alert ${kind}`}><span>{icon}</span><span>{children}</span></div>;
}
