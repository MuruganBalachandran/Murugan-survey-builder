// region imports
import type { Context, Next } from "hono";
import type { RateLimitRecord } from "../types";
import {
  HTTP_STATUS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  SUBMIT_RATE_LIMIT_MAX_REQUESTS,
  SUBMIT_RATE_LIMIT_WINDOW_MS,
} from "../utils/constants";
// endregion

// region helper functions

// Extracts the client's real IP address from standard HTTP proxy and gateway headers.
const getClientIp = (c: Context): string =>
  // Cloudflare header containing the client's original connecting IP address
  c.req.header("cf-connecting-ip") ||
  // De facto standard proxy header listing IPs the request passed through (first is client IP)
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
  // Nginx/proxy header representing the client's source IP address
  c.req.header("x-real-ip") ||
  // Fallback string if no IP address headers are present
  "unknown";

// Extracts the client's fingerprint combining IP address and User-Agent to distinguish devices sharing a public IP.
const getClientFingerprint = (c: Context): string => {
  const ip = getClientIp(c);
  // User-Agent header specifying the client browser and operating system details
  const userAgent = c.req.header("user-agent") || "unknown-agent";
  return `${ip}:${userAgent}`;
};
// endregion

// region factory

// Factory to construct standard, reusable rate limit middlewares.
export const createRateLimiter = (
  maxRequests: number,
  windowMs: number,
  keyFn: (c: Context) => string,
  message = "Too many requests. Please try again later.",
) => {
  // Local store tracking client request counts and reset timestamps
  const limiterStore = new Map<string, RateLimitRecord>();

  return async (c: Context, next: Next): Promise<Response | void> => {
    const key = keyFn(c);
    const now = Date.now();

    // Check if the record is missing or expired, and initialize/reset as appropriate
    const record: RateLimitRecord =
      !limiterStore.has(key) || now > limiterStore.get(key)!.resetAt
        ? { count: 0, resetAt: now + windowMs }
        : limiterStore.get(key)!;

    // Increment request count for the current rate limit window
    record.count++;
    limiterStore.set(key, record);

    // X-RateLimit-Limit: Header specifying the maximum number of requests allowed in the rate limit window
    c.header("X-RateLimit-Limit", maxRequests.toString());
    
    // X-RateLimit-Remaining: Header specifying the number of requests remaining in the current window
    c.header(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - record.count).toString(),
    );

    // If client has exceeded the request threshold, block the request
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      // Retry-After: Standard HTTP header indicating the number of seconds the client must wait before retrying
      c.header("Retry-After", retryAfter.toString());
      return c.json(
        { success: false, message, retryAfter },
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    await next();
  };
};

// endregion

// region middleware

// General rate limiter middleware to protect standard API endpoints from abuse
export const rateLimitMiddleware = createRateLimiter(
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  getClientFingerprint,
);

// endregion

// region submit limiter

// Survey submission limiter restricting requests to 1 submission per client IP per survey per 24 hours
export const submitRateLimiter = createRateLimiter(
  SUBMIT_RATE_LIMIT_MAX_REQUESTS,
  SUBMIT_RATE_LIMIT_WINDOW_MS,
  (c) => {
    const fingerprint = getClientFingerprint(c);
    const surveyId = c.req.param("surveyId") ?? "";
    return `${fingerprint}:${surveyId}`;
  },
  "You have already submitted a response to this survey.",
);

// endregion
