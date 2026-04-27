import React, { useEffect, useState } from 'react'
import { Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function ProgressPage() {
  const [progress, setProgress] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/progress').then(r => setProgress(r.data.progress)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const completed = progress.filter(p => p.completionPercentage === 100).length
  const avg = progress.length ? Math.round(progress.reduce((s,p) => s+p.completionPercentage, 0)/progress.length) : 0

  return (
    <div>
      <div className="grid-3 mb-20">
        {[
          { label:'Enrolled', value:progress.length, color:'#eff2ff', icon:'📚' },
          { label:'Completed', value:completed, color:'#d1fae5', icon:'✅' },
          { label:'Avg Progress', value:`${avg}%`, color:'#f3f0ff', icon:'📈' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background:s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        {progress.map(p => {
          const pct = p.completionPercentage
          return (
            <div key={p._id} className="stat-card">
              <div className="stat-icon" style={{ background:'#eff2ff' }}>📘</div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>{p.course?.title || 'Course'}</div>
              <div className="stat-value" style={{ fontSize:24, color: pct===100?'var(--success)':pct>50?'var(--accent)':'var(--warn)' }}>{pct}%</div>
              <div className="progress-bar mt-8"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
              <div className="text-xs text-muted mt-4">{pct===100?'✅ Completed':`${p.completedLessons?.length||0} lessons done`}</div>
              {p.lastAccessedAt && <div className="text-xs text-muted">Last: {new Date(p.lastAccessedAt).toLocaleDateString()}</div>}
            </div>
          )
        })}
        {progress.length === 0 && (
          <div className="empty-state" style={{ gridColumn:'1/-1' }}>
            <div className="empty-icon">📈</div>
            <p>Enroll in courses to track your progress.</p>
          </div>
        )}
      </div>
    </div>
  )
}
