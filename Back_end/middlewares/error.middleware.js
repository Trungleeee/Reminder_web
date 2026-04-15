/**
 * Middleware xử lý lỗi toàn cục
 * Đặt ở cuối cùng trong app.js
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi server, vui lòng thử lại sau";

  // Mongoose: CastError (ObjectId không hợp lệ)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `ID không hợp lệ: ${err.value}`;
  }

  // Mongoose: Duplicate key (email trùng, tên category trùng...)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} đã tồn tại trong hệ thống`;
  }

  // Mongoose: Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({ message: "Dữ liệu không hợp lệ", errors });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token đã hết hạn";
  }

  // Log lỗi trong môi trường dev
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware xử lý route không tồn tại (404)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route không tồn tại: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
