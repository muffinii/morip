const pool = require('../config/db');

// 이탈 발생
exports.startEscape = async (req, res) => {
    try{
        const {session_id} = req.body;

        // 본인의 세션인지 확인
        const [sessions] = await pool.query(
            'select session_id from sessions where session_id = ? and user_pkid = ? and end_time is null',
            [session_id, req.user.pkid]
        );

        if (sessions.length === 0) {
            return res.status(404).json({message: '진행 중인 세션을 찾을 수 없습니다.'});
        }

        const [result] = await pool.query(
            'insert into escapes (session_id, escape_start) values (?, now())',
            [session_id]
        );

        res.status(201).json({
            message: '이탈 기록 시작',
            escape_id: result.insertId
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({message: '서버 오류'});
    }
};

// 이탈 후 복귀
exports.endEscape = async(req, res) => {
    try{
        const {id} = req.params;

        const [result] = await pool.query(
            'update escapes set escape_end = now() where escape_id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: '이탈 기록을 찾을 수 없습니다.'});
        }

        res.json({message: '이탈 복귀 완료'});
    } catch(error) {
        console.error(error);
        res.status(500).json({message: '서버 오류'});
    }
};