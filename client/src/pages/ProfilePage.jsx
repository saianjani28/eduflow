import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

function initials(name='') { return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) }
const roleColor = { admin:'#9d174d', instructor:'#5b21b6', learner:'#075985' }

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm]         = useState({ name:user.name, bio:user.bio||'' })
  const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')
  const [pwMsg, setPwMsg]       = useState('')
  const [pwErr, setPwErr]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const color = roleColor[user.role] || '#4f6ef7'

  async function handleProfile(e) {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('')
    try {
      const { data } = await api.put('/auth/profile', form)
      updateUser(data.user)
      setMsg('✅ Profile updated successfully!')
    } catch (err) { setErr(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  async function handlePassword(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { setPwErr('Passwords do not match'); return }
    setPwSaving(true); setPwMsg(''); setPwErr('')
    try {
      await api.put('/auth/password', { currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword })
      setPwMsg('✅ Password changed successfully!')
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' })
    } catch (err) { setPwErr(err.response?.data?.message || 'Failed') }
    finally { setPwSaving(false) }
  }

  return (
    <div style={{ maxWidth:640 }}>
      {/* Profile header card */}
      <div className="card mb-16">
        <div className="flex items-center gap-16 mb-20">
          <div className="avatar av-xl" style={{ background:`${color}20`, color }}>
            {initials(user.name)}
          </div>
          <div>
            <h2 style={{ fontSize:18, marginBottom:4 }}>{user.name}</h2>
            <div className="text-muted text-sm mb-8">{user.email}</div>
            <div className="flex gap-8">
              <span className={`chip chip-${user.role}`} style={{ textTransform:'capitalize' }}>{user.role}</span>
              <span className="chip chip-active">Active</span>
            </div>
          </div>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        <form onSubmit={handleProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" value={user.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input" rows={3} placeholder="Tell us about yourself…"
              value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" style={{ width:16,height:16 }} /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="section-title mb-16">Change Password</div>
        {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
        {pwErr && <div className="alert alert-error">{pwErr}</div>}
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={pwForm.currentPassword}
              onChange={e => setPwForm(p=>({...p,currentPassword:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={pwForm.newPassword} minLength={6}
              onChange={e => setPwForm(p=>({...p,newPassword:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={pwForm.confirm}
              onChange={e => setPwForm(p=>({...p,confirm:e.target.value}))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={pwSaving}>
            {pwSaving ? <><span className="spinner" style={{ width:16,height:16 }} /> Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
