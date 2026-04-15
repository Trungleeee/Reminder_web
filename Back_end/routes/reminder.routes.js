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

router.use(authenticate);

router.get("/",    getReminders);
router.get("/:id", mongoIdValidator("id"), getReminderById);
router.post("/",   reminderValidator, createReminder);
router.put("/:id", mongoIdValidator("id"), reminderValidator, updateReminder);
router.patch("/:id/complete", mongoIdValidator("id"), completeReminder);
router.patch("/:id/status",   mongoIdValidator("id"), reminderStatusValidator, updateReminderStatus); // ← MỚI
router.delete("/:id",         mongoIdValidator("id"), deleteReminder);

module.exports = router;