const express = require("express");
const router = express.Router();
const { getUsers, updateUser, getAuditLogs } = require("../controllers/admin.controller");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");
const { mongoIdValidator } = require("../middlewares/validate.middleware");

// Tất cả route admin đều cần đăng nhập + quyền admin
router.use(authenticate, requireAdmin);

// GET /api/admin/users              — UC-12
router.get("/users", getUsers);

// PUT /api/admin/users/:id          — UC-13
router.put("/users/:id", mongoIdValidator("id"), updateUser);

// GET /api/admin/audit-logs
router.get("/audit-logs", getAuditLogs);

module.exports = router;
