import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiUser, FiLogOut, FiShield } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiUsers /> },
    { name: "Profile", path: "/profile", icon: <FiUser /> },
  ];

  // Add Admin link if user is ADMIN
  if (user?.role === "ADMIN") {
    navItems.push({ name: "Admin Panel", path: "/admin", icon: <FiShield /> });
  }

  return (
    <div className="d-flex flex-column h-100 p-4">
      <div className="mb-5 px-2">
        <h3 className="fw-bold text-primary mb-0">ContactHub</h3>
        <p className="text-muted small">Professional CRM</p>
      </div>

      <nav className="flex-grow-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-link-custom ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-top">
        <div className="d-flex align-items-center gap-3 mb-4 px-2">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="mb-0 fw-bold small text-truncate">{user?.email}</p>
            <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="btn btn-link nav-link-custom text-danger w-100 border-0 text-start"
        >
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
