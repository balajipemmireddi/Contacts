import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/authContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import DashBoard from "./pages/DashBoard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (isAuthenticated) {
    return (
      <div className="glass-card p-5 text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h1 style={{ color: 'var(--accent)' }}>Welcome to Contacts Manager</h1>
        <p className="mt-3">You are logged in. Navigate using the sidebar to manage your contacts.</p>
        <Link to="/dashboard" className="btn btn-primary mt-3">Go to Dashboard</Link>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-5 text-center" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1 style={{ color: 'var(--accent)' }}>Welcome to Contacts Manager</h1>
      <p className="mt-3">Please login or signup to manage your contacts.</p>
      <div className="mt-4">
        <Link to="/login" className="btn btn-primary me-3">Login</Link>
        <Link to="/signup" className="btn btn-outline-primary">Signup</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
