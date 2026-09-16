"use client";

import { getChallenge } from "@/content/challenges";
import { FlagSubmit } from "@/components/flag-submit";

/**
 * MDX-friendly wrapper: drop `<LabChallenge id="ai-prompt-leak" />` into a lesson
 * to embed that challenge's flag box inline. Looks the challenge up from the
 * registry so lesson authors only ever reference an id, never the (hashed) answer.
 */
export function LabChallenge({ id }: { id: string }) {
  const challenge = getChallenge(id);
  if (!challenge) {
    return (
      <div className="callout callout-danger">
        <p style={{ margin: 0 }}>Unknown challenge id: <code>{id}</code></p>
      </div>
    );
  }
  return <FlagSubmit challenge={challenge} />;
}
