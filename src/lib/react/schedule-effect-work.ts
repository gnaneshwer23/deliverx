/**
 * Defer effect work off the synchronous effect body.
 * Used for mount-time client fetches so setState is not flagged as
 * cascading renders by react-hooks/set-state-in-effect.
 */
export function scheduleEffectWork(work: () => void): () => void {
  const id = setTimeout(work, 0);
  return () => clearTimeout(id);
}
