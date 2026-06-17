import React, { useEffect, useState } from 'react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import api from '../../services/api';

const STATUS_COLOR = { present:'var(--emerald)', absent:'var(--rose)', late:'var(--amber)', 'half-day':'var(--amber)', leave:'var(--accent-light)' };

export default function InternAttendance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear]   = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.get(`/attendance/my?month=${month}&year=${year}`)
      .then(r => { setRecords(r.data.data); setStats(r.data.stats); setLoading(false); });
  }, [month, year]);

  // Build calendar grid
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const firstDow = getDay(startOfMonth(new Date(year, month - 1)));
  const recordByDay = {};
  records.forEach(r => { const d = new Date(r.date); recordByDay[d.getDate()] = r; });

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years  = [2023,2024,2025,2026];

  return (
    <div>
      <div className="page-header">
        <h2>My Attendance</h2>
        <div className="flex gap-1" style={{ marginTop:'1rem' }}>
          <select className="form-select" style={{ width:'auto' }} value={month} onChange={e=>setMonth(+e.target.value)}>
            {months.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width:'auto' }} value={year} onChange={e=>setYear(+e.target.value)}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        {stats && (
          <div className="card-grid mb-3">
            {[
              { label:'Present', val:stats.present, color:'var(--emerald)', icon:'✅' },
              { label:'Late',    val:stats.late,    color:'var(--amber)',   icon:'⏰' },
              { label:'Absent',  val:stats.absent,  color:'var(--rose)',    icon:'❌' },
              { label:'Hours',   val:`${stats.totalHours}h`, color:'var(--accent-light)', icon:'⏱️' },
            ].map(s=>(
              <div key={s.label} style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ fontSize:'1.5rem' }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:500 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Heatmap */}
        <div className="card mb-3">
          <h3 className="mb-2">{months[month-1]} {year}</h3>
          {loading ? <div className="loader"><div className="spinner" /></div> : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'0.375rem', marginBottom:'0.5rem' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
                  <div key={d} style={{ textAlign:'center', fontSize:'0.7rem', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{d}</div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'0.375rem' }}>
                {Array.from({length: firstDow}).map((_,i)=><div key={`e${i}`} />)}
                {Array.from({length:daysInMonth},(_,i)=>i+1).map(day => {
                  const rec = recordByDay[day];
                  const isToday = day===new Date().getDate() && month===new Date().getMonth()+1 && year===new Date().getFullYear();
                  const color = rec ? STATUS_COLOR[rec.status] : 'var(--bg-elevated)';
                  return (
                    <div key={day} title={rec ? `${rec.status}${rec.hoursWorked ? ` · ${rec.hoursWorked}h` : ''}` : ''}
                      style={{ aspectRatio:1, borderRadius:'var(--radius-sm)', background: rec ? `${color}22` : 'var(--bg-elevated)', border: isToday ? `2px solid ${color || 'var(--accent)'}` : `1px solid ${rec ? `${color}44` : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', cursor: rec ? 'pointer' : 'default', transition:'transform 0.1s' }}>
                      <div style={{ fontSize:'0.75rem', fontWeight: isToday ? 700 : 500, color: rec ? color : 'var(--text-muted)' }}>{day}</div>
                      {rec && <div style={{ width:5, height:5, borderRadius:'50%', background:color, marginTop:2 }} />}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex gap-2" style={{ marginTop:'1rem', flexWrap:'wrap' }}>
                {Object.entries(STATUS_COLOR).map(([s,c])=>(
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:c }} />
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Records Table */}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>No records this month</td></tr>
              ) : records.map(r=>(
                <tr key={r._id}>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{format(new Date(r.date),'EEE, dd MMM')}</td>
                  <td>{r.checkIn ? format(new Date(r.checkIn),'HH:mm') : '—'}</td>
                  <td>{r.checkOut ? format(new Date(r.checkOut),'HH:mm') : '—'}</td>
                  <td style={{ color:'var(--accent-light)', fontWeight:600 }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{r.notes||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
