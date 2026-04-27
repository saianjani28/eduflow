const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const {
  authRoutes, userRoutes, courseRoutes, lessonRoutes,
  enrollmentRoutes, assignmentRoutes, submissionRoutes,
  quizRoutes, progressRoutes, messageRoutes,
  announcementRoutes, certificateRoutes, adminRoutes
} = require('./routes/routes');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/lessons',       lessonRoutes);
app.use('/api/enrollments',   enrollmentRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/submissions',   submissionRoutes);
app.use('/api/quizzes',       quizRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/admin',         adminRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eduflow')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log('🚀 Server → http://localhost:' + PORT));
  })
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });
