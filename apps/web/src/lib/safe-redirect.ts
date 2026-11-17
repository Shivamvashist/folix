/**
 * Returns `path` only when it is a same-site relative path, otherwise the fallback.
 * Used for `?next=` after sign-in, so a crafted link cannot send a user to another site.
 */
export function getSafeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  // Must be a single-slash absolute path. Rejects `//evil.com`, `/\evil.com` and full URLs.
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return fallback;
  // Control characters can be used to smuggle a different URL past the checks above.
  if (/[\u0000-\u001f\u007f]/.test(path)) return fallback;
  return path;
}
