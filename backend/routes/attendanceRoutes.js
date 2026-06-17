// routes/attendanceRoutes.js
const express = require('express');
const { checkIn, checkOut, getMyAttendance, getTodayStatus, getAllAttendance, markAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.post('/checkin',    authorize('intern'), checkIn);
router.put('/checkout',    authorize('intern'), checkOut);
router.get('/my',          authorize('intern'), getMyAttendance);
router.get('/today',       authorize('intern'), getTodayStatus);
router.get('/all',         authorize('admin'),  getAllAttendance);
router.post('/mark',       authorize('admin'),  markAttendance);

module.exports = router;
