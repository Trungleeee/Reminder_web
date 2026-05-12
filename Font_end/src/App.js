import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer.js";
import Calendar from "./pages/Calendar";
import Home from "./pages/Home";
import Task from "./pages/Task";
import Timer from "./pages/Timer";
import Matrix from "./pages/Matrix";
import NoMatch from "./pages/NoMatch.js";
import { TaskProvider } from "./pages/Share/TaskContext.js";
import { AuthProvider, useAuth } from "./pages/Sign_in";
import SignIn from "./pages/Sign_in";

const HIDE_LAYOUT_PATHS = ["/sign_in/admin"];

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", fontSize:28 }}>⏳</div>;
  return user ? children : <Navigate to="/sign_in" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/task" replace /> : children;
}
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = HIDE_LAYOUT_PATHS.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="apps">
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <Layout>
            <Routes>
              <Route path="/"          element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/sign_in/*" element={<SignIn />} />

              <Route path="/task"     element={<ProtectedRoute><Task /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/matrix"   element={<ProtectedRoute><Matrix /></ProtectedRoute>} />
              <Route path="/timer"    element={<ProtectedRoute><Timer /></ProtectedRoute>} />

              <Route path="*"         element={<NoMatch />} />
            </Routes>
          </Layout>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;