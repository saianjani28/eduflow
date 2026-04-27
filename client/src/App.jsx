import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AppLayout from './components/Layout/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import CourseDetailPage from './pages/CourseDetailPage.jsx'
import MyLearningPage from './pages/MyLearningPage.jsx'
import AssignmentsPage from './pages/AssignmentsPage.jsx'
import QuizzesPage from './pages/QuizzesPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import AnnouncementsPage from './pages/AnnouncementsPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import CertificatesPage from './pages/CertificatesPage.jsx'
import StudentsPage from './pages/StudentsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'

const Spinner = () => (
  <div className="loading-center"><div className="spinner" /></div>
)

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/courses"       element={<CoursesPage />} />
        <Route path="/courses/:id"   element={<CourseDetailPage />} />
        <Route path="/my-learning"   element={<PrivateRoute roles={['learner']}><MyLearningPage /></PrivateRoute>} />
        <Route path="/assignments"   element={<AssignmentsPage />} />
        <Route path="/quizzes"       element={<PrivateRoute roles={['learner']}><QuizzesPage /></PrivateRoute>} />
        <Route path="/messages"      element={<MessagesPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/progress"      element={<PrivateRoute roles={['learner']}><ProgressPage /></PrivateRoute>} />
        <Route path="/certificates"  element={<PrivateRoute roles={['learner']}><CertificatesPage /></PrivateRoute>} />
        <Route path="/students"      element={<PrivateRoute roles={['instructor','admin']}><StudentsPage /></PrivateRoute>} />
        <Route path="/analytics"     element={<PrivateRoute roles={['instructor','admin']}><AnalyticsPage /></PrivateRoute>} />
        <Route path="/admin"         element={<PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>} />
        <Route path="/profile"       element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
