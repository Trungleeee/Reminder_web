const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề không được để trống"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: ["work", "study", "personal", "health", "other"],
      default: "work",
    },
    date: {
      type: String,
      required: [true, "Ngày không được để trống"],
    },
    startTime: {
      type: String,
      required: [true, "Giờ bắt đầu không được để trống"],
    },
    endTime: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Super"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
    reminderTime: {   // ← thêm
      type: Date,
      default: null,
    },
    deadline: {       // ← thêm
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reminderSchema.pre("save", function (next) {
  try {
    if (this.date && this.startTime) {
      const start = new Date(`${this.date}T${this.startTime}`);
      const end   = this.endTime
        ? new Date(`${this.date}T${this.endTime}`)
        : start;

      if (isNaN(start.getTime())) return next(new Error("startTime không hợp lệ"));
      if (isNaN(end.getTime()))   return next(new Error("endTime không hợp lệ"));
      if (end < start)            return next(new Error("endTime phải sau startTime"));

      this.reminderTime = start;
      this.deadline     = end;
    }
    next();
  } catch (err) {
    next(err);
  }
});

reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ reminderTime: 1, isNotified: 1 });

module.exports = mongoose.model("Reminder", reminderSchema);