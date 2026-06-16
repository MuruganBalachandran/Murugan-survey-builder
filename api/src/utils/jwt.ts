// region imports
import { jwtVerify, SignJWT } from "jose";
import type { JWTPayload } from "../types";
// endregion

// region helper functions
const getSecretKey = (secret: string): Uint8Array =>
  new TextEncoder().encode(secret);
// endregion

// region generate token
export const generateToken = async (
  userId: string,
  email: string,
  env: Env,
): Promise<string> => {
  const payload: Record<string, string> = { userId, email };

  return (
    new SignJWT(payload)
      // Sets the JWT header.
      .setProtectedHeader({ alg: "HS256" })
      // expiration time
      .setExpirationTime(env.JWT_EXPIRY ?? "1h")
      // cryptographic signing happens.
      .sign(getSecretKey(env.JWT_SECRET))
  );
};
// endregion

// region verify token
export const verifyToken = async (
  token: string,
  env: Env,
): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(env.JWT_SECRET));
    return {
      userId: payload?.userId as string,
      email: payload?.email as string,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
// endregion
