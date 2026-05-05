const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 라우터 연결
const memberRouter = require('./routes/member');
app.use('/api/member', memberRouter);

const subjectRouter = require('./routes/subject');
app.use('/api/subjects', subjectRouter);

const sessionRouter = require('./routes/session');
app.use('/api/sessions', sessionRouter);

const escapeRouter = require('./routes/escape');
app.use('/api/escapes', escapeRouter);

const reportRouter = require('./routes/report');
app.use('/api/report', reportRouter);

const friendRouter = require('./routes/friend');
const rankingRouter = require('./routes/ranking');
app.use('/api/friends', friendRouter);
app.use('/api/ranking', rankingRouter);

// 테스트용 API
app.get('/', (req, res) => {
  res.json({ message: 'morip Backend Server' });
});

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});