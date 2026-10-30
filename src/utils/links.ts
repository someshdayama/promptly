/**
 * Helpers for profile links (LinkedIn, portfolio) shown in resume headers.
 */

/** Returns an absolute http(s) URL, or "" if the value is empty or uses an unsafe scheme. */
export function normalizeUrl(raw: string | undefined | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  // Reject other schemes such as javascript:, data:, mailto:
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "";
  return `https://${value.replace(/^\/+/, "")}`;
}

/** Short, human-readable form for print: "linkedin.com/in/name" (no protocol, www or trailing slash). */
export function displayUrl(raw: string | undefined | null): string {
  return (raw || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}
