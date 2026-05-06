import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import DashBoard from "./pages/DashBoard";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/Sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router basename="/ContactHub">
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        {/* Sidebar only for authenticated users */}
        {user && (
          <aside className="glass-card m-3 position-sticky top-0" style={{ width: "var(--sidebar-width)", height: "calc(100vh - 32px)" }}>
            <Sidebar />
          </aside>
        )}

        <main className="flex-grow-1 p-4" style={{ overflowX: 'hidden' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                {user?.role === "ADMIN" ? <div>Admin Panel (Work in Progress)</div> : <Navigate to="/dashboard" />}
              </ProtectedRoute>
            } />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
