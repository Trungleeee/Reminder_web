const User     = require("../models/User");
const AuditLog = require("../models/AuditLog");
const crypto   = require("crypto");
const admin    = require("../config/firebase-admin");
const { sendMail } = require("../config/mailer");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../config/jwt");

// ── UC-01: Đăng ký ──────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email đã được sử dụng" });
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (error) { next(error); }
};

// ── UC-02: Đăng nhập email/password ─────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +refreshToken");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
    if (!user.isActive) return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });

    const payload      = { id: user._id, role: user.role };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log(`🔐 [LOGIN] ${user.email} (${user.role}) đăng nhập thành công`); // ← thêm
    await AuditLog.create({
      userId: user._id, action: "LOGIN",
      targetModel: "User", targetId: user._id, ip: req.ip,
    });

    res.json({
      message: "Đăng nhập thành công",
      accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (error) { next(error); }
};

// ── UC-03: Đăng nhập Google qua Firebase ────────────────
const socialLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Thiếu idToken" });

    const decoded  = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, firebase: fb } = decoded;
    const provider = fb.sign_in_provider.includes("google") ? "google" : "facebook";

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: name || email.split("@")[0], email, provider, providerId: uid });
    } else if (user.provider === "local") {
      user.provider = provider; user.providerId = uid;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.isActive) return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });

    const payload      = { id: user._id, role: user.role };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    user.refreshToken  = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log(`🔐 [SOCIAL LOGIN] ${user.email} đăng nhập bằng ${provider}`); // ← thêm
    res.json({
      message: "Đăng nhập thành công",
      accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    if (error.code?.startsWith("auth/")) {
      return res.status(401).json({ message: "Token Firebase không hợp lệ" });
    }
    next(error);
  }
};

// ── UC-04: Quên mật khẩu — gửi OTP ─────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpires");

    // ← Báo lỗi rõ thay vì trả 200 im lặng
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }
    if (user.provider !== "local") {
      return res.status(400).json({ message: "Tài khoản này đăng nhập bằng Google, không có mật khẩu" });
    }

    const otp     = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtp        = otp;
    user.resetOtpExpires = expires;
    await user.save({ validateBeforeSave: false });

    const result = await sendMail(email, "Mã xác nhận đặt lại mật khẩu", `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2 style="color:#16a34a">Đặt lại mật khẩu</h2>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#16a34a;margin:16px 0">${otp}</div>
        <p style="color:#666">Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này cho ai.</p>
      </div>
    `);
    console.log("📧 Kết quả gửi mail:", result);

    if (!result || result.error) {
    return res.status(500).json({ message: "Gửi email thất bại" });
  }

    res.json({ message: "Mã OTP đã được gửi đến email của bạn" });
  } catch (error) { next(error); }
};

// ── UC-05: Verify OTP (chưa đổi mật khẩu) ──────────────
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpires");

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    res.json({ message: "OTP hợp lệ" });
  } catch (error) { next(error); }
};

// ── UC-06: Đặt lại mật khẩu mới ────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpires +password");

    if (!user || user.resetOtp !== otp || !user.resetOtpExpires || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu tối thiểu 6 ký tự" });
    }

    user.password        = newPassword; // pre-save hook sẽ hash
    user.resetOtp        = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) { next(error); }
};

// ── Refresh Token ────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ message: "Không tìm thấy refresh token" });

    const decoded = verifyRefreshToken(token);
    const user    = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    const payload       = { id: user._id, role: user.role };
    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    user.refreshToken   = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token đã hết hạn, vui lòng đăng nhập lại" });
    }
    next(error);
  }
};

// ── Đăng xuất ───────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    await AuditLog.create({
      userId: req.user._id, action: "LOGOUT",
      targetModel: "User", targetId: req.user._id, ip: req.ip,
    });
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) { next(error); }
};

// ── Lấy thông tin user hiện tại ─────────────────────────
const getMe = async (req, res) => {
  res.json({
    user: {
      _id:       req.user._id,
      name:      req.user.name,
      email:     req.user.email,
      role:      req.user.role,
      createdAt: req.user.createdAt,
    }
  });
};

module.exports = {
  register, login, socialLogin,
  forgotPassword, verifyOtp, resetPassword,
  refreshToken, logout, getMe, 
};