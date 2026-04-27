const mongoose = require('mongoose');

// Lesson
const lessonSchema = new mongoose.Schema({
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:      { type: String, required: true },
  content:    { type: String, default: '' },
  contentUrl: { type: String, default: '' },
  type:       { type: String, enum: ['video','pdf','text'], default: 'video' },
  order:      { type: Number, default: 0 },
  duration:   { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now }
});
const Lesson = mongoose.model('Lesson', lessonSchema);

// Enrollment
const enrollmentSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status:     { type: String, enum: ['active','completed','dropped'], default: 'active' }
});
enrollmentSchema.index({ user:1, course:1 }, { unique: true });
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// Assignment
const assignmentSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  deadline:    { type: Date, required: true },
  maxMarks:    { type: Number, default: 100 },
  createdAt:   { type: Date, default: Date.now }
});
const Assignment = mongoose.model('Assignment', assignmentSchema);

// Submission
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl:    { type: String, default: '' },
  notes:      { type: String, default: '' },
  grade:      { type: Number, default: null },
  feedback:   { type: String, default: '' },
  status:     { type: String, enum: ['submitted','graded','returned'], default: 'submitted' },
  submittedAt:{ type: Date, default: Date.now },
  gradedAt:   { type: Date }
});
submissionSchema.index({ assignment:1, user:1 }, { unique: true });
const Submission = mongoose.model('Submission', submissionSchema);

// Quiz
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [{ type: String, required: true }],
  answer:   { type: Number, required: true }
});
const quizSchema = new mongoose.Schema({
  course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:     { type: String, required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Quiz = mongoose.model('Quiz', quizSchema);

const quizResultSchema = new mongoose.Schema({
  quiz:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [Number],
  score:   { type: Number, required: true },
  total:   { type: Number, required: true },
  takenAt: { type: Date, default: Date.now }
});
const QuizResult = mongoose.model('QuizResult', quizResultSchema);

// Progress
const progressSchema = new mongoose.Schema({
  user:                { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:              { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  completionPercentage:{ type: Number, default: 0 },
  lastAccessedAt:      { type: Date, default: Date.now },
  completedAt:         { type: Date }
});
progressSchema.index({ user:1, course:1 }, { unique: true });
const Progress = mongoose.model('Progress', progressSchema);

// Message
const messageSchema = new mongoose.Schema({
  from:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true },
  read:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Announcement
const announcementSchema = new mongoose.Schema({
  course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  body:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model('Announcement', announcementSchema);

// Certificate
const certificateSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt:      { type: Date, default: Date.now },
  certificateId: { type: String, unique: true }
});
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    this.certificateId = 'CERT-' + Date.now() + '-' + Math.random().toString(36).substr(2,9).toUpperCase();
  }
  next();
});
const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = { Lesson, Enrollment, Assignment, Submission, Quiz, QuizResult, Progress, Message, Announcement, Certificate };
