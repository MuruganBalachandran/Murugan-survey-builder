import type { User } from '../types'

/**
 * User Queries
 */

export const findUserByEmail = async (db: D1Database, email: string): Promise<User | undefined> => {
  try {
    const result = await db
      .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .bind(email)
      .first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      passwordHash: result.password_hash,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }
  } catch (error) {
    console.error('Find user by email error:', error)
    return undefined
  }
}

export const findUserById = async (db: D1Database, id: string): Promise<User | undefined> => {
  try {
    const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<any>()

    if (!result) return undefined

    return {
      id: result.id,
      email: result.email,
      name: result.name,
      passwordHash: result.password_hash,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }
  } catch (error) {
    console.error('Find user by id error:', error)
    return undefined
  }
}

export const createUser = async (
  db: D1Database,
  user: Omit<User, 'createdAt' | 'updatedAt'>,
): Promise<User | undefined> => {
  try {
    const now = new Date().toISOString()

    await db
      .prepare(
        'INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(user.id, user.email, user.name, user.passwordHash, now, now)
      .run()

    return {
      ...user,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error('Create user error:', error)
    return undefined
  }
}

export const updateUser = async (
  db: D1Database,
  id: string,
  updates: Partial<Omit<User, 'id'>>,
): Promise<User | null> => {
  try {
    const user = await findUserById(db, id)
    if (!user) return null

    const now = new Date().toISOString()

    await db
      .prepare(
        'UPDATE users SET email = ?, name = ?, password_hash = ?, updated_at = ? WHERE id = ?',
      )
      .bind(
        updates.email ?? user.email,
        updates.name ?? user.name,
        updates.passwordHash ?? user.passwordHash,
        now,
        id,
      )
      .run()

    return {
      id,
      email: updates.email ?? user.email,
      name: updates.name ?? user.name,
      passwordHash: updates.passwordHash ?? user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: now,
    }
  } catch (error) {
    console.error('Update user error:', error)
    return null
  }
}