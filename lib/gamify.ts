import type { Badge, Progress } from "./types";

export const XP_PER_LESSON = 25;
export const XP_QUIZ_MAX = 50;
export const XP_PER_LEVEL = 100;

export const emptyProgress = (): Progress => ({
  completedLessons: [],
  quizScores: {},
  streak: 0,
  lastActive: "",
});

/** XP is a pure function of progress (idempotent — retakes never double-count). */
export function xpOf(p: Progress): number {
  const base = p.completedLessons.length * XP_PER_LESSON;
  const quiz = Object.values(p.quizScores).reduce((s, f) => s + Math.round(f * XP_QUIZ_MAX), 0);
  return base + quiz;
}

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const inLevel = xp % XP_PER_LEVEL;
  return { level, inLevel, span: XP_PER_LEVEL, pctToNext: (inLevel / XP_PER_LEVEL) * 100 };
}

export const perfectCount = (p: Progress) =>
  Object.values(p.quizScores).filter((f) => f >= 0.999).length;

export function metrics(p: Progress) {
  const xp = xpOf(p);
  return {
    lessons: p.completedLessons.length,
    perfect: perfectCount(p),
    streak: p.streak,
    level: levelInfo(xp).level,
    xp,
  };
}

/** Evaluate a badge `cond` like "lessons>=3" against derived metrics. */
export function earnedBadges(p: Progress, badges: Badge[]): Set<string> {
  const m = metrics(p) as Record<string, number>;
  const out = new Set<string>();
  for (const b of badges) {
    const mt = b.cond.match(/^(\w+)>=(\d+)$/);
    if (mt && (m[mt[1]] ?? 0) >= +mt[2]) out.add(b.id);
  }
  return out;
}

const dayStr = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => dayStr(new Date());

/** Returns the new streak given the previous progress and today's date. */
export function bumpStreak(prev: Progress): Progress {
  const t = today();
  if (prev.lastActive === t) return prev;
  const yesterday = dayStr(new Date(Date.now() - 86400000));
  const streak = prev.lastActive === yesterday ? prev.streak + 1 : 1;
  return { ...prev, streak, lastActive: t };
}
