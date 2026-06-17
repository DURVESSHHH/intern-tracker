const Attendance = require('../models/Attendance');
const Task = require('../models/Task');
const User = require('../models/User');

// @route  GET /api/reports/intern/:id  (admin)
exports.getInternReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const intern = await User.findById(req.params.id);
    if (!intern) return res.status(404).json({ success: false, message: 'Intern not found.' });

    const start = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, 1);
    const end   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({ intern: intern._id, date: { $gte: start, $lte: end } });
    const tasks      = await Task.find({ assignedTo: intern._id, isActive: true });

    const attendanceSummary = {
      present:    attendance.filter(a => a.status === 'present').length,
      absent:     attendance.filter(a => a.status === 'absent').length,
      late:       attendance.filter(a => a.status === 'late').length,
      leave:      attendance.filter(a => a.status === 'leave').length,
      totalHours: attendance.reduce((s, a) => s + a.hoursWorked, 0).toFixed(1),
    };

    const taskSummary = {
      total:    tasks.length,
      approved: tasks.filter(t => t.status === 'approved').length,
      pending:  tasks.filter(t => t.status === 'pending').length,
      rejected: tasks.filter(t => t.status === 'rejected').length,
    };

    res.json({ success: true, data: { intern, attendanceSummary, taskSummary, attendance, tasks } });
  } catch (err) { next(err); }
};

// @route  GET /api/reports/overview  (admin)
exports.getOverview = async (req, res, next) => {
  try {
    const interns = await User.find({ role: 'intern', isActive: true });

    const report = await Promise.all(interns.map(async (intern) => {
      const tasks = await Task.find({ assignedTo: intern._id, isActive: true });
      const attendance = await Attendance.find({ intern: intern._id });
      return {
        intern: { _id: intern._id, name: intern.name, department: intern.department },
        totalTasks:    tasks.length,
        approvedTasks: tasks.filter(t => t.status === 'approved').length,
        totalDays:     attendance.length,
        presentDays:   attendance.filter(a => ['present','late'].includes(a.status)).length,
        totalHours:    attendance.reduce((s,a) => s + a.hoursWorked, 0).toFixed(1),
      };
    }));

    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};
