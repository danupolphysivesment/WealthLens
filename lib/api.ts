import type { Analysis, AnalyzeInput, AuthUser, Content, Meta } from "./types";

async function post<T>(url: string, body: unknown, token?: string): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    let msg = `${url} -> ${r.status}`;
    try { const j = await r.json(); if (j.detail) msg = j.detail; } catch {}
    throw new Error(msg);
  }
  return r.json();
}

async function get<T>(url: string, token?: string): Promise<T> {
  const r = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

export const analyze = (input: AnalyzeInput) => post<Analysis>("/api/analyze", input);
export const getContent = () => get<Content>("/api/content");
export const getMeta = () => get<Meta>("/api/meta");

export const signup = (email: string, name: string, password: string) =>
  post<{ token: string; user: AuthUser }>("/api/auth/signup", { email, name, password });
export const login = (email: string, password: string) =>
  post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
export const fetchMe = (token: string) => get<{ user: AuthUser }>("/api/auth/me", token);
export const fetchState = (token: string) => get<{ state: any }>("/api/user/state", token);
export const saveState = (token: string, state: any) =>
  fetch("/api/user/state", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ state }),
  });

export const DEFAULT_INPUT: AnalyzeInput = {
  value: 500_000,
  equity: 60,
  fixed_income: 25,
  alternatives: 15,
  age: 40,
  horizon_years: 20,
  tolerance: 6,
  liquidity: "Low",
};
