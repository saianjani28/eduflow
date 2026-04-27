# EduFlow LMS — Enterprise Learning Management System
### React Vite + Node.js + MongoDB · Full JSX Components

---

## 🚀 Quick Start

### 1. Install all dependencies
```bash
npm run install-all
```

### 2. Configure environment
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start dev servers (runs both client + server)
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 🔑 Demo Credentials

| Role       | Email                | Password  |
|------------|----------------------|-----------|
| Admin      | admin@eduflow.com    | admin123  |
| Instructor | alex@eduflow.com     | pass123   |
| Learner    | sam@eduflow.com      | pass123   |

---

## 📁 Project Structure

```
eduflow-vite/
├── package.json              ← Root scripts (concurrently)
│
├── server/                   ← Node.js + Express API
│   ├── index.js              ← App entry point
│   ├── .env                  ← Environment variables
│   ├── models/
│   │   ├── User.js           ← User model (bcrypt hashed passwords)
│   │   ├── Course.js         ← Course model
│   │   └── models.js         ← All other models (Lesson, Enrollment,
│   │                           Assignment, Submission, Quiz, Progress,
│   │                           Message, Announcement, Certificate)
│   ├── controllers/
│   │   ├── authController.js     ← Register, login, profile
│   │   ├── courseController.js   ← CRUD for courses
│   │   ├── controllers.js        ← All other controllers
│   │   └── adminController.js    ← Admin-only operations
│   ├── routes/
│   │   └── routes.js         ← All routes in one barrel file
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect + role authorize
│   │   └── upload.js         ← Multer file uploads
│   └── utils/
│       └── seed.js           ← Database seeder
│
└── client/                   ← React Vite Frontend
    ├── index.html
    ├── vite.config.js        ← Vite + API proxy config
    ├── package.json
    └── src/
        ├── main.jsx          ← React entry point
        ├── App.jsx           ← Router + protected routes
        ├── index.css         ← Global design system
        ├── context/
        │   └── AuthContext.jsx    ← JWT auth state management
        ├── utils/
        │   └── api.js             ← Axios with auto token injection
        ├── components/
        │   ├── Layout/
        │   │   └── AppLayout.jsx  ← Sidebar + Topbar layout
        │   └── UI/
        │       └── index.jsx      ← Modal, StatCard, CourseCard, Avatar…
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx      ← Role-aware (Learner/Instructor/Admin)
            ├── AdminPage.jsx          ← Full admin panel (users + courses)
            ├── CoursesPage.jsx
            ├── CourseDetailPage.jsx
            ├── MyLearningPage.jsx
            ├── AssignmentsPage.jsx
            ├── QuizzesPage.jsx
            ├── ProgressPage.jsx
            ├── CertificatesPage.jsx
            ├── MessagesPage.jsx
            ├── AnnouncementsPage.jsx
            ├── StudentsPage.jsx
            ├── AnalyticsPage.jsx
            └── ProfilePage.jsx
```

---

## 🧰 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite 5, React Router v6       |
| Styling    | Pure CSS (custom design system)         |
| HTTP       | Axios with JWT interceptors             |
| Backend    | Node.js, Express.js                     |
| Auth       | JWT + Bcrypt                            |
| Database   | MongoDB + Mongoose                      |
| Uploads    | Multer                                  |
| Dev Tools  | Nodemon, Concurrently                   |

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/courses` | List all published courses |
| POST | `/api/courses` | Create course (instructor) |
| GET  | `/api/courses/:id` | Course detail + lessons |
| POST | `/api/enrollments/course/:id` | Enroll in course |
| GET  | `/api/assignments` | List assignments |
| POST | `/api/submissions/assignment/:id` | Submit assignment |
| POST | `/api/quizzes/:id/submit` | Submit quiz |
| POST | `/api/progress/:courseId/lesson/:lessonId` | Mark lesson complete |
| GET  | `/api/certificates/my` | My certificates |
| GET  | `/api/admin/stats` | Admin platform stats |
| GET  | `/api/admin/users` | All users (admin only) |
| PUT  | `/api/admin/courses/:id/toggle` | Toggle publish (admin) |

---

## ✨ Features

- **Role-based access** — Learner, Instructor, Admin (each with distinct UI)
- **Admin Panel** — Manage all users (edit role, status, delete) and all courses (publish/unpublish/delete)
- **Course Management** — Create, publish, add/remove lessons
- **Enrollment System** — One-click enroll, progress tracking per lesson
- **Assignment Workflow** — Create → Submit → Grade → Feedback
- **Quiz Engine** — Multi-choice, instant scoring, retry support
- **Certificate System** — Auto-issued on 100% course completion
- **Messaging** — Direct chat between any two users
- **Announcements** — Course-level announcements with delete
- **Analytics** — Enrollment stats, learner activity, engagement metrics
- **File Uploads** — Assignment submissions via Multer
- **JWT Auth** — Secure, token-based with auto-refresh interceptor
