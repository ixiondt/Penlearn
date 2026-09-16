export type Mode = "passive" | "active" | "defense" | "report" | "all";
export type Track = "foundations" | "recon" | "exploit" | "soc" | "ir" | "ot" | "report" | "malware";
export type Difficulty = "intro" | "core" | "advanced";

/**
 * The completion contract for a hands-on lab. Turns "read this lesson" into
 * "prove you did this" — Objective → Task → Verify → Pass, rendered on both the
 * lesson page and the lab card. Only meaningful when `hasLab` is true.
 */
export interface LabContract {
  /** What competence completing the lab demonstrates. */
  objective: string;
  /** The concrete thing to build or run. */
  task: string;
  /** The command / observation that shows it worked. */
  verify: string;
  /** The bar that counts as done. */
  pass: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  difficulty: Difficulty;
  attck?: string[];
  scripts?: string[];
  docs?: string[];
  hasLab?: boolean;
  labId?: string;
  /** Pass criteria for this lesson's lab. Present only when `hasLab`. */
  labContract?: LabContract;
  /**
   * A capstone/checkpoint lesson that consolidates the module before advancing.
   * Surfaced with a distinct chip; conceptually the module's exit gate.
   */
  isCheckpoint?: boolean;
}

export interface Module {
  id: string;
  number: string;
  track: Track;
  title: string;
  summary: string;
  prerequisites?: string[];
  mode: Mode;
  /**
   * One-line exit outcome: what a learner can do once the module is complete.
   * Mirrors the Agentic-Coding "By the end of Phase 1 you are…" statement.
   */
  outcome?: string;
  lessons: Lesson[];
}

export interface Lab {
  id: string;
  title: string;
  summary: string;
  targets: string[];
  requires: string[];
  isolation: "host-only" | "private-net" | "air-gapped";
  authorization: "self-hosted" | "explicit-only";
  composeFile?: string;
  hasVagrant?: boolean;
  hasTerraform?: boolean;
}

/**
 * A jeopardy-style CTF challenge. The flag is never stored in plaintext — only
 * `answerHash`, the salted SHA-256 of the normalized answer (see lib/ctf.ts).
 * The learner recovers the flag by completing the linked lab; there is no server,
 * no scoreboard beyond the local one, and no way to read the answer from the page.
 */
export interface Challenge {
  id: string;
  /** The lab this challenge is solved inside. Ties the CTF back to the BYOL harness. */
  labId: string;
  /** Optional lesson deep-link (moduleId/lessonId) for the teaching context. */
  lesson?: { moduleId: string; lessonId: string };
  title: string;
  /** What the learner is looking for, and roughly where — never the flag itself. */
  prompt: string;
  /** Difficulty tier, reused from the lesson vocabulary. */
  difficulty: Difficulty;
  /** Points awarded on solve. Rough proxy for effort. */
  points: number;
  /** Salted SHA-256 (hex) of the normalized flag. Authored via scripts/ctf-hash.ts. */
  answerHash: string;
  /** A one-line shape hint shown by the input, e.g. "PENLEARN{...}" or "a CVE id". */
  format: string;
  /** ATT&CK techniques exercised, for cross-reference with the curriculum. */
  attck?: string[];
  /** Progressive hints — revealed one at a time, learner's choice. */
  hints?: string[];
}

export type PathEmphasis = "core" | "supporting" | "optional";

export interface PathStep {
  moduleId: string;
  emphasis: PathEmphasis;
  note?: string;
}

export interface LearningPath {
  id: string;
  role: string;
  tagline: string;
  audience: string;
  outcomes: string[];
  steps: PathStep[];
  cert?: string;
}
