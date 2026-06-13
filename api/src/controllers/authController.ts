// region imports
import type { Context } from 'hono'
import { createUser, findUserByEmail, findUserById } from '../queries'
import { generateUserId } from '../utils/generators'
import type { AuthPayload, AuthResponse, SignupPayload } from '../types'
import {
  generateToken,
  verifyToken,
  comparePassword,
  hashPassword,
  validateLogin,
  validateSignup,
} from '../utils'
// endregion

// region signup

export const signup = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB
    const body = (await c.req.json()) as SignupPayload

    const { email, password, confirmPassword, name } = body

    // validate signup input
    const validationErrors = validateSignup(email, password, name)

    if (Object.keys(validationErrors).length > 0) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        400,
      )
    }

    // ensure passwords match
    if (password !== confirmPassword) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Passwords do not match',
          errors: {
            confirmPassword: 'Passwords do not match',
          },
        },
        400,
      )
    }

    // check if email already exists
    const existingUser = await findUserByEmail(db, email)

    if (existingUser) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'User already exists',
          errors: {
            email: 'Email already registered',
          },
        },
        409,
      )
    }

    // securely hash password
    const passwordHash = await hashPassword(password)

    // create new user
    const userId = generateUserId()

    const newUser = await createUser(db, {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
    })

    if (!newUser) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Failed to create user',
        },
        500,
      )
    }

    // generate authenticated session token
    const token = await generateToken(newUser.id, newUser.email)

    return c.json<AuthResponse>(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      201,
    )
  } catch (error) {
    console.error('Signup error:', error)

    return c.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion

// region login

export const login = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB
    const body = (await c.req.json()) as AuthPayload

    const { email, password } = body

    // validate login input
    const validationErrors = validateLogin(email, password)

    if (Object.keys(validationErrors).length > 0) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        400,
      )
    }

    // find user by email
    const user = await findUserByEmail(db, email)

    if (!user) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid credentials',
          errors: {
            email: 'Email not found',
          },
        },
        401,
      )
    }

    // verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid credentials',
          errors: {
            password: 'Incorrect password',
          },
        },
        401,
      )
    }

    // generate authenticated session token
    const token = await generateToken(user.id, user.email)

    return c.json<AuthResponse>(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      200,
    )
  } catch (error) {
    console.error('Login error:', error)

    return c.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion

// region verify

export const verify = async (c: Context): Promise<Response> => {
  try {
    const db = c.env.DB

    // extract authorization header
    const authHeader = c.req.header('Authorization')

    // validate bearer token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'No token provided',
        },
        401,
      )
    }

    // extract token value
    const token = authHeader.substring(7)

    // verify JWT token
    const payload = await verifyToken(token)

    if (!payload) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid token',
        },
        401,
      )
    }

    // fetch authenticated user
    const user = await findUserById(db, payload.userId)

    if (!user) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: 'User not found',
        },
        404,
      )
    }

    return c.json<AuthResponse>(
      {
        success: true,
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      200,
    )
  } catch (error) {
    console.error('Verify error:', error)

    return c.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion

// region logout

export const logout = async (c: Context): Promise<Response> => {
  try {
    // JWT tokens are stateless
    // logout is handled on the frontend
    return c.json<AuthResponse>(
      {
        success: true,
        message: 'Logout successful',
      },
      200,
    )
  } catch (error) {
    console.error('Logout error:', error)

    return c.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      500,
    )
  }
}

// endregion