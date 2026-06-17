import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import Sidebar from './components/shared/Sidebar';

// Admin
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminTasks      from './pages/admin/AdminTasks';
import AdminInterns    from './pages/admin/AdminInterns';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminReports    from './pages/admin/AdminReports';

// Intern
import InternDashboard  from './pages/intern/InternDashboard';
import InternTasks      from './pages/intern/InternTasks';
import InternAttendance from './pages/intern/InternAttendance';
import InternProfile    from './pages/intern/InternProfile';

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/intern/dashboard'} replace />;
  return children;
}

// ─── App Shell with Sidebar ───────────────────────────────────────────────────
function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={user ? <Navigate to={user.role==='admin'?'/admin/dashboard':'/intern/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role==='admin'?'/admin/dashboard':'/intern/dashboard'} replace /> : <Register />} />

      {/* Admin */}
      <Route path="/admin/dashboard"  element={<RequireAuth role="admin"><AppShell><AdminDashboard /></AppShell></RequireAuth>} />
      <Route path="/admin/interns"    element={<RequireAuth role="admin"><AppShell><AdminInterns /></AppShell></RequireAuth>} />
      <Route path="/admin/tasks"      element={<RequireAuth role="admin"><AppShell><AdminTasks /></AppShell></RequireAuth>} />
      <Route path="/admin/attendance" element={<RequireAuth role="admin"><AppShell><AdminAttendance /></AppShell></RequireAuth>} />
      <Route path="/admin/reports"    element={<RequireAuth role="admin"><AppShell><AdminReports /></AppShell></RequireAuth>} />

      {/* Intern */}
      <Route path="/intern/dashboard"  element={<RequireAuth role="intern"><AppShell><InternDashboard /></AppShell></RequireAuth>} />
      <Route path="/intern/tasks"      element={<RequireAuth role="intern"><AppShell><InternTasks /></AppShell></RequireAuth>} />
      <Route path="/intern/attendance" element={<RequireAuth role="intern"><AppShell><InternAttendance /></AppShell></RequireAuth>} />
      <Route path="/intern/profile"    element={<RequireAuth role="intern"><AppShell><InternProfile /></AppShell></RequireAuth>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'var(--bg-base)' }}>
          <div style={{ fontSize:'4rem' }}>404</div>
          <h2>Page not found</h2>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
