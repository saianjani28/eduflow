const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'learner' });
    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: signToken(user._id), user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = (req, res) => res.json({ user: req.user });

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, bio: req.body.bio }, { new: true });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(req.body.currentPassword)))
      return res.status(400).json({ message: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
