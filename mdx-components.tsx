import type { MDXComponents } from "mdx/types";
import { Checkpoint } from "@/components/checkpoint";
import { LabChallenge } from "@/components/lab-challenge";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Checkpoint,
    LabChallenge,
  };
}
