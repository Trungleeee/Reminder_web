import { useState, useRef, useEffect } from "react";
import "./Calendar.css";
import AddTaskModal from "./Share/addTaskModal";
import { TODAY, COLOR_CATEGORY } from "./Share/Modal";
import { useTasks } from "./Share/TaskContext";

const DOW    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function getDaysInMonth(year, month)  { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

function parseTime(t = "") {
  const [h = 0, m = 0] = String(t).split(":").map(Number);
  return h * 60 + (isNaN(m) ? 0 : m);
}

function layoutEvents(events) {
  const sorted = [...events].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  const cols = [];

  const assigned = sorted.map(ev => {
    const startMin = parseTime(ev.startTime);
    const endMin   = ev.endTime ? parseTime(ev.endTime) : startMin + 60;
    let col = cols.findIndex(end => end <= startMin);
    if (col === -1) { col = cols.length; cols.push(0); }
    cols[col] = endMin;
    return { ...ev, col, startMin, endMin };
  });

  return assigned.map(ev => {
    const totalCols = assigned
      .filter(o => o.startMin < ev.endMin && o.endMin > ev.startMin)
      .reduce((max, o) => Math.max(max, o.col + 1), 1);
    return { ...ev, totalCols };
  });
}

function EventDetail({ event, anchorPos, onClose }) {
  const ref = useRef(null);
  const { deleteTask } = useTasks();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const style = {
    top:  Math.min(anchorPos.y, window.innerHeight - 220),
    left: Math.min(anchorPos.x + 10, window.innerWidth - 260),
  };

  return (
    <div className="cal-detail-popup" style={style} ref={ref}>
      <button className="cal-detail-close" onClick={onClose}>✕</button>
      <div className="cal-detail-title">{event.title}</div>
      <div className="cal-detail-time">
        📅 {event.date} &nbsp; ⏰ {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}
      </div>
      {event.description && (
        <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#6b7280" }}>{event.description}</div>
      )}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          style={{ fontSize:"0.78rem", color:"#ef4444", background:"#fdeaea", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}
          onClick={() => { deleteTask(event.id); onClose(); }}
        >🗑 Xóa</button>
      </div>
    </div>
  );
}

function MonthView({ year, month, events, onCellClick, onEventClick }) {
  const firstDay    = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays    = getDaysInMonth(year, month - 1);
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i, m2 = month - 1 < 0 ? 11 : month - 1, y2 = month - 1 < 0 ? year - 1 : year;
    cells.push({ day: d, otherMonth: true, dateStr: toDateStr(y2, m2, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false, dateStr: toDateStr(year, month, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m2 = month + 1 > 11 ? 0 : month + 1, y2 = month + 1 > 11 ? year + 1 : year;
    cells.push({ day: d, otherMonth: true, dateStr: toDateStr(y2, m2, d) });
  }

  return (
    <div className="cal-grid">
      {cells.map((cell, idx) => {
        const isToday    = cell.dateStr === TODAY;
        const cellEvents = events
          .filter(e => e.date === cell.dateStr)
          .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

        return (
          <div
            key={idx}
            className={`cal-cell${cell.otherMonth ? " other-month" : ""}${isToday ? " today" : ""}`}
            onClick={() => onCellClick(cell.dateStr)}
          >
            <div className="cal-day-num">{cell.day}</div>
            <div className="cal-events" onClick={e => e.stopPropagation()}>
              {cellEvents.map(ev => {
                const color = COLOR_CATEGORY[ev.category] ?? COLOR_CATEGORY.other;
                return (
                  <div
                    key={ev.id}
                    className="cal-event cal-event--month"
                    style={{ backgroundColor: color.bg, color: color.text }}
                    onClick={e => { e.stopPropagation(); onEventClick(ev, e); }}
                    title={ev.title}
                  >
                    <span className="cal-event-time">{ev.startTime}</span>
                    <span className="cal-event-name">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const HOUR_HEIGHT = 56;

function WeekView({ year, month, weekOffset, events, onCellClick, onEventClick }) {
  const todayD = new Date(TODAY);
  const startOfWeek = new Date(todayD);
  startOfWeek.setDate(todayD.getDate() - todayD.getDay() + weekOffset * 7);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      label: DOW[i],
      num: d.getDate(),
      dateStr: toDateStr(d.getFullYear(), d.getMonth(), d.getDate()),
    });
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const totalH = 24 * HOUR_HEIGHT;

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="cal-week-header-row">
        <div className="cal-week-time-gutter"/>
        {weekDays.map((wd, i) => (
          <div key={i} className={`cal-week-day-header${wd.dateStr === TODAY ? " today-col" : ""}`}>
            {wd.label} {wd.num}
          </div>
        ))}
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        <div style={{ display: "flex" }}>
          <div className="cal-week-time-gutter" style={{ flexShrink: 0 }}>
            {hours.map(h => (
              <div key={h} className="cal-week-hour-label" style={{ height: HOUR_HEIGHT, boxSizing: "border-box" }}>
                {`${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {weekDays.map((wd, colIdx) => {
            const dayEvents  = events.filter(e => e.date === wd.dateStr);
            const positioned = layoutEvents(dayEvents);

            return (
              <div
                key={colIdx}
                className={`cal-week-col${wd.dateStr === TODAY ? " today-col" : ""}`}
                style={{ flex: 1, position: "relative", height: totalH, borderRight: "1px solid var(--cal-border, #e5e7eb)", boxSizing: "border-box" }}
                onClick={() => onCellClick(wd.dateStr)}
              >
                {hours.map(h => (
                  <div key={h} style={{ position: "absolute", top: h * HOUR_HEIGHT, left: 0, right: 0, height: HOUR_HEIGHT, borderTop: "1px solid var(--cal-border, #e5e7eb)", boxSizing: "border-box" }}/>
                ))}

                {positioned.map(ev => {
                  const color       = COLOR_CATEGORY[ev.category] ?? COLOR_CATEGORY.other;
                  const top         = (ev.startMin / 60) * HOUR_HEIGHT;
                  const height      = Math.max(((ev.endMin - ev.startMin) / 60) * HOUR_HEIGHT, 20);
                  const colWidthPct = 100 / ev.totalCols;
                  const leftPct     = ev.col * colWidthPct;

                  return (
                    <div
                      key={ev.id}
                      className="cal-event cal-event--week"
                      style={{ top, height, left: `calc(${leftPct}% + 1px)`, width: `calc(${colWidthPct}% - 2px)`, backgroundColor: color.bg, color: color.text }}
                      onClick={e => { e.stopPropagation(); onEventClick(ev, e); }}
                    >
                      <span className="cal-event-time" style={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ""}
                      </span>
                      <span className="cal-event-name" style={{ lineHeight: 1.3 }}>{ev.title}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { tasks } = useTasks();
  const todayDate = new Date(TODAY);
  const [viewYear,   setViewYear]   = useState(todayDate.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(todayDate.getMonth());
  const [view,       setView]       = useState("month");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal,  setShowModal]  = useState(false);
  const [modalDate,  setModalDate]  = useState(TODAY);
  const [detail,     setDetail]     = useState(null);

  const goToPrev = () => {
    if (view === "month") {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
      else setViewMonth(m => m - 1);
    } else {
      setWeekOffset(w => w - 1);
    }
  };

  const goToNext = () => {
    if (view === "month") {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
      else setViewMonth(m => m + 1);
    } else {
      setWeekOffset(w => w + 1);
    }
  };

  useEffect(() => {
    if (view !== "week") return;
    const todayD = new Date(TODAY);
    const startOfWeek = new Date(todayD);
    startOfWeek.setDate(todayD.getDate() - todayD.getDay() + weekOffset * 7);
    const midWeek = new Date(startOfWeek);
    midWeek.setDate(startOfWeek.getDate() + 3);
    setViewMonth(midWeek.getMonth());
    setViewYear(midWeek.getFullYear());
  }, [weekOffset, view]);

  const goToToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    setWeekOffset(0);
  };

  return (
    <div className="cal-page">
      <div className="cal-wrap">
        <div className="cal-toolbar">
          <button className="cal-nav-btn" onClick={goToPrev}>‹</button>
          <button className="cal-nav-btn" onClick={goToNext}>›</button>
          <button className="cal-today-btn" onClick={goToToday}>Hôm nay</button>
          <span className="cal-month-title">{MONTHS[viewMonth]} / {viewYear}</span>
          <div className="cal-view-toggle">
            <button className={`cal-view-btn${view === "month" ? " active" : ""}`} onClick={() => setView("month")}>Tháng</button>
            <button className={`cal-view-btn${view === "week"  ? " active" : ""}`} onClick={() => setView("week")}>Tuần</button>
          </div>
          <button className="cal-add-btn" onClick={() => { setModalDate(TODAY); setShowModal(true); }}>+ Thêm</button>
        </div>

        {view === "month" && (
          <div className="cal-dow-row">
            {DOW.map(d => <div key={d} className="cal-dow-cell">{d}</div>)}
          </div>
        )}

        {view === "month" ? (
          <MonthView
            year={viewYear} month={viewMonth}
            events={tasks}
            onCellClick={(d) => { setModalDate(d); setShowModal(true); }}
            onEventClick={(ev, e) => setDetail({ event: ev, pos: { x: e.clientX, y: e.clientY } })}
          />
        ) : (
          <WeekView
            year={viewYear} month={viewMonth} weekOffset={weekOffset}
            events={tasks}
            onCellClick={(d) => { setModalDate(d); setShowModal(true); }}
            onEventClick={(ev, e) => setDetail({ event: ev, pos: { x: e.clientX, y: e.clientY } })}
          />
        )}
      </div>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} defaultDate={modalDate} />}
      {detail && <EventDetail event={detail.event} anchorPos={detail.pos} onClose={() => setDetail(null)} />}
    </div>
  );
}