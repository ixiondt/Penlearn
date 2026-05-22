"use client";

import { useState } from "react";

interface Question {
  q: string;
  options: string[];
  answer: number;
  why?: string;
}

export function Checkpoint({ id, questions }: { id: string; questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = Object.entries(answers).filter(([i, a]) => questions[Number(i)].answer === a).length;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <section className="callout callout-info" aria-labelledby={`cp-${id}`}>
      <h4 id={`cp-${id}`} style={{ margin: 0 }}>Checkpoint</h4>
      <p style={{ color: "var(--color-fg-2)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
        Answer all to see your score. Nothing is sent — purely local.
      </p>
      <ol style={{ listStyle: "decimal", paddingLeft: "1.25rem", marginTop: "var(--space-md)" }}>
        {questions.map((q, i) => (
          <li key={i} style={{ marginBottom: "var(--space-lg)" }}>
            <div style={{ color: "var(--color-fg-0)", marginBottom: "var(--space-sm)" }}>{q.q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {q.options.map((opt, j) => {
                const chosen = answers[i] === j;
                const correct = submitted && j === q.answer;
                const wrong = submitted && chosen && j !== q.answer;
                return (
                  <label key={j} style={{
                    display: "flex", alignItems: "flex-start", gap: "0.5rem",
                    padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)",
                    border: `1px solid ${correct ? "var(--color-success)" : wrong ? "var(--color-danger)" : chosen ? "var(--color-border-strong)" : "var(--color-border)"}`,
                    background: correct ? "color-mix(in oklch, var(--color-success) 12%, var(--color-bg-1))" : wrong ? "color-mix(in oklch, var(--color-danger) 12%, var(--color-bg-1))" : "var(--color-bg-1)",
                    cursor: "pointer",
                  }}>
                    <input
                      type="radio"
                      name={`q-${id}-${i}`}
                      checked={chosen}
                      onChange={() => setAnswers((a) => ({ ...a, [i]: j }))}
                      style={{ marginTop: 4 }}
                    />
                    <span style={{ fontSize: "0.9375rem" }}>{opt}</span>
                  </label>
                );
              })}
            </div>
            {submitted && q.why && (
              <p style={{ color: "var(--color-fg-2)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                <strong style={{ color: "var(--color-fg-0)" }}>Why:</strong> {q.why}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "center" }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!allAnswered}
          onClick={() => setSubmitted(true)}
          style={{ opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? "pointer" : "not-allowed" }}
        >
          Check answers
        </button>
        {submitted && (
          <span style={{ color: "var(--color-fg-0)" }}>
            <strong>{score} / {questions.length}</strong>
          </span>
        )}
      </div>
    </section>
  );
}
