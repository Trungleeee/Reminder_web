import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer.js";
import Calendar from "./pages/Calendar";
import Home from "./pages/Home";
import Task from "./pages/Task";
import Timer from "./pages/Timer";
import Matrix from "./pages/Matrix";
import NoMatch from "./pages/NoMatch.js";
import { TaskProvider } from "./pages/Share/TaskContext.js";
import { AuthProvider } from "./pages/Sign_in";
import SignIn from "./pages/Sign_in";

// Các path muốn ẩn Header + Footer
const HIDE_LAYOUT_PATHS = ["/sign_in/admin"];

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
              <Route path="/"          element={<Home />} />
              <Route path="/calendar"  element={<Calendar />} />
              <Route path="/task"      element={<Task />} />
              <Route path="/matrix"    element={<Matrix />} />
              <Route path="/timer"     element={<Timer />} />
              <Route path="/sign_in/*" element={<SignIn />} />
              <Route path="*"          element={<NoMatch />} />
            </Routes>
          </Layout>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;