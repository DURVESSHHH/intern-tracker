const Task = require('../models/Task');

// @route  POST /api/tasks  (admin)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate, tags } = req.body;
    const task = await Task.create({
      title, description, assignedTo, priority, dueDate, tags,
      assignedBy: req.user._id,
    });
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name' },
    ]);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

// @route  GET /api/tasks/my  (intern)
exports.getMyTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = { assignedTo: req.user._id, isActive: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'name')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

// @route  GET /api/tasks  (admin)
exports.getAllTasks = async (req, res, next) => {
  try {
    const { status, assignedTo, priority } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) { next(err); }
};

// @route  GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Interns can only view their own tasks
    if (req.user.role === 'intern' && task.assignedTo._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// @route  PUT /api/tasks/:id  (admin — edit task)
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// @route  POST /api/tasks/:id/submit  (intern)
exports.submitTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.assignedTo.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not your task.' });

    task.submission = { content: req.body.content, fileUrl: req.body.fileUrl };
    task.status = 'submitted';
    await task.save();
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// @route  PUT /api/tasks/:id/review  (admin — approve/reject/feedback)
exports.reviewTask = async (req, res, next) => {
  try {
    const { status, feedback, grade } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.status = status; // 'approved' | 'rejected' | 'revision'
    if (task.submission) {
      task.submission.feedback = feedback;
      task.submission.feedbackAt = new Date();
      task.submission.grade = grade;
    }
    await task.save();
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

// @route  DELETE /api/tasks/:id  (admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) { next(err); }
};
