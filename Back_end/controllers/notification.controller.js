const Notification = require("../models/Notification");

/**
 * UC-08: Lấy danh sách thông báo của user
 * GET /api/notifications?isRead=false&page=1&limit=20
 */
const getNotifications = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user._id };
    if (isRead !== undefined) filter.isRead = isRead === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("reminderId", "title deadline priority")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    res.json({
      notifications,
      unreadCount,
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
 * Đánh dấu 1 thông báo đã đọc
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    res.json({ message: "Đã đánh dấu đọc", notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "Đã đánh dấu tất cả đã đọc" });
  } catch (error) {
    next(error);
  }
};
module.exports = { getNotifications, markAsRead, markAllAsRead };
