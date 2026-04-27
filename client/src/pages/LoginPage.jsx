import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const QUICK = [
  { label: 'Learner',    email: 'sam@eduflow.com',   password: 'pass123'  },
  { label: 'Instructor', email: 'alex@eduflow.com',  password: 'pass123'  },
  { label: 'Admin',      email: 'admin@eduflow.com', password: 'admin123' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = async (email, password) => {
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally { setLoading(false) }
  }

  const handleSubmit = e => { e.preventDefault(); doLogin(form.email, form.password) }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back</h1>
          <p className="text-muted text-sm">Sign in to your EduFlow account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button className="btn btn-primary w-full" style={{ width: '100%', justifyContent: 'center' }}
            type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="divider" />

        <div>
          <p className="text-xs text-muted text-center mb-8">Quick demo login</p>
          <div className="flex gap-8" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {QUICK.map(q => (
              <button key={q.email} className="btn btn-secondary btn-sm"
                onClick={() => doLogin(q.email, q.password)} disabled={loading}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-16">
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}
