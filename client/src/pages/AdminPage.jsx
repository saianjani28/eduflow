import React, { useEffect, useState } from 'react'
import { Modal, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

const ROLES = ['learner', 'instructor', 'admin']

export default function AdminPage() {
  const [tab, setTab]           = useState('users')
  const [users, setUsers]       = useState([])
  const [courses, setCourses]   = useState([])
  const [stats, setStats]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [search, setSearch]     = useState('')
  const [msg, setMsg]           = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [s, u, c] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/courses'),
      ])
      setStats(s.data.stats || {})
      setUsers(u.data.users || [])
      setCourses(c.data.courses || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleUpdateUser(e) {
    e.preventDefault()
    try {
      const { data } = await api.put(`/admin/users/${editUser._id}`, { name: editUser.name, role: editUser.role, isActive: editUser.isActive })
      setUsers(prev => prev.map(u => u._id === data.user._id ? data.user : u))
      setEditUser(null)
      flash('✅ User updated successfully!')
    } catch (err) { alert(err.response?.data?.message || 'Update failed') }
  }

  async function handleDeleteUser(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      flash('🗑️ User deleted.')
    } catch (err) { alert(err.response?.data?.message || 'Delete failed') }
  }

  async function handleToggleCourse(id) {
    try {
      const { data } = await api.put(`/admin/courses/${id}/toggle`)
      setCourses(prev => prev.map(c => c._id === id ? data.course : c))
      flash('✅ Course status updated!')
    } catch (err) { alert(err.response?.data?.message || 'Failed') }
  }

  async function handleDeleteCourse(id, title) {
    if (!window.confirm(`Delete course "${title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/courses/${id}`)
      setCourses(prev => prev.filter(c => c._id !== id))
      flash('🗑️ Course deleted.')
    } catch (err) { alert(err.response?.data?.message || 'Delete failed') }
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const filteredUsers   = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <Spinner />

  return (
    <div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Summary */}
      <div className="grid-4 mb-20">
        {[
          { icon: '👥', value: stats.totalUsers || 0,        label: 'Total Users',        color: '#eff2ff' },
          { icon: '📚', value: stats.totalCourses || 0,      label: 'Total Courses',      color: '#d1fae5' },
          { icon: '🎓', value: stats.totalEnrollments || 0,  label: 'Enrollments',        color: '#f3f0ff' },
          { icon: '🏆', value: stats.totalCertificates || 0, label: 'Certificates',       color: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="admin-tab-bar mb-20">
        {['users', 'courses'].map(t => (
          <button key={t} className={`admin-tab${tab === t ? ' active' : ''}`} onClick={() => { setTab(t); setSearch('') }}>
            {t === 'users' ? '👥 User Management' : '📚 Course Management'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-12 mb-16">
        <input className="form-input" style={{ maxWidth: 300 }}
          placeholder={`🔍 Search ${tab}…`} value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-muted" style={{ lineHeight: '38px', fontSize: 13 }}>
          {tab === 'users' ? `${filteredUsers.length} users` : `${filteredCourses.length} courses`}
        </span>
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-10">
                        <div className="avatar av-sm" style={{ background: '#eff2ff', color: 'var(--accent)' }}>
                          {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                    <td><span className={`chip chip-${u.role}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`chip ${u.isActive !== false ? 'chip-active' : 'chip-pending'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditUser({ ...u })}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id, u.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {tab === 'courses' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Instructor</th><th>Category</th><th>Level</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.instructor?.name || '—'}</td>
                    <td><span className="tag tag-blue">{c.category}</span></td>
                    <td><span className="tag tag-gray">{c.level}</span></td>
                    <td>
                      <span className={`chip ${c.isPublished ? 'chip-active' : 'chip-pending'}`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className={`btn btn-sm ${c.isPublished ? 'btn-warn' : 'btn-success'}`}
                          onClick={() => handleToggleCourse(c._id)}>
                          {c.isPublished ? '⏸ Unpublish' : '🚀 Publish'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCourse(c._id, c.title)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No courses found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <form onSubmit={handleUpdateUser}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={editUser.name}
                onChange={e => setEditUser(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="form-input" value={editUser.email} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={editUser.role}
                onChange={e => setEditUser(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={editUser.isActive !== false ? 'true' : 'false'}
                onChange={e => setEditUser(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
