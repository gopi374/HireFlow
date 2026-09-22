import { sendError } from "../utils/response.js";

export const notFoundHandler = (req, res) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND");
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return sendError(res, `A record with that ${field} already exists.`, 409, "DUPLICATE_KEY_ERROR", [
      { field, message: `${field} must be unique.` },
    ]);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, "Validation failed", 400, "VALIDATION_ERROR", details);
  }

  // CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, `Invalid resource identifier format for ${err.path}`, 400, "INVALID_ID");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return sendError(res, "Authentication failed. Token invalid or expired.", 401, "INVALID_TOKEN");
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : err.message;
  return sendError(res, message, statusCode, err.code || "INTERNAL_ERROR");
};
