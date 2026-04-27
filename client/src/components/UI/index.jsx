import React from 'react'

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  )
}

export function StatCard({ icon, value, label, color, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${change.startsWith('+') || change.startsWith('↑') ? 'up' : 'down'}`}>{change}</div>}
    </div>
  )
}

const THUMBS = { Frontend:'⚛️', Backend:'🟢', Design:'🎨', DevOps:'🐳', 'AI/ML':'🤖' }
const COLORS = { Frontend:'#eff2ff', Backend:'#d1fae5', Design:'#f3f0ff', DevOps:'#fef3c7', 'AI/ML':'#fee2e2' }

export function CourseCard({ course, enrolled, progress, onEnroll, onClick }) {
  const thumb = THUMBS[course.category] || '📘'
  const color = COLORS[course.category] || '#f3f4f6'
  const pct   = progress?.completionPercentage || 0

  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-thumb" style={{ background: color }}>{thumb}</div>
      <div className="course-body">
        <div className="flex gap-6 mb-8">
          <span className="tag tag-blue">{course.category}</span>
          <span className="tag tag-gray">{course.level}</span>
        </div>
        <div className="course-title">{course.title}</div>
        <div className="course-meta mb-8">{course.duration || 'TBD'} · {course.instructor?.name}</div>
        {enrolled && (
          <>
            <div className="progress-bar mb-4">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-muted">{pct}% complete</div>
          </>
        )}
        <div className="flex gap-8 mt-12">
          {!enrolled && onEnroll && (
            <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onEnroll(course._id) }}>
              Enroll Free
            </button>
          )}
          {enrolled && <span className="chip chip-active">Enrolled</span>}
          {!course.isPublished && <span className="chip chip-pending">Draft</span>}
        </div>
      </div>
    </div>
  )
}

export function Avatar({ name = '', size = 'av-md', role }) {
  const colors = { admin: '#9d174d', instructor: '#5b21b6', learner: '#075985', default: '#4f6ef7' }
  const color = colors[role] || colors.default
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div className={`avatar ${size}`} style={{ background: `${color}22`, color }}>
      {initials}
    </div>
  )
}

export function EmptyState({ icon = '📭', message = 'Nothing here yet.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  )
}

export function Spinner() {
  return <div className="loading-center"><div className="spinner" /></div>
}
