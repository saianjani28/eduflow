import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'learner' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎓</div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Create account</h1>
          <p className="text-muted text-sm">Join EduFlow and start learning today</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Jane Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">I want to</label>
            <select className="form-input" value={form.role} onChange={set('role')}>
              <option value="learner">Learn — Enroll in courses</option>
              <option value="instructor">Teach — Create & manage courses</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-16">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
