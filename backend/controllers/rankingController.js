const pool = require('../config/db');

// 카테고리별 랭킹 (같은 카테고리 사용자끼리)
exports.getCategoryRanking = async (req, res) => {
  try {
    // 본인 카테고리 확인
    const [user] = await pool.query(
      'SELECT category FROM users WHERE pkid = ?',
      [req.user.pkid]
    );

    const category = user[0].category;

    const [ranking] = await pool.query(
      `SELECT 
        u.nickname,
        u.category,
        COALESCE(SUM(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)), 0) AS weekly_study_minutes,
        COALESCE(ROUND(AVG(s.focus_score)), 0) AS avg_focus_score
      FROM users u
      LEFT JOIN sessions s ON u.pkid = s.user_pkid 
        AND s.start_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND s.end_time IS NOT NULL
      WHERE u.category = ?
      GROUP BY u.pkid, u.nickname, u.category
      ORDER BY weekly_study_minutes DESC
      LIMIT 20`,
      [category]
    );

    const rankedList = ranking.map((row, index) => ({
      rank: index + 1,
      ...row
    }));

    res.json({
      category: category,
      ranking: rankedList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};