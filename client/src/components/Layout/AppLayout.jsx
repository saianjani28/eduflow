import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV = {
  learner: [
    { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
    { to: '/courses',       icon: '📚', label: 'Browse Courses' },
    { to: '/my-learning',   icon: '🎓', label: 'My Learning' },
    { to: '/assignments',   icon: '📝', label: 'Assignments' },
    { to: '/quizzes',       icon: '✅', label: 'Quizzes' },
    { to: '/progress',      icon: '📈', label: 'My Progress' },
    { to: '/certificates',  icon: '🏆', label: 'Certificates' },
    { to: '/messages',      icon: '💬', label: 'Messages' },
    { to: '/announcements', icon: '📢', label: 'Announcements' },
  ],
  instructor: [
    { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/courses',       icon: '📚', label: 'My Courses' },
    { to: '/assignments',   icon: '📝', label: 'Assignments' },
    { to: '/students',      icon: '👥', label: 'Students' },
    { to: '/analytics',     icon: '📈', label: 'Analytics' },
    { to: '/messages',      icon: '💬', label: 'Messages' },
    { to: '/announcements', icon: '📢', label: 'Announcements' },
  ],
  admin: [
    { to: '/dashboard',     icon: '📊', label: 'Dashboard' },
    { to: '/admin',         icon: '🛡️', label: 'Admin Panel' },
    { to: '/courses',       icon: '📚', label: 'All Courses' },
    { to: '/students',      icon: '👥', label: 'All Users' },
    { to: '/assignments',   icon: '📝', label: 'Assignments' },
    { to: '/analytics',     icon: '📈', label: 'Analytics' },
    { to: '/messages',      icon: '💬', label: 'Messages' },
    { to: '/announcements', icon: '📢', label: 'Announcements' },
  ],
}

const TITLES = {
  '/dashboard': 'Dashboard', '/courses': 'Courses', '/my-learning': 'My Learning',
  '/assignments': 'Assignments', '/quizzes': 'Quizzes', '/progress': 'My Progress',
  '/certificates': 'Certificates', '/messages': 'Messages', '/announcements': 'Announcements',
  '/students': 'Students', '/analytics': 'Analytics', '/admin': 'Admin Panel', '/profile': 'My Profile',
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const roleColor = { admin: '#9d174d', instructor: '#5b21b6', learner: '#075985' }

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const path = window.location.pathname
  const navItems = NAV[user?.role] || NAV.learner
  const title = Object.entries(TITLES).find(([k]) => path.startsWith(k))?.[1] || 'EduFlow'
  const color = roleColor[user?.role] || '#4f6ef7'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-wrap">
            <div className="logo-icon">🎓</div>
            <span className="logo-text">EduFlow</span>
          </div>
        </div>

        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar av-md" style={{ background: `${color}22`, color }}>
              {initials(user?.name)}
            </div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <span className={`chip chip-${user?.role}`} style={{ textTransform: 'capitalize' }}>
              {user?.role}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>
              <div className="avatar av-sm" style={{ background: `${color}22`, color }}>
                {initials(user?.name)}
              </div>
              {user?.name}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
