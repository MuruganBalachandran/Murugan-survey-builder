// region id utilities

// Generates a unique identifier using timestamp + random suffix
export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// endregion

// region slug utilities

// Converts a survey title into a URL-friendly slug with a random suffix
export const generateSlug = (title: string): string => {
  const formatted = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${formatted}-${suffix}`;
};

// endregion

// region byte utilities

// Generates a random hex salt string of the given byte length
export const generateSalt = (byteLength: number): string => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Converts a Uint8Array to a lowercase hex string
export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

// endregion

// region cookie utilities

const COOKIE_NAME = "auth_token";

// Builds a Set-Cookie header with httpOnly, SameSite security flags
// For cross-origin requests, use SameSite=None; Secure in production
export const buildCookieHeader = (token: string, env: Env): string => {
  const maxAge = 60 * 60; // 1 hour — matches JWT_EXPIRY
  return [
    // Cookie name and the JWT token payload
    `${COOKIE_NAME}=${token}`,
    // Lifespan of the cookie in seconds (1 hour)
    `Max-Age=${maxAge}`,
    // Path parameter making the cookie accessible across the entire application domain
    "Path=/",
    // HTTP-only flag to prevent client-side script access (mitigates XSS attacks)
    "HttpOnly",
    // SameSite=None attribute allowing cookies to be sent in cross-site requests
    "SameSite=None",
    // Secure attribute ensuring the cookie is only transmitted over HTTPS
    "Secure",
  ]
    .filter(Boolean)
    .join("; ");
};

// Builds a Set-Cookie header that immediately expires the cookie
export const clearCookieHeader = (): string =>
  // Set Max-Age to 0 to instruct the browser to delete the cookie immediately
  `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=None; Secure`;

// Extracts the JWT value from the Cookie request header
export const getTokenFromCookie = (cookieHeader: string): string | null => {
  // Regex pattern matching the cookie name followed by its value within the Cookie header
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  return match?.[1] ?? null;
};

// endregion
