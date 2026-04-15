const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reminder",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    channel: {
      type: String,
      enum: ["ui", "email"],
      default: "ui",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: null,
    },
      
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index để query thông báo chưa đọc của user nhanh
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
