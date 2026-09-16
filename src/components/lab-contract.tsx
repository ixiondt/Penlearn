import type { LabContract as LabContractType } from "@/lib/types";

const ROWS: { key: keyof LabContractType; label: string }[] = [
  { key: "objective", label: "Objective" },
  { key: "task", label: "Task" },
  { key: "verify", label: "Verify" },
  { key: "pass", label: "Pass" },
];

/**
 * Renders a lab's completion contract (Objective → Task → Verify → Pass) as a
 * labelled definition list. Used on the lesson page so the concrete deliverable
 * is visible before the learner opens the lab harness.
 */
export function LabContract({ contract }: { contract: LabContractType }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-sm)" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--color-fg-0)" }}>Pass criteria</h3>
        <span style={{ fontSize: "0.75rem", color: "var(--color-fg-3)" }}>what counts as done</span>
      </div>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "0.5rem 0.875rem",
          margin: 0,
          fontSize: "0.9375rem",
        }}
      >
        {ROWS.map(({ key, label }) => (
          <div key={key} style={{ display: "contents" }}>
            <dt
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--color-fg-3)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                paddingTop: "0.125rem",
              }}
            >
              {label}
            </dt>
            <dd style={{ margin: 0, color: "var(--color-fg-1)" }}>{contract[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
