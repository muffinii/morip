const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.post('/signup', memberController.signup);
router.post('/login', memberController.login);

module.exports = router;