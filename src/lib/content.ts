import type { ComponentType } from "react";

interface LessonModule {
  default: ComponentType;
  frontmatter?: { title?: string };
}

export async function loadLesson(moduleId: string, lessonId: string): Promise<LessonModule | null> {
  try {
    const mod = (await import(`../content/lessons/${moduleId}/${lessonId}.mdx`)) as LessonModule;
    return mod;
  } catch {
    return null;
  }
}
