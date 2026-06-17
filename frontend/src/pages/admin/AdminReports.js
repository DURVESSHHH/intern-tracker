import React, { useEffect, useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';

export default function AdminReports() {
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/overview').then(r => { setOverview(r.data.data); setLoading(false); });
  }, []);

  const topPerformer = overview.length > 0
    ? [...overview].sort((a,b) => (b.approvedTasks/Math.max(b.totalTasks,1)) - (a.approvedTasks/Math.max(a.totalTasks,1)))[0]
    : null;

  return (
    <div>
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <p className="text-muted text-sm">Performance summary across all interns</p>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Top performer highlight */}
            {topPerformer && (
              <div className="card mb-3" style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))', border:'1px solid var(--border-accent)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ fontSize:'2rem' }}>🏆</div>
                  <div>
                    <div style={{ fontSize:'0.75rem', color:'var(--accent-light)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>Top Performer</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:700, color:'var(--text-primary)' }}>{topPerformer.intern.name}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                      {topPerformer.intern.department} · {topPerformer.approvedTasks}/{topPerformer.totalTasks} tasks approved · {topPerformer.presentDays}/{topPerformer.totalDays} days present
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overview table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Intern</th>
                    <th>Department</th>
                    <th>Tasks</th>
                    <th>Approval Rate</th>
                    <th>Attendance</th>
                    <th>Total Hours</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.map(row => {
                    const approvalRate = row.totalTasks > 0 ? Math.round((row.approvedTasks / row.totalTasks) * 100) : 0;
                    const attendanceRate = row.totalDays > 0 ? Math.round((row.presentDays / row.totalDays) * 100) : 0;
                    const score = Math.round((approvalRate + attendanceRate) / 2);
                    const scoreColor = score >= 75 ? 'var(--emerald)' : score >= 50 ? 'var(--amber)' : 'var(--rose)';

                    return (
                      <tr key={row.intern._id}>
                        <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{row.intern.name}</td>
                        <td>{row.intern.department || '—'}</td>
                        <td>{row.approvedTasks}/{row.totalTasks}</td>
                        <td>
                          <div className="progress-bar-wrap" style={{ minWidth:100 }}>
                            <div className="progress-bar-label"><span>{approvalRate}%</span></div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width:`${approvalRate}%`, background:'var(--accent)' }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress-bar-wrap" style={{ minWidth:100 }}>
                            <div className="progress-bar-label"><span>{attendanceRate}%</span></div>
                            <div className="progress-bar-bg">
                              <div className="progress-bar-fill" style={{ width:`${attendanceRate}%`, background:'var(--emerald)' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ color:'var(--accent-light)', fontWeight:600 }}>{row.totalHours}h</td>
                        <td>
                          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:scoreColor }}>{score}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Radar chart */}
            {overview.length > 0 && (
              <div className="card mt-3">
                <h3 className="mb-2">Performance Radar — Top 5 Interns</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={overview.slice(0,5).map(r => ({
                    name: r.intern.name.split(' ')[0],
                    Tasks: r.totalTasks > 0 ? Math.round((r.approvedTasks/r.totalTasks)*100) : 0,
                    Attendance: r.totalDays > 0 ? Math.round((r.presentDays/r.totalDays)*100) : 0,
                    Hours: Math.min(100, r.totalHours),
                  }))}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:12 }} />
                    <Radar dataKey="Tasks" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
                    <Radar dataKey="Attendance" stroke="var(--emerald)" fill="var(--emerald)" fillOpacity={0.1} />
                    <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
