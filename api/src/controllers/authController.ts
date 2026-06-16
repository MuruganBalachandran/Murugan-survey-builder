// region imports
import type { Context } from "hono";
import { createUser, findUserByEmail, findUserById } from "../queries";
import type { AuthPayload, AuthResponse, SignupPayload } from "../types";
import {
  buildCookieHeader,
  clearCookieHeader,
  comparePassword,
  generateId,
  generateToken,
  hashPassword,
  HTTP_STATUS,
  validateLogin,
  validateSignup,
} from "../utils";
// endregion

// region signup
export const signup = async (c: Context): Promise<Response> => {
  try {
    // db and body from context, typed as SignupPayload
    const db = c.env.DB;
    const body = (await c.req.json()) as SignupPayload;
    // extract fields for validation and signup
    const { email, password, confirmPassword, name } = body;

    // validate fields
    const validationErrors = validateSignup(email, password, name);
    if (Object.keys(validationErrors).length > 0) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // validate password and confirm password match
    if (password !== confirmPassword) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "Passwords do not match",
          errors: { confirmPassword: "Passwords do not match" },
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // check for existing user with the same email
    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "User already exists",
          errors: { email: "Email already registered" },
        },
        HTTP_STATUS.CONFLICT,
      );
    }

    // hash the password and create the user in the database
    const passwordHash = await hashPassword(password);
    const newUser = await createUser(db, {
      id: generateId(),
      email: email.toLowerCase(),
      name,
      passwordHash,
    });

    // if user creation fails, return an error response
    if (!newUser) {
      return c.json<AuthResponse>(
        { success: false, message: "Failed to create user" },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    // create a JWT token with the user id and email as payload
    const token = await generateToken(newUser.id, newUser.email, c.env);

    // Set the JWT in an httpOnly cookie — never exposed to JS
    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully",
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      } satisfies AuthResponse),
      {
        status: HTTP_STATUS.CREATED,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildCookieHeader(token, c.env),
        },
      },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return c.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region login
export const login = async (c: Context): Promise<Response> => {
  try {
    //  AuthPayload schema,
    const db = c.env.DB;
    const body = (await c.req.json()) as AuthPayload;
    // destructure email and password
    const { email, password } = body;

    // validate email and password
    const validationErrors = validateLogin(email, password);
    if (Object.keys(validationErrors).length > 0) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        },
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // perform find the user by email query
    const user = await findUserByEmail(db, email);
    if (!user) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "Invalid credentials",
          errors: { email: "Email not found" },
        },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // copare the password with the hash in the database
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json<AuthResponse>(
        {
          success: false,
          message: "Invalid credentials",
          errors: { password: "Incorrect password" },
        },
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    // generate access token with user id and email as payload
    const token = await generateToken(user.id, user.email, c.env);

    // Set the JWT in an httpOnly cookie — never exposed to JS
    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, name: user.name },
      } satisfies AuthResponse),
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildCookieHeader(token, c.env),
        },
      },
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region verify
export const verify = async (c: Context): Promise<Response> => {
  try {
    // db and userId from context
    const db = c.env.DB;
    const { userId } = c.get("user");

    // find the user by id query
    const user = await findUserById(db, userId);
    if (!user) {
      return c.json<AuthResponse>(
        { success: false, message: "User not found" },
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return c.json<AuthResponse>(
      {
        success: true,
        message: "Token is valid",
        user: { id: user.id, email: user.email, name: user.name },
      },
      HTTP_STATUS.OK,
    );
  } catch (error) {
    console.error("Verify error:", error);
    return c.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion

// region logout
export const logout = async (c: Context): Promise<Response> => {
  try {
    // returns a response with the cookie cleared
    return new Response(
      JSON.stringify({
        success: true,
        message: "Logout successful",
      } satisfies AuthResponse),
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearCookieHeader(),
        },
      },
    );
  } catch (error) {
    console.error("Logout error:", error);
    return c.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }
};
// endregion
