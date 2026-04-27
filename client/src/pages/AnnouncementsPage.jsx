import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Modal, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const isInst   = user.role !== 'learner'

  const [announcements, setAnnouncements] = useState([])
  const [courses, setCourses]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [showCreate, setShowCreate]       = useState(false)
  const [form, setForm]  = useState({ course:'', title:'', body:'' })
  const [flash, setFlash] = useState('')

  useEffect(() => {
    load()
    if (isInst) api.get('/courses/my').then(r => setCourses(r.data.courses))
  }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/announcements')
      setAnnouncements(data.announcements)
    } finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await api.post('/announcements', form)
      setShowCreate(false)
      setForm({ course:'', title:'', body:'' })
      load()
      setFlash('✅ Announcement posted!')
      setTimeout(() => setFlash(''), 3000)
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      setAnnouncements(p => p.filter(a => a._id !== id))
    } catch {}
  }

  if (loading) return <Spinner />

  return (
    <div>
      {flash && <div className="alert alert-success">{flash}</div>}

      {isInst && (
        <div className="flex justify-end mb-20">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Announcement</button>
        </div>
      )}

      {announcements.map(a => (
        <div key={a._id} className="annc-item" style={{ marginBottom:12 }}>
          <div className="flex items-start justify-between">
            <div style={{ flex:1 }}>
              <div className="flex items-center gap-8 mb-6">
                <span className="tag tag-blue">{a.course?.title || 'General'}</span>
                <span className="text-xs text-muted">
                  {new Date(a.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
                </span>
              </div>
              <h3 style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{a.title}</h3>
              <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{a.body}</p>
              <div className="flex items-center gap-8 mt-10" style={{ paddingTop:10, borderTop:'1px solid var(--border)' }}>
                <div className="avatar av-sm" style={{ background:'#eff2ff', color:'var(--accent)' }}>
                  {(a.author?.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <span className="text-xs text-muted">Posted by {a.author?.name || 'Instructor'}</span>
              </div>
            </div>
            {isInst && (
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)', marginLeft:12 }}
                onClick={() => handleDelete(a._id)}>🗑️</button>
            )}
          </div>
        </div>
      ))}

      {announcements.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <p>No announcements yet.</p>
        </div>
      )}

      {showCreate && (
        <Modal title="New Announcement" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-input" value={form.course} onChange={e => setForm(p=>({...p,course:e.target.value}))} required>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="Announcement title"
                value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" rows={4} placeholder="Your message to students…"
                value={form.body} onChange={e => setForm(p=>({...p,body:e.target.value}))} required />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Post Announcement</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
