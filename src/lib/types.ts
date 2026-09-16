export type Mode = "passive" | "active" | "defense" | "report" | "all";
export type Track = "foundations" | "recon" | "exploit" | "soc" | "ir" | "ot" | "report" | "malware";
export type Difficulty = "intro" | "core" | "advanced";

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
}

export interface Module {
  id: string;
  number: string;
  track: Track;
  title: string;
  summary: string;
  prerequisites?: string[];
  mode: Mode;
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
