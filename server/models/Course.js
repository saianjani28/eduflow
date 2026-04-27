const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:    { type: String, required: true },
  level:       { type: String, enum: ['Beginner','Intermediate','Advanced'], default: 'Beginner' },
  thumbnail:   { type: String, default: '' },
  duration:    { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  tags:        [String],
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});
courseSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
module.exports = mongoose.model('Course', courseSchema);
