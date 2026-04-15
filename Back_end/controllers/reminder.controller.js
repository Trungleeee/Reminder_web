const Reminder = require("../models/Reminder");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

const getReminders = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 50,
    } = req.query;

    const filter = { userId: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search)   filter.title    = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reminders, total] = await Promise.all([
      Reminder.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Reminder.countDocuments(filter),
    ]);

    res.json({
      reminders,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReminderById = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    res.json({ reminder });
  } catch (error) {
    next(error);
  }
};

const createReminder = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      status,
      category,
    } = req.body;

    const reminder = await Reminder.create({
      userId: req.user._id,
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      status,
      category: category || "work",
    });

    await AuditLog.create({
      userId:      req.user._id,
      action:      "CREATE_REMINDER",
      targetModel: "Reminder",
      targetId:    reminder._id,
      changes:     { after: reminder.toObject() },
      ip:          req.ip,
    });
    console.log(`✅ [CREATE TASK] "${reminder.title}" — user: ${req.user._id}`); // ← thêm
    res.status(201).json({ message: "Tạo task thành công", reminder });
  } catch (error) {
    next(error);
  }
};

const updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    const before = reminder.toObject();

    const simpleFields = [
      "title", "description", "date", "startTime",
      "endTime", "priority", "status", "category",
    ];
    simpleFields.forEach((field) => {
      if (req.body[field] !== undefined) reminder[field] = req.body[field];
    });

    if (req.body.status === "DONE" && !reminder.completedAt) {
      reminder.completedAt = new Date();
    }
    if (req.body.status && req.body.status !== "DONE") {
      reminder.completedAt = null;
    }
    if (req.body.date || req.body.startTime || req.body.endTime) {
      reminder.reminderTime = null;
      reminder.deadline     = null;
    }

    await reminder.save();

    await AuditLog.create({
      userId:      req.user._id,
      action:      "UPDATE_REMINDER",
      targetModel: "Reminder",
      targetId:    reminder._id,
      changes:     { before, after: reminder.toObject() },
      ip:          req.ip,
    });
    console.log(`✏️  [UPDATE TASK] "${reminder.title}" — user: ${req.user._id}`); // ← thêm
    res.json({ message: "Cập nhật task thành công", reminder });
  } catch (error) {
    next(error);
  }
};

const completeReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    reminder.status      = "DONE";
    reminder.completedAt = new Date();
    reminder.isNotified  = true; // ← luôn true khi hoàn thành
    await reminder.save();

    await AuditLog.create({
      userId:      req.user._id,
      action:      "COMPLETE_REMINDER",
      targetModel: "Reminder",
      targetId:    reminder._id,
      changes:     { status: "DONE", completedAt: reminder.completedAt },
      ip:          req.ip,
    });
    console.log(`✅ [COMPLETE TASK] "${reminder.title}" — user: ${req.user._id}`);
    res.json({ message: "Đánh dấu hoàn thành thành công", reminder });
  } catch (error) {
    next(error);
  }
};

const updateReminderStatus = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    reminder.status      = req.body.status;
    reminder.completedAt = req.body.status === "DONE" ? new Date() : null;
    reminder.isNotified  = req.body.status === "DONE" ? true : false; // ← sửa
    await reminder.save();

    res.json({ message: "Cập nhật status thành công", reminder });
  } catch (error) {
    next(error);
  }
};

const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Không tìm thấy task" });
    }

    await Notification.deleteMany({ reminderId: reminder._id });
    await reminder.deleteOne();

    await AuditLog.create({
      userId:      req.user._id,
      action:      "DELETE_REMINDER",
      targetModel: "Reminder",
      targetId:    req.params.id,
      changes:     { before: reminder.toObject() },
      ip:          req.ip,
    });
    console.log(`🗑️  [DELETE TASK] "${reminder.title}" — user: ${req.user._id}`); // ← thêm
    res.json({ message: "Xóa task thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  completeReminder,
  updateReminderStatus,
  deleteReminder,
};