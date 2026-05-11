const pool = require('../config/db');

// 오늘 공부 요약
exports.getDailyReport = async (req, res) => {
    try {
        const [result] = await pool.query(
            `select count(*) as total_sessions,
            coalesce(sum(timestampdiff(second, start_time, end_time)), 0) as total_study_seconds,
            coalesce(sum(escape_count), 0) as total_escapes,
            coalesce(round(avg(focus_score)), 0) as avg_score
            from sessions
            where user_pkid = ? and date(start_time) = curdate() and end_time is not null`,
            [req.user.pkid]
        );

        res.json({
            message: '오늘 공부 요약',
            data: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 주간 리포트
exports.getWeeklyReport = async (req, res) => {
    try {
        // 요일별 공부 시간
        const [dailyStats] = await pool.query(
            `select dayname(start_time) as day_name,
                dayofweek(start_time) as day_number,
                coalesce(sum(timestampdiff(minute, start_time, end_time)), 0) as study_minutes,
                coalesce(round(avg(focus_score)), 0) as avg_focus_score,
                coalesce(sum(escape_count), 0) as total_escapes
                from sessions
                where user_pkid = ?
                and start_time >= date_sub(curdate(), interval 7 day)
                and end_time is not null
                group by dayname(start_time), dayofweek(start_time)
                order by day_number`,
            [req.user.pkid]
        );

        // 주간 전체 요약
        const [weeklySummary] = await pool.query(
            `select count(*) as total_sessions,
                coalesce(sum(timestampdiff(minute, start_time, end_time)), 0) as total_study_minutes,
                coalesce(round(avg(focus_score)), 0) as avg_focus_score,
                coalesce(sum(escape_count), 0) as total_escapes
                from sessions
                where user_pkid = ?
                and start_time >= date_sub(curdate(), interval 7 day)
                and end_time is not null`,
            [req.user.pkid]
        );

        res.json({
            message: '주간 리포트',
            summary: weeklySummary[0],
            daily: dailyStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 골든타임 분석
exports.getGoldenTime = async (req, res) => {
    try {
        // 시간대별 평균 집중 점수
        const [hourlyStats] = await pool.query(
            `select
                hour(start_time) as hour,
                count(*) as session_count,
                coalesce(round(avg(focus_score)), 0) as avg_focus_score,
                coalesce(round(avg(timestampdiff(minute, start_time, end_time))), 0) as avg_study_minutes
                from sessions
                where user_pkid = ? and end_time is not null
                group by hour(start_time)
                order by avg_focus_score desc`,
            [req.user.pkid]
        );

        // 과목별 최적 시간대
        const [subjectGoldenTime] = await pool.query(
            `select
                sub.name as subject_name,
                hour(s.start_time) as best_hour,
                round(avg(s.focus_score)) as avg_focus_score
                from sessions s
                join subjects sub on s.subject_id = sub.subject_id
                where s.user_pkid = ? and s.end_time is not null
                group by sub.name, hour(s.start_time)
                order by sub.name, avg_focus_score desc`,
            [req.user.pkid]
        );

        // 과목별로 가장 집중 잘 되는 시간대만 추출
        const bestBySubject = {};
        subjectGoldenTime.forEach(row => {
            if (!bestBySubject[row.subject_name]) {
                bestBySubject[row.subject_name] = {
                    subject: row.subject_name,
                    best_hour: row.best_hour,
                    avg_focus_score: row.avg_focus_score
                };
            }
        });

        res.json({
            message: '골든타임 분석',
            hourly_stats: hourlyStats,
            subject_golden_time: Object.values(bestBySubject)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
};

// 과목별 통계
exports.getSubjectStats = async (req, res) => {
    try {
        const [stats] = await pool.query(
            `select sub.name as subject_name,
                count(*) as total_sessions,
                coalesce(sum(timestampdiff(minute, s.start_time, s.end_time)), 0) as total_study_minutes,
                coalesce(round(avg(timestampdiff(minute, s.start_time, s.end_time))), 0) as avg_session_minutes,
                coalesce(round(avg(s.focus_score)), 0) as avg_focus_score,
                coalesce(sum(s.escape_count), 0) as total_escapes
                from sessions s
                join subjects sub on s.subject_id = sub.subject_id
                where s.user_pkid = ? and s.end_time is not null
                group by sub.name
                order by total_study_minutes desc`,
            [req.user.pkid]
        );

        res.json({
            message: '과목별 통계',
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
}
