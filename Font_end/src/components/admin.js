import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../pages/Sign_in";
import "./admin.css";
import { PROVIDER_META, AV_COLORS } from "../pages/Share/Modal";

const API_URL = "http://localhost:5000/api";
const SERVER_PAGE_SIZE = 20;

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ─── ACTION_META định nghĩa trực tiếp ở đây ──────────────────────────────────
const ACTION_META = {
  ACTIVATE_USER:    { label: "Kích hoạt user",  bg: "#DCFCE7", color: "#166534" },
  DEACTIVATE_USER:  { label: "Vô hiệu user",    bg: "#FEE2E2", color: "#991B1B" },
  UPDATE_USER:      { label: "Cập nhật user",   bg: "#DBEAFE", color: "#1E40AF" },
  CREATE_REMINDER:  { label: "Tạo task",         bg: "#F0FDF4", color: "#15803D" },
  UPDATE_REMINDER:  { label: "Sửa task",         bg: "#EFF6FF", color: "#1D4ED8" },
  DELETE_REMINDER:  { label: "Xóa task",         bg: "#FFF1F2", color: "#BE123C" },
  COMPLETE_REMINDER:{ label: "Hoàn thành task",  bg: "#FEF9C3", color: "#854D0E" },
};

const REMINDER_ACTIONS = ["CREATE_REMINDER","UPDATE_REMINDER","DELETE_REMINDER","COMPLETE_REMINDER"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name) =>
  name.trim().split(/\s+/).map((w) => w[0]).slice(-2).join("").toUpperCase();

const avColor = (id) => {
  const n = parseInt(id.replace(/\D/g, "") || "0");
  return AV_COLORS[n % AV_COLORS.length];
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const fmtDT = (d) =>
  d ? new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, id }) {
  const c = avColor(id);
  return (
    <div className="avatar" style={{ background: c.bg, color: c.color }}>
      {initials(name)}
    </div>
  );
}

function Badge({ children, bg, color }) {
  return <span className="badge" style={{ background: bg, color }}>{children}</span>;
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${colorClass || ""}`}>{value}</div>
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? "toast--visible" : "toast--hidden"}`}>
      {message}
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Admin() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  // ── Users state ──
  const [allUsers, setAllUsers]         = useState([]);
  const [pagination, setPagination]     = useState({ total: 0, totalPages: 1, page: 1 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers,   setErrorUsers]   = useState(null);

  // ── Logs state ──
  const [logs, setLogs]                       = useState([]);
  const [logPagination, setLogPagination]     = useState({ total: 0, totalPages: 1, page: 1 });
  const [loadingLogs, setLoadingLogs]         = useState(false);
  const [filterAction, setFilterAction]       = useState("");

  // ── UI state ──
  const [tab, setTab]                         = useState("users");
  const [search, setSearch]                   = useState("");
  const [filterStatus,   setFilterStatus]     = useState("");
  const [filterProvider, setFilterProvider]   = useState("");
  const [page,    setPage]                    = useState(1);
  const [logPage, setLogPage]                 = useState(1);
  const [editUser,   setEditUser]             = useState(null);
  const [editActive, setEditActive]           = useState(true);
  const [toast, setToast]                     = useState({ visible: false, message: "" });

  const handleLogout = () => { logout(); navigate("/sign_in"); };

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  // ── Fetch users ──
  const fetchUsers = useCallback(async (overridePage = page) => {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);
      const params = {
        page: overridePage, limit: 50,
        ...(filterStatus === "active"   && { isActive: true  }),
        ...(filterStatus === "inactive" && { isActive: false }),
        ...(search.trim()               && { search: search.trim() }),
      };
      const res = await axios.get(`${API_URL}/admin/users`, { ...getAuthHeader(), params });
      setAllUsers(res.data.users || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1, page: 1 });
    } catch (err) {
      console.error("Lỗi fetch users:", err);
      setErrorUsers("Không thể tải danh sách người dùng.");
    } finally {
      setLoadingUsers(false);
    }
  }, [page, filterStatus, search]);

  // ── Fetch logs — có filter action ──
  const fetchLogs = useCallback(async (overridePage = logPage) => {
    try {
      setLoadingLogs(true);
      const res = await axios.get(`${API_URL}/admin/audit-logs`, {
        ...getAuthHeader(),
        params: {
          page: overridePage,
          limit: SERVER_PAGE_SIZE,
          ...(filterAction && { action: filterAction }),
        },
      });
      setLogs(res.data.logs || []);
      setLogPagination(res.data.pagination || { total: 0, totalPages: 1, page: 1 });
    } catch (err) {
      console.error("Lỗi fetch logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [logPage, filterAction]);

  // ── Effects ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    fetchUsers(page);
  }, [page, filterStatus, search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return;
    if (tab === "logs") fetchLogs(1);
  }, [tab, logPage, filterAction]);

  // ── Filter provider ở client ──
  const CLIENT_PAGE_SIZE  = 8;
  const filteredByProvider = filterProvider
    ? allUsers.filter((u) => u.provider === filterProvider)
    : allUsers;
  const clientTotalPages  = Math.max(1, Math.ceil(filteredByProvider.length / CLIENT_PAGE_SIZE));
  const clientPage        = Math.min(page, clientTotalPages);
  const users             = filteredByProvider.slice(
    (clientPage - 1) * CLIENT_PAGE_SIZE,
    clientPage * CLIENT_PAGE_SIZE
  );

  // ── Stats ──
  const stats = {
    total:    pagination.total,
    active:   allUsers.filter((u) => u.isActive).length,
    inactive: allUsers.filter((u) => !u.isActive).length,
    google:   allUsers.filter((u) => u.provider === "google").length,
    facebook: allUsers.filter((u) => u.provider === "facebook").length,
  };

  // ── Toggle active ──
  const handleToggleActive = async (id, val) => {
    setAllUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: val } : u));
    try {
      await axios.put(`${API_URL}/admin/users/${id}`, { isActive: val }, getAuthHeader());
      showToast(val ? "Đã kích hoạt người dùng" : "Đã vô hiệu hóa người dùng");
      if (tab === "logs") fetchLogs(logPage);
    } catch (err) {
      showToast(err.response?.data?.message || "Có lỗi xảy ra.");
      fetchUsers(page);
    }
  };

  // ── Edit modal ──
  const openEdit = (u) => { setEditUser(u); setEditActive(u.isActive); };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      await axios.put(`${API_URL}/admin/users/${editUser._id}`, { isActive: editActive }, getAuthHeader());
      showToast("Đã cập nhật người dùng");
      setEditUser(null);
      fetchUsers(page);
      if (tab === "logs") fetchLogs(logPage);
    } catch (err) {
      showToast(err.response?.data?.message || "Có lỗi xảy ra khi lưu.");
    }
  };

  const resetPage = () => setPage(1);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* Header */}
      <div className="admin-header">
        <div>
          <span className="admin-title">Quản lý người dùng</span>
          <span className="admin-subtitle">{pagination.total} tài khoản</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {loadingUsers && <span className="admin-loading">Đang tải...</span>}
          <button className="btn btn--danger" onClick={handleLogout}>🚪 Đăng xuất</button>
        </div>
      </div>

      {errorUsers && <div className="error-banner">{errorUsers}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Tổng"      value={pagination.total} />
        <StatCard label="Hoạt động" value={stats.active}   colorClass="stat-value--green" />
        <StatCard label="Vô hiệu"   value={stats.inactive} colorClass="stat-value--red"   />
        <StatCard label="Google"    value={stats.google}   colorClass="stat-value--blue"  />
        <StatCard label="Facebook"  value={stats.facebook} colorClass="stat-value--indigo"/>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === "users" ? "tab-btn--active" : ""}`} onClick={() => setTab("users")}>
          Người dùng
        </button>
        <button className={`tab-btn ${tab === "logs" ? "tab-btn--active" : ""}`} onClick={() => setTab("logs")}>
          Audit logs
        </button>
      </div>

      {/* ── Users tab ── */}
      {tab === "users" && (
        <>
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input className="search-input" placeholder="Tìm tên hoặc email..."
                value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} />
            </div>
            <select className="filter-select" value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}>
              <option value="">Trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu</option>
            </select>
            <select className="filter-select" value={filterProvider}
              onChange={(e) => { setFilterProvider(e.target.value); resetPage(); }}>
              <option value="">Provider</option>
              <option value="local">Local</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div className="table-card">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="col-user">Người dùng</th>
                  <th className="col-provider">Provider</th>
                  <th className="col-status">Trạng thái</th>
                  <th className="col-created">Ngày tạo</th>
                  <th className="col-updated">Cập nhật</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan={6} className="td-empty">Đang tải dữ liệu...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="td-empty">Không tìm thấy người dùng nào</td></tr>
                ) : (
                  users.map((u) => {
                    const pm = PROVIDER_META[u.provider] || PROVIDER_META.local;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <Avatar name={u.name} id={u._id} />
                            <div>
                              <div className="user-name">{u.name}</div>
                              <div className="user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge bg={pm.bg} color={pm.color}>{pm.label}</Badge></td>
                        <td>
                          {u.isActive
                            ? <Badge bg="#DCFCE7" color="#166534">Hoạt động</Badge>
                            : <Badge bg="#FEE2E2" color="#991B1B">Vô hiệu</Badge>}
                        </td>
                        <td className="td-muted">{fmtDate(u.createdAt)}</td>
                        <td className="td-muted">{fmtDate(u.updatedAt)}</td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn" onClick={() => openEdit(u)}>Sửa</button>
                            {u.isActive
                              ? <button className="btn btn--danger" onClick={() => handleToggleActive(u._id, false)}>Vô hiệu</button>
                              : <button className="btn btn--success" onClick={() => handleToggleActive(u._id, true)}>Kích hoạt</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="pagination">
              <span>{filteredByProvider.length} kết quả &nbsp;·&nbsp; trang {clientPage}/{clientTotalPages}</span>
              <div className="pg-buttons">
                <button className="pg-btn" disabled={clientPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                {Array.from({ length: clientTotalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`pg-btn ${p === clientPage ? "pg-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pg-btn" disabled={clientPage === clientTotalPages} onClick={() => setPage((p) => Math.min(clientTotalPages, p + 1))}>›</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Audit logs tab ── */}
      {tab === "logs" && (
        <div className="table-card">

          {/* Filter action */}
          <div className="toolbar" style={{ marginBottom: 8 }}>
            <select className="filter-select" value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setLogPage(1); }}>
              <option value="">Tất cả hành động</option>
              <option value="CREATE_REMINDER">Tạo task</option>
              <option value="UPDATE_REMINDER">Sửa task</option>
              <option value="DELETE_REMINDER">Xóa task</option>
              <option value="COMPLETE_REMINDER">Hoàn thành task</option>
              <option value="ACTIVATE_USER">Kích hoạt user</option>
              <option value="DEACTIVATE_USER">Vô hiệu user</option>
              <option value="UPDATE_USER">Cập nhật user</option>
            </select>
          </div>

          {/* Log header — 5 cột */}
          <div className="log-header" style={{ gridTemplateColumns: "160px 160px 1fr 200px 80px" }}>
            <span>Thời gian</span>
            <span>Hành động</span>
            <span>Chi tiết</span>
            <span>Người thực hiện</span>
            <span>IP</span>
          </div>

          {loadingLogs ? (
            <div className="log-empty">Đang tải logs...</div>
          ) : logs.length === 0 ? (
            <div className="log-empty">Chưa có log nào</div>
          ) : (
            logs.map((l, i) => {
              const am = ACTION_META[l.action] || { label: l.action, bg: "#F3F4F6", color: "#374151" };

              const isReminderAction = REMINDER_ACTIONS.includes(l.action);

              // Lấy tên task từ changes
              const reminderTitle =
                l.changes?.after?.title  ||
                l.changes?.before?.title ||
                "—";

              // Lấy tên user bị tác động (với action user)
              const targetUser = !isReminderAction
                ? allUsers.find((u) => u._id === l.targetId?.toString())
                : null;

              const actorName  = l.userId?.name  || "—";
              const actorEmail = l.userId?.email || "—";

              return (
                <div
                  key={i}
                  className={`log-row ${i % 2 === 0 ? "log-row--even" : "log-row--odd"}`}
                  style={{ gridTemplateColumns: "160px 160px 1fr 200px 80px" }}
                >
                  <span className="log-time">{fmtDT(l.createdAt)}</span>

                  <div className="log-action-wrap">
                    <Badge bg={am.bg} color={am.color}>{am.label}</Badge>
                  </div>

                  {/* Chi tiết */}
              
                  <div>
                    {isReminderAction ? (
                      l.action === "UPDATE_REMINDER" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span className="log-target">📝 {reminderTitle}</span>
                          {l.changes?.before?.title !== l.changes?.after?.title && (
                            <span style={{ fontSize: 11, color: "#6B7280" }}>
                              <span style={{ color: "#991B1B", textDecoration: "line-through" }}>
                                {l.changes?.before?.title || "—"}
                              </span>
                              {" → "}
                              <span style={{ color: "#15803D" }}>
                                {l.changes?.after?.title || "—"}
                              </span>
                            </span>
                          )}
                          {l.changes?.before?.description !== l.changes?.after?.description && (
                            <span style={{ fontSize: 11, color: "#6B7280" }}>
                              Mô tả:{" "}
                              <span style={{ color: "#991B1B", textDecoration: "line-through" }}>
                                {l.changes?.before?.description || "—"}
                              </span>
                              {" → "}
                              <span style={{ color: "#15803D" }}>
                                {l.changes?.after?.description || "—"}
                              </span>
                            </span>
                          )}
                          {l.changes?.before?.dueDate !== l.changes?.after?.dueDate && (
                            <span style={{ fontSize: 11, color: "#6B7280" }}>
                              Hạn:{" "}
                              <span style={{ color: "#991B1B", textDecoration: "line-through" }}>
                                {fmtDate(l.changes?.before?.dueDate) || "—"}
                              </span>
                              {" → "}
                              <span style={{ color: "#15803D" }}>
                                {fmtDate(l.changes?.after?.dueDate) || "—"}
                              </span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="log-target">
                          {l.action === "CREATE_REMINDER"   && "➕ "}
                          {l.action === "DELETE_REMINDER"   && "🗑️ "}
                          {l.action === "COMPLETE_REMINDER" && "🏁 "}
                          {reminderTitle}
                        </span>
                      )
                    ) : targetUser ? (
                      <span className="log-target">👤 {targetUser.name}</span>
                    ) : (
                      <span style={{ color: "#9CA3AF" }}>—</span>
                    )}
                  </div>

                  {/* Người thực hiện */}
                  <div>
                    <div className="log-email">{actorName}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{actorEmail}</div>
                  </div>

                  <span className="log-ip">{l.ip}</span>
                </div>
              );
            })
          )}

          {logPagination.totalPages > 1 && (
            <div className="pagination">
              <span>{logPagination.total} logs &nbsp;·&nbsp; trang {logPage}/{logPagination.totalPages}</span>
              <div className="pg-buttons">
                <button className="pg-btn" disabled={logPage === 1} onClick={() => setLogPage((p) => Math.max(1, p - 1))}>‹</button>
                {Array.from({ length: logPagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={`pg-btn ${p === logPage ? "pg-btn--active" : ""}`} onClick={() => setLogPage(p)}>{p}</button>
                ))}
                <button className="pg-btn" disabled={logPage === logPagination.totalPages} onClick={() => setLogPage((p) => Math.min(logPagination.totalPages, p + 1))}>›</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Edit modal ── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)}>
        <h3 className="modal-title">Chỉnh sửa người dùng</h3>
        <label className="form-label">Họ tên</label>
        <input className="form-input" value={editUser?.name || ""} disabled />
        <label className="form-label">Email</label>
        <input className="form-input" value={editUser?.email || ""} disabled />
        <label className="form-label">Provider</label>
        <input className="form-input"
          value={editUser
            ? (PROVIDER_META[editUser.provider]?.label || editUser.provider) +
              (editUser.providerId ? ` (${editUser.providerId})` : "")
            : ""}
          disabled />
        <label className="form-label">Trạng thái</label>
        <select className="form-select" value={String(editActive)}
          onChange={(e) => setEditActive(e.target.value === "true")}>
          <option value="true">Đang hoạt động</option>
          <option value="false">Vô hiệu hóa</option>
        </select>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setEditUser(null)}>Hủy</button>
          <button className="btn-primary" onClick={handleSave}>Lưu thay đổi</button>
        </div>
      </Modal>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}