import { useState } from "react";
import "./Matrix.css";
import { useTasks } from "./Share/TaskContext";
import { CATEGORY_LABEL, PRIORITY_LABEL, COLOR_CATEGORY } from "./Share/Modal";
import AddTaskModal from "./Share/addTaskModal";

// Backend trả về "Low" | "Medium" | "High" | "Super" (viết hoa)
const PRIORITY_TO_QUAD = {
  Super:  1,
  High:   2,
  Medium: 3,
  Low:    4,
};

const QUADRANT_META = {
  1: { label: "Làm ngay",     cls: "q1" },
  3: { label: "Lên kế hoạch", cls: "q2" },
  2: { label: "Ủy thác",      cls: "q3" },
  4: { label: "Loại bỏ",      cls: "q4" },
};

// ─── TaskItem ─────────────────────────────────────────────
function TaskItem({ task, onDelete, onToggle }) {
  const color = COLOR_CATEGORY[task.category] ?? COLOR_CATEGORY.other;

  return (
    <div
      className={`em-task${task.done ? " em-task--done" : ""}`}
      onClick={() => onToggle(task.id)}
      style={{ cursor: "pointer" }}
    >
      <div className="em-task-body">
        {/* title lớn hơn */}
        <span
          className="em-task-name"
          style={{
            color: color.text,
            fontSize: "1rem",           // ← tăng font
            fontWeight: 600,            // ← đậm hơn
            textDecoration: task.done ? "line-through" : "none",
            opacity: task.done ? 0.55 : 1,
          }}
        >
          {task.title}
        </span>

        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <span
            className={`task-category-badge task-category-badge--${task.category}`}
            style={{ fontSize: "0.7rem" }}
          >
            {CATEGORY_LABEL[task.category]}
          </span>
          <span className={`task-priority-badge task-priority-badge--${task.priority}`}>
            {PRIORITY_LABEL[task.priority] }
          </span>
          {task.date && <span className="em-task-due">📅 {task.date}</span>}
          {task.startTime && (
            <span className="em-task-due">
              ⏰ {task.startTime}{task.endTime ? ` – ${task.endTime}` : ""}
            </span>
          )}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{ fontSize: "1.1rem", cursor: "pointer" }}
          onClick={() => onToggle(task.id)} 
        >
          {!task.done && (
            <span
              style={{ fontSize: "1.1rem", cursor: "pointer" }}
              onClick={() => onToggle(task.id)}
            >
              ⬜
            </span>
          )}
        </span>
        <button
          className="em-task-del"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
// ─── Quadrant ─────────────────────────────────────────────
function Quadrant({ q, tasks, onAdd, onDelete, onToggle, single }) {
  const meta = QUADRANT_META[q];
  return (
    <div className={`em-quadrant em-${meta.cls}${single ? " em-quadrant--single" : ""}`}>
      <div className="em-q-label">
        {meta.label}
        <span className="em-q-count">{tasks.length}</span>
      </div>
      <div className="em-tasks">
        {tasks.map(t => (
          <TaskItem key={t.id} task={t} onDelete={onDelete} onToggle={onToggle} />
        ))}
        {tasks.length === 0 && <div className="em-empty-q">Trống</div>}
      </div>
      <button className="em-q-add" onClick={() => onAdd(q)}>+ thêm</button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
export default function Matrix() {
  const { tasks, deleteTask, toggleDone } = useTasks();   // ← lấy toggleDone
  const [search,  setSearch]  = useState("");
  const [filterQ, setFilterQ] = useState(0);
  const [modal,   setModal]   = useState(null);

  const filtered = tasks.filter(t =>
    (t.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Priority từ backend là "Super" | "High" | "Medium" | "Low"
  const getQuadTasks = (q) =>
    filtered.filter(t => PRIORITY_TO_QUAD[t.priority] === q && !t.done); 

  // defaultPriority truyền vào modal phải khớp với giá trị backend gửi lên
  const quadToDefaultPriority = { 1: "Super", 2: "High", 3: "Medium", 4: "Low" };

  return (
    <div className="em-root">
      <div className="em-header">
        <h1 className="em-title">🌿 Ma trận ưu tiên</h1>
        <div className="em-header-right">
          <div className="em-search-wrap">
            <span className="em-search-icon">🔍</span>
            <input
              className="em-search"
              placeholder="Tìm task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="em-search-clear" onClick={() => setSearch("")}>×</button>
            )}
          </div>

          <div className="em-filter-tabs">
            {[
              { v: 0, l: "Tất cả"   },
              { v: 1, l: "Làm ngay" },
              { v: 2, l: "Kế hoạch" },
              { v: 3, l: "Ủy thác"  },
              { v: 4, l: "Loại bỏ"  },
            ].map(({ v, l }) => (
              <button
                key={v}
                className={`em-filter-tab${filterQ === v ? " em-filter-tab--active" : ""}`}
                onClick={() => setFilterQ(v)}
              >
                {l}
              </button>
            ))}
          </div>

          <button className="em-add-btn" onClick={() => setModal({ quad: 1 })}>
            + Thêm task
          </button>
        </div>
      </div>

      {filterQ === 0 && (
        <div className="em-axis-top-row">
          <div className="em-corner" />
          <div className="em-axis-top em-axis-urgent">⚡ Gấp</div>
          <div className="em-axis-top em-axis-not-urgent">🌙 Không gấp</div>
        </div>
      )}

      <div className={`em-grid${filterQ !== 0 ? " em-grid--single" : ""}`}>
        {filterQ === 0 ? (
          <>
            <div className="em-row-label em-label-important">Quan trọng</div>
            {[1, 3].map(q => (
              <Quadrant
                key={q} q={q}
                tasks={getQuadTasks(q)}
                onAdd={(q) => setModal({ quad: q })}
                onDelete={deleteTask}
                onToggle={toggleDone}
              />
            ))}
            <div className="em-row-label em-label-not-important">Không quan trọng</div>
            {[2, 4].map(q => (
              <Quadrant
                key={q} q={q}
                tasks={getQuadTasks(q)}
                onAdd={(q) => setModal({ quad: q })}
                onDelete={deleteTask}
                onToggle={toggleDone}
              />
            ))}
          </>
        ) : (
          <Quadrant
            q={filterQ}
            tasks={getQuadTasks(filterQ)}
            onAdd={(q) => setModal({ quad: q })}
            onDelete={deleteTask}
            onToggle={toggleDone}
            single
          />
        )}
      </div>

      {modal && (
        <AddTaskModal
          onClose={() => setModal(null)}
          defaultDate={undefined}
          defaultPriority={quadToDefaultPriority[modal.quad]}
        />
      )}
    </div>
  );
}