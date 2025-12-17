class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const response = {
    error: statusCode === 500 ? "Internal Server Error" : err.name || "Error",
    message:
      process.env.NODE_ENV === "development" || statusCode < 500
        ? err.message
        : "Something went wrong",
  };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  console.error("Error:", err);

  res.status(statusCode).json(response);
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { ApiError, errorHandler, asyncHandler };



