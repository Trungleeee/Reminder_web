const express = require("express");
const router = express.Router();
const { getUsers, updateUser, getAuditLogs } = require("../controllers/admin.controller");
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware");
const { mongoIdValidator } = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Lấy danh sách user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: "65abc123"
 *                   email: "user@gmail.com"
 *                   role: "user"
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Cập nhật user (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "new@gmail.com"
 *             role: "admin"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Lấy audit logs (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách logs
 *         content:
 *           application/json:
 *             example:
 *               - action: "UPDATE_USER"
 *                 user: "admin"
 *                 time: "2026-04-23"
 */

// Middleware (giữ nguyên)
router.use(authenticate, requireAdmin);

// Routes (giữ nguyên)
router.get("/users", getUsers);
router.put("/users/:id", mongoIdValidator("id"), updateUser);
router.get("/audit-logs", getAuditLogs);

module.exports = router;