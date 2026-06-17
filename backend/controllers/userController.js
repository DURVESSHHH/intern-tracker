const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Task = require('../models/Task');

// @route  GET /api/users  (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (department) filter.department = new RegExp(department, 'i');

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// @route  GET /api/users/:id  (admin)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Quick stats
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: user._id, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const attendanceStats = await Attendance.aggregate([
      { $match: { intern: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, data: user, taskStats, attendanceStats });
  } catch (err) { next(err); }
};

// @route  PUT /api/users/:id  (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, isActive, organization, internshipStart, internshipEnd } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, isActive, organization, internshipStart, internshipEnd },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route  DELETE /api/users/:id  (admin — soft delete)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) { next(err); }
};

// @route  GET /api/users/dashboard-stats  (admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalInterns   = await User.countDocuments({ role: 'intern', isActive: true });
    const totalTasks     = await Task.countDocuments({ isActive: true });
    const pendingTasks   = await Task.countDocuments({ status: { $in: ['pending','in-progress'] }, isActive: true });
    const submittedTasks = await Task.countDocuments({ status: 'submitted', isActive: true });

    const today = new Date(); today.setHours(0,0,0,0);
    const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['present','late'] } });

    const recentTasks = await Task.find({ isActive: true })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, data: { totalInterns, totalTasks, pendingTasks, submittedTasks, presentToday, recentTasks } });
  } catch (err) { next(err); }
};
