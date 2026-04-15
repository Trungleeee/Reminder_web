import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { FaGoogle, FaFacebook, FaLock, FaEnvelope, FaIdCard, FaSignOutAlt, FaCheckCircle } from "react-icons/fa";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Admin from "../components/admin";
import "./Sign_in.css";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyAjglxTi3oP7ZNXW6IaiL5yRVXfVSKxakQ",
  authDomain: "reminder-39fc5.firebaseapp.com",
  projectId: "reminder-39fc5",
  storageBucket: "reminder-39fc5.firebasestorage.app",
  messagingSenderId: "580764158170",
  appId: "1:580764158170:web:4e305438296b2a2d85bde3",
});

const firebaseAuth = getAuth(firebaseApp);

// ═══════════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════════
const API_BASE = "http://localhost:5000/api";
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || token === "undefined") { setLoading(false); return; }
    fetch(`${API_BASE}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser({
        id: data.user._id, name: data.user.name,
        email: data.user.email, createdAt: data.user.createdAt,
        role: data.user.role,
      }))
      .catch(() => { localStorage.removeItem("token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const saveAuth = (newToken, newUser) => {
    if (!newToken || newToken === "undefined") return;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    window.dispatchEvent(new Event("authChange"));
  };

  const login = useCallback(async ({ email, password }) => {
    const res  = await fetch(`${API_BASE}/auth/sign_in`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
    const token = data.accessToken;
    if (!token) throw new Error("Không nhận được token");
    saveAuth(token, { id: data.user._id, name: data.user.name, email: data.user.email, createdAt: data.user.createdAt, role: data.user.role });
    return data.user;
  }, []);

  const socialLogin = useCallback(async (providerName) => {
    const provider = new GoogleAuthProvider();
    const result  = await signInWithPopup(firebaseAuth, provider);
    const idToken = await result.user.getIdToken();

    const res  = await fetch(`${API_BASE}/auth/social-login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

    saveAuth(data.accessToken, {
      id: data.user.id, name: data.user.name,
      email: data.user.email, createdAt: data.user.createdAt,
      role: data.user.role,
    });
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null); setUser(null);
    window.dispatchEvent(new Event("authChange"));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, socialLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
}

// ═══════════════════════════════════════════════════════════
// ROUTE GUARDS
// ═══════════════════════════════════════════════════════════
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", fontSize:28 }}>⏳</div>;
  return user ? children : <Navigate to="/sign_in" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/sign_in/login" replace />;
  return user.role === "admin"
    ? children
    : <Navigate to="/sign_in/profile" replace />;
}

function GuestRoute({ children }) {
  const { user } = useAuth();

  return !user
    ? children
    : <Navigate to={user.role === "admin" ? "/sign_in/admin" : "/sign_in/profile"} replace />;
}

// ═══════════════════════════════════════════════════════════
// SIGN IN PAGE
// ═══════════════════════════════════════════════════════════
function SignIn() {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Vui lòng nhập đầy đủ thông tin."); return; }
    setLoading(true); setError("");
    try {
      const userData = await login({ email, password });
      navigate(userData.role === "admin" ? "/sign_in/admin" : "/sign_in/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally { setLoading(false); }
  };

  const handleSocial = async (provider) => {
    setLoading(true); setError("");
    try {
      const userData = await socialLogin(provider);
      navigate(userData.role === "admin" ? "/sign_in/admin" : "/sign_in/profile", { replace: true });
    } catch (err) {
      setError(err.message || `Đăng nhập ${provider} thất bại.`);
    } finally { setLoading(false); }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">🌿</div>
          <h1 className="signin-title">Chào mừng trở lại</h1>
          <p className="signin-sub">Đăng nhập để tiếp tục</p>
        </div>
        <div className="signin-body">
          <div className="signin-input-box">
            <FaEnvelope className="signin-icon" />
            <input type="email" placeholder="Email" className="signin-input"
              value={email} disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              onChange={(e) => { setEmail(e.target.value); setError(""); }} />
          </div>
          <div className="signin-input-box">
            <FaLock className="signin-icon" />
            <input type="password" placeholder="Mật khẩu" className="signin-input"
              value={password} disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              onChange={(e) => { setPassword(e.target.value); setError(""); }} />
          </div>

          <p style={{ textAlign: "right", margin: "-4px 0 8px" }}>
            <span className="signin-link" onClick={() => navigate("/sign_in/forgot")}>
              Quên mật khẩu?
            </span>
          </p>

          {error && <p className="signin-error">{error}</p>}

          <button className="signin-btn-main" onClick={handleLogin} disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <div className="signin-divider"><span>hoặc</span></div>

          <button className="signin-btn-google" onClick={() => handleSocial("google")} disabled={loading}>
            <FaGoogle /> Đăng nhập với Google
          </button>
          <button className="signin-btn-facebook" onClick={() => handleSocial("facebook")} disabled={loading}>
            <FaFacebook /> Đăng nhập với Facebook
          </button>

          <p className="signin-footer-text">
            Chưa có tài khoản?{" "}
            <span className="signin-link" onClick={() => navigate("/sign_in/register")}>Đăng ký</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════
function ForgotPassword() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) { setError("Vui lòng nhập email."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Truyền email qua location state
      navigate("/sign_in/reset", { state: { email } });
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">🔒</div>
          <h1 className="signin-title">Quên mật khẩu</h1>
          <p className="signin-sub">Nhập email để nhận mã OTP</p>
        </div>
        <div className="signin-body">
          <div className="signin-input-box">
            <FaEnvelope className="signin-icon" />
            <input type="email" placeholder="Email của bạn" className="signin-input"
              value={email} disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onChange={(e) => { setEmail(e.target.value); setError(""); }} />
          </div>
          {error && <p className="signin-error">{error}</p>}
          <button className="signin-btn-main" onClick={handleSend} disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
          <p className="signin-footer-text">
            <span className="signin-link" onClick={() => navigate("/sign_in")}>← Quay lại đăng nhập</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════
function ResetPassword() {
  const navigate  = useNavigate();
  const location  = useLocation();
  // Lấy email từ location.state (được truyền từ ForgotPassword)
  const email     = location.state?.email;

  const [step,        setStep]        = useState(1);
  const [otp,         setOtp]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [loading,     setLoading]     = useState(false);

  // Nếu không có email (vào thẳng URL), redirect về forgot
  useEffect(() => {
    if (!email) navigate("/sign_in/forgot", { replace: true });
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError("Vui lòng nhập mã OTP 6 số."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message || "OTP không hợp lệ hoặc đã hết hạn.");
    } finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (!newPassword || !confirm)    { setError("Vui lòng điền đầy đủ."); return; }
    if (newPassword !== confirm)     { setError("Mật khẩu không khớp."); return; }
    if (newPassword.length < 6)      { setError("Mật khẩu tối thiểu 6 ký tự."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => navigate("/sign_in", { replace: true }), 2000);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-success">
          <FaCheckCircle className="signin-success-icon" />
          <p>Đặt lại mật khẩu thành công!</p>
          <span>Đang chuyển về đăng nhập...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">{step === 1 ? "✉️" : "🔑"}</div>
          <h1 className="signin-title">{step === 1 ? "Nhập mã OTP" : "Mật khẩu mới"}</h1>
          <p className="signin-sub">
            {step === 1
              ? <>Mã đã gửi đến <strong>{email}</strong></>
              : "Tạo mật khẩu mới cho tài khoản"}
          </p>
        </div>
        <div className="signin-body">
          {step === 1 ? (
            <>
              <div className="signin-input-box">
                <FaLock className="signin-icon" />
                <input type="text" placeholder="Mã OTP 6 số" className="signin-input"
                  value={otp} disabled={loading} maxLength={6}
                  onChange={(e) => { setOtp(e.target.value); setError(""); }} />
              </div>
              {error && <p className="signin-error">{error}</p>}
              <button className="signin-btn-main" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Xác nhận OTP"}
              </button>
              <p className="signin-footer-text">
                <span className="signin-link" onClick={() => navigate("/sign_in/forgot")}>← Gửi lại OTP</span>
              </p>
            </>
          ) : (
            <>
              <div className="signin-input-box">
                <FaLock className="signin-icon" />
                <input type="password" placeholder="Mật khẩu mới" className="signin-input"
                  value={newPassword} disabled={loading}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }} />
              </div>
              <div className="signin-input-box">
                <FaLock className="signin-icon" />
                <input type="password" placeholder="Xác nhận mật khẩu mới" className="signin-input"
                  value={confirm} disabled={loading}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }} />
              </div>
              {error && <p className="signin-error">{error}</p>}
              <button className="signin-btn-main" onClick={handleReset} disabled={loading}>
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIGN UP
// ═══════════════════════════════════════════════════════════
function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" }); setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name     = "Vui lòng nhập họ tên.";
    if (!form.email.trim())   errs.email    = "Vui lòng nhập email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email không hợp lệ.";
    if (!form.password)       errs.password = "Vui lòng nhập mật khẩu.";
    else if (form.password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (!form.confirm)        errs.confirm  = "Vui lòng xác nhận mật khẩu.";
    else if (form.confirm !== form.password) errs.confirm = "Mật khẩu không khớp.";
    return errs;
  };

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true); setApiError("");
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate("/sign_in", { replace: true }), 1800);
    } catch (err) {
      setApiError(err.message || "Đăng ký thất bại.");
    } finally { setLoading(false); }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">🌿</div>
          <h1 className="signin-title">Tạo tài khoản</h1>
          <p className="signin-sub">Tham gia cùng chúng tôi hôm nay</p>
        </div>
        {success ? (
          <div className="signin-success">
            <FaCheckCircle className="signin-success-icon" />
            <p>Đăng ký thành công!</p>
            <span>Đang chuyển hướng...</span>
          </div>
        ) : (
          <div className="signin-body">
            {apiError && <p className="signin-error">{apiError}</p>}
            {[
              { field: "name",     type: "text",     icon: <FaIdCard />,   ph: "Họ và tên"         },
              { field: "email",    type: "email",    icon: <FaEnvelope />, ph: "Email"              },
              { field: "password", type: "password", icon: <FaLock />,     ph: "Mật khẩu"           },
              { field: "confirm",  type: "password", icon: <FaLock />,     ph: "Xác nhận mật khẩu" },
            ].map(({ field, type, icon, ph }) => (
              <div key={field}>
                <div className="signin-input-box">
                  <span className="signin-icon">{icon}</span>
                  <input type={type} placeholder={ph} disabled={loading}
                    className={`signin-input ${errors[field] ? "signin-input-error" : ""}`}
                    value={form[field]} onChange={update(field)} />
                </div>
                {errors[field] && <p className="signin-error">{errors[field]}</p>}
              </div>
            ))}
            <button className="signin-btn-main" onClick={handleRegister} disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
            <p className="signin-footer-text">
              Đã có tài khoản?{" "}
              <span className="signin-link" onClick={() => navigate("/sign_in")}>Đăng nhập</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════
function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "??";
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })
    : "Không rõ";
  const handleLogout = () => { logout(); navigate("/sign_in", { replace: true }); };

  return (
    <div className="signin-page signin-profile-page">
      <div className="signin-card signin-profile-card">
        <div className="signin-profile-cover" />
        <div className="signin-profile-avatar-wrap">
          <div className="signin-profile-avatar">{initials}</div>
        </div>
        <div className="signin-profile-body">
          <h2 className="signin-profile-name">{user?.name}</h2>
          <p className="signin-profile-email">{user?.email}</p>
          <div className="signin-profile-divider" />
          <div className="signin-profile-info-grid">
            <div className="signin-profile-info-item">
              <span className="signin-profile-info-label">Trạng thái</span>
              <span className="signin-profile-info-value signin-status-active">
                <span className="signin-status-dot" /> Đang hoạt động
              </span>
            </div>
            <div className="signin-profile-info-item">
              <span className="signin-profile-info-label">Ngày tham gia</span>
              <span className="signin-profile-info-value">{joinDate}</span>
            </div>
            <div className="signin-profile-info-item">
              <span className="signin-profile-info-label">Vai trò</span>
              <span className="signin-profile-info-value">Thành viên</span>
            </div>
            <div className="signin-profile-info-item">
              <span className="signin-profile-info-label">Gói dịch vụ</span>
              <span className="signin-profile-info-value">Miễn phí</span>
            </div>
          </div>
          <button className="signin-btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROUTER
// ═══════════════════════════════════════════════════════════
function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 28 }}>
      ⏳
    </div>
  );

  return (
    <Routes>
      {/* Guest-only routes */}
        <Route index element={<SignIn />} />
        <Route path="register" element={<GuestRoute><SignUp /></GuestRoute>} />
        <Route path="forgot"   element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="reset"    element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
          {/* Default redirect */}
      <Route path="*" element={
        <Navigate to={user?.role === "admin" ? "/sign_in/admin" : user ? "/sign_in/profile" : "/sign_in"} replace />
      } />
    </Routes>
  );
}

export default function Sign_in() {
  return <AppRouter />;
}

export { useAuth, AuthProvider };