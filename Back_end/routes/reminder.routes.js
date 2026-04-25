const express = require("express");
const router = express.Router();
const {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  completeReminder,
  updateReminderStatus,
  deleteReminder,
} = require("../controllers/reminder.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  reminderValidator,
  reminderStatusValidator,
  mongoIdValidator,
} = require("../middlewares/validate.middleware");

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Reminder management APIs
 */

// 🔐 tất cả API cần đăng nhập
router.use(authenticate);

/**
 * @swagger
 * /reminders:
 *   get:
 *     summary: Lấy danh sách reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách reminders
 *         content:
 *           application/json:
 *             example:
 *               - _id: "65abc123"
 *                 title: "Học NodeJS"
 *                 status: "pending"
 *                 dueDate: "2026-04-25"
 */
router.get("/", getReminders);

/**
 * @swagger
 * /reminders/{id}:
 *   get:
 *     summary: Lấy chi tiết reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết reminder
 */
router.get("/:id", mongoIdValidator("id"), getReminderById);

/**
 * @swagger
 * /reminders:
 *   post:
 *     summary: Tạo reminder mới
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: "Làm bài tập"
 *             dueDate: "2026-04-25"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", reminderValidator, createReminder);

/**
 * @swagger
 * /reminders/{id}:
 *   put:
 *     summary: Cập nhật reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: "Học Swagger"
 *             dueDate: "2026-04-26"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", mongoIdValidator("id"), reminderValidator, updateReminder);

/**
 * @swagger
 * /reminders/{id}/complete:
 *   patch:
 *     summary: Đánh dấu hoàn thành
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã hoàn thành
 */
router.patch("/:id/complete", mongoIdValidator("id"), completeReminder);

/**
 * @swagger
 * /reminders/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: "done"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.patch(
  "/:id/status",
  mongoIdValidator("id"),
  reminderStatusValidator,
  updateReminderStatus
);

/**
 * @swagger
 * /reminders/{id}:
 *   delete:
 *     summary: Xóa reminder
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/:id", mongoIdValidator("id"), deleteReminder);

module.exports = router;