import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

function InternDetailModal({ intern, onClose, onUpdate }) {
  const [form, setForm] = useState({ ...intern });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.put(`/users/${intern._id}`, form);
      addToast('Intern updated.', 'success');
      onUpdate();
    } catch { addToast('Update failed.', 'error'); }
    finally { setLoading(false); }
  };

  const initials = intern.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:560 }}>
        <div className="modal-header">
          <span className="modal-title">Intern Profile</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1.5rem', padding:'1rem', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem', flexShrink:0 }}>{initials}</div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>{intern.name}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{intern.email}</div>
            <span className={`badge badge-${intern.isActive?'present':'absent'}`} style={{ marginTop:'0.25rem' }}>{intern.isActive?'Active':'Inactive'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department||''} onChange={e=>setForm(f=>({...f,department:e.target.value}))} placeholder="Engineering" />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.internshipStart?.slice(0,10)||''} onChange={e=>setForm(f=>({...f,internshipStart:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input className="form-input" type="date" value={form.internshipEnd?.slice(0,10)||''} onChange={e=>setForm(f=>({...f,internshipEnd:e.target.value}))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.isActive?'true':'false'} onChange={e=>setForm(f=>({...f,isActive:e.target.value==='true'}))}>
              <option value="true">Active</option>
              <option value="false">Deactivated</option>
            </select>
          </div>
          <div className="flex gap-1" style={{ justifyContent:'flex-end', marginTop:'0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving…':'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInterns() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/users?role=intern');
    setInterns(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      addToast(`Intern ${isActive ? 'deactivated' : 'activated'}.`, 'success');
      load();
    } catch { addToast('Action failed.', 'error'); }
  };

  const filtered = interns.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    (i.department||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div><h2>Interns</h2><p className="text-muted text-sm">{interns.length} registered intern{interns.length!==1?'s':''}</p></div>
        </div>
        <div style={{ marginTop:'1rem' }}>
          <input className="form-input" style={{ maxWidth:320 }} placeholder="Search by name, email, department…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="table-wrap"><div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No interns found</div></div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Intern</th>
                  <th>Department</th>
                  <th>Organization</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(intern => {
                  const initials = intern.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
                  return (
                    <tr key={intern._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem', flexShrink:0 }}>{initials}</div>
                          <div>
                            <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{intern.name}</div>
                            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{intern.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{intern.department || '—'}</td>
                      <td>{intern.organization || '—'}</td>
                      <td style={{ fontSize:'0.8rem' }}>
                        {intern.internshipStart ? (
                          <>{format(new Date(intern.internshipStart), 'dd MMM')}<span style={{ color:'var(--text-muted)' }}> → </span>{intern.internshipEnd ? format(new Date(intern.internshipEnd), 'dd MMM yyyy') : 'Ongoing'}</>
                        ) : '—'}
                      </td>
                      <td><span className={`badge badge-${intern.isActive ? 'present' : 'absent'}`}>{intern.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(intern)}>Edit</button>
                          <button className={`btn btn-sm ${intern.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleDeactivate(intern._id, intern.isActive)}>
                            {intern.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <InternDetailModal intern={selected} onClose={() => setSelected(null)} onUpdate={() => { setSelected(null); load(); }} />}
    </div>
  );
}
