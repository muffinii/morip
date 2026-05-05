const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.post('/request', auth, friendController.sendRequest);
router.put('/:id/accept', auth, friendController.acceptRequest);
router.get('/', auth, friendController.getFriends);
router.get('/status', auth, friendController.getFriendsStatus);
router.get('/ranking', auth, friendController.getFriendsRanking);

module.exports = router;