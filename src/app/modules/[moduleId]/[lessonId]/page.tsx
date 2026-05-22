import Link from "next/link";
import { notFound } from "next/navigation";
import { getLesson, modules, getLab } from "@/content/curriculum";
import { LessonNav } from "@/components/lesson-nav";
import { AttckChip, DifficultyChip, ModeChip, ScriptChip } from "@/components/chips";
import { LabCard } from "@/components/lab-card";
import { loadLesson } from "@/lib/content";

export function generateStaticParams() {
  return modules.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lessonId: l.id })));
}

export default async function LessonPage(props: { params: Promise<{ moduleId: string; lessonId: string }> }) {
  const { moduleId, lessonId } = await props.params;
  const found = getLesson(moduleId, lessonId);
  if (!found) notFound();
  const { module: mod, lesson } = found;

  const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? mod.lessons[idx - 1] : undefined;
  const next = idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : undefined;
  const lab = lesson.labId ? getLab(lesson.labId) : undefined;

  const mdx = await loadLesson(moduleId, lessonId);
  const Content = mdx?.default;

  return (
    <div className="container-app" style={{ paddingBlock: "var(--space-3xl)" }}>
      <div style={{ display: "grid", gap: "var(--space-2xl)", gridTemplateColumns: "1fr" }} className="lesson-grid">
        <div>
          <Link href={`/modules/${mod.id}`} style={{ color: "var(--color-fg-2)", fontSize: "0.875rem" }}>← {mod.title}</Link>
          <header style={{ marginTop: "var(--space-md)", marginBottom: "var(--space-2xl)" }}>
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "var(--space-md)" }}>
              <ModeChip mode={mod.mode} />
              <DifficultyChip d={lesson.difficulty} />
              <span className="chip">{lesson.minutes} min</span>
              {lesson.attck?.map((a) => <AttckChip key={a} id={a} />)}
              {lesson.scripts?.map((s) => <ScriptChip key={s} name={s} />)}
            </div>
            <h1 style={{ marginTop: 0 }}>{lesson.title}</h1>
            <p style={{ color: "var(--color-fg-1)", fontSize: "1.0625rem", maxWidth: "70ch" }}>{lesson.summary}</p>
          </header>

          <article className="prose">
            {Content ? <Content /> : <PlaceholderContent lesson={lesson} />}
          </article>

          {lab && (
            <section style={{ marginTop: "var(--space-3xl)" }}>
              <h2>Lab</h2>
              <LabCard lab={lab} />
            </section>
          )}

          <nav style={{ marginTop: "var(--space-3xl)", display: "flex", justifyContent: "space-between", gap: "var(--space-md)", flexWrap: "wrap" }}>
            {prev ? (
              <Link className="btn btn-secondary" href={`/modules/${mod.id}/${prev.id}`}>← {prev.title}</Link>
            ) : <span />}
            {next ? (
              <Link className="btn btn-primary" href={`/modules/${mod.id}/${next.id}`}>{next.title} →</Link>
            ) : <Link className="btn btn-primary" href={`/modules/${mod.id}`}>Back to module</Link>}
          </nav>
        </div>

        <div className="hidden lg:block" style={{ minWidth: 0 }}>
          <LessonNav mod={mod} currentId={lesson.id} />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lesson-grid { grid-template-columns: minmax(0, 1fr) 280px; }
        }
      `}</style>
    </div>
  );
}

function PlaceholderContent({ lesson }: { lesson: NonNullable<ReturnType<typeof getLesson>>["lesson"] }) {
  return (
    <>
      <div className="callout">
        <p style={{ margin: 0 }}>
          This lesson is a structured outline — its overview, the toolkit scripts and
          field references it maps to, and the ATT&amp;CK techniques it covers. The full
          walkthrough is being authored.
        </p>
      </div>
      <h2>Overview</h2>
      <p>{lesson.summary}</p>
      {lesson.scripts && lesson.scripts.length > 0 && (
        <>
          <h3>Toolkit scripts</h3>
          <ul>{lesson.scripts.map((s) => <li key={s}><code>scripts/{s}</code></li>)}</ul>
        </>
      )}
      {lesson.docs && lesson.docs.length > 0 && (
        <>
          <h3>Field references</h3>
          <ul>{lesson.docs.map((d) => <li key={d}><code>{d}</code></li>)}</ul>
        </>
      )}
      {lesson.attck && lesson.attck.length > 0 && (
        <>
          <h3>ATT&amp;CK techniques</h3>
          <ul>{lesson.attck.map((a) => <li key={a}><code>{a}</code></li>)}</ul>
        </>
      )}
    </>
  );
}
