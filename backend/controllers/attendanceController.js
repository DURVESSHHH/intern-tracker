const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @route  POST /api/attendance/checkin  (intern)
exports.checkIn = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ intern: req.user._id, date: today });
    if (existing)
      return res.status(400).json({ success: false, message: 'Already checked in today.' });

    const now = new Date();
    const nineAM = new Date(); nineAM.setHours(9, 0, 0, 0);
    const status = now > nineAM ? 'late' : 'present';

    const record = await Attendance.create({
      intern: req.user._id,
      date: today,
      checkIn: now,
      status,
      notes: req.body.notes,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

// @route  PUT /api/attendance/checkout  (intern)
exports.checkOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ intern: req.user._id, date: today });
    if (!record)
      return res.status(404).json({ success: false, message: 'No check-in found for today.' });
    if (record.checkOut)
      return res.status(400).json({ success: false, message: 'Already checked out today.' });

    record.checkOut = new Date();
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

// @route  GET /api/attendance/my  (intern)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = { intern: req.user._id };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(filter).sort({ date: -1 });
    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent:  records.filter(r => r.status === 'absent').length,
      late:    records.filter(r => r.status === 'late').length,
      leave:   records.filter(r => r.status === 'leave').length,
      totalHours: records.reduce((s, r) => s + r.hoursWorked, 0).toFixed(1),
    };
    res.json({ success: true, stats, data: records });
  } catch (err) { next(err); }
};

// @route  GET /api/attendance/today  (intern) — today's status
exports.getTodayStatus = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const record = await Attendance.findOne({ intern: req.user._id, date: today });
    res.json({ success: true, data: record || null });
  } catch (err) { next(err); }
};

// ─── Admin Routes ──────────────────────────────────────────────────────────────

// @route  GET /api/attendance/all  (admin)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, internId, status } = req.query;
    const filter = {};
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      filter.date = d;
    }
    if (internId) filter.intern = internId;
    if (status) filter.status = status;

    const records = await Attendance.find(filter)
      .populate('intern', 'name email department')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

// @route  POST /api/attendance/mark  (admin — manual entry)
exports.markAttendance = async (req, res, next) => {
  try {
    const { internId, date, status, notes } = req.body;
    const day = new Date(date); day.setHours(0,0,0,0);

    const record = await Attendance.findOneAndUpdate(
      { intern: internId, date: day },
      { status, notes, markedBy: req.user._id },
      { upsert: true, new: true, runValidators: true }
    ).populate('intern', 'name email');

    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};
