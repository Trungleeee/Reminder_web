const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      // Các action chuẩn trong hệ thống
      enum: [
        "CREATE_REMINDER",
        "UPDATE_REMINDER",
        "DELETE_REMINDER",
        "COMPLETE_REMINDER",
        "CREATE_CATEGORY",
        "UPDATE_CATEGORY",
        "DELETE_CATEGORY",
        "UPDATE_USER",
        "DEACTIVATE_USER",
        "ACTIVATE_USER",
        "LOGIN",
        "LOGOUT",
      ],
    },
    targetModel: {
      type: String,
      enum: ["Reminder", "Category", "User", "Notification"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed, // { before: {}, after: {} }
      default: {},
    },
    ip: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // log không bao giờ sửa
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
