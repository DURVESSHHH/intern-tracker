import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const PRIORITY_ORDER = { urgent:0, high:1, medium:2, low:3 };

function TaskModal({ task, interns, onClose, onSave }) {
  const [form, setForm] = useState(task || { title:'', description:'', assignedTo:'', priority:'medium', dueDate:'', tags:'' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags };
      if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
        addToast('Task updated.', 'success');
      } else {
        await api.post('/tasks', payload);
        addToast('Task created.', 'success');
      }
      onSave();
    } catch (err) { addToast(err.response?.data?.message || 'Failed.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{task?._id ? 'Edit Task' : 'New Task'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Build REST API endpoints" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe what needs to be done…" required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" name="assignedTo" value={form.assignedTo?._id || form.assignedTo} onChange={handleChange} required>
                <option value="">Select intern…</option>
                {interns.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" name="dueDate" value={form.dueDate?.slice(0,10)} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" name="tags" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={handleChange} placeholder="react, api, design" />
            </div>
          </div>
          <div className="flex gap-1" style={{ justifyContent:'flex-end', marginTop:'0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : task?._id ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({ status:'approved', feedback:'', grade:'' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.put(`/tasks/${task._id}/review`, form);
      addToast('Review submitted.', 'success');
      onSave();
    } catch { addToast('Failed to submit review.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Review Submission</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="card" style={{ marginBottom:'1.25rem', background:'var(--bg-elevated)' }}>
          <div style={{ fontWeight:600, marginBottom:'0.5rem' }}>{task.title}</div>
          <div className="text-muted text-sm">{task.submission?.content}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Decision</label>
              <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="revision">Request Revision</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <select className="form-select" value={form.grade} onChange={e=>setForm(f=>({...f,grade:e.target.value}))}>
                <option value="">No grade</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Feedback</label>
            <textarea className="form-textarea" placeholder="Write detailed feedback for the intern…" value={form.feedback} onChange={e=>setForm(f=>({...f,feedback:e.target.value}))} />
          </div>
          <div className="flex gap-1" style={{ justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit Review'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'review'
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ status:'', priority:'', assignedTo:'' });
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filter).filter(([,v])=>v)));
    const [t, i] = await Promise.all([
      api.get(`/tasks?${params}`),
      api.get('/users?role=intern&isActive=true'),
    ]);
    setTasks(t.data.data.sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]));
    setInterns(i.data.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); addToast('Task deleted.', 'success'); load(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const statuses = ['','pending','in-progress','submitted','approved','rejected','revision'];
  const priorities = ['','low','medium','high','urgent'];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div><h2>Tasks</h2><p className="text-muted text-sm">{tasks.length} task{tasks.length!==1?'s':''} total</p></div>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('create'); }}>+ Assign Task</button>
        </div>

        {/* Filters */}
        <div className="flex gap-1" style={{ marginTop:'1rem', flexWrap:'wrap' }}>
          <select className="form-select" style={{ width:'auto' }} value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
            {statuses.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }} value={filter.priority} onChange={e=>setFilter(f=>({...f,priority:e.target.value}))}>
            {priorities.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }} value={filter.assignedTo} onChange={e=>setFilter(f=>({...f,assignedTo:e.target.value}))}>
            <option value="">All Interns</option>
            {interns.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="table-wrap"><div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No tasks found</div><div className="empty-desc">Try adjusting your filters or create a new task.</div></div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'0.15rem' }}>{task.title}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{task.description?.slice(0,60)}…</div>
                      {task.tags?.length > 0 && (
                        <div style={{ marginTop:'0.3rem', display:'flex', gap:'0.25rem', flexWrap:'wrap' }}>
                          {task.tags.map(t => <span key={t} style={{ fontSize:'0.68rem', background:'var(--bg-elevated)', padding:'0.1rem 0.4rem', borderRadius:4, color:'var(--text-muted)' }}>{t}</span>)}
                        </div>
                      )}
                    </td>
                    <td>{task.assignedTo?.name || '—'}</td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td><span className={`badge badge-${task.status}`}>{task.status}</span></td>
                    <td style={{ whiteSpace:'nowrap' }}>
                      <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== 'approved' ? 'var(--rose)' : 'inherit' }}>
                        {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {task.status === 'submitted' && (
                          <button className="btn btn-success btn-sm" onClick={() => { setSelected(task); setModal('review'); }}>Review</button>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(task); setModal('edit'); }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <TaskModal task={modal === 'edit' ? selected : null} interns={interns} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
      {modal === 'review' && selected && (
        <ReviewModal task={selected} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}
