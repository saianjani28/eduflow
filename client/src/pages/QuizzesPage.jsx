// QuizzesPage.jsx
import React, { useEffect, useState } from 'react'
import { Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function QuizzesPage() {
  const [quizzes, setQuizzes]   = useState([])
  const [active, setActive]     = useState(null)
  const [answers, setAnswers]   = useState([])
  const [result, setResult]     = useState(null)
  const [qIndex, setQIndex]     = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/quizzes').then(r => setQuizzes(r.data.quizzes)).finally(() => setLoading(false))
  }, [])

  function start(quiz) { setActive(quiz); setAnswers([]); setResult(null); setQIndex(0) }

  function select(i) { const a = [...answers]; a[qIndex] = i; setAnswers(a) }

  async function submit() {
    try {
      const { data } = await api.post(`/quizzes/${active._id}/submit`, { answers })
      setResult(data)
    } catch { alert('Submission failed') }
  }

  if (loading) return <Spinner />

  if (result) return (
    <div className="card" style={{ maxWidth:480, margin:'0 auto', textAlign:'center', padding:40 }}>
      <div style={{ fontSize:56, marginBottom:12 }}>{result.percentage>=80?'🏆':result.percentage>=60?'👍':'📖'}</div>
      <h2 style={{ fontSize:22, marginBottom:8 }}>{result.percentage>=80?'Excellent!':result.percentage>=60?'Good Job!':'Keep Practicing!'}</h2>
      <div style={{ fontSize:42, fontWeight:700, color: result.percentage>=80?'var(--success)':result.percentage>=60?'var(--warn)':'var(--danger)', margin:'12px 0' }}>
        {result.percentage}%
      </div>
      <p className="text-muted mb-20">{result.score} / {result.total} correct</p>
      <div className="flex gap-8 justify-center">
        <button className="btn btn-ghost" onClick={() => start(active)}>Retry</button>
        <button className="btn btn-primary" onClick={() => { setActive(null); setResult(null) }}>Done</button>
      </div>
    </div>
  )

  if (active) {
    const q   = active.questions[qIndex]
    const last = qIndex === active.questions.length - 1
    return (
      <div className="card" style={{ maxWidth:560, margin:'0 auto' }}>
        <div className="flex justify-between mb-4">
          <span className="section-title">{active.title}</span>
          <span className="text-xs text-muted">{qIndex+1}/{active.questions.length}</span>
        </div>
        <div className="progress-bar mb-20">
          <div className="progress-fill" style={{ width:`${((qIndex+1)/active.questions.length)*100}%` }} />
        </div>
        <p style={{ fontSize:15, fontWeight:500, marginBottom:16 }}>{q.question}</p>
        {q.options.map((opt, i) => (
          <div key={i} className={`quiz-option${answers[qIndex]===i?' selected':''}`} onClick={() => select(i)}>
            {String.fromCharCode(65+i)}. {opt}
          </div>
        ))}
        <div className="flex justify-between mt-20">
          {qIndex > 0 ? <button className="btn btn-ghost" onClick={() => setQIndex(p=>p-1)}>← Back</button> : <span />}
          {last
            ? <button className="btn btn-success" onClick={submit} disabled={answers[qIndex]===undefined}>Submit Quiz</button>
            : <button className="btn btn-primary" onClick={() => setQIndex(p=>p+1)} disabled={answers[qIndex]===undefined}>Next →</button>}
        </div>
        <button className="btn btn-ghost btn-sm mt-8" style={{ width:'100%' }} onClick={() => setActive(null)}>Cancel Quiz</button>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {quizzes.map(q => (
        <div key={q._id} className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ fontSize:15, marginBottom:4 }}>{q.title}</h3>
              <p className="text-muted text-sm">{q.questions?.length||0} questions · Multiple choice</p>
            </div>
            <button className="btn btn-primary" onClick={() => start(q)}>Take Quiz →</button>
          </div>
        </div>
      ))}
      {quizzes.length === 0 && <div className="empty-state"><div className="empty-icon">✅</div><p>No quizzes available.</p></div>}
    </div>
  )
}
