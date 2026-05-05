const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.get('/daily', auth, reportController.getDailyReport);
router.get('/weekly', auth, reportController.getWeeklyReport);
router.get('/goldentime', auth, reportController.getGoldenTime);
router.get('/subjectstats', auth, reportController.getSubjectStats);

module.exports = router;