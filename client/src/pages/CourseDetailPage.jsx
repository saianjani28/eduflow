import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Modal, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

const THUMBS = { Frontend:'⚛️', Backend:'🟢', Design:'🎨', DevOps:'🐳', 'AI/ML':'🤖' }
const COLORS  = { Frontend:'#eff2ff', Backend:'#d1fae5', Design:'#f3f0ff', DevOps:'#fef3c7', 'AI/ML':'#fee2e2' }

export default function CourseDetailPage() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse]         = useState(null)
  const [lessons, setLessons]       = useState([])
  const [enrollCount, setEnrollCount] = useState(0)
  const [enrolled, setEnrolled]     = useState(false)
  const [loading, setLoading]       = useState(true)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonForm, setLessonForm] = useState({ title:'', type:'video', contentUrl:'', duration:'' })

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/courses/${id}`)
        setCourse(data.course)
        setLessons(data.lessons)
        setEnrollCount(data.enrollmentCount)
        if (user.role === 'learner') {
          const enr = await api.get('/enrollments/my')
          setEnrolled(enr.data.enrollments.some(e => String(e.course?._id) === id))
        }
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleEnroll() {
    try {
      await api.post(`/enrollments/course/${id}`)
      setEnrolled(true); setEnrollCount(p => p + 1)
      alert('✅ Enrolled!')
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handlePublish() {
    try {
      const { data } = await api.put(`/courses/${id}/publish`)
      setCourse(data.course)
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleAddLesson(e) {
    e.preventDefault()
    try {
      const { data } = await api.post(`/lessons/${id}`, { ...lessonForm, order: lessons.length + 1 })
      setLessons(p => [...p, data.lesson])
      setShowAddLesson(false)
      setLessonForm({ title:'', type:'video', contentUrl:'', duration:'' })
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleDeleteLesson(lid) {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await api.delete(`/lessons/${lid}`)
      setLessons(p => p.filter(l => l._id !== lid))
    } catch {}
  }

  if (loading) return <Spinner />
  if (!course)  return <div className="empty-state"><p>Course not found.</p></div>

  const thumb  = THUMBS[course.category] || '📘'
  const color  = COLORS[course.category] || '#f3f4f6'
  const isOwner = (user.role === 'instructor' && String(course.instructor?._id) === String(user._id)) || user.role === 'admin'

  return (
    <div>
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate(-1)}>← Back</button>

      <div className="card mb-16" style={{ display:'flex', gap:24, alignItems:'flex-start' }}>
        <div style={{ width:110, height:110, borderRadius:16, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, flexShrink:0 }}>
          {thumb}
        </div>
        <div style={{ flex:1 }}>
          <div className="flex gap-8 mb-8">
            <span className="tag tag-blue">{course.category}</span>
            <span className="tag tag-gray">{course.level}</span>
            <span className={`chip ${course.isPublished ? 'chip-active' : 'chip-pending'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
          </div>
          <h1 style={{ fontSize:22, marginBottom:8 }}>{course.title}</h1>
          <p className="text-muted mb-16">{course.description}</p>
          <div className="flex gap-16 text-sm text-muted mb-16">
            <span>👨‍🏫 {course.instructor?.name}</span>
            <span>⏱ {course.duration || 'TBD'}</span>
            <span>👥 {enrollCount} enrolled</span>
            <span>📖 {lessons.length} lessons</span>
          </div>
          <div className="flex gap-8">
            {user.role === 'learner' && (
              enrolled
                ? <button className="btn btn-success" onClick={() => navigate('/my-learning')}>▶ Go to Course</button>
                : <button className="btn btn-primary btn-lg" onClick={handleEnroll}>Enroll Now — Free</button>
            )}
            {isOwner && !course.isPublished && (
              <button className="btn btn-success" onClick={handlePublish}>🚀 Publish Course</button>
            )}
            {isOwner && (
              <button className="btn btn-ghost" onClick={() => setShowAddLesson(true)}>+ Add Lesson</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="section-title">Course Content — {lessons.length} Lessons</span>
        </div>
        {lessons.map((l, i) => (
          <div key={l._id} className="flex items-center gap-12"
            style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'var(--light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
              {l.type === 'video' ? '▶️' : '📄'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500, fontSize:13 }}>{i+1}. {l.title}</div>
              <div className="text-xs text-muted">{l.type}{l.duration ? ` · ${l.duration}` : ''}</div>
            </div>
            {isOwner && (
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }}
                onClick={() => handleDeleteLesson(l._id)}>🗑️</button>
            )}
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <p>No lessons yet.{isOwner && ' Add your first lesson above.'}</p>
          </div>
        )}
      </div>

      {showAddLesson && (
        <Modal title="Add New Lesson" onClose={() => setShowAddLesson(false)}>
          <form onSubmit={handleAddLesson}>
            <div className="form-group"><label className="form-label">Title</label>
              <input className="form-input" value={lessonForm.title}
                onChange={e => setLessonForm(p => ({...p,title:e.target.value}))} required placeholder="Lesson title" />
            </div>
            <div className="grid-2 gap-16">
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-input" value={lessonForm.type}
                  onChange={e => setLessonForm(p => ({...p,type:e.target.value}))}>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Duration</label>
                <input className="form-input" value={lessonForm.duration}
                  onChange={e => setLessonForm(p => ({...p,duration:e.target.value}))} placeholder="e.g. 15m" />
              </div>
            </div>
            <div className="form-group"><label className="form-label">Content URL (optional)</label>
              <input className="form-input" value={lessonForm.contentUrl}
                onChange={e => setLessonForm(p => ({...p,contentUrl:e.target.value}))} placeholder="https://..." />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Add Lesson</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddLesson(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
