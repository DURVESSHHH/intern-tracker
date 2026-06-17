// routes/taskRoutes.js
const express = require('express');
const { createTask, getMyTasks, getAllTasks, getTask, updateTask, submitTask, reviewTask, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/',             authorize('admin'),  createTask);
router.get('/my',            authorize('intern'), getMyTasks);
router.get('/',              authorize('admin'),  getAllTasks);
router.get('/:id',           getTask);
router.put('/:id',           authorize('admin'),  updateTask);
router.post('/:id/submit',   authorize('intern'), submitTask);
router.put('/:id/review',    authorize('admin'),  reviewTask);
router.delete('/:id',        authorize('admin'),  deleteTask);

module.exports = router;
