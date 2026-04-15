const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

/**
 * UC-12: Xem danh sách người dùng (Admin)
 * GET /api/admin/users?page=1&limit=10&isActive=true&search=...
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UC-13: Cập nhật user (Admin) — đổi role, kích hoạt/vô hiệu hóa
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Admin không tự sửa role của chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Không thể sửa thông tin của chính mình tại đây" });
    }

    const before = user.toObject();
    const { role, isActive } = req.body;

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save({ validateBeforeSave: false });

    const action = isActive === false ? "DEACTIVATE_USER" : isActive === true ? "ACTIVATE_USER" : "UPDATE_USER";

    await AuditLog.create({
      userId: req.user._id,
      action,
      targetModel: "User",
      targetId: user._id,
      changes: { before: { role: before.role, isActive: before.isActive }, after: { role: user.role, isActive: user.isActive } },
      ip: req.ip,
    });
    console.log(`👤 [ADMIN ${action}] user: ${user.email} — by admin: ${req.user._id}`); // ← thêm
    res.json({ message: "Cập nhật người dùng thành công", user });
  } catch (error) {
    next(error);
  }
};

/**
 * Xem audit logs (Admin)
 * GET /api/admin/audit-logs?userId=...&action=...&page=1
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { userId, action, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name email")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(filter),
    ]);
      
    res.json({
      logs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUser, getAuditLogs };
