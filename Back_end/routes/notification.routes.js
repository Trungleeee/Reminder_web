const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { mongoIdValidator } = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification APIs
 */

// 🔐 Middleware phải đặt TRƯỚC
router.use(authenticate);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy danh sách thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 *         content:
 *           application/json:
 *             example:
 *               - _id: "65abc123"
 *                 message: "Bạn có nhắc việc mới"
 *                 isRead: false
 *                 createdAt: "2026-04-23T10:00:00Z"
 */
router.get("/", getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Đánh dấu tất cả thông báo đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã cập nhật tất cả
 */
router.patch("/read-all", markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Đánh dấu 1 thông báo đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của notification
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.patch("/:id/read", mongoIdValidator("id"), markAsRead);

module.exports = router;