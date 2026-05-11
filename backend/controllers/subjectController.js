const pool = require('../config/db');

// 과목 목록 조회
exports.getSubjects = async (req, res) => {
    try {
        const [subjects] = await pool.query(
            `SELECT sub.subject_id, sub.name,
        COALESCE(SUM(CASE WHEN DATE(s.start_time) = CURDATE() AND s.end_time IS NOT NULL 
          THEN TIMESTAMPDIFF(SECOND, s.start_time, s.end_time) ELSE 0 END), 0) AS today_seconds
      FROM subjects sub
      LEFT JOIN sessions s ON sub.subject_id = s.subject_id
      WHERE sub.user_pkid = ?
      GROUP BY sub.subject_id, sub.name`,
            [req.user.pkid]
        );

        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 과목 추가
exports.addSubject = async (req, res) => {
    try {
        const { name } = req.body;

        await pool.query(
            'insert into subjects (user_pkid, name) values(?, ?)',
            [req.user.pkid, name]
        );

        res.status(201).json({ message: '과목 추가 성공' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 과목 삭제
exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'delete from subjects where subject_id = ? and user_pkid =?',
            [id, req.user.pkid]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '과목을 찾을 수 없습니다.' });
        }

        res.json({ message: '과목 삭제 성공' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
}