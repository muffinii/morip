const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

router.post('/', auth, sessionController.startSession);
router.put('/:id', auth, sessionController.endSession);
router.get('/', auth, sessionController.getSessions);

module.exports = router;
