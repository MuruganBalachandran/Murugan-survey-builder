// region imports
import { SignJWT, jwtVerify } from 'jose'

import type { JWTPayload } from '../types'
// endregion

// region constants

declare const process: {
  env: Record<string, string>
}

// JWT secret key
const JWT_SECRET =
  (typeof process !== 'undefined' && process.env?.JWT_SECRET) ||
  'survey-builder-secret-key-change-in-production'

// token expiration duration
const JWT_EXPIRY = '1h'

// endregion

// region helper functions

// convert secret string into Uint8Array
const getSecretKey = (): Uint8Array => {
  return new TextEncoder().encode(JWT_SECRET)
}

// endregion

// region generate token

export const generateToken = async (
  userId: string,
  email: string,
): Promise<string> => {
  // create JWT payload
  const payload: Record<string, string> = {
    userId,
    email,
  }

  // generate signed JWT token
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecretKey())

  return token
}

// endregion

// region verify token

export const verifyToken = async (
  token: string,
): Promise<JWTPayload | null> => {
  try {
    // verify JWT token
    const verified = await jwtVerify(token, getSecretKey())

    // return decoded payload
    return {
      userId: verified.payload.userId as string,
      email: verified.payload.email as string,
    }
  } catch (error) {
    console.error('Token verification failed:', error)

    return null
  }
}

// endregion