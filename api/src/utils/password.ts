// region imports
import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, generateSalt } from "./commonFunctions";
import {
  PBKDF2_ITERATIONS,
  PBKDF2_KEY_LENGTH,
  SALT_BYTE_LENGTH,
} from "./constants";
// endregion

// region hashPassword
// Hashes a plain-text password using PBKDF2-SHA256.
// Stores the result as: iterations$salt$hash
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = generateSalt(SALT_BYTE_LENGTH);
    const passwordBytes = new TextEncoder().encode(password);
    const hash = pbkdf2(sha256, passwordBytes, salt, {
      c: PBKDF2_ITERATIONS,
      dkLen: PBKDF2_KEY_LENGTH,
    });
    return `${PBKDF2_ITERATIONS}$${salt}$${bytesToHex(hash)}`;
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new Error("Failed to hash password");
  }
};
// endregion

// region comparePassword
// Rehashes the plain-text password with the stored salt and compares.
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const parts = hashedPassword.split("$");

    if (parts.length !== 3) {
      console.error("Invalid password hash format");
      return false;
    }

    const [iterStr, salt, storedHash] = parts;

    if (!iterStr || !salt || !storedHash) {
      console.error("Password hash is missing required parts");
      return false;
    }

    const iterations = parseInt(iterStr, 10);
    if (isNaN(iterations)) {
      console.error("Invalid iterations in password hash");
      return false;
    }

    const passwordBytes = new TextEncoder().encode(plainPassword);
    const computedHash = pbkdf2(sha256, passwordBytes, salt, {
      c: iterations,
      dkLen: PBKDF2_KEY_LENGTH,
    });

    return bytesToHex(computedHash) === storedHash;
  } catch (error) {
    console.error("Password comparison failed:", error);
    return false;
  }
};
// endregion
