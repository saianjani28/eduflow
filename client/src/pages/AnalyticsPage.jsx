import React, { useEffect, useState } from 'react'
import { StatCard, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function AnalyticsPage() {
  const [courses, setCourses]   = useState([])
  const [learners, setLearners] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.get('/courses/my'), api.get('/users/learners')])
      .then(([c,l]) => { setCourses(c.data.courses); setLearners(l.data.learners) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const metrics = [
    { icon:'📚', value:courses.length,  label:'Total Courses',  color:'#eff2ff', change:'↑ +2 this month' },
    { icon:'👥', value:learners.length, label:'Total Learners',  color:'#d1fae5', change:'↑ +5 this week'  },
    { icon:'🏆', value:Math.floor(learners.length*0.3), label:'Certificates Issued', color:'#f3f0ff' },
    { icon:'⭐', value:'4.8',           label:'Avg Rating',     color:'#fef3c7'  },
  ]

  const engagement = [
    { label:'Total Views',   value:'1,248', change:'↑ 12% this week', color:'var(--accent)'  },
    { label:'Avg Study Time',value:'6.4h',  change:'↑ 5% this week',  color:'var(--success)' },
    { label:'Quiz Attempts', value:'342',   change:'↑ 8% this week',  color:'var(--accent2)' },
    { label:'Submissions',   value:'89',    change:'↑ 3 today',       color:'var(--warn)'    },
  ]

  return (
    <div>
      <div className="grid-4 mb-20">
        {metrics.map(m => <StatCard key={m.label} {...m} />)}
      </div>

      <div className="grid-2 gap-16 mb-16">
        {/* Course breakdown */}
        <div className="card">
          <div className="section-title mb-16">Courses Breakdown</div>
          {courses.length === 0 && <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet.</p></div>}
          {courses.map((c, i) => {
            const pct = [72, 55, 88, 41, 65][i % 5]
            return (
              <div key={c._id} style={{ marginBottom:14 }}>
                <div className="flex justify-between mb-4">
                  <span style={{ fontSize:13, fontWeight:500 }}>{c.title}</span>
                  <div className="flex gap-6">
                    <span className={`chip ${c.isPublished?'chip-active':'chip-pending'}`}>{c.isPublished?'Live':'Draft'}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--accent)' }}>{pct}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width:`${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Learner table */}
        <div className="card">
          <div className="section-title mb-16">Active Learners</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Learner</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {learners.slice(0,8).map(l => (
                  <tr key={l._id}>
                    <td>
                      <div className="flex items-center gap-8">
                        <div className="avatar av-sm" style={{ background:'#eff2ff', color:'var(--accent)' }}>
                          {l.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        {l.name}
                      </div>
                    </td>
                    <td style={{ color:'var(--muted)', fontSize:12 }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td><span className="chip chip-active">Active</span></td>
                  </tr>
                ))}
                {learners.length === 0 && <tr><td colSpan="3" style={{ textAlign:'center', color:'var(--muted)', padding:20 }}>No learners yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Engagement row */}
      <div className="card">
        <div className="section-title mb-16">Platform Engagement</div>
        <div className="grid-4">
          {engagement.map(e => (
            <div key={e.label} style={{ padding:'16px', background:'var(--surface)', borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:700, color:e.color }}>{e.value}</div>
              <div className="text-xs text-muted mb-4">{e.label}</div>
              <div className="text-xs" style={{ color:'var(--success)' }}>{e.change}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
