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

    // 세션 정보 조회
    const [sessions] = await pool.query(
      'SELECT start_time FROM sessions WHERE session_id = ? AND user_pkid = ?',
      [id, req.user.pkid]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: '세션을 찾을 수 없습니다' });
    }

    // 이탈 기록 조회
    const [escapes] = await pool.query(
      'SELECT escape_start, escape_end FROM escapes WHERE session_id = ?',
      [id]
    );

    // 1. 이탈 횟수 감점 (1회당 5점)
    const escapeCount = escapes.length;
    const escapeCountPenalty = escapeCount * 5;

    // 2. 이탈 시간 감점
    const sessionStart = new Date(sessions[0].start_time);
    const sessionEnd = new Date();
    const totalSessionMinutes = (sessionEnd - sessionStart) / 1000 / 60;

    let totalEscapeMinutes = 0;
    escapes.forEach(escape => {
      if (escape.escape_end) {
        const escapeTime = (new Date(escape.escape_end) - new Date(escape.escape_start)) / 1000 / 60;
        totalEscapeMinutes += escapeTime;
      }
    });

    const escapeTimePenalty = totalSessionMinutes > 0
      ? Math.round((totalEscapeMinutes / totalSessionMinutes) * 50)
      : 0;

    // 3. 연속 집중 보너스 (25분 이상 연속 집중 구간 계산)
    let focusSegments = [];
    let prevEnd = sessionStart;

    escapes.forEach(escape => {
      const focusDuration = (new Date(escape.escape_start) - prevEnd) / 1000 / 60;
      focusSegments.push(focusDuration);
      if (escape.escape_end) {
        prevEnd = new Date(escape.escape_end);
      }
    });
    // 마지막 이탈 이후 ~ 세션 종료까지
    const lastFocus = (sessionEnd - prevEnd) / 1000 / 60;
    focusSegments.push(lastFocus);

    const longFocusCount = focusSegments.filter(min => min >= 25).length;
    const focusBonus = Math.min(longFocusCount * 3, 15);

    // 최종 점수 계산 (0~100 범위)
    const focusScore = Math.max(0, Math.min(100, 100 - escapeCountPenalty - escapeTimePenalty + focusBonus));

    // DB 업데이트
    await pool.query(
      'UPDATE sessions SET end_time = NOW(), focus_score = ?, escape_count = ? WHERE session_id = ? AND user_pkid = ?',
      [focusScore, escapeCount, id, req.user.pkid]
    );

    res.json({
      message: '공부 세션 종료',
      focus_score: focusScore,
      escape_count: escapeCount,
      total_session_minutes: Math.round(totalSessionMinutes),
      total_escape_minutes: Math.round(totalEscapeMinutes),
      focus_bonus: focusBonus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

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