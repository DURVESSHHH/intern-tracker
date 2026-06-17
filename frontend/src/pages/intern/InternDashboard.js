import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { format, differenceInDays } from 'date-fns';

function CheckInRing({ today, onAction, loading }) {
  const isCheckedIn = !!today?.checkIn;
  const isCheckedOut = !!today?.checkOut;
  const progress = isCheckedOut ? 100 : isCheckedIn ? 50 : 0;
  const r = 64, circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div style={{ textAlign:'center' }}>
      <div className="checkin-ring" onClick={!loading && !isCheckedOut ? onAction : undefined} style={{ cursor: isCheckedOut ? 'default' : 'pointer' }}>
        <svg viewBox="0 0 160 160">
          <circle className="track" cx="80" cy="80" r={r} />
          <circle className="progress" cx="80" cy="80" r={r} strokeDasharray={circ} strokeDashoffset={offset}
            stroke={isCheckedOut ? 'var(--accent-light)' : isCheckedIn ? 'var(--amber)' : 'var(--emerald)'} />
        </svg>
        <div className={`checkin-btn-inner ${isCheckedIn ? 'checked-in' : ''}`}>
          <div className="checkin-btn-icon">{isCheckedOut ? '✅' : isCheckedIn ? '⏱️' : '▶️'}</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.85rem', color:'var(--text-primary)' }}>
            {loading ? '…' : isCheckedOut ? 'Done' : isCheckedIn ? 'Check Out' : 'Check In'}
          </div>
          <div className="checkin-btn-label">{isCheckedOut ? 'Completed' : isCheckedIn ? 'Tap to leave' : 'Tap to start'}</div>
        </div>
      </div>
      <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
        {today?.checkIn && <span>In: <strong style={{ color:'var(--text-primary)' }}>{format(new Date(today.checkIn),'HH:mm')}</strong></span>}
        {today?.checkIn && today?.checkOut && <span style={{ margin:'0 0.5rem' }}>·</span>}
        {today?.checkOut && <span>Out: <strong style={{ color:'var(--text-primary)' }}>{format(new Date(today.checkOut),'HH:mm')}</strong></span>}
      </div>
      {today?.status && <span className={`badge badge-${today.status}`} style={{ marginTop:'0.5rem' }}>{today.status}</span>}
    </div>
  );
}

export default function InternDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [today, setToday] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attStats, setAttStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attendance/today'),
      api.get('/tasks/my?status=pending'),
      api.get('/attendance/my'),
    ]).then(([t, tk, att]) => {
      setToday(t.data.data);
      setTasks(tk.data.data.slice(0,4));
      setAttStats(att.data.stats);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, []);

  const handleCheckInOut = async () => {
    setLoading(true);
    try {
      if (!today?.checkIn) {
        const { data } = await api.post('/attendance/checkin');
        setToday(data.data);
        addToast(data.data.status === 'late' ? 'Checked in — marked as late.' : 'Checked in! Have a productive day.', data.data.status === 'late' ? 'info' : 'success');
      } else {
        const { data } = await api.put('/attendance/checkout');
        setToday(data.data);
        addToast(`Great work! ${data.data.hoursWorked}h logged today.`, 'success');
      }
    } catch (err) { addToast(err.response?.data?.message || 'Action failed.', 'error'); }
    finally { setLoading(false); }
  };

  const daysLeft = user?.internshipEnd ? differenceInDays(new Date(user.internshipEnd), new Date()) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (dataLoading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <p className="text-muted text-sm">{greeting},</p>
        <h1 style={{ marginTop:'0.1rem' }}>{user?.name} 🎯</h1>
        {daysLeft !== null && (
          <p className="text-muted text-sm" style={{ marginTop:'0.25rem' }}>
            {daysLeft > 0 ? `${daysLeft} days remaining in internship` : daysLeft === 0 ? 'Last day of internship!' : 'Internship completed'}
          </p>
        )}
      </div>

      <div className="page-body">
        <div className="grid-2 mb-3">
          {/* Check-in card */}
          <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem' }}>
            <div style={{ width:'100%' }}>
              <h3 style={{ marginBottom:'0.25rem' }}>Today's Attendance</h3>
              <p className="text-muted text-sm">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
            </div>
            <CheckInRing today={today} onAction={handleCheckInOut} loading={loading} />
          </div>

          {/* This month stats */}
          <div className="card">
            <h3 className="mb-2">This Month</h3>
            {attStats ? (
              <>
                {[
                  { label:'Present', val:attStats.present, color:'var(--emerald)', max: attStats.present+attStats.absent+attStats.late+attStats.leave },
                  { label:'Late',    val:attStats.late,    color:'var(--amber)' },
                  { label:'Leave',   val:attStats.leave,   color:'var(--accent-light)' },
                ].map(item => (
                  <div className="progress-bar-wrap" key={item.label}>
                    <div className="progress-bar-label"><span>{item.label}</span><span style={{ color:item.color, fontWeight:600 }}>{item.val} days</span></div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: item.max ? `${(item.val/item.max)*100}%` : '0%', background:item.color }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop:'1.25rem', padding:'0.875rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Total hours logged</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--accent-light)' }}>{attStats.totalHours}h</span>
                </div>
              </>
            ) : <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">No data yet</div></div>}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3>Pending Tasks</h3>
            <Link to="/intern/tasks" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {tasks.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {tasks.map(task => (
                <div key={task._id} style={{ padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'0.25rem' }}>{task.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Due: {task.dueDate ? format(new Date(task.dueDate),'dd MMM yyyy') : '—'}</div>
                  </div>
                  <div className="flex gap-1" style={{ alignItems:'center' }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-desc">No pending tasks right now.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
