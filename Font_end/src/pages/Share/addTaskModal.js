import { useState } from "react";
import { TODAY } from "./Modal";
import { useTasks } from "./TaskContext";

export default function AddTaskModal({ onClose, defaultDate }) {
  const { addTask } = useTasks();
  const [title,     setTitle]     = useState("");
  const [date,     setDate]     = useState(defaultDate || TODAY);
  const [time,     setTime]     = useState("09:00");
  const [endTime,  setEndTime]  = useState("10:00");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("work");
  const [error,    setError]    = useState(false);

  const handleSave = () => {
    if (!title.trim()) { setError(true); return; }
    addTask({
      title:     title.trim(),
      date:      date,
      startTime: time,
      endTime:   endTime,
      priority:  priority,
      category:  category,  
    });
    onClose();
  };

  return (
    <div className="task-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal-title">Thêm task mới</div>

        <div className="task-modal-field">
          <label className="task-modal-label">Tên task</label>
          <input
            className={`task-modal-input ${error ? "task-modal-input--error" : ""}`}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(false); }}
            placeholder="Nhập tên công việc..."
            autoFocus
          />
        </div>

        <div className="task-modal-field">
          <label className="task-modal-label">Ngày Dealine</label>
          <input
            className="task-modal-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onClick={(e) => e.target.showPicker()}
          />
        </div>

        <div className="cal-modal-field">
          <div className="cal-modal-row">
            <div>
              <label className="cal-modal-label">Bắt đầu</label>
              <input className="cal-modal-input" type="time" value={time}  onChange={(e) => setTime(e.target.value)}    onClick={(e) => e.target.showPicker()} />
            </div>
            <div>
              <label className="cal-modal-label">Kết thúc</label>
              <input className="cal-modal-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} onClick={(e) => e.target.showPicker()} />
            </div>
          </div>
        </div>

        <div className="task-modal-field">
          <label className="task-modal-label">Ưu tiên</label>
          <select className="task-modal-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Loại bỏ</option>
            <option value="Medium">Không gấp</option>
            <option value="High">Ủy thác</option>
            <option value="Super">Gấp</option>
          </select>
        </div>

        <div className="task-modal-field">
          <label className="task-modal-label">Danh mục</label>
          <select className="task-modal-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="work">Công việc</option>
            <option value="study">Học tập</option>
            <option value="personal">Cá nhân</option>
            <option value="health">Sức khỏe</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="task-modal-actions">
          <button className="task-btn-cancel" onClick={onClose}>Hủy</button>
          <button className="task-btn-save"   onClick={handleSave}>Lưu task</button>
        </div>
      </div>
    </div>
  );
}