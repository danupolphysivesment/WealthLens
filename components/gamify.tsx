"use client";
import type { Badge, Progress } from "@/lib/types";
import { earnedBadges, levelInfo, xpOf } from "@/lib/gamify";

export function LevelHeader({ progress, badges }: { progress: Progress; badges: Badge[] }) {
  const xp = xpOf(progress);
  const { level, inLevel, span, pctToNext } = levelInfo(xp);
  const earned = earnedBadges(progress, badges);
  return (
    <div className="level-header">
      <div className="lvl-ring">
        <div className="lvl-num">{level}</div>
        <div className="lvl-cap">level</div>
      </div>
      <div className="lvl-main">
        <div className="lvl-row">
          <span className="lvl-xp">{xp} XP</span>
          <span className="muted" style={{ fontSize: 12 }}>{inLevel}/{span} to level {level + 1}</span>
        </div>
        <div className="xp-bar"><div className="xp-fill" style={{ width: `${pctToNext}%` }} /></div>
        <div className="lvl-stats">
          <span title="Lessons completed">📘 {progress.completedLessons.length} lessons</span>
          <span title="Day streak" className={progress.streak >= 3 ? "streak-hot" : ""}>🔥 {progress.streak}-day streak</span>
          <span title="Badges earned">🏅 {earned.size}/{badges.length} badges</span>
        </div>
      </div>
    </div>
  );
}

export function BadgeShelf({ progress, badges }: { progress: Progress; badges: Badge[] }) {
  const earned = earnedBadges(progress, badges);
  return (
    <div className="badge-grid">
      {badges.map((b) => {
        const got = earned.has(b.id);
        return (
          <div key={b.id} className={`badge ${got ? "got" : "locked"}`} title={b.desc}>
            <div className="badge-ico">{got ? b.icon : "🔒"}</div>
            <div className="badge-t">{b.title}</div>
            <div className="badge-d">{b.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
