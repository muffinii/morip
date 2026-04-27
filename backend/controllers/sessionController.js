const pool = require('../config/db');

// 세션 시작
exports.startSession = async (req, res) => {
    try {
        const { subject_id } = req.body;

        const [result] = await pool.query(
            'insert into sessions (user_pkid, subject_id, start_time, focus_score, escape_count) values (?, ?, now(), 100, 0)',
            [req.user.pkid, subject_id]
        );

        res.status(201).json({
            message: '공부 세션 시작',
            session_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 세션 종료
exports.endSession = async (req, res) => {
    try {
        const { id } = req.params;

        // 해당 세션의 이탈 횟수 조회
        const [escapes] = await pool.query(
            'select count(*) as count from escapes where session_id = ?',
            [id]
        );

        const escapeCount = escapes[0].count;
        const focusScore = Math.max(0, 100 - (escapeCount * 10));

        const [result] = await pool.query(
            'update sessions set end_time = now(), focus_score = ?, escape_count = ? where session_id = ? and user_pkid = ?',
            [focusScore, escapeCount, id, req.user.pkid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '세션을 찾을 수 없습니다.' });
        }

        res.json({
            message: '공부 세션 종료',
            focus_score: focusScore,
            escape_count: escapeCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
}

// 세션 조회
exports.getSessions = async (req, res) => {
    try{
        const [sessions] = await pool.query(
            `select s.session_id, sub.name as subject_name, s.start_time, s.end_time, s.focus_score, s.escape_count
            from sessions s
            join subjects sub on s.subject_id = sub.subject_id
            where s.user_pkid = ?
            order by s.start_time desc`,
            [req.user.pkid]
        );

        res.json(sessions);
    } catch(error) {
        console.error(error);
        res.status(500).json({message: '서버 오류'});
    }
}