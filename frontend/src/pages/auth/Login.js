import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      addToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/intern/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero-grid" />
        <div className="auth-hero-content">
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' }}>
            <div className="logo-icon" style={{ width:44, height:44, fontSize:'1.3rem' }}>🎯</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.3rem' }}>InternTrack</span>
          </div>
          <h1>Track progress.<br /><span>Build careers.</span></h1>
          <p style={{ marginTop:'1rem' }}>
            A complete platform for managing intern attendance, assigning tasks, monitoring performance, and delivering feedback — all in one place.
          </p>
          <div className="auth-features">
            {[
              { icon:'📅', title:'Smart Attendance', desc:'Check-in/out tracking with late detection' },
              { icon:'📋', title:'Task Workflows', desc:'Assign, submit, review, and grade tasks' },
              { icon:'📊', title:'Live Reports', desc:'Per-intern performance and attendance reports' },
            ].map(f => (
              <div className="auth-feature" key={f.title}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--text-primary)' }}>{f.title}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <h2 className="auth-heading">Sign in</h2>
          <p className="auth-subheading">Enter your credentials to access the platform.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary w-full btn-lg" type="submit" disabled={loading} style={{ marginTop:'0.5rem' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.875rem', color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent-light)', fontWeight:600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
