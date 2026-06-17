import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { format } from 'date-fns';

export default function InternProfile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    organization: user?.organization || '',
    bio: user?.bio || '',
    internshipStart: user?.internshipStart?.slice(0,10) || '',
    internshipEnd: user?.internshipEnd?.slice(0,10) || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });

  const handleProfileSave = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', profileForm);
      updateUser(data.user);
      addToast('Profile updated.', 'success');
    } catch (err) { addToast(err.response?.data?.message || 'Update failed.', 'error'); }
    finally { setLoading(false); }
  };

  const handlePasswordSave = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm)
      return addToast('Passwords do not match.', 'error');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      addToast('Password changed.', 'success');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (err) { addToast(err.response?.data?.message || 'Failed.', 'error'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div>
      <div className="page-header">
        <h2>My Profile</h2>
        <p className="text-muted text-sm">Manage your account details and security settings.</p>
      </div>

      <div className="page-body">
        {/* Profile Hero Card */}
        <div className="card mb-3" style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))', border:'1px solid var(--border-accent)' }}>
          <div className="flex items-center gap-2">
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.5rem', flexShrink:0 }}>
              {initials}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:700, color:'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>{user?.email}</div>
              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                <span className="badge badge-present">{user?.role}</span>
                {user?.department && <span className="badge badge-pending">{user?.department}</span>}
                {user?.organization && <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{user?.organization}</span>}
              </div>
            </div>
            {user?.internshipStart && (
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Internship</div>
                <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)', marginTop:'0.2rem' }}>
                  {format(new Date(user.internshipStart),'dd MMM yyyy')}
                </div>
                {user?.internshipEnd && (
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                    → {format(new Date(user.internshipEnd),'dd MMM yyyy')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', background:'var(--bg-surface)', padding:'0.25rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', width:'fit-content' }}>
          {[{ id:'profile', label:'👤 Profile' }, { id:'security', label:'🔒 Security' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius:'var(--radius-sm)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card">
            <h3 className="mb-3">Personal Information</h3>
            <form onSubmit={handleProfileSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profileForm.name} onChange={e=>setProfileForm(f=>({...f,name:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profileForm.phone} onChange={e=>setProfileForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={profileForm.department} onChange={e=>setProfileForm(f=>({...f,department:e.target.value}))} placeholder="Engineering" />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <input className="form-input" value={profileForm.organization} onChange={e=>setProfileForm(f=>({...f,organization:e.target.value}))} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Internship Start</label>
                  <input className="form-input" type="date" value={profileForm.internshipStart} onChange={e=>setProfileForm(f=>({...f,internshipStart:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Internship End</label>
                  <input className="form-input" type="date" value={profileForm.internshipEnd} onChange={e=>setProfileForm(f=>({...f,internshipEnd:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={profileForm.bio} onChange={e=>setProfileForm(f=>({...f,bio:e.target.value}))} placeholder="Tell your team a bit about yourself…" maxLength={300} />
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>{profileForm.bio.length}/300</div>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div className="card">
            <h3 className="mb-3">Change Password</h3>
            <form onSubmit={handlePasswordSave} style={{ maxWidth:400 }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))} required placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))} required placeholder="Min 6 characters" minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} required placeholder="Repeat new password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating…' : 'Update Password'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
