const express = require("express");
const router = express.Router();

// ← thêm 3 hàm mới vào destructuring
const {
  register, login, refreshToken, logout, getMe,
  socialLogin, forgotPassword, resetPassword, verifyOtp   
} = require("../controllers/auth.controller");

const { authenticate } = require("../middlewares/auth.middleware");
const { registerValidator, loginValidator } = require("../middlewares/validate.middleware");

router.post("/register",       registerValidator, register);
router.post("/sign_in",          loginValidator,    login);
router.post("/refresh-token",  refreshToken);
router.post("/logout",         authenticate,      logout);
router.get("/profile",              authenticate,      getMe);

// ← 3 route mới — không cần authenticate
router.post("/social-login",    socialLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.post("/verify-otp", verifyOtp);
module.exports = router;