import type { MDXComponents } from "mdx/types";
import { Checkpoint } from "@/components/checkpoint";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Checkpoint,
  };
}
