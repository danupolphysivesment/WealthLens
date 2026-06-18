"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  analyze, DEFAULT_INPUT, fetchMe, fetchState, saveState,
  login as apiLogin, signup as apiSignup,
} from "./api";
import { bumpStreak, emptyProgress } from "./gamify";
import type { Analysis, AnalyzeInput, AuthUser, Progress } from "./types";

interface Store {
  input: AnalyzeInput;
  setInput: (patch: Partial<AnalyzeInput>) => void;
  data: Analysis | null;
  loading: boolean;
  error: string | null;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  // gamification
  progress: Progress;
  completeLesson: (lessonId: string, score: number) => void;
  // auth
  user: AuthUser | null;
  isAuthed: boolean;
  authBusy: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<Store | null>(null);
const KEY = "wealthlens.input";
const ONB = "wealthlens.onboarded";
const PROG = "wealthlens.progress";
const TOK = "wealthlens.token";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [input, setInputState] = useState<AnalyzeInput>(DEFAULT_INPUT);
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboarded, setOnboardedState] = useState(false);
  const [progress, setProgress] = useState<Progress>(emptyProgress());
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [ready, setReady] = useState(false);
  const analyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- hydrate (localStorage, then server if logged in) ----
  useEffect(() => {
    (async () => {
      try {
        const savedInput = localStorage.getItem(KEY);
        let inp = savedInput ? { ...DEFAULT_INPUT, ...JSON.parse(savedInput) } : DEFAULT_INPUT;
        let onb = localStorage.getItem(ONB) === "1";
        const savedProg = localStorage.getItem(PROG);
        let prog = savedProg ? { ...emptyProgress(), ...JSON.parse(savedProg) } : emptyProgress();
        const tok = localStorage.getItem(TOK);
        if (tok) {
          try {
            const me = await fetchMe(tok);
            setUser(me.user); setToken(tok);
            const s = (await fetchState(tok)).state || {};
            if (s.input || s.progress) {
              if (s.input) inp = { ...DEFAULT_INPUT, ...s.input };
              if (s.progress) prog = { ...emptyProgress(), ...s.progress };
              if (typeof s.onboarded === "boolean") onb = s.onboarded;
            } else {
              saveState(tok, { input: inp, progress: prog, onboarded: onb }).catch(() => {});
            }
          } catch {
            localStorage.removeItem(TOK);
          }
        }
        setInputState(inp);
        setOnboardedState(onb);
        setProgress(bumpStreak(prog)); // count today's visit toward the streak
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // ---- persist (localStorage + server when logged in) ----
  // Guard on `hydrated` so the initial render's default state never clobbers
  // saved data before hydration has loaded it from localStorage / the server.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(input));
      localStorage.setItem(PROG, JSON.stringify(progress));
      localStorage.setItem(ONB, onboarded ? "1" : "0");
    } catch {}
    if (!token) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const t = token;
    saveTimer.current = setTimeout(() => {
      saveState(t, { input, progress, onboarded }).catch(() => {});
    }, 600);
  }, [input, progress, onboarded, token, ready]);

  // ---- re-analyze on input change (debounced) ----
  useEffect(() => {
    if (analyzeTimer.current) clearTimeout(analyzeTimer.current);
    analyzeTimer.current = setTimeout(() => {
      setLoading(true);
      analyze(input)
        .then((d) => { setData(d); setError(null); })
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => { if (analyzeTimer.current) clearTimeout(analyzeTimer.current); };
  }, [input]);

  const setInput = (patch: Partial<AnalyzeInput>) =>
    setInputState((prev) => ({ ...prev, ...patch }));

  const setOnboarded = (v: boolean) => setOnboardedState(v);

  const completeLesson = (lessonId: string, score: number) =>
    setProgress((prev) => {
      const completedLessons = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons : [...prev.completedLessons, lessonId];
      const quizScores = { ...prev.quizScores, [lessonId]: Math.max(prev.quizScores[lessonId] ?? 0, score) };
      return bumpStreak({ ...prev, completedLessons, quizScores });
    });

  const login = async (email: string, password: string) => {
    setAuthBusy(true); setAuthError(null);
    try {
      const { token: t, user: u } = await apiLogin(email, password);
      localStorage.setItem(TOK, t); setToken(t); setUser(u);
      const s = (await fetchState(t)).state || {};
      if (s.input || s.progress) {
        if (s.input) setInputState({ ...DEFAULT_INPUT, ...s.input });
        if (s.progress) setProgress({ ...emptyProgress(), ...s.progress });
        if (typeof s.onboarded === "boolean") setOnboardedState(s.onboarded);
      } else {
        await saveState(t, { input, progress, onboarded });
      }
      return true;
    } catch (e: any) { setAuthError(e?.message || "Login failed"); return false; }
    finally { setAuthBusy(false); }
  };

  const signup = async (email: string, name: string, password: string) => {
    setAuthBusy(true); setAuthError(null);
    try {
      const { token: t, user: u } = await apiSignup(email, name, password);
      localStorage.setItem(TOK, t); setToken(t); setUser(u);
      await saveState(t, { input, progress, onboarded }); // carry anonymous state into the account
      return true;
    } catch (e: any) { setAuthError(e?.message || "Sign-up failed"); return false; }
    finally { setAuthBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem(TOK); setToken(null); setUser(null);
  };

  return (
    <Ctx.Provider value={{
      input, setInput, data, loading, error, onboarded, setOnboarded,
      progress, completeLesson,
      user, isAuthed: !!token, authBusy, authError, login, signup, logout,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProfile must be used within ProfileProvider");
  return c;
}
