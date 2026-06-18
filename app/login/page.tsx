"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/store";
import { Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, authBusy, authError, isAuthed, user } = useProfile();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = mode === "login"
      ? await login(email, password)
      : await signup(email, name, password);
    if (ok) router.push("/dashboard");
  };

  if (isAuthed && user) {
    return (
      <div className="auth-wrap">
        <Card title={`You're signed in as ${user.name}`} sub={user.email}>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, margin: "6px 0 16px" }}>
            Your profile, progress and badges are saved to your account and will follow you to any device.
          </p>
          <button className="btn block" onClick={() => router.push("/dashboard")}>Go to dashboard →</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 38 }}>🧭</div>
        <h1 style={{ fontSize: 24 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
          {mode === "login" ? "Log in to pick up where you left off." : "Save your plan, lessons, XP and badges across devices."}
        </p>
      </div>
      <Card>
        <div className="auth-tabs">
          <button className={mode === "signup" ? "on" : ""} onClick={() => setMode("signup")}>Sign up</button>
          <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Log in</button>
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <div className="field">
              <label>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alexandra Chen" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          {authError && <div className="auth-err">{authError}</div>}
          <button className="btn block" type="submit" disabled={authBusy}>
            {authBusy ? "One moment…" : mode === "login" ? "Log in" : "Create account & save progress"}
          </button>
        </form>
        <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
          Demo accounts only — passwords are salted &amp; hashed locally. Don't reuse a real password.
        </p>
      </Card>
    </div>
  );
}
