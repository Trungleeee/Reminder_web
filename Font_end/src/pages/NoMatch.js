import { useNavigate } from "react-router-dom";

export default function NoMatch() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "60vh", gap: 12, textAlign: "center"
    }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: "#111" }}>404</h1>
      <p style={{ color: "#6B7280", fontSize: 16 }}>Trang bạn tìm không tồn tại.</p>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 8, padding: "10px 24px", borderRadius: 8,
          background: "#22c55e", color: "#fff", border: "none",
          fontSize: 15, cursor: "pointer", fontWeight: 600
        }}
      >
        ← Về trang chủ
      </button>
    </div>
  );
}