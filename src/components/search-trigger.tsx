"use client";

import { useEffect, useState, useCallback } from "react";
import { SearchModal } from "./search-modal";

export function SearchTrigger({ variant = "button" }: { variant?: "button" | "icon" }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Keyboard shortcut: Cmd/Ctrl+K or "/"
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      // "/" opens search unless user is typing in an input/textarea/contenteditable
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className={variant === "icon" ? "btn btn-ghost" : "btn btn-secondary"}
        style={
          variant === "icon"
            ? { minHeight: 36, padding: "0.375rem 0.625rem" }
            : {
                minHeight: 36, padding: "0.375rem 0.75rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
                fontSize: "0.875rem", color: "var(--color-fg-2)",
                minWidth: 220, justifyContent: "space-between",
              }
        }
      >
        {variant === "button" ? (
          <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span aria-hidden style={{ fontFamily: "var(--font-mono)" }}>⌕</span>
              <span>Search</span>
            </span>
            <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", padding: "0 0.375rem", border: "1px solid var(--color-border)", borderRadius: 3, color: "var(--color-fg-3)" }}>
              ⌘K
            </kbd>
          </>
        ) : (
          <span aria-hidden style={{ fontFamily: "var(--font-mono)" }}>⌕</span>
        )}
      </button>
      <SearchModal open={open} onClose={close} />
    </>
  );
}
