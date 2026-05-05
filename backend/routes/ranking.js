const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const auth = require('../middleware/auth');

router.get('/category', auth, rankingController.getCategoryRanking);

module.exports = router;