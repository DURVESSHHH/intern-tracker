import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/admin/interns',   icon: '👥', label: 'Interns' },
  { to: '/admin/tasks',     icon: '📋', label: 'Tasks' },
  { to: '/admin/attendance',icon: '📅', label: 'Attendance' },
  { to: '/admin/reports',   icon: '📊', label: 'Reports' },
];

const internLinks = [
  { to: '/intern/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/intern/tasks',     icon: '📋', label: 'My Tasks' },
  { to: '/intern/attendance',icon: '📅', label: 'My Attendance' },
  { to: '/intern/profile',   icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : internLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🎯</div>
          <div>
            <div className="logo-text">InternTrack</div>
            <div className="logo-sub">
              {user?.role === 'admin' ? 'Admin Portal' : 'Intern Portal'}
            </div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: '2rem' }}>Account</div>
        <button className="nav-item w-full" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <span className="nav-icon">🚪</span>
          Sign Out
        </button>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role} · {user?.department || 'General'}</div>
        </div>
      </div>
    </aside>
  );
}
