// graphql/utils/errors.js
const { GraphQLError } = require("graphql");

// Use standard `extensions.code` so clients can branch on error types.
class AppError extends GraphQLError {
  constructor(message, code = "INTERNAL_SERVER_ERROR", props = {}) {
    super(message, {
      extensions: { code, ...props },
    });
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found", props = {}) {
    super(message, "NOT_FOUND", props);
  }
}

class ValidationError extends AppError {
  // `details` should be an array of { path, message } from Yup
  constructor(message = "Validation failed", details = [], props = {}) {
    super(message, "BAD_USER_INPUT", { details, ...props });
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", props = {}) {
    super(message, "FORBIDDEN", props);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, ForbiddenError };
