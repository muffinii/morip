const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입
exports.signup = async (req, res) => {
    try {
        const {user_id, email, password, nickname, category} = req.body;

        // 아이디, 이메일 중복 체크
        const [existing] = await pool.query(
            'select pkid from users where user_id = ? or email = ?'
            [user_id, email]
        );
        
        // 아이디, 이메일이 이미 존재하는 경우
        if (existing.length > 0) {
            return res.status(400).json({message: '이미 존재하는 아이디 또는 이메일 입니다.'});
        }

        // 비밀번호 암호화
        const heashedPassword = await bcrypt.hash(password, 10);

        // DB에 저장
        await pool.query(
            'insert into users (user_id, email, password, nickname, category) values (? ?, ?, ?, ?)',
            [user_id, email, heashedPassword, nickname, category]
        );

        res.status(201).json({message: '회원가입 성공'});
    } catch(error) {
        console.error(error);
        res.status(500).json({message: '서버 오류'});

    }
};

exports.login = async (req, res) => {
    try {
        const {user_id, password} = req.body;

        // 사용자 찾기
        const [users] = await pool.query(
            'select * from users where user_id = ?',
            [user_id]
        );

        if (users.length === 0) {
            return res.status(401).json({message: '아이디 또는 비밀번호가 틀렸습니다.'});
        }

        // 비밀번호 확인
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({message: '아이디 또는 비밀번호가 틀렸습니다.'});
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            {pkid: user.pkid, user_id: user.user_id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );

        res.json({
            message: '로그인 성공',
            token: token,
            user: {
                pkid: user.pkid,
                user_id: user.user_id,
                nickname: user.nickname,
                category: user.category
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: '서버 오류'});
    }
};