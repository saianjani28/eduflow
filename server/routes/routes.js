// routes/index.js — barrel export for all routes

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const cc = require('../controllers/courseController');
const ctrl = require('../controllers/controllers');
const adminCtrl = require('../controllers/adminController');
const upload = require('../middleware/upload');

// ── AUTH ─────────────────────────────────────────────
const authRouter = express.Router();
authRouter.post('/register', auth.register);
authRouter.post('/login',    auth.login);
authRouter.get('/me',        protect, auth.getMe);
authRouter.put('/profile',   protect, auth.updateProfile);
authRouter.put('/password',  protect, auth.changePassword);
module.exports.authRoutes = authRouter;

// ── USERS ─────────────────────────────────────────────
const userRouter = express.Router();
userRouter.get('/',          protect, authorize('admin'), ctrl.getAllUsers);
userRouter.get('/learners',  protect, authorize('instructor','admin'), ctrl.getLearners);
userRouter.get('/:id',       protect, ctrl.getUserById);
userRouter.put('/:id',       protect, authorize('admin'), ctrl.updateUser);
userRouter.delete('/:id',    protect, authorize('admin'), ctrl.deleteUser);
module.exports.userRoutes = userRouter;

// ── COURSES ───────────────────────────────────────────
const courseRouter = express.Router();
courseRouter.get('/',           protect, cc.getAllCourses);
courseRouter.get('/my',         protect, authorize('instructor','admin'), cc.getInstructorCourses);
courseRouter.get('/:id',        protect, cc.getCourse);
courseRouter.post('/',          protect, authorize('instructor','admin'), cc.createCourse);
courseRouter.put('/:id',        protect, authorize('instructor','admin'), cc.updateCourse);
courseRouter.put('/:id/publish',protect, authorize('instructor','admin'), cc.publishCourse);
courseRouter.delete('/:id',     protect, authorize('instructor','admin'), cc.deleteCourse);
module.exports.courseRoutes = courseRouter;

// ── LESSONS ───────────────────────────────────────────
const lessonRouter = express.Router();
lessonRouter.get('/:courseId',  protect, ctrl.getLessons);
lessonRouter.post('/:courseId', protect, authorize('instructor','admin'), ctrl.createLesson);
lessonRouter.put('/:id',        protect, authorize('instructor','admin'), ctrl.updateLesson);
lessonRouter.delete('/:id',     protect, authorize('instructor','admin'), ctrl.deleteLesson);
module.exports.lessonRoutes = lessonRouter;

// ── ENROLLMENTS ───────────────────────────────────────
const enrollRouter = express.Router();
enrollRouter.get('/my',                   protect, ctrl.getMyEnrollments);
enrollRouter.get('/course/:courseId',     protect, authorize('instructor','admin'), ctrl.getCourseEnrollments);
enrollRouter.post('/course/:courseId',    protect, ctrl.enroll);
enrollRouter.delete('/course/:courseId',  protect, ctrl.unenroll);
module.exports.enrollmentRoutes = enrollRouter;

// ── ASSIGNMENTS ───────────────────────────────────────
const assignRouter = express.Router();
assignRouter.get('/',       protect, ctrl.getAssignments);
assignRouter.post('/',      protect, authorize('instructor','admin'), ctrl.createAssignment);
assignRouter.put('/:id',    protect, authorize('instructor','admin'), ctrl.updateAssignment);
assignRouter.delete('/:id', protect, authorize('instructor','admin'), ctrl.deleteAssignment);
module.exports.assignmentRoutes = assignRouter;

// ── SUBMISSIONS ───────────────────────────────────────
const subRouter = express.Router();
subRouter.get('/my',                       protect, ctrl.getMySubmissions);
subRouter.get('/assignment/:assignmentId', protect, authorize('instructor','admin'), ctrl.getSubmissions);
subRouter.post('/assignment/:assignmentId',protect, upload.single('file'), ctrl.submit);
subRouter.put('/:id/grade',               protect, authorize('instructor','admin'), ctrl.gradeSubmission);
module.exports.submissionRoutes = subRouter;

// ── QUIZZES ───────────────────────────────────────────
const quizRouter = express.Router();
quizRouter.get('/',             protect, ctrl.getQuizzes);
quizRouter.get('/results/my',   protect, ctrl.getMyQuizResults);
quizRouter.get('/:id',          protect, ctrl.getQuiz);
quizRouter.post('/',            protect, authorize('instructor','admin'), ctrl.createQuiz);
quizRouter.post('/:id/submit',  protect, ctrl.submitQuiz);
module.exports.quizRoutes = quizRouter;

// ── PROGRESS ──────────────────────────────────────────
const progressRouter = express.Router();
progressRouter.get('/',                              protect, ctrl.getAllProgress);
progressRouter.get('/:courseId',                     protect, ctrl.getProgress);
progressRouter.post('/:courseId/lesson/:lessonId',   protect, ctrl.markLessonComplete);
module.exports.progressRoutes = progressRouter;

// ── MESSAGES ──────────────────────────────────────────
const msgRouter = express.Router();
msgRouter.get('/contacts', protect, ctrl.getContacts);
msgRouter.get('/:userId',  protect, ctrl.getConversation);
msgRouter.post('/',        protect, ctrl.sendMessage);
module.exports.messageRoutes = msgRouter;

// ── ANNOUNCEMENTS ────────────────────────────────────
const anncRouter = express.Router();
anncRouter.get('/',       protect, ctrl.getAnnouncements);
anncRouter.post('/',      protect, authorize('instructor','admin'), ctrl.createAnnouncement);
anncRouter.delete('/:id', protect, authorize('instructor','admin'), ctrl.deleteAnnouncement);
module.exports.announcementRoutes = anncRouter;

// ── CERTIFICATES ──────────────────────────────────────
const certRouter = express.Router();
certRouter.get('/my',          protect, ctrl.getMyCertificates);
certRouter.get('/verify/:certId', ctrl.verifyCertificate);
module.exports.certificateRoutes = certRouter;

// ── ADMIN ─────────────────────────────────────────────
const adminRouter = express.Router();
adminRouter.get('/stats',            protect, authorize('admin'), adminCtrl.getStats);
adminRouter.get('/users',            protect, authorize('admin'), adminCtrl.getAllUsers);
adminRouter.put('/users/:id',        protect, authorize('admin'), adminCtrl.updateUser);
adminRouter.delete('/users/:id',     protect, authorize('admin'), adminCtrl.deleteUser);
adminRouter.get('/courses',          protect, authorize('admin'), adminCtrl.getAllCourses);
adminRouter.put('/courses/:id/toggle', protect, authorize('admin'), adminCtrl.toggleCoursePublish);
adminRouter.delete('/courses/:id',   protect, authorize('admin'), adminCtrl.deleteCourse);
module.exports.adminRoutes = adminRouter;
