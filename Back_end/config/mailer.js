const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false, // true nếu port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false  // ← thêm dòng này
  }
});

/**
 * Gửi email thông báo reminder
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề
 * @param {string} html - Nội dung HTML
 */
const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Reminder App" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Template email nhắc nhở deadline
 */
const reminderEmailTemplate = (userName, title, deadline, priority) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #e53e3e;">⏰ Nhắc nhở: ${title}</h2>
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Task của bạn sắp đến hạn:</p>
    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px; background:#f7f7f7; font-weight:bold;">Tên task</td>
        <td style="padding: 8px;">${title}</td>
      </tr>
      <tr>
        <td style="padding: 8px; background:#f7f7f7; font-weight:bold;">Hạn chót</td>
        <td style="padding: 8px;">${new Date(deadline).toLocaleString("vi-VN")}</td>
      </tr>
      <tr>
        <td style="padding: 8px; background:#f7f7f7; font-weight:bold;">Mức ưu tiên</td>
        <td style="padding: 8px;">${priority}</td>
      </tr>
    </table>
    <p style="color: #666; font-size: 12px;">Email này được gửi tự động từ Reminder App.</p>
  </div>
`;

module.exports = { sendMail, reminderEmailTemplate };
