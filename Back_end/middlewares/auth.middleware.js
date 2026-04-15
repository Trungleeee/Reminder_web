const { verifyAccessToken } = require("../config/jwt");
const User = require("../models/User");

/**
 * Middleware xác thực Access Token
 * Gắn req.user cho các route tiếp theo
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Kiểm tra user còn tồn tại và đang active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn", code: "TOKEN_EXPIRED" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Phải dùng sau authenticate
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
