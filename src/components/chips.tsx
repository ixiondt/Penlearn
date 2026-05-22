import type { Module, Lesson } from "@/lib/types";

export function ModeChip({ mode }: { mode: Module["mode"] }) {
  const variant =
    mode === "active" ? "chip-warn" :
    mode === "defense" ? "chip-info" :
    mode === "passive" ? "chip-ok" :
    mode === "report" ? "chip" : "chip";
  return <span className={`chip ${variant}`}>{mode}</span>;
}

export function DifficultyChip({ d }: { d: Lesson["difficulty"] }) {
  return <span className="chip" title="Difficulty">{d}</span>;
}

export function AttckChip({ id }: { id: string }) {
  const ics = id.startsWith("T0");
  return (
    <span className={`chip ${ics ? "chip-warn" : "chip-info"}`} title={ics ? "ICS ATT&CK technique" : "Enterprise ATT&CK technique"}>
      {id}
    </span>
  );
}

export function ScriptChip({ name }: { name: string }) {
  return <span className="chip" title="Toolkit script">{name}</span>;
}
