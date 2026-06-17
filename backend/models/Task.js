const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submittedAt: { type: Date, default: Date.now },
  content: { type: String, required: true },
  fileUrl: { type: String },
  feedback: { type: String },
  feedbackAt: { type: Date },
  grade: { type: String, enum: ['excellent', 'good', 'average', 'poor', ''] },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'submitted', 'approved', 'rejected', 'revision'],
      default: 'pending',
    },
    dueDate: { type: Date, required: true },
    tags: [{ type: String, trim: true }],
    submission: submissionSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
