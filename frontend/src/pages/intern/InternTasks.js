import React, { useEffect, useState, useCallback } from 'react';
import { format, isPast } from 'date-fns';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function SubmitModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({ content:'', fileUrl:'' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try { await api.post(`/tasks/${task._id}/submit`, form); addToast('Task submitted!', 'success'); onSave(); }
    catch (err) { addToast(err.response?.data?.message || 'Submit failed.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Submit Task</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', marginBottom:'1.25rem' }}>
          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{task.title}</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>{task.description}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Work / Summary</label>
            <textarea className="form-textarea" style={{ minHeight:140 }} placeholder="Describe what you've done, key decisions made, challenges faced…" value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Link / URL (optional)</label>
            <input className="form-input" placeholder="https://github.com/you/repo or Google Drive link" value={form.fileUrl} onChange={e=>setForm(f=>({...f,fileUrl:e.target.value}))} />
          </div>
          <div className="flex gap-1" style={{ justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Submitting…':'Submit Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeedbackModal({ task, onClose }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Task Feedback</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', marginBottom:'1.25rem' }}>
          <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'0.5rem' }}>{task.title}</div>
          <span className={`badge badge-${task.status}`}>{task.status}</span>
          {task.submission?.grade && <span className="badge badge-present" style={{ marginLeft:'0.5rem' }}>{task.submission.grade}</span>}
        </div>
        {task.submission?.feedback ? (
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)', marginBottom:'0.5rem' }}>Feedback from admin</div>
            <div style={{ padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', color:'var(--text-primary)', lineHeight:1.7 }}>{task.submission.feedback}</div>
            {task.submission.feedbackAt && <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.5rem' }}>Reviewed {format(new Date(task.submission.feedbackAt),'dd MMM yyyy, HH:mm')}</div>}
          </div>
        ) : <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-title">Awaiting feedback</div></div>}
        <button className="btn btn-secondary w-full" style={{ marginTop:'1rem' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function InternTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    const { data } = await api.get(`/tasks/my${params}`);
    setTasks(data.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter(t=>t.status==='pending').length,
    'in-progress': tasks.filter(t=>t.status==='in-progress').length,
    submitted: tasks.filter(t=>t.status==='submitted').length,
    approved: tasks.filter(t=>t.status==='approved').length,
  };

  return (
    <div>
      <div className="page-header">
        <h2>My Tasks</h2>
        <div className="flex gap-1" style={{ marginTop:'1rem', flexWrap:'wrap' }}>
          {Object.entries(statusCounts).map(([s, count]) => (
            <button key={s} className={`btn btn-sm ${filter === (s==='all'?'':s) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s==='all'?'':s)}>
              {s} <span style={{ opacity:0.7, marginLeft:'0.25rem' }}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No tasks</div><div className="empty-desc">Your assigned tasks will appear here.</div></div></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {tasks.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !['approved','submitted'].includes(task.status);
              return (
                <div key={task._id} className="card" style={{ borderLeft: `3px solid ${isOverdue ? 'var(--rose)' : task.status==='approved' ? 'var(--emerald)' : 'var(--accent)'}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                      {isOverdue && <span className="badge badge-absent">Overdue</span>}
                      {task.submission?.grade && <span className="badge badge-approved">{task.submission.grade}</span>}
                    </div>
                    <span style={{ fontSize:'0.78rem', color: isOverdue ? 'var(--rose)' : 'var(--text-muted)' }}>
                      Due {task.dueDate ? format(new Date(task.dueDate),'dd MMM yyyy') : '—'}
                    </span>
                  </div>
                  <h3 style={{ margin:'0.5rem 0 0.25rem' }}>{task.title}</h3>
                  <p style={{ fontSize:'0.875rem', marginBottom:'1rem' }}>{task.description}</p>

                  {task.tags?.length > 0 && (
                    <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                      {task.tags.map(t=><span key={t} style={{ fontSize:'0.7rem', background:'var(--bg-elevated)', padding:'0.15rem 0.5rem', borderRadius:4, color:'var(--text-muted)', border:'1px solid var(--border)' }}>{t}</span>)}
                    </div>
                  )}

                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
                    Assigned by {task.assignedBy?.name}
                  </div>

                  <div className="flex gap-1">
                    {(task.status === 'pending' || task.status === 'in-progress' || task.status === 'revision') && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelected(task); setModal('submit'); }}>Submit Work</button>
                    )}
                    {(task.status === 'approved' || task.status === 'rejected' || task.status === 'revision') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(task); setModal('feedback'); }}>View Feedback</button>
                    )}
                    {task.status === 'submitted' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(task); setModal('feedback'); }}>View Submission</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'submit' && selected && <SubmitModal task={selected} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}} />}
      {modal === 'feedback' && selected && <FeedbackModal task={selected} onClose={()=>setModal(null)} />}
    </div>
  );
}
