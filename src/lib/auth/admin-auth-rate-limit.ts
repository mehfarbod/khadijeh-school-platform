import { createHash } from "node:crypto";

import { NextRequest } from "next/server";

import { rateLimit } from "@/lib/security/rate-limit";

type AdminAuthRateLimitOptions = {
  ipLimit: number;
  identifierLimit: number;
  windowMs: number;
};

export function rateLimitAdminAuth(
  request: NextRequest,
  namespace: string,
  nationalId: string,
  options: AdminAuthRateLimitOptions,
) {
  const ipResult = rateLimit(request, `${namespace}:ip`, {
    limit: options.ipLimit,
    windowMs: options.windowMs,
  });
  const identifierKey = createHash("sha256")
    .update(nationalId)
    .digest("base64url");
  const identifierResult = rateLimit(request, `${namespace}:national-id`, {
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

export function rateLimitAdminPasswordLogin(
  request: NextRequest,
  nationalId: string,
) {
  return rateLimitAdminAuth(
    request,
    "admin-auth:password-login",
    nationalId,
    {
      ipLimit: 10,
      identifierLimit: 5,
      windowMs: 15 * 60 * 1000,
    },
  );
}
