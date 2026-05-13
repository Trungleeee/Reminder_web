import { createContext, useContext,useCallback , useEffect, useState } from "react";
import axios from "axios";

const TaskContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchTasks = useCallback(async () => {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return;
  try {
    setLoading(true);
    const res = await axios.get(`${API_URL}/reminders`, getAuthHeader());
    const normalized = (res.data.reminders || []).map((t) => ({
      id:          t._id,
      title:       t.title || "",
      description: t.description || "",
      date:        t.date,
      startTime:   t.startTime,
      endTime:     t.endTime,
      priority:    t.priority || "Medium",
      category:    t.category || "work",
      done:        t.status === "DONE",
    }));
    setTasks(normalized);
  } catch (error) {
    console.error("Lỗi fetch tasks:", error);
  } finally {
    setLoading(false);
  }
}, []); 

  const addTask = async (data) => {
    
    try {
      const payload = {
        title:       data.title?.trim(),
        description: data.description?.trim() || "",
        date:        data.date,
        startTime:   data.startTime,
        endTime:     data.endTime || data.startTime,
        priority:    ["Low", "Medium", "High", "Super"].includes(data.priority)
                      ? data.priority : "Medium",
        category:    ["work", "study", "personal", "health", "other"].includes(data.category)
                      ? data.category : "work",
      };
      console.log("Gửi lên backend:", payload); 
      const res = await axios.post(`${API_URL}/reminders`, payload, getAuthHeader());
      console.log("Backend trả về:", res.data);  
      fetchTasks();
    } catch (error) {
      console.log("FULL ERROR:", error.response?.data);
    }
  };

  const toggleDone = async (id) => {
  const task = tasks.find(t => t.id === id);
  const newDone = !task.done;

  setTasks(prev =>
    prev.map(t => t.id === id ? { ...t, done: newDone } : t)
  );

  try {
    if (newDone) {
      // Hoàn thành → gọi /complete
      await axios.patch(
        `${API_URL}/reminders/${id}/complete`,
        {},
        getAuthHeader()
      );

      // Hiện browser notification
      if (Notification.permission === "granted") {
        new Notification("✅ Hoàn thành task!", {
          body: `Bạn đã hoàn thành "${task.title}"`,
          icon: "/logo192.png",
        });
      }
      } else {
        // Bỏ hoàn thành → gọi /status
        await axios.patch(
          `${API_URL}/reminders/${id}/status`,
          { status: "TODO" },
          getAuthHeader()
        );
      }
    } catch (error) {
    console.error("Toggle error:", error.response?.data);
    fetchTasks();
  }
};

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/reminders/${id}`, getAuthHeader());
      fetchTasks();
    } catch (error) {
      console.error("Lỗi xóa task:", error);
    }
  };
  useEffect(() => {
  const handleAuthChange = () => {
    setToken(localStorage.getItem("token"));
  };
  window.addEventListener("authChange", handleAuthChange);
  return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);
  useEffect(() => {
      if (token && token !== "undefined" && token !== "null") {
        fetchTasks();
      } else {
        setTasks([]); // clear khi logout
      }
  }, [token, fetchTasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, deleteTask, toggleDone }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}