const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { mongoIdValidator } = require("../middlewares/validate.middleware");

router.use(authenticate);

// GET   /api/notifications              — UC-08
router.get("/", getNotifications);

// PATCH /api/notifications/read-all
router.patch("/read-all", markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", mongoIdValidator("id"), markAsRead);

module.exports = router;
