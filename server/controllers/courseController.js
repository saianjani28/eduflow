// courseController.js
const Course = require('../models/Course');
const { Enrollment, Lesson } = require('../models/models');

exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = {};
    if (req.user.role === 'learner') filter.isPublished = true;
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const courses = await Course.find(filter).populate('instructor', 'name avatar');
    res.json({ courses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name avatar bio');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lessons = await Lesson.find({ course: course._id }).sort('order');
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    res.json({ course, lessons, enrollmentCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id });
    res.status(201).json({ course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ course: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json({ courses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    res.json({ course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = exports;
