// routes/reportRoutes.js
const express = require('express');
const { getInternReport, getOverview } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/intern/:id', getInternReport);

module.exports = router;
