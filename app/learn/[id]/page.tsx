"use client";
import { useEffect, useState, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/lib/store";
import { getContent } from "@/lib/api";
import type { Content } from "@/lib/types";
import { Card, Loading } from "@/components/ui";
import { XP_PER_LESSON, XP_QUIZ_MAX } from "@/lib/gamify";

function inline(text: string, k: number) {
  // render **bold** segments
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <Fragment key={k}>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</Fragment>;
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { progress, completeLesson } = useProfile();
  const [content, setContent] = useState<Content | null>(null);
  useEffect(() => { getContent().then(setContent).catch(() => {}); }, []);

  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  if (!content) return <Loading label="Loading lesson…" />;
  const lesson = content.lessons.find((l) => l.id === id);
  const body = content.lessonBodies[id] || [];
  const quiz = content.quizzes[id] || [];
  if (!lesson) return <Card title="Lesson not found"><button className="btn" onClick={() => router.push("/learn")}>← Back to Learn Hub</button></Card>;

  const q = quiz[qi];
  const pick = (i: number) => {
    if (answered) return;
    setSelected(i); setAnswered(true);
    if (i === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (qi + 1 < quiz.length) {
      setQi(qi + 1); setSelected(null); setAnswered(false);
    } else {
      const score = quiz.length ? correct / quiz.length : 1;
      setFinalScore(score);
      completeLesson(id, score);
      setFinished(true);
    }
  };
  const restart = () => {
    setQi(0); setSelected(null); setAnswered(false); setCorrect(0); setFinished(false);
  };

  const best = progress.quizScores[id];
  const earnedXP = (progress.completedLessons.includes(id) ? 0 : XP_PER_LESSON) + Math.round(finalScore * XP_QUIZ_MAX);

  return (
    <div style={{ maxWidth: 760 }}>
      <button className="acct-link" style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}
        onClick={() => router.push("/learn")}>← Learn Hub</button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
        <span style={{ fontSize: 34 }}>{lesson.icon}</span>
        <div>
          <h1 style={{ fontSize: 25 }}>{lesson.title}</h1>
          <div className="muted" style={{ fontSize: 13 }}>
            {lesson.level} · {lesson.minutes} min read
            {best != null && <> · best quiz {Math.round(best * 100)}%</>}
          </div>
        </div>
      </div>

      <Card style={{ marginTop: 14 }}>
        <div className="prose">
          {body.map((p, i) => p.startsWith("> ")
            ? <span className="hl" key={i}>{inline(p.slice(2), i)}</span>
            : <p key={i}>{inline(p, i)}</p>)}
        </div>
      </Card>

      <Card title="✅ Quick quiz" sub={`Answer ${quiz.length} questions to earn XP`} style={{ marginTop: 16 }}>
        {!finished ? (
          <>
            <div className="quiz-progress" style={{ marginBottom: 12 }}>Question {qi + 1} of {quiz.length}</div>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>{q.q}</h3>
            {q.options.map((opt, i) => {
              let cls = "quiz-opt";
              if (answered && i === q.answer) cls += " correct";
              else if (answered && i === selected) cls += " wrong";
              return (
                <button key={i} className={cls} disabled={answered} onClick={() => pick(i)}>
                  {opt}{answered && i === q.answer ? "  ✓" : answered && i === selected ? "  ✗" : ""}
                </button>
              );
            })}
            {answered && (
              <>
                <div className="quiz-explain">{selected === q.answer ? "Correct! " : "Not quite. "}{q.explain}</div>
                <button className="btn" onClick={next}>
                  {qi + 1 < quiz.length ? "Next question →" : "Finish & earn XP"}
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 46 }}>{finalScore >= 0.999 ? "🏆" : finalScore >= 0.5 ? "🎉" : "📘"}</div>
            <h3 style={{ fontSize: 20, margin: "8px 0" }}>
              You scored {correct}/{quiz.length}
            </h3>
            <p className="muted" style={{ fontSize: 14 }}>
              Lesson complete · <span className="xp-chip">+{earnedXP} XP</span> added
              {finalScore >= 0.999 && " · perfect score!"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              <button className="btn ghost" onClick={restart}>Retake quiz</button>
              <button className="btn" onClick={() => router.push("/learn")}>Back to Learn Hub →</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
