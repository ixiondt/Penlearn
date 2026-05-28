export type Mode = "passive" | "active" | "defense" | "report" | "all";
export type Track = "foundations" | "recon" | "exploit" | "soc" | "ir" | "ot" | "report";
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
