// region imports
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ApiError, ErrorResponse } from "../types";
import { HTTP_STATUS } from "../utils";
// endregion

// region helper functions
// formats consistent API error responses
const formatErrorResponse = (
  message: string,
  code: string,
  details?: string,
): ErrorResponse => ({
  success: false,
  message,
  error: {
    code,
    ...(details && { details }),
  },
  timestamp: new Date().toISOString(),
});

// extracts status code from error
const getStatusCode = (error: unknown): number => {
  if (error instanceof HTTPException) {
    return error.status;
  }

  if (error instanceof SyntaxError) {
    return HTTP_STATUS.BAD_REQUEST;
  }

  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
};

// extracts user-friendly error information
const getErrorDetails = (
  error: unknown,
): {
  message: string;
  code: string;
  details?: string;
} => {
  if (error instanceof HTTPException) {
    return {
      message: error.message,
      code: "HTTP_EXCEPTION",
      details: error.cause?.toString(),
    };
  }

  if (error instanceof SyntaxError) {
    return {
      message: "Invalid request format",
      code: "SYNTAX_ERROR",
      details: error.message,
    };
  }

  if (error instanceof TypeError) {
    return {
      message: "Type error occurred",
      code: "TYPE_ERROR",
      details: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }

  return {
    message: "Internal server error",
    code: "UNKNOWN_ERROR",
  };
};
// endregion

// region middleware
export const errorHandler = (error: Error, c: Context) => {
  // extract formatted error information
  const { message, code, details } = getErrorDetails(error);

  // determine HTTP status code
  const statusCode = getStatusCode(error);

  // log server error details
  console.error(`[${code}] ${message}`, {
    statusCode,
    details,
    path: c.req.path,
    method: c.req.method,
    stack: error.stack,
  });

  // return formatted API response
  return c.json(
    formatErrorResponse(message, code, details),
    statusCode as typeof HTTP_STATUS[keyof typeof HTTP_STATUS],
  );
};
// endregion
