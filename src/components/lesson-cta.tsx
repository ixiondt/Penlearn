import Link from "next/link";

// Email-capture endpoint from your provider (Kit / Buttondown form action URL).
// Set NEXT_PUBLIC_NEWSLETTER_ENDPOINT in .env.local — until then the form is inert
// (button disabled) so it can never silently drop a signup. See .env.example.
const NEWSLETTER_ENDPOINT = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT ?? "";
const TOOLKIT_URL = "https://github.com/ixiondt/Pentest";

const BOOKS = [
  "Reconnaissance",
  "Offensive Operations",
  "Detection Engineering & Threat Hunting",
  "Incident Response & Forensics",
  "ICS, OT & Specialized Domains",
];

// Lesson-footer call to action: lead magnet (free cheat sheets) + book-launch list.
// One form, one goal — grow the owned email audience. Rendered on every lesson page.
export function LessonCTA() {
  return (
    <section
      className="container-app"
      style={{ marginTop: "var(--space-3xl)", paddingBottom: "var(--space-3xl)" }}
      aria-labelledby="lesson-cta-heading"
    >
      <div className="card" style={{ display: "grid", gap: "var(--space-xl)" }}>
        <div>
          <h2 id="lesson-cta-heading" style={{ marginTop: 0 }}>
            Get the field-reference cheat sheets — free
          </h2>
          <p style={{ color: "var(--color-fg-1)", marginTop: "var(--space-sm)" }}>
            The same checklists this lesson draws on — recon, Active Directory, cloud, IR,
            ICS/OT — as printable PDFs. Join the list and I&apos;ll send them over, plus first
            notice when the <strong>SecOps Toolkit book series</strong> launches on Kindle.
          </p>
        </div>

        <form
          action={NEWSLETTER_ENDPOINT || undefined}
          method="post"
          style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap", alignItems: "center" }}
        >
          {/* Honeypot — external-service form convention. Hidden from users + assistive tech. */}
          <input
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />
          <label htmlFor="lesson-cta-email" style={{ position: "absolute", left: "-9999px" }}>
            Email address
          </label>
          <input
            id="lesson-cta-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            style={{
              flex: "1 1 18rem",
              minHeight: 44,
              padding: "0.625rem 0.875rem",
              background: "var(--color-bg-2)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-fg-0)",
              fontSize: "0.9375rem",
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={!NEWSLETTER_ENDPOINT}>
            Send me the cheat sheets
          </button>
        </form>

        {!NEWSLETTER_ENDPOINT && (
          <p style={{ color: "var(--color-fg-3)", fontSize: "0.8125rem", margin: 0 }}>
            Signup activates once <code>NEXT_PUBLIC_NEWSLETTER_ENDPOINT</code> is set (your
            Kit / Buttondown form URL).
          </p>
        )}

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-lg)" }}>
          <p style={{ color: "var(--color-fg-2)", fontSize: "0.875rem", margin: 0 }}>
            <strong style={{ color: "var(--color-fg-1)" }}>The books</strong> — five short
            volumes, one per element of the lifecycle: {BOOKS.join(" · ")}. Coming to Amazon
            Kindle, rolling out monthly.{" "}
            <Link href={TOOLKIT_URL} style={{ color: "var(--color-accent-1)" }}>
              Browse the toolkit on GitHub →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
