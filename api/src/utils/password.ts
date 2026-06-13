// region imports
import { pbkdf2 } from '@noble/hashes/pbkdf2'
import { sha256 } from '@noble/hashes/sha256'
// endregion

// region constants

// PBKDF2 iteration count
const ITERATIONS = 100000

// endregion

// region helper functions

// generate random salt for password hashing
const generateSalt = (): string => {
  const bytes = new Uint8Array(16)

  crypto.getRandomValues(bytes)

  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// convert byte array into hexadecimal string
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// endregion

// region hash password

export const hashPassword = async (
  password: string,
): Promise<string> => {
  try {
    // generate unique salt
    const salt = generateSalt()

    // encode password into bytes
    const passwordBytes = new TextEncoder().encode(password)

    // generate PBKDF2 hash
    const hash = pbkdf2(
      sha256,
      passwordBytes,
      salt,
      {
        c: ITERATIONS,
        dkLen: 32,
      },
    )

    // convert hash into hexadecimal string
    const hashHex = bytesToHex(hash)

    // store as: iterations$salt$hash
    return `${ITERATIONS}$${salt}$${hashHex}`
  } catch (error) {
    console.error('Password hashing failed:', error)

    throw new Error('Failed to hash password')
  }
}

// endregion

// region compare password

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    // split stored password parts
    const parts = hashedPassword.split('$')

    // validate hash format
    if (parts.length !== 3) {
      console.error('Invalid password hash format')

      return false
    }

    const [iterStr, salt, storedHash] = parts

    // validate required values
    if (!iterStr || !salt || !storedHash) {
      console.error('Password hash is missing required parts')

      return false
    }

    // parse iteration count
    const iterations = parseInt(iterStr, 10)

    if (isNaN(iterations)) {
      console.error('Invalid iterations in password hash')

      return false
    }

    // encode input password
    const passwordBytes = new TextEncoder().encode(plainPassword)

    // generate comparison hash
    const computedHash = pbkdf2(
      sha256,
      passwordBytes,
      salt,
      {
        c: iterations,
        dkLen: 32,
      },
    )

    // convert computed hash into hexadecimal string
    const computedHashHex = bytesToHex(computedHash)

    // compare generated hash with stored hash
    return computedHashHex === storedHash
  } catch (error) {
    console.error('Password comparison failed:', error)

    return false
  }
}

// endregion