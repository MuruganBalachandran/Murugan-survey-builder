// region imports
import type { User } from "../types";
// endregion

// Shared column list — avoids SELECT * and keeps mapping explicit
const USER_COLUMNS = "id, email, name, password_hash, created_at, updated_at";

// Maps a raw D1 row to the typed User shape
const mapUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// region findUserByEmail
export const findUserByEmail = async (
  db: D1Database,
  email: string,
  // returns User if found, otherwise undefined
): Promise<User | undefined> => {
  try {
    const result = await db
      .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`)
      // Replaces the ? placeholder.
      .bind(email.toLowerCase())
      .first<any>();

    return result ? mapUser(result) : undefined;
  } catch (error) {
    console.error("findUserByEmail error:", error);
    return undefined;
  }
};
// endregion

// region findUserById
export const findUserById = async (
  db: D1Database,
  id: string,
): Promise<User | undefined> => {
  try {
    const result = await db
      .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`)
      .bind(id)
      // Runs the query and returns the first matching row.
      .first<any>();

    return result ? mapUser(result) : undefined;
  } catch (error) {
    console.error("findUserById error:", error);
    return undefined;
  }
};
// endregion

// region createUser
export const createUser = async (
  db: D1Database,
  // Takes a type User and removes the properties - createdAt and updatedAt.
  user: Omit<User, "createdAt" | "updatedAt">,
): Promise<User | undefined> => {
  try {
    const now = new Date().toISOString();

    await db
      .prepare(
        "INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(
        user.id,
        user.email.toLowerCase(),
        user.name,
        user.passwordHash,
        now,
        now,
      )
      // sends the INSERT command to D1.
      .run();

    return { ...user, createdAt: now, updatedAt: now };
  } catch (error) {
    console.error("createUser error:", error);
    return undefined;
  }
};
// endregion

// region updateUser
export const updateUser = async (
  db: D1Database,
  id: string,
  // Pick - Selects only email and name properties from User.
  // Partial - Makes all properties optional
  updates: Partial<Pick<User, "email" | "name" | "passwordHash">>,
): Promise<User | null> => {
  try {
    const now = new Date().toISOString();

    // Build SET clause dynamically — only include fields that were provided
    const fields: string[] = ["updated_at = ?"];
    const values: any[] = [now];

    // update fields and values
    if (updates.email !== undefined) {
      fields.push("email = ?");
      values.push(updates.email.toLowerCase());
    }
    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.passwordHash !== undefined) {
      fields.push("password_hash = ?");
      values.push(updates.passwordHash);
    }

    // push the id
    values.push(id);

    // query result
    const result = await db
      .prepare(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ? RETURNING ${USER_COLUMNS}`,
      )
      .bind(...values)
      // Runs the query and returns the first matching row.

      .first<any>();

    return result ? mapUser(result) : null;
  } catch (error) {
    console.error("updateUser error:", error);
    return null;
  }
};
// endregion
