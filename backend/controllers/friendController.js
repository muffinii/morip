const pool = require('../config/db');

// 친구 요청 보내기
exports.sendRequest = async (req, res) => {
  try {
    const { friend_user_id } = req.body;

    // 상대방 찾기
    const [users] = await pool.query(
      'SELECT pkid FROM users WHERE user_id = ?',
      [friend_user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다' });
    }

    const friendPkid = users[0].pkid;

    // 자기 자신에게 요청 방지
    if (friendPkid === req.user.pkid) {
      return res.status(400).json({ message: '자기 자신에게 친구 요청을 보낼 수 없습니다' });
    }

    // 이미 요청했는지 확인
    const [existing] = await pool.query(
      'SELECT friendship_id FROM friendships WHERE (user_pkid = ? AND friend_pkid = ?) OR (user_pkid = ? AND friend_pkid = ?)',
      [req.user.pkid, friendPkid, friendPkid, req.user.pkid]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '이미 친구 요청을 보냈거나 친구입니다' });
    }

    await pool.query(
      'INSERT INTO friendships (user_pkid, friend_pkid, status) VALUES (?, ?, "pending")',
      [req.user.pkid, friendPkid]
    );

    res.status(201).json({ message: '친구 요청 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 요청 수락
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE friendships SET status = "accepted" WHERE friendship_id = ? AND friend_pkid = ? AND status = "pending"',
      [id, req.user.pkid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '친구 요청을 찾을 수 없습니다' });
    }

    res.json({ message: '친구 요청 수락 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 목록 조회
exports.getFriends = async (req, res) => {
  try {
    const [friends] = await pool.query(
      `SELECT 
        f.friendship_id,
        u.user_id,
        u.nickname,
        u.category,
        f.status
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_pkid = ? THEN f.friend_pkid = u.pkid
          ELSE f.user_pkid = u.pkid
        END
      )
      WHERE (f.user_pkid = ? OR f.friend_pkid = ?) AND f.status = "accepted"`,
      [req.user.pkid, req.user.pkid, req.user.pkid]
    );

    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 공부 현황 조회
exports.getFriendsStatus = async (req, res) => {
  try {
    const [status] = await pool.query(
      `SELECT 
        u.nickname,
        CASE 
          WHEN s.end_time IS NULL AND s.start_time IS NOT NULL THEN '공부 중'
          ELSE '쉬는 중'
        END AS study_status,
        sub.name AS current_subject,
        s.start_time
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_pkid = ? THEN f.friend_pkid = u.pkid
          ELSE f.user_pkid = u.pkid
        END
      )
      LEFT JOIN sessions s ON u.pkid = s.user_pkid 
        AND s.session_id = (
          SELECT session_id FROM sessions 
          WHERE user_pkid = u.pkid 
          ORDER BY start_time DESC LIMIT 1
        )
      LEFT JOIN subjects sub ON s.subject_id = sub.subject_id
      WHERE (f.user_pkid = ? OR f.friend_pkid = ?) AND f.status = "accepted"`,
      [req.user.pkid, req.user.pkid, req.user.pkid]
    );

    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 친구 랭킹 (이번 주 공부 시간 기준)
exports.getFriendsRanking = async (req, res) => {
  try {
    // 본인 + 친구 목록의 주간 공부 시간 랭킹
    const [ranking] = await pool.query(
      `SELECT 
        u.nickname,
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)), 0) AS weekly_study_minutes,
        COALESCE(ROUND(AVG(s.focus_score)), 0) AS avg_focus_score
      FROM users u
      LEFT JOIN sessions s ON u.pkid = s.user_pkid 
        AND s.start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND s.end_time IS NOT NULL
      WHERE u.pkid = ? OR u.pkid IN (
        SELECT CASE 
          WHEN user_pkid = ? THEN friend_pkid 
          ELSE user_pkid 
        END
        FROM friendships 
        WHERE (user_pkid = ? OR friend_pkid = ?) AND status = "accepted"
      )
      GROUP BY u.pkid, u.nickname
      ORDER BY weekly_study_minutes DESC`,
      [req.user.pkid, req.user.pkid, req.user.pkid, req.user.pkid]
    );

    // 순위 추가
    const rankedList = ranking.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    res.json(rankedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};