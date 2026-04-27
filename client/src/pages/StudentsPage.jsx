import React, { useEffect, useState } from 'react'
import { Spinner } from '../components/UI/index.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'

function initials(name='') { return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) }

export default function StudentsPage() {
  const { user } = useAuth()
  const [learners, setLearners] = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/users/learners').then(r => setLearners(r.data.learners)).finally(() => setLoading(false))
  }, [])

  const filtered = learners.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      <div className="grid-3 mb-20">
        <div className="stat-card"><div className="stat-icon" style={{ background:'#eff2ff' }}>👥</div><div className="stat-value">{learners.length}</div><div className="stat-label">Total Learners</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#d1fae5' }}>✅</div><div className="stat-value">{learners.filter(l=>l.isActive!==false).length}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#fef3c7' }}>📅</div><div className="stat-value">{learners.filter(l => new Date(l.createdAt) > new Date(Date.now()-7*24*60*60*1000)).length}</div><div className="stat-label">New This Week</div></div>
      </div>

      <div className="flex gap-12 mb-16">
        <input className="form-input" style={{ maxWidth:300 }} placeholder="🔍 Search students…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <span className="text-muted" style={{ lineHeight:'38px', fontSize:13 }}>
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Email</th><th>Joined</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id}>
                  <td>
                    <div className="flex items-center gap-10">
                      <div className="avatar av-md" style={{ background:'#eff2ff', color:'var(--accent)', flexShrink:0 }}>
                        {initials(l.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight:500 }}>{l.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--muted)' }}>{l.email}</td>
                  <td style={{ color:'var(--muted)', fontSize:12 }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td><span className="chip chip-active">Active</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign:'center', color:'var(--muted)', padding:40 }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
