const express = require("express");
const router = express.Router();

const {
  register, login, refreshToken, logout, getMe,
  socialLogin, forgotPassword, resetPassword, verifyOtp   
} = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { registerValidator, loginValidator } = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "user@gmail.com"
 *             password: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post("/register", registerValidator, register);

/**
 * @swagger
 * /auth/sign_in:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "user@gmail.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Trả về JWT token
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "jwt_token_here"
 */
router.post("/sign_in", loginValidator, login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token mới
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout thành công
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 */
router.get("/profile", authenticate, getMe);

/**
 * @swagger
 * /auth/social-login:
 *   post:
 *     summary: Đăng nhập bằng mạng xã hội
 *     tags: [Auth]
 */
router.post("/social-login", socialLogin);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Gửi OTP reset password
 *     tags: [Auth]
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Auth]
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     tags: [Auth]
 */
router.post("/verify-otp", verifyOtp);

module.exports = router;