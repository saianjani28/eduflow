const { Enrollment, Lesson, Assignment, Submission, Quiz, QuizResult, Progress, Message, Announcement, Certificate } = require('../models/models');
const Course = require('../models/Course');
const User = require('../models/User');

// ── ENROLLMENT ────────────────────────────────────────
exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const exists = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (exists) return res.status(400).json({ message: 'Already enrolled' });
    const enrollment = await Enrollment.create({ user: req.user._id, course: course._id });
    await Progress.create({ user: req.user._id, course: course._id }).catch(() => {});
    res.status(201).json({ enrollment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.unenroll = async (req, res) => {
  try {
    await Enrollment.findOneAndDelete({ user: req.user._id, course: req.params.courseId });
    res.json({ message: 'Unenrolled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
    res.json({ enrollments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('user', 'name email avatar');
    res.json({ enrollments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── LESSONS ───────────────────────────────────────────
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
    res.json({ lessons });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, course: req.params.courseId });
    res.status(201).json({ lesson });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ lesson });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lesson deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ASSIGNMENTS ───────────────────────────────────────
exports.getAssignments = async (req, res) => {
  try {
    const filter = req.query.courseId ? { course: req.query.courseId } : {};
    const assignments = await Assignment.find(filter).populate('course', 'title');
    res.json({ assignments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createAssignment = async (req, res) => {
  try {
    const a = await Assignment.create(req.body);
    res.status(201).json({ assignment: a });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateAssignment = async (req, res) => {
  try {
    const a = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ assignment: a });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SUBMISSIONS ───────────────────────────────────────
exports.submit = async (req, res) => {
  try {
    const existing = await Submission.findOne({ assignment: req.params.assignmentId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });
    const sub = await Submission.create({
      assignment: req.params.assignmentId, user: req.user._id,
      fileUrl: req.file ? `/uploads/submissions/${req.file.filename}` : '',
      notes: req.body.notes || ''
    });
    res.status(201).json({ submission: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.gradeSubmission = async (req, res) => {
  try {
    const sub = await Submission.findByIdAndUpdate(req.params.id,
      { grade: req.body.grade, feedback: req.body.feedback, status: 'graded', gradedAt: Date.now() },
      { new: true }).populate('user', 'name').populate('assignment', 'title');
    res.json({ submission: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getSubmissions = async (req, res) => {
  try {
    const subs = await Submission.find({ assignment: req.params.assignmentId }).populate('user', 'name email avatar');
    res.json({ submissions: subs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getMySubmissions = async (req, res) => {
  try {
    const subs = await Submission.find({ user: req.user._id }).populate('assignment', 'title deadline course');
    res.json({ submissions: subs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── QUIZZES ───────────────────────────────────────────
exports.getQuizzes = async (req, res) => {
  try {
    const filter = req.query.courseId ? { course: req.query.courseId } : {};
    const quizzes = await Quiz.find(filter).select('-questions.answer');
    res.json({ quizzes });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.answer');
    res.json({ quiz });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ quiz });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    const { answers } = req.body;
    const score = quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    await QuizResult.create({ quiz: quiz._id, user: req.user._id, answers, score, total: quiz.questions.length });
    res.json({ score, total: quiz.questions.length, percentage: Math.round(score / quiz.questions.length * 100) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getMyQuizResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id }).populate('quiz', 'title course');
    res.json({ results });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PROGRESS ──────────────────────────────────────────
exports.getProgress = async (req, res) => {
  try {
    const p = await Progress.findOne({ user: req.user._id, course: req.params.courseId }).populate('completedLessons');
    res.json({ progress: p });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const totalLessons = await Lesson.countDocuments({ course: courseId });
    let p = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!p) p = await Progress.create({ user: req.user._id, course: courseId });
    if (!p.completedLessons.map(String).includes(lessonId)) p.completedLessons.push(lessonId);
    p.completionPercentage = totalLessons ? Math.round((p.completedLessons.length / totalLessons) * 100) : 0;
    p.lastAccessedAt = Date.now();
    if (p.completionPercentage === 100 && !p.completedAt) {
      p.completedAt = Date.now();
      const exists = await Certificate.findOne({ user: req.user._id, course: courseId });
      if (!exists) await Certificate.create({ user: req.user._id, course: courseId });
    }
    await p.save();
    res.json({ progress: p });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getAllProgress = async (req, res) => {
  try {
    const p = await Progress.find({ user: req.user._id }).populate('course', 'title thumbnail');
    res.json({ progress: p });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MESSAGES ──────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const msg = await Message.create({ from: req.user._id, to: req.body.to, text: req.body.text });
    await msg.populate('from', 'name avatar');
    res.status(201).json({ message: msg });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getConversation = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user._id, to: req.params.userId }, { from: req.params.userId, to: req.user._id }]
    }).sort('createdAt').populate('from', 'name avatar');
    await Message.updateMany({ from: req.params.userId, to: req.user._id }, { read: true });
    res.json({ messages });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getContacts = async (req, res) => {
  try {
    const sent = await Message.distinct('to', { from: req.user._id });
    const received = await Message.distinct('from', { to: req.user._id });
    const ids = [...new Set([...sent.map(String), ...received.map(String)])].filter(id => id !== String(req.user._id));
    const contacts = await User.find({ _id: { $in: ids } }).select('name avatar role');
    res.json({ contacts });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ANNOUNCEMENTS ────────────────────────────────────
exports.getAnnouncements = async (req, res) => {
  try {
    const filter = req.query.courseId ? { course: req.query.courseId } : {};
    const a = await Announcement.find(filter).populate('author', 'name avatar').populate('course', 'title').sort('-createdAt');
    res.json({ announcements: a });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.createAnnouncement = async (req, res) => {
  try {
    const a = await Announcement.create({ ...req.body, author: req.user._id });
    await a.populate('author', 'name avatar');
    res.status(201).json({ announcement: a });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── CERTIFICATES ──────────────────────────────────────
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id }).populate('course', 'title instructor').populate('user', 'name');
    res.json({ certificates: certs });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId }).populate('user', 'name').populate('course', 'title');
    if (!cert) return res.status(404).json({ message: 'Not found', valid: false });
    res.json({ valid: true, certificate: cert });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── USERS ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getLearners = async (req, res) => {
  try {
    const learners = await User.find({ role: 'learner' }).select('-password');
    res.json({ learners });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
