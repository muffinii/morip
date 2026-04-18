const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 테스트용 API
app.get('/', (req, res) => {
  res.json({ message: 'morip Backend Server' });
});

app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중`);
});