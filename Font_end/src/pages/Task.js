import { useState } from "react";
import "./Task.css";
import { TODAY, CATEGORY_LABEL, PRIORITY_LABEL } from "./Share/Modal";
import { useTasks } from "./Share/TaskContext";
import AddTaskModal from "./Share/addTaskModal";

const FILTERS = [
  { key: "all",   label: "Tất cả"       },
  { key: "today", label: "Hôm nay"      },
  { key: "high",  label: "Ưu tiên cao"  },
  { key: "done",  label: "Hoàn thành"   },
];

function to_day() {
  const [y, m, d] = TODAY.split("-").map(Number);
  return `${d}/${m}/${y}`;
}

// ─── TaskCard ─────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false);

  // Normalize — KHÔNG đụng classname
  const title    = task.title    || "";
  const startTime = task.startTime || "";
  const category = task.category  || "";
  const priority = task.priority  || "";

  return (
    <div
      className={["task-card", `task-card--${task.priority}`, task.done ? "task-card--done" : ""].join(" ")}
      onClick={() => onToggle(task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`task-checkbox ${task.done ? "task-checkbox--checked" : "task-checkbox--unchecked"}`}>
        {task.done && "✓"}
      </div>
      <div className="task-info">
        <div className={`task-name ${task.done ? "task-name--done" : "task-name--active"}`}>
          {title}           
        </div>
        <div className="task-meta">
          <span className="task-hour">{startTime} - {task.endTime}</span>   {/* ← chỉ đổi value */}
          <span className="task-date">📅 {task.date}</span>
          <span className={`task-category-badge task-category-badge--${category}`}> 
            {CATEGORY_LABEL[category]}
          </span>
          <span className={`task-priority-badge task-priority-badge--${priority}`}>
            {PRIORITY_LABEL[priority]}
          </span>
        </div>
      </div>
      {hovered && (
        <button
          className="task-delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          title="Xóa"
        >🗑</button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function Task() {
  const { tasks, toggleDone, deleteTask } = useTasks();
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  const done   = tasks.filter((t) => t.done).length;
  const total  = tasks.length;
  const urgent = tasks.filter((t) => t.priority === "Super" && !t.done).length;
  const pct    = total ? Math.round((done / total) * 100) : 0;

  const filtered = tasks.filter((t) => {
    // Normalize title ở đây luôn, tránh crash
    const title = (t.title || t.name || "").toLowerCase();
    const matchSearch = title.includes(search.toLowerCase());

    if (filter === "today") return !t.done && t.date === TODAY && matchSearch;
    if (filter === "high")  return t.priority === "Super" && !t.done && matchSearch;
    if (filter === "done")  return t.done && matchSearch;
    return matchSearch;
  });

  const pending  = filter === "done" ? [] : filtered.filter((t) => !t.done);
  const doneList = filter === "all"  ? filtered.filter((t) => t.done) : filter === "done" ? filtered : [];

  return (
    <div className="task-page">
      <div className="task-page-header">
        <h1 className="task-page-title">Nhiệm vụ hôm nay: {to_day()}</h1>
        <button className="task-add-btn" onClick={() => setShowModal(true)}>
          <span className="task-add-btn-icon">+</span> Thêm task
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="task-stats-row">
        <div className="task-stat-card">
          <div className="task-stat-number">{total}</div>
          <div className="task-stat-label">Tổng nhiệm vụ</div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-number">{done}</div>
          <div className="task-stat-label">Đã hoàn thành</div>
        </div>
        <div className="task-stat-card">
          <div className="task-stat-number">{urgent}</div>
          <div className="task-stat-label">Khẩn cấp</div>
        </div>
        <div className="task-stat-card task-stat-card--highlight">
          <div className="task-stat-number">{pct}%</div>
          <div className="task-stat-label">Tiến độ</div>
        </div>
      </div>

      <div className="task-filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`task-tab ${filter === f.key ? "task-tab--active" : "task-tab--inactive"}`}
            onClick={() => setFilter(f.key)}
          >{f.label}</button>
        ))}
      </div>

      <div className="task-search-row">
        <input
          className="task-search-input"
          placeholder="🔍  Tìm kiếm task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="task-section-label">Đang thực hiện</div>
      {pending.length === 0 ? (
        <div className="task-empty-state">
          <div className="task-empty-state-icon">🌿</div>
          Không có task nào. Thêm task mới nhé!
        </div>
      ) : (
        pending.map((t) => <TaskCard key={t.id} task={t} onToggle={toggleDone} onDelete={deleteTask} />)
      )}

      {doneList.length > 0 && (
        <>
          <div className="task-section-label task-section-label--mt">Đã hoàn thành</div>
          {doneList.map((t) => <TaskCard key={t.id} task={t} onToggle={toggleDone} onDelete={deleteTask} />)}
        </>
      )}

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} defaultDate={TODAY} />}
    </div>
  );
}