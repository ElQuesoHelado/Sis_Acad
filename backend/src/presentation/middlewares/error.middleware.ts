/**
 * @file Global error handling middleware.
 * Catches all application errors and returns a standardized JSON response.
 */
import { type Request, type Response, type NextFunction } from "express";
import { type ErrorRequestHandler } from "express";
import { DomainError } from "@/domain/errors/index.js";
import { UnauthorizedError } from "express-jwt";

/**
 * Handles all errors thrown in the application.
 * Sends proper HTTP status codes and JSON error messages.
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Handle express-jwt authentication errors
  if (err instanceof UnauthorizedError) {
    console.warn("JWT Authentication Error:", err.message);
    return res.status(err.status).json({
      name: err.name,
      message: err.message,
    });
  }

  // Handle known domain errors (validation or business logic failures)
  if (err instanceof DomainError) {
    console.warn("Domain Error:", err.message);
    return res.status(400).json({
      name: err.name,
      message: err.message,
    });
  }

  // Handle unknown server errors (Internal Server Error 500)
  console.error("Unknown Server Error:", err);
  return res.status(500).json({
    name: "InternalServerError",
    message: "An unexpected error occurred.",
  });
};
