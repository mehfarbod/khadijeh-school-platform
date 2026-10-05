const RETURN_TO_ORIGIN = "https://student-return.local";

export function getSafeStudentReturnTo(
  value: string | null | undefined,
  fallback = "/portal",
) {
  if (!value) return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const url = new URL(candidate, RETURN_TO_ORIGIN);
    if (url.origin !== RETURN_TO_ORIGIN) return fallback;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getStudentLoginUrl(returnTo: string) {
  const safeReturnTo = getSafeStudentReturnTo(returnTo);
  return `/portal/login?returnTo=${encodeURIComponent(safeReturnTo)}`;
}

export function getStudentPasswordChangeUrl(returnTo: string) {
  const safeReturnTo = getSafeStudentReturnTo(returnTo);
  return `/portal/change-password?returnTo=${encodeURIComponent(safeReturnTo)}`;
}
