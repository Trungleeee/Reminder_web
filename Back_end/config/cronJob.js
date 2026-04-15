const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendMail, reminderEmailTemplate } = require("./mailer");

/**
 * Cron job chạy mỗi phút, kiểm tra các reminder đến giờ nhắc nhở
 * UC-08: Nhận thông báo
 */
const startReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      // Lấy tất cả reminder chưa được thông báo và đã đến giờ nhắc
      const now     = new Date();
      const soon    = new Date(now.getTime() + 30 * 60 * 1000); // 30 phút tới
      const fiveMin = new Date(now.getTime() - 5 * 60 * 1000);  // 5 phút trước

      const reminders = await Reminder.find({
        isNotified:   false,
        status:       { $ne: "DONE" },
        reminderTime: { $gte: fiveMin, $lte: soon }, // ← cho phép trễ tối đa 5 phút
      }).populate("userId", "name email isActive");

      if (reminders.length === 0) return;

      console.log(`🔔 Cron: Tìm thấy ${reminders.length} reminder cần gửi thông báo`);

      for (const reminder of reminders) {
        const user = reminder.userId;
        if (!user || !user.isActive) continue;

        const message = `Task "${reminder.title}" sẽ đến hạn vào ${new Date(reminder.deadline).toLocaleString("vi-VN")}`;

        // Gửi email nếu có thông tin
        if (user.email) {
          const html = reminderEmailTemplate(
            user.name,
            reminder.title,
            reminder.deadline,
            reminder.priority
          );

          const result = await sendMail(
            user.email,
            `⏰ Nhắc nhở: ${reminder.title}`,
            html
          );

          // Tạo notification email riêng để track
          await Notification.create({
            userId: user._id,
            reminderId: reminder._id,
            message,
            channel: "email",
            retryCount: result.success ? 0 : 1,
            sentAt: result.success ? now : null,
          });
        }

        // Đánh dấu đã gửi thông báo
        reminder.isNotified = true;
        await reminder.save();
      }
    } catch (error) {
      console.error("❌ Cron job error:", error.message);
    }
  });

  console.log("⏱️  Reminder cron job đã khởi động (chạy mỗi phút)");
};

module.exports = { startReminderCron };
