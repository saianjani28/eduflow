// CoursesPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Modal, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

const CATS   = ['All','Frontend','Backend','Design','DevOps','AI/ML']
const LEVELS = ['All','Beginner','Intermediate','Advanced']
const THUMBS = { Frontend:'⚛️', Backend:'🟢', Design:'🎨', DevOps:'🐳', 'AI/ML':'🤖' }
const COLORS = { Frontend:'#eff2ff', Backend:'#d1fae5', Design:'#f3f0ff', DevOps:'#fef3c7', 'AI/ML':'#fee2e2' }

export default function CoursesPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const isInst    = user.role !== 'learner'

  const [courses, setCourses]       = useState([])
  const [search, setSearch]         = useState('')
  const [cat, setCat]               = useState('All')
  const [level, setLevel]           = useState('All')
  const [loading, setLoading]       = useState(true)
  const [enrolledIds, setEnrolledIds] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', category:'Frontend', level:'Beginner', duration:'' })

  useEffect(() => { loadCourses(); if (!isInst) loadEnrollments() }, [])

  async function loadCourses() {
    setLoading(true)
    try {
      const ep = isInst ? '/courses/my' : '/courses'
      const { data } = await api.get(ep)
      setCourses(data.courses)
    } finally { setLoading(false) }
  }

  async function loadEnrollments() {
    try {
      const { data } = await api.get('/enrollments/my')
      setEnrolledIds(data.enrollments.map(e => String(e.course?._id)))
    } catch {}
  }

  async function handleEnroll(courseId) {
    try {
      await api.post(`/enrollments/course/${courseId}`)
      setEnrolledIds(p => [...p, courseId])
      alert('✅ Enrolled successfully!')
    } catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await api.post('/courses', form)
      setShowCreate(false)
      setForm({ title:'', description:'', category:'Frontend', level:'Beginner', duration:'' })
      loadCourses()
    } catch (err) { alert(err.response?.data?.message || 'Failed') }
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (cat === 'All' || c.category === cat) &&
    (level === 'All' || c.level === level)
  )

  return (
    <div>
      <div className="flex items-center gap-12 mb-20 flex-wrap">
        <input className="form-input" style={{ maxWidth: 240 }} placeholder="🔍 Search courses…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input" style={{ width: 140 }} value={cat} onChange={e => setCat(e.target.value)}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input" style={{ width: 140 }} value={level} onChange={e => setLevel(e.target.value)}>
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
        {isInst && <button className="btn btn-primary ml-auto" onClick={() => setShowCreate(true)}>+ New Course</button>}
      </div>

      {loading ? <Spinner /> : (
        <div className="grid-3">
          {filtered.map(c => {
            const thumb    = THUMBS[c.category] || '📘'
            const bg       = COLORS[c.category] || '#f3f4f6'
            const enrolled = enrolledIds.includes(String(c._id))
            return (
              <div key={c._id} className="course-card" onClick={() => navigate(`/courses/${c._id}`)}>
                <div className="course-thumb" style={{ background: bg }}>{thumb}</div>
                <div className="course-body">
                  <div className="flex gap-6 mb-8">
                    <span className="tag tag-blue">{c.category}</span>
                    <span className="tag tag-gray">{c.level}</span>
                  </div>
                  <div className="course-title">{c.title}</div>
                  <div className="course-meta mb-8">{c.duration || 'TBD'} · {c.instructor?.name}</div>
                  <div className="flex gap-8 mt-12">
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/courses/${c._id}`) }}>Details</button>
                    {!isInst && !enrolled && (
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); handleEnroll(c._id) }}>Enroll Free</button>
                    )}
                    {!isInst && enrolled && <span className="chip chip-active">Enrolled ✓</span>}
                    {isInst && <span className={`chip ${c.isPublished ? 'chip-active' : 'chip-pending'}`}>{c.isPublished ? 'Live' : 'Draft'}</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">🔍</div>
              <p>No courses found.</p>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <Modal title="Create New Course" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group"><label className="form-label">Title</label>
              <input className="form-input" placeholder="e.g. Advanced JavaScript"
                value={form.title} onChange={e => setForm(p => ({...p,title:e.target.value}))} required />
            </div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} required />
            </div>
            <div className="grid-2 gap-16">
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({...p,category:e.target.value}))}>
                  {['Frontend','Backend','Design','DevOps','AI/ML'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Level</label>
                <select className="form-input" value={form.level} onChange={e => setForm(p => ({...p,level:e.target.value}))}>
                  {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Duration</label>
              <input className="form-input" placeholder="e.g. 8h" value={form.duration} onChange={e => setForm(p => ({...p,duration:e.target.value}))} />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Create Course</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
