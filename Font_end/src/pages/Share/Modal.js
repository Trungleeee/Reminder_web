export const TODAY = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();
 
// ── Category ──────────────────────────────────────────────
// Key phải khớp với field `key` trong collection categories của MongoDB
export const CATEGORY_LABEL = {
  work:     "Công việc",
  study:    "Học tập",
  personal: "Cá nhân",
  health:   "Sức khỏe",
  other:    "Khác",
};
 
export const PRIORITY_LABEL = {
  Low:    "Loại bỏ",
  Medium: "Không gấp",
  High:   "Ủy thác",
  Super:  "Gấp",
};
export const COLOR_CATEGORY = {
  work:     { bg: "#e3f2fd", text: "#1565c0" },
  study:    { bg: "#f3e5f5", text: "#6a1b9a" },
  personal: { bg: "#fff3e0", text: "#ef6c00" },
  health:   { bg: "#e8f5e9", text: "#2e7d32" },
  other:    { bg: "#f5f5f5", text: "#616161" },
};

export const PROVIDER_META = {
  local: { bg: "#EEF2FF", color: "#3730A3", label: "Local" },
  google: { bg: "#FEF2F2", color: "#991B1B", label: "Google" },
  facebook: { bg: "#EFF6FF", color: "#1E40AF", label: "Facebook" },
};

export const ACTION_META = {
  // Admin actions
  ACTIVATE_USER:    { label: "Kích hoạt",  bg: "#DCFCE7", color: "#166534" },
  DEACTIVATE_USER:  { label: "Vô hiệu",    bg: "#FEE2E2", color: "#991B1B" },
  UPDATE_USER:      { label: "Cập nhật",   bg: "#DBEAFE", color: "#1E40AF" },

  // Reminder actions
  CREATE_REMINDER:  { label: "Tạo task",   bg: "#F0FDF4", color: "#15803D" },
  UPDATE_REMINDER:  { label: "Sửa task",   bg: "#EFF6FF", color: "#1D4ED8" },
  DELETE_REMINDER:  { label: "Xóa task",   bg: "#FFF1F2", color: "#BE123C" },
  COMPLETE_REMINDER:{ label: "Hoàn thành", bg: "#FEF9C3", color: "#854D0E" },
};

export const AV_COLORS = [
  { bg: "#DBEAFE", color: "#1E40AF" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#EDE9FE", color: "#4C1D95" },
  { bg: "#FFEDD5", color: "#7C2D12" },
];
