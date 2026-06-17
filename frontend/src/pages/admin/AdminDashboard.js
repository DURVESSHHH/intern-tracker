import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR = { pending:'var(--accent-light)', 'in-progress':'#22d3ee', submitted:'#a78bfa', approved:'var(--emerald)', rejected:'var(--rose)' };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/dashboard-stats').then(r => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const chartData = stats?.recentTasks
    ? [
        { name: 'Pending', count: stats.pendingTasks },
        { name: 'Submitted', count: stats.submittedTasks },
        { name: 'Total', count: stats.totalTasks },
      ]
    : [];

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted text-sm">{greeting},</p>
            <h1 style={{ marginTop:'0.1rem' }}>{user?.name} 👋</h1>
          </div>
          <div className="flex gap-1">
            <Link to="/admin/interns" className="btn btn-secondary btn-sm">Manage Interns</Link>
            <Link to="/admin/tasks" className="btn btn-primary btn-sm">+ Assign Task</Link>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Stat Cards */}
        <div className="card-grid mb-3">
          <div className="stat-card accent">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats?.totalInterns ?? '—'}</div>
            <div className="stat-label">Active Interns</div>
          </div>
          <div className="stat-card emerald">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{stats?.presentToday ?? '—'}</div>
            <div className="stat-label">Present Today</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats?.pendingTasks ?? '—'}</div>
            <div className="stat-label">Pending Tasks</div>
          </div>
          <div className="stat-card rose">
            <div className="stat-icon">📬</div>
            <div className="stat-value">{stats?.submittedTasks ?? '—'}</div>
            <div className="stat-label">Awaiting Review</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Recent Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3>Recent Tasks</h3>
              <Link to="/admin/tasks" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            {stats?.recentTasks?.length > 0 ? (
              <div className="timeline">
                {stats.recentTasks.map(task => (
                  <div className="timeline-item" key={task._id}>
                    <div className="timeline-dot" style={{ borderColor: STATUS_COLOR[task.status] || 'var(--border)' }}>
                      {task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : '🔵'}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{task.title}</div>
                      <div className="timeline-meta">
                        {task.assignedTo?.name} · <span style={{ color: STATUS_COLOR[task.status] }}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No tasks yet</div></div>
            )}
          </div>

          {/* Task Overview Chart */}
          <div className="card">
            <h3 className="mb-2">Task Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)' }}
                  cursor={{ fill:'var(--accent-glow)' }}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop:'1rem' }}>
              {[
                { label:'Total Tasks', val: stats?.totalTasks, color:'var(--accent-light)' },
                { label:'Pending + In Progress', val: stats?.pendingTasks, color:'var(--amber)' },
                { label:'Awaiting Review', val: stats?.submittedTasks, color:'#a78bfa' },
              ].map(item => (
                <div key={item.label} className="progress-bar-wrap">
                  <div className="progress-bar-label">
                    <span>{item.label}</span>
                    <span style={{ color: item.color, fontWeight:600 }}>{item.val ?? 0}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: stats?.totalTasks ? `${Math.min(100, ((item.val||0)/(stats.totalTasks||1))*100)}%` : '0%',
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="card mt-2">
          <h3 className="mb-2">Quick Actions</h3>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <Link to="/admin/attendance" className="btn btn-secondary">📅 Mark Attendance</Link>
            <Link to="/admin/tasks" className="btn btn-secondary">📋 Create Task</Link>
            <Link to="/admin/interns" className="btn btn-secondary">👥 View Interns</Link>
            <Link to="/admin/reports" className="btn btn-secondary">📊 Generate Report</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
