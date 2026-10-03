import { createHash } from "node:crypto";
import { NextRequest } from "next/server";

import { rateLimit } from "@/lib/security/rate-limit";

type StudentAuthRateLimitOptions = {
  ipLimit: number;
  identifierLimit: number;
  windowMs: number;
};

export function rateLimitStudentAuth(
  request: NextRequest,
  namespace: string,
  identifier: string,
  options: StudentAuthRateLimitOptions,
) {
  const ipResult = rateLimit(request, `${namespace}:ip`, {
    limit: options.ipLimit,
    windowMs: options.windowMs,
  });
  const identifierKey = createHash("sha256")
    .update(identifier)
    .digest("base64url");
  const identifierResult = rateLimit(request, `${namespace}:identifier`, {
    limit: options.identifierLimit,
    windowMs: options.windowMs,
    key: identifierKey,
  });

  return {
    allowed: ipResult.allowed && identifierResult.allowed,
    retryAfterSeconds: Math.max(
      ipResult.retryAfterSeconds,
      identifierResult.retryAfterSeconds,
    ),
  };
}
