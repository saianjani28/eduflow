import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function MyLearningPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [progress, setProgress]       = useState([])
  const [lessons, setLessons]         = useState({})
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [enr, prog] = await Promise.all([api.get('/enrollments/my'), api.get('/progress')])
        setEnrollments(enr.data.enrollments)
        setProgress(prog.data.progress)
        const map = {}
        for (const e of enr.data.enrollments) {
          if (e.course?._id) {
            const { data } = await api.get(`/lessons/${e.course._id}`)
            map[e.course._id] = data.lessons
          }
        }
        setLessons(map)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  async function markDone(courseId, lessonId) {
    try {
      const { data } = await api.post(`/progress/${courseId}/lesson/${lessonId}`)
      setProgress(p => p.map(x => String(x.course?._id) === String(courseId) ? data.progress : x))
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  if (loading) return <Spinner />

  return (
    <div className="grid-2 gap-16">
      {enrollments.map(enr => {
        const cid  = enr.course?._id
        const prog = progress.find(p => String(p.course?._id) === String(cid))
        const pct  = prog?.completionPercentage || 0
        const done = (prog?.completedLessons || []).map(String)
        const cls  = lessons[cid] || []
        const next = cls.find(l => !done.includes(String(l._id)))

        return (
          <div key={enr._id} className="card">
            <div className="flex items-center gap-12 mb-16">
              <div style={{ width:52, height:52, borderRadius:12, background:'#eff2ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>📘</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{enr.course?.title}</div>
                <div className="text-xs text-muted">{enr.course?.duration}</div>
              </div>
            </div>
            <div className="progress-bar mb-4"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
            <div className="flex justify-between mb-16">
              <span className="text-xs text-muted">{pct}% complete</span>
              <span className="text-xs text-muted">{done.length}/{cls.length} lessons</span>
            </div>

            <div style={{ fontWeight:600, fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Lessons</div>
            {cls.map(l => {
              const isDone = done.includes(String(l._id))
              return (
                <div key={l._id} className="flex items-center gap-10"
                  style={{ padding:'8px 10px', borderRadius:8, marginBottom:6, background: isDone ? '#d1fae5' : 'var(--surface)' }}>
                  <span>{l.type === 'video' ? '▶️' : '📄'}</span>
                  <div style={{ flex:1, fontSize:13, color: isDone ? '#065f46' : 'var(--text)', fontWeight: isDone ? 500 : 400 }}>{l.title}</div>
                  <span>{isDone ? '✅' : '⭕'}</span>
                </div>
              )
            })}
            {cls.length === 0 && <p className="text-xs text-muted">No lessons uploaded yet.</p>}

            {next && pct < 100 && (
              <button className="btn btn-primary btn-sm mt-16" onClick={() => markDone(cid, next._id)}>
                ▶ Mark "{next.title}" Complete
              </button>
            )}
            {pct === 100 && <div className="alert alert-success mt-16">🎉 Course complete! Check Certificates.</div>}
          </div>
        )
      })}
      {enrollments.length === 0 && (
        <div className="empty-state" style={{ gridColumn:'1/-1' }}>
          <div className="empty-icon">📚</div>
          <p>Not enrolled in any courses yet.</p>
        </div>
      )}
    </div>
  )
}
