// region imports
import type { Context, Next } from "hono";
import type { RateLimitRecord } from "../types";
import {
  HTTP_STATUS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
} from "../utils/constants";
// endregion

// region in-memory store
const store = new Map<string, RateLimitRecord>();
// endregion

// region helper functions
const getClientIp = (c: Context): string =>
  // header automatically added by Cloudflare.
  c.req.header("cf-connecting-ip") ||
  // Standard header used by proxies to forward the original client's IP address.
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
  // Some reverse proxies (such as Nginx) set:
  c.req.header("x-real-ip") ||
  "unknown";
// endregion

// region middleware
export const rateLimitMiddleware = async (
  c: Context,
  next: Next,
): Promise<Response | void> => {
  // Determine the client's IP address using the helper function.
  const key = getClientIp(c);
  const now = Date.now();

  // Check if there's an existing record for this IP and if the rate limit window has expired.
  const record: RateLimitRecord =
    !store.has(key) || now > store.get(key)!.resetAt
      ? { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
      : store.get(key)!;

  // Increment the request count and update the store with the new record.
  record.count++;
  // Update the store with the new record for the client's IP address.
  store.set(key, record);

  // Set rate limit headers to inform the client about their current usage and limits.
  c.header("X-RateLimit-Limit", RATE_LIMIT_MAX_REQUESTS.toString());
  // Calculate the remaining requests and ensure it doesn't go negative, then set the header.
  c.header(
    "X-RateLimit-Remaining",
    Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count).toString(),
  );

  // If the request count exceeds the maximum allowed, respond with a 429 status and include a Retry-After header.
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    // Calculate the time until the rate limit resets and set the Retry-After header accordingly.
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    c.header("Retry-After", retryAfter.toString());
    return c.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter,
      },
      HTTP_STATUS.TOO_MANY_REQUESTS,
    );
  }

  await next();
};
// endregion
