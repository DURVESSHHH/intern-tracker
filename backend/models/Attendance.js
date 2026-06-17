const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    intern: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'leave'],
      default: 'present',
    },
    hoursWorked: { type: Number, default: 0 },
    notes: { type: String, maxlength: 500 },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin override
  },
  { timestamps: true }
);

// Prevent duplicate attendance per intern per day
attendanceSchema.index({ intern: 1, date: 1 }, { unique: true });

// Auto-calculate hours worked
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.hoursWorked = Math.round(diff * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
