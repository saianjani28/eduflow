const User = require('../models/User');
const Course = require('../models/Course');
const { Enrollment, Submission, Certificate, Progress, Announcement, Assignment } = require('../models/models');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, totalCertificates] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
    ]);
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('-password');
    const recentCourses = await Course.find().sort('-createdAt').limit(5).populate('instructor', 'name');

    res.json({
      stats: { totalUsers, totalCourses, totalEnrollments, totalCertificates },
      usersByRole,
      recentUsers,
      recentCourses
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ users });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id))
      return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email').sort('-createdAt');
    res.json({ courses });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ course });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
