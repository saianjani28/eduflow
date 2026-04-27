import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { StatCard, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

function LearnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/enrollments/my'), api.get('/progress'), api.get('/submissions/my')])
      .then(([e, p, s]) => setData({ enrollments: e.data.enrollments, progress: p.data.progress, submissions: s.data.submissions }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const { enrollments = [], progress = [], submissions = [] } = data || {}
  const completed = progress.filter(p => p.completionPercentage === 100).length
  const avgProg   = progress.length ? Math.round(progress.reduce((s, p) => s + p.completionPercentage, 0) / progress.length) : 0

  return (
    <div>
      <div className="mb-20">
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Welcome back, {user.name.split(' ')[0]}! 👋</h2>
        <p className="text-muted">Continue where you left off.</p>
      </div>

      <div className="grid-4 mb-20">
        <StatCard icon="📚" value={enrollments.length} label="Enrolled Courses" color="#eff2ff" />
        <StatCard icon="✅" value={completed} label="Completed" color="#d1fae5" />
        <StatCard icon="📝" value={submissions.length} label="Submitted" color="#fef3c7" />
        <StatCard icon="📈" value={`${avgProg}%`} label="Avg Progress" color="#f3f0ff" />
      </div>

      <div className="grid-2 gap-16">
        <div className="card">
          <div className="card-header">
            <span className="section-title">Continue Learning</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-learning')}>View all →</button>
          </div>
          {enrollments.slice(0, 4).map(enr => {
            const prog = progress.find(p => String(p.course?._id) === String(enr.course?._id))
            const pct  = prog?.completionPercentage || 0
            return (
              <div key={enr._id} className="flex items-center gap-12 mb-16"
                style={{ cursor: 'pointer' }} onClick={() => navigate('/my-learning')}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📘</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{enr.course?.title}</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="text-xs text-muted mt-4">{pct}% complete</div>
                </div>
              </div>
            )
          })}
          {enrollments.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No courses yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/courses')}>Browse courses →</span></p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="section-title">Recent Submissions</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/assignments')}>View all →</button>
          </div>
          {submissions.slice(0, 4).map(sub => (
            <div key={sub._id} className="flex items-center justify-between mb-12"
              style={{ padding: '10px', background: 'var(--surface)', borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{sub.assignment?.title}</div>
                <div className="text-xs text-muted">{new Date(sub.submittedAt).toLocaleDateString()}</div>
              </div>
              <span className={`chip ${sub.grade !== null ? 'chip-active' : 'chip-pending'}`}>
                {sub.grade !== null ? `${sub.grade}/100` : 'Pending'}
              </span>
            </div>
          ))}
          {submissions.length === 0 && <div className="empty-state"><div className="empty-icon">📝</div><p>No submissions yet.</p></div>}
        </div>
      </div>
    </div>
  )
}

function InstructorDashboard() {
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/courses/my'), api.get('/users/learners')])
      .then(([c, l]) => setData({ courses: c.data.courses, learners: l.data.learners }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  const { courses = [], learners = [] } = data || {}

  return (
    <div>
      <div className="mb-20">
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Instructor Dashboard 👨‍🏫</h2>
        <p className="text-muted">Manage your courses and students.</p>
      </div>
      <div className="grid-4 mb-20">
        <StatCard icon="📚" value={courses.length} label="Active Courses" color="#eff2ff" change="+2 this month" />
        <StatCard icon="👥" value={learners.length} label="Total Learners" color="#d1fae5" change="+5 this week" />
        <StatCard icon="📈" value="87%" label="Avg Completion" color="#f3f0ff" />
        <StatCard icon="⭐" value="4.8" label="Avg Rating" color="#fef3c7" />
      </div>
      <div className="grid-2 gap-16">
        <div className="card">
          <div className="card-header">
            <span className="section-title">Your Courses</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/courses')}>+ New Course</button>
          </div>
          {courses.map(c => (
            <div key={c._id} className="flex items-center gap-12 mb-12"
              style={{ padding: '10px', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => navigate(`/courses/${c._id}`)}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📘</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                <div className="text-xs text-muted">{c.category} · {c.level}</div>
              </div>
              <span className={`chip ${c.isPublished ? 'chip-active' : 'chip-pending'}`}>{c.isPublished ? 'Live' : 'Draft'}</span>
            </div>
          ))}
          {courses.length === 0 && <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet.</p></div>}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="section-title">Recent Learners</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students')}>View all →</button>
          </div>
          {learners.slice(0, 6).map(l => (
            <div key={l._id} className="flex items-center gap-12 mb-12">
              <div className="avatar av-md" style={{ background: '#eff2ff', color: 'var(--accent)' }}>
                {l.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{l.name}</div>
                <div className="text-xs text-muted">{l.email}</div>
              </div>
            </div>
          ))}
          {learners.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><p>No learners yet.</p></div>}
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  const { stats = {}, recentUsers = [], recentCourses = [], usersByRole = [] } = data || {}

  return (
    <div>
      <div className="mb-20">
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Admin Dashboard 🛡️</h2>
        <p className="text-muted">Full platform overview and management.</p>
      </div>
      <div className="grid-4 mb-20">
        <StatCard icon="👥" value={stats.totalUsers || 0}        label="Total Users"        color="#eff2ff" />
        <StatCard icon="📚" value={stats.totalCourses || 0}      label="Total Courses"      color="#d1fae5" />
        <StatCard icon="🎓" value={stats.totalEnrollments || 0}  label="Total Enrollments"  color="#f3f0ff" />
        <StatCard icon="🏆" value={stats.totalCertificates || 0} label="Certificates Issued" color="#fef3c7" />
      </div>

      <div className="grid-2 gap-16 mb-16">
        <div className="card">
          <div className="card-header">
            <span className="section-title">Users by Role</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin')}>Manage Users</button>
          </div>
          {usersByRole.map(r => (
            <div key={r._id} className="flex items-center justify-between mb-12"
              style={{ padding: '10px', background: 'var(--surface)', borderRadius: 8 }}>
              <div className="flex items-center gap-8">
                <span>{r._id === 'admin' ? '🛡️' : r._id === 'instructor' ? '👨‍🏫' : '🎓'}</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{r._id}</span>
              </div>
              <span className={`chip chip-${r._id}`}>{r.count} users</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="section-title">Recent Users</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>View all →</button>
          </div>
          {recentUsers.map(u => (
            <div key={u._id} className="flex items-center gap-12 mb-12">
              <div className="avatar av-md" style={{ background: '#eff2ff', color: 'var(--accent)' }}>
                {u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                <div className="text-xs text-muted">{u.email}</div>
              </div>
              <span className={`chip chip-${u.role}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="section-title">Recent Courses</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>Manage →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Instructor</th><th>Category</th><th>Level</th><th>Status</th></tr></thead>
            <tbody>
              {recentCourses.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td className="text-muted">{c.instructor?.name}</td>
                  <td><span className="tag tag-blue">{c.category}</span></td>
                  <td><span className="tag tag-gray">{c.level}</span></td>
                  <td><span className={`chip ${c.isPublished ? 'chip-active' : 'chip-pending'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'admin')      return <AdminDashboard />
  if (user?.role === 'instructor') return <InstructorDashboard />
  return <LearnerDashboard />
}
