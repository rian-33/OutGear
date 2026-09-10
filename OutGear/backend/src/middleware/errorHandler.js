export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export const notFound = (req, res, _next) => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err, req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.name === "CastError") {
    status = 400;
    message = "ID tidak valid";
  }

  if (err.code === 11000) {
    status = 409;
    message = "Data sudah ada (duplikat)";
  }

  if (err.name === "RateLimitError") {
    status = 429;
    message = "Terlalu banyak permintaan. Coba lagi nanti.";
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
