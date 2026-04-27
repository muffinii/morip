const express = require('express');
const router = express.Router();
const escapeController = require('../controllers/escapeController');
const auth = require('../middleware/auth');

router.post('/', auth, escapeController.startEscape);
router.put('/:id', auth, escapeController.endEscape);

module.exports = router;