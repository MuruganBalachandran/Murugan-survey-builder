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

// region in-memory store
const store = new Map<string, RateLimitRecord>();
// endregion

// region helper functions
const getClientIp = (c: Context): string =>
  c.req.header("cf-connecting-ip") ||
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
  c.req.header("x-real-ip") ||
  "unknown";
// endregion

// region factory
export const createRateLimiter = (
  maxRequests: number,
  windowMs: number,
  keyFn: (c: Context) => string,
) => {
  const limiterStore = new Map<string, RateLimitRecord>();

  return async (c: Context, next: Next): Promise<Response | void> => {
    const key = keyFn(c);
    const now = Date.now();

    const record: RateLimitRecord =
      !limiterStore.has(key) || now > limiterStore.get(key)!.resetAt
        ? { count: 0, resetAt: now + windowMs }
        : limiterStore.get(key)!;

    record.count++;
    limiterStore.set(key, record);

    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - record.count).toString(),
    );

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      c.header("Retry-After", retryAfter.toString());
      return c.json(
        { success: false, message: "You have already submitted a response to this survey.", retryAfter },
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    await next();
  };
};
// endregion

// region middleware
export const rateLimitMiddleware = async (
  c: Context,
  next: Next,
): Promise<Response | void> => {
  const key = getClientIp(c);
  const now = Date.now();

  const record: RateLimitRecord =
    !store.has(key) || now > store.get(key)!.resetAt
      ? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      : store.get(key)!;

  record.count++;
  store.set(key, record);

  c.header("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
  c.header(
    "X-RateLimit-Remaining",
    Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count).toString(),
  );

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    c.header("Retry-After", retryAfter.toString());
    return c.json(
      { success: false, message: "Too many requests. Please try again later.", retryAfter },
      HTTP_STATUS.TOO_MANY_REQUESTS,
    );
  }

  await next();
};
// endregion

// region submit limiter — 1 submission per IP per survey per 24 h
export const submitRateLimiter = createRateLimiter(
  SUBMIT_RATE_LIMIT_MAX_REQUESTS,
  SUBMIT_RATE_LIMIT_WINDOW_MS,
  (c) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";
    return `${ip}:${c.req.param("surveyId") ?? ""}`;
  },
);
// endregion
