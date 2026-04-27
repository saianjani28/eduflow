import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Modal, Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

function InstructorAssignment({ a, onGrade, setGradeForm }) {
  const [subs, setSubs] = useState([])
  const [open, setOpen] = useState(false)

  async function toggle() {
    if (!open) {
      const { data } = await api.get(`/submissions/assignment/${a._id}`)
      setSubs(data.submissions)
    }
    setOpen(p => !p)
  }

  return (
    <div className="card mb-16">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 style={{ fontSize:15, marginBottom:4 }}>{a.title}</h3>
          <p className="text-muted text-sm mb-4">{a.description}</p>
          <span className="tag tag-blue">{a.course?.title}</span>
          <span className="text-xs text-muted ml-auto"> · Due {new Date(a.deadline).toLocaleDateString()}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>{open ? 'Hide ▲' : 'Submissions ▼'}</button>
      </div>
      {open && (
        <div className="table-wrap mt-16">
          <table>
            <thead><tr><th>Student</th><th>Notes</th><th>Status</th><th>Grade</th><th>Action</th></tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s._id}>
                  <td><div className="flex items-center gap-8">
                    <div className="avatar av-sm" style={{ background:'#eff2ff', color:'var(--accent)' }}>
                      {(s.user?.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    {s.user?.name}
                  </div></td>
                  <td style={{ color:'var(--muted)', fontSize:12 }}>{s.notes || '—'}</td>
                  <td><span className={`chip ${s.grade!==null?'chip-active':'chip-pending'}`}>{s.grade!==null?'Graded':'Pending'}</span></td>
                  <td>{s.grade!==null ? <strong>{s.grade}/100</strong> : '—'}</td>
                  <td><button className="btn btn-primary btn-sm"
                    onClick={() => { setGradeForm({grade:s.grade||'',feedback:s.feedback||''}); onGrade(s) }}>
                    {s.grade!==null?'Edit Grade':'Grade'}
                  </button></td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan="5" style={{ textAlign:'center', color:'var(--muted)', padding:20 }}>No submissions yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const isInst   = user.role !== 'learner'

  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [showSubmit, setShowSubmit]   = useState(null)
  const [showGrade, setShowGrade]     = useState(null)
  const [form, setForm] = useState({ course:'', title:'', description:'', deadline:'' })
  const [gradeForm, setGradeForm] = useState({ grade:'', feedback:'' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/assignments')
      setAssignments(data.assignments)
      if (!isInst) {
        const s = await api.get('/submissions/my')
        setSubmissions(s.data.submissions)
      } else {
        const c = await api.get('/courses/my')
        setCourses(c.data.courses)
      }
    } finally { setLoading(false) }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try { await api.post('/assignments', form); setShowCreate(false); load() }
    catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleSubmit(e, aid) {
    e.preventDefault()
    const fd = new FormData(e.target)
    try { await api.post(`/submissions/assignment/${aid}`, fd); setShowSubmit(null); load() }
    catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  async function handleGrade(e, sid) {
    e.preventDefault()
    try { await api.put(`/submissions/${sid}/grade`, gradeForm); setShowGrade(null); load() }
    catch (err) { alert(err.response?.data?.message || 'Error') }
  }

  if (loading) return <Spinner />

  return (
    <div>
      {isInst && (
        <div className="flex justify-end mb-20">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Assignment</button>
        </div>
      )}

      {isInst ? (
        assignments.map(a => (
          <InstructorAssignment key={a._id} a={a} onGrade={setShowGrade} setGradeForm={setGradeForm} />
        ))
      ) : (
        assignments.map(a => {
          const sub = submissions.find(s => String(s.assignment?._id) === String(a._id))
          return (
            <div key={a._id} className="card mb-16">
              <div className="flex items-start justify-between">
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:15, marginBottom:4 }}>{a.title}</h3>
                  <p className="text-muted text-sm mb-8">{a.description}</p>
                  <div className="flex gap-8">
                    {a.course?.title && <span className="tag tag-blue">{a.course.title}</span>}
                    <span className="text-xs text-muted">📅 Due: {new Date(a.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign:'right', marginLeft:20 }}>
                  {sub ? (
                    <>
                      <span className="chip chip-active">✓ Submitted</span>
                      {sub.grade !== null
                        ? <div style={{ marginTop:8 }}>
                            <span style={{ fontSize:20, fontWeight:700, color:'var(--accent)' }}>{sub.grade}/100</span>
                            <br /><span className="text-xs text-muted">{sub.feedback}</span>
                          </div>
                        : <div className="text-xs text-muted mt-4">Awaiting grade</div>}
                    </>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setShowSubmit(a)}>Submit</button>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}

      {assignments.length === 0 && <div className="empty-state"><div className="empty-icon">📝</div><p>No assignments yet.</p></div>}

      {showCreate && (
        <Modal title="New Assignment" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group"><label className="form-label">Course</label>
              <select className="form-input" value={form.course} onChange={e => setForm(p=>({...p,course:e.target.value}))} required>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required />
            </div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} required />
            </div>
            <div className="form-group"><label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline} onChange={e => setForm(p=>({...p,deadline:e.target.value}))} required />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {showSubmit && (
        <Modal title={`Submit: ${showSubmit.title}`} onClose={() => setShowSubmit(null)}>
          <form onSubmit={e => handleSubmit(e, showSubmit._id)}>
            <div className="form-group"><label className="form-label">Upload File</label>
              <input type="file" name="file" className="form-input" required />
            </div>
            <div className="form-group"><label className="form-label">Notes (optional)</label>
              <textarea name="notes" className="form-input" placeholder="Any notes for the instructor…" />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Submit Assignment</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowSubmit(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {showGrade && (
        <Modal title="Grade Submission" onClose={() => setShowGrade(null)}>
          <div className="flex items-center gap-10 mb-16 p-12" style={{ background:'var(--surface)', borderRadius:8 }}>
            <div className="avatar av-md" style={{ background:'#eff2ff', color:'var(--accent)' }}>
              {(showGrade.user?.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600 }}>{showGrade.user?.name}</div>
              <div className="text-xs text-muted">Submission ID: {showGrade._id?.slice(-8)}</div>
            </div>
          </div>
          <form onSubmit={e => handleGrade(e, showGrade._id)}>
            <div className="form-group"><label className="form-label">Grade (0–100)</label>
              <input type="number" min="0" max="100" className="form-input" value={gradeForm.grade}
                onChange={e => setGradeForm(p=>({...p,grade:e.target.value}))} required />
            </div>
            <div className="form-group"><label className="form-label">Feedback</label>
              <textarea className="form-input" value={gradeForm.feedback}
                onChange={e => setGradeForm(p=>({...p,feedback:e.target.value}))} placeholder="Write feedback for the student…" />
            </div>
            <div className="flex gap-8">
              <button type="submit" className="btn btn-primary">Save Grade</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowGrade(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
