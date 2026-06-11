const express = require('express');
const router = express.Router();

router.use('/employees', require('./employees'));
router.use('/groups', require('./groups'));
router.use('/shift-templates', require('./shiftTemplates'));
router.use('/schedules', require('./schedules'));
router.use('/shift-swap-requests', require('./shiftSwapRequests'));
router.use('/leave-requests', require('./leaveRequests'));
router.use('/reports', require('./reports'));
router.use('/auto-schedule', require('./autoSchedule'));

module.exports = router;