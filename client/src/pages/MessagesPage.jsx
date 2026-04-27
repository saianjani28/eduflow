import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/UI/index.jsx'
import api from '../utils/api.js'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
}

export default function MessagesPage() {
  const { user }  = useAuth()
  const [contacts, setContacts]   = useState([])
  const [allUsers, setAllUsers]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [messages, setMessages]   = useState([])
  const [text, setText]           = useState('')
  const [loading, setLoading]     = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [c, u] = await Promise.all([
          api.get('/messages/contacts'),
          user.role === 'learner'
            ? api.get('/users/learners').catch(() => ({ data:{ learners:[] } }))
            : api.get('/users/learners').catch(() => ({ data:{ learners:[] } }))
        ])
        setContacts(c.data.contacts || [])
        setAllUsers(u.data.learners || u.data.users || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/messages/${selected._id}`).then(r => {
      setMessages(r.data.messages || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
    })
  }, [selected])

  async function sendMsg(e) {
    e.preventDefault()
    if (!text.trim() || !selected) return
    try {
      const { data } = await api.post('/messages', { to: selected._id, text })
      setMessages(p => [...p, data.message])
      setText('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
    } catch {}
  }

  // merge contacts + other users (avoid dups + self)
  const allContacts = [
    ...contacts,
    ...allUsers.filter(u => u._id !== user._id && !contacts.find(c => String(c._id) === String(u._id)))
  ].filter(c => String(c._id) !== String(user._id))

  if (loading) return <Spinner />

  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:16, height:'calc(100vh - 130px)' }}>
      {/* Contact list */}
      <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="section-title mb-16">Contacts</div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {allContacts.map(c => (
            <div key={c._id}
              onClick={() => setSelected(c)}
              className="flex items-center gap-12"
              style={{
                padding:'10px', borderRadius:8, cursor:'pointer', marginBottom:4,
                background: String(selected?._id) === String(c._id) ? '#eff2ff' : 'transparent',
                border: String(selected?._id) === String(c._id) ? '1px solid var(--accent)' : '1px solid transparent',
                transition:'.15s'
              }}>
              <div className="avatar av-md" style={{ background:'#eff2ff', color:'var(--accent)', flexShrink:0 }}>
                {initials(c.name)}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                <div className="text-xs text-muted" style={{ textTransform:'capitalize' }}>{c.role}</div>
              </div>
            </div>
          ))}
          {allContacts.length === 0 && (
            <div className="empty-state" style={{ padding:'20px 0' }}>
              <p className="text-sm text-muted">No contacts yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-12 pb-16" style={{ borderBottom:'1px solid var(--border)', marginBottom:16 }}>
              <div className="avatar av-md" style={{ background:'#eff2ff', color:'var(--accent)' }}>{initials(selected.name)}</div>
              <div>
                <div style={{ fontWeight:600 }}>{selected.name}</div>
                <div className="text-xs" style={{ color:'var(--success)' }}>● Online</div>
              </div>
            </div>

            {/* Messages */}
            <div className="msg-wrap" style={{ flex:1, overflowY:'auto', marginBottom:16, padding:'4px 0' }}>
              {messages.length === 0 && (
                <div className="text-center text-muted text-sm" style={{ padding:20 }}>
                  Start a conversation with {selected.name} 👋
                </div>
              )}
              {messages.map(m => {
                const isMe = String(m.from?._id || m.from) === String(user._id)
                return (
                  <div key={m._id} className={`msg-bubble ${isMe ? 'msg-out' : 'msg-in'}`}>
                    {m.text}
                    <div style={{ fontSize:10, opacity:.6, marginTop:3, textAlign:'right' }}>
                      {new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMsg} className="flex gap-8">
              <input className="form-input" style={{ flex:1 }} placeholder="Type a message…"
                value={text} onChange={e => setText(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send ↑</button>
            </form>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
            <p style={{ color:'var(--muted)', fontSize:14 }}>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
