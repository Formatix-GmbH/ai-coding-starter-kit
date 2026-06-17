/** Lässt nur interne Pfade als Redirect-Ziel zu (Schutz vor Open-Redirect), PROJ-2.
 *  Akzeptiert nur Pfade, die mit genau einem "/" beginnen. */
export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!candidate) return fallback;
  // Muss mit "/" beginnen, aber nicht mit "//" oder "/\" (protokoll-relativ).
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//") || candidate.startsWith("/\\")) return fallback;
  return candidate;
}
