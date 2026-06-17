import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = ['present','absent','late','half-day','leave'];

function MarkModal({ interns, onClose, onSave }) {
  const [form, setForm] = useState({ internId:'', date: format(new Date(),'yyyy-MM-dd'), status:'present', notes:'' });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/attendance/mark', form); addToast('Attendance marked.', 'success'); onSave(); }
    catch (err) { addToast(err.response?.data?.message || 'Failed.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Mark Attendance</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Intern</label>
            <select className="form-select" value={form.internId} onChange={e=>setForm(f=>({...f,internId:e.target.value}))} required>
              <option value="">Select intern…</option>
              {interns.map(i=><option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input className="form-input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes…" />
          </div>
          <div className="flex gap-1" style={{ justifyContent:'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving…':'Mark Attendance'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({ date: format(new Date(),'yyyy-MM-dd'), internId:'', status:'' });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(Object.fromEntries(Object.entries(filter).filter(([,v])=>v)));
    const [r, i] = await Promise.all([
      api.get(`/attendance/all?${params}`),
      api.get('/users?role=intern&isActive=true'),
    ]);
    setRecords(r.data.data);
    setInterns(i.data.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const todaySummary = {
    present: records.filter(r=>r.status==='present').length,
    late:    records.filter(r=>r.status==='late').length,
    absent:  records.filter(r=>r.status==='absent').length,
    leave:   records.filter(r=>r.status==='leave').length,
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div><h2>Attendance</h2><p className="text-muted text-sm">{records.length} record{records.length!==1?'s':''} found</p></div>
          <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Mark Attendance</button>
        </div>

        {/* Today summary pills */}
        <div className="flex gap-1" style={{ marginTop:'1rem', flexWrap:'wrap' }}>
          {[{label:'Present',val:todaySummary.present,color:'var(--emerald)'},
            {label:'Late',val:todaySummary.late,color:'var(--amber)'},
            {label:'Absent',val:todaySummary.absent,color:'var(--rose)'},
            {label:'Leave',val:todaySummary.leave,color:'var(--accent-light)'},
          ].map(s=>(
            <div key={s.label} style={{ padding:'0.4rem 1rem', background:'var(--bg-elevated)', borderRadius:'100px', border:'1px solid var(--border)', fontSize:'0.8rem', display:'flex', gap:'0.4rem', alignItems:'center' }}>
              <span style={{ color:s.color, fontWeight:700 }}>{s.val}</span>
              <span style={{ color:'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-1" style={{ marginTop:'1rem', flexWrap:'wrap' }}>
          <input className="form-input" type="date" style={{ width:'auto' }} value={filter.date} onChange={e=>setFilter(f=>({...f,date:e.target.value}))} />
          <select className="form-select" style={{ width:'auto' }} value={filter.internId} onChange={e=>setFilter(f=>({...f,internId:e.target.value}))}>
            <option value="">All Interns</option>
            {interns.map(i=><option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }} value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={()=>setFilter({date:'',internId:'',status:''})}>Clear</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="table-wrap"><div className="empty-state"><div className="empty-icon">📅</div><div className="empty-title">No records</div><div className="empty-desc">Try a different date or mark attendance manually.</div></div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Intern</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{r.intern?.name||'—'}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{r.intern?.department}</div>
                    </td>
                    <td>{r.date ? format(new Date(r.date),'dd MMM yyyy') : '—'}</td>
                    <td>{r.checkIn ? format(new Date(r.checkIn),'HH:mm') : '—'}</td>
                    <td>{r.checkOut ? format(new Date(r.checkOut),'HH:mm') : '—'}</td>
                    <td style={{ color:'var(--accent-light)', fontWeight:600 }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem', maxWidth:160 }}>{r.notes||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <MarkModal interns={interns} onClose={()=>setModal(false)} onSave={()=>{setModal(false);load();}} />}
    </div>
  );
}
