import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import '../index.css'; // ensures CSS utilities are loaded

export default function Sidebar() {
  const { isAuthenticated, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar glass-card">
      <h2 className="text-center mb-4" style={{ color: 'var(--accent)' }}>Contacts Manager</h2>
      <nav>
        <Link to="/dashboard" className="nav-link" >Dashboard</Link>
        <Link to="/profile" className="nav-link" >Profile</Link>
        {role === 'ADMIN' && <Link to="/admin" className="nav-link" >Admin</Link>}
        {isAuthenticated && (
          <button className="btn btn-outline-light mt-3" onClick={handleLogout}>Logout</button>
        )}
      </nav>
    </div>
  );
}
