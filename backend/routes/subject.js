const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/auth');

router.get('/', auth, subjectController.getSubjects);
router.post('/', auth, subjectController.addSubject);
router.delete('/:id', auth, subjectController.deleteSubject);

module.exports = router;