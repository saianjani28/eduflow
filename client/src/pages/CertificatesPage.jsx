import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certs, setCerts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data.certificates)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      {certs.length > 0 && (
        <div className="grid-3 mb-20">
          <div className="stat-card"><div className="stat-icon" style={{ background:'#fef3c7' }}>🏆</div><div className="stat-value">{certs.length}</div><div className="stat-label">Certificates Earned</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'#d1fae5' }}>✅</div><div className="stat-value">{certs.length}</div><div className="stat-label">Courses Completed</div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background:'#eff2ff' }}>📅</div><div className="stat-value">{new Date(certs[0]?.issuedAt).getFullYear()}</div><div className="stat-label">Latest Year</div></div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
        {certs.map(cert => (
          <div key={cert._id} className="cert-box">
            <div style={{ fontSize:52, marginBottom:12 }}>🏆</div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>
              Certificate of Completion
            </div>
            <div className="cert-title">{cert.course?.title}</div>
            <div style={{ fontSize:14, color:'var(--muted)', marginBottom:4 }}>Awarded to</div>
            <div style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>{user.name}</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>
              Certificate ID: <code style={{ fontSize:11, background:'rgba(79,110,247,.08)', padding:'2px 6px', borderRadius:4 }}>{cert.certificateId}</code>
            </div>
            <div style={{ fontSize:12.5, color:'var(--muted)', marginBottom:20 }}>
              EduFlow LMS · {new Date(cert.issuedAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
            </div>
            <div className="flex gap-8 justify-center">
              <button className="btn btn-primary btn-sm" onClick={() => window.print()}>⬇ Download PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(cert.certificateId); alert('Certificate ID copied!') }}>📋 Copy ID</button>
            </div>
          </div>
        ))}

        {certs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <p style={{ marginBottom:8 }}>No certificates yet.</p>
            <p className="text-sm text-muted">Complete a course 100% to earn your first certificate!</p>
          </div>
        )}
      </div>
    </div>
  )
}
