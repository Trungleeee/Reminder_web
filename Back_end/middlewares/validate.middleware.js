const { validationResult, body, param } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Tên không được để trống").isLength({ max: 100 }).withMessage("Tên không vượt quá 100 ký tự"),
  body("email").trim().isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu ít nhất 6 ký tự"),
  handleValidationErrors,
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
  body("password").notEmpty().withMessage("Mật khẩu không được để trống"),
  handleValidationErrors,
];

const categoryValidator = [
  body("name").trim().notEmpty().withMessage("Tên danh mục không được để trống").isLength({ max: 50 }).withMessage("Tên không vượt quá 50 ký tự"),
  body("color").optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage("Màu phải là mã hex hợp lệ (vd: #FF5733)"),
  handleValidationErrors,
];

const reminderValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Tiêu đề không được để trống")
    .isLength({ max: 200 }).withMessage("Tiêu đề không vượt quá 200 ký tự"),
  body("date")
    .notEmpty().withMessage("Ngày không được để trống")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Ngày phải theo định dạng YYYY-MM-DD"),
  body("startTime")
    .notEmpty().withMessage("Giờ bắt đầu không được để trống")
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ bắt đầu phải theo định dạng HH:MM"),
  body("endTime")
    .optional({ checkFalsy: true })
    .matches(/^\d{2}:\d{2}$/).withMessage("Giờ kết thúc phải theo định dạng HH:MM")
    .custom((endTime, { req }) => {
      if (endTime && req.body.startTime && endTime <= req.body.startTime) {
        throw new Error("endTime phải sau startTime");
      }
      return true;
    }),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Super"]).withMessage("Priority phải là Low, Medium, High hoặc Super"),
  body("status")
    .optional()
    .isIn(["TODO", "IN_PROGRESS", "DONE"]).withMessage("Status không hợp lệ"),
  body("category")
    .optional({ nullable: true })
    .isString().withMessage("category phải là string"),
  body("categoryId")
    .optional({ nullable: true })
    .isString().withMessage("categoryId phải là string"),
  handleValidationErrors,
];

// ← MỚI: chỉ validate status
const reminderStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status không được để trống")
    .isIn(["TODO", "IN_PROGRESS", "DONE"]).withMessage("Status không hợp lệ"),
  handleValidationErrors,
];

const mongoIdValidator = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`${paramName} không hợp lệ`),
  handleValidationErrors,
];

module.exports = {
  registerValidator,
  loginValidator,
  categoryValidator,
  reminderValidator,
  reminderStatusValidator,
  mongoIdValidator,
  handleValidationErrors,
};