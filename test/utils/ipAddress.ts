export type NormalizedIp = string;

/**
 * Resolves a safe client IP address for audit logging.
 * Handles:
 * - IPv4 / IPv6
 * - Proxy headers (x-forwarded-for)
 * - Local development (::1, 127.0.0.1)
 * - Null/undefined values
 */
export function resolveClientIp(req: any): NormalizedIp {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const rawIp =
    (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
    req?.socket?.remoteAddress ||
    req?.ip ||
    null;

  if (!rawIp) return "unknown";

  // Normalize localhost variants
  if (rawIp === "::1" || rawIp === "127.0.0.1") {
    return "local";
  }

  return rawIp;
}