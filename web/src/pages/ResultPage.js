import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { focus_score, escape_count, total_session_seconds, total_escape_seconds, focus_bonus, subject_name } = location.state || {};

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>공부 완료!</h1>
            <p style={styles.subject}>{subject_name}</p>

            <div style={styles.scoreContainer}>
                <p style={styles.scoreLabel}>집중력 점수</p>
                <h2 style={styles.score}>{focus_score}점</h2>
            </div>

            <div style={styles.statsContainer}>
                <div style={styles.statRow}>
                    <span style={styles.statLabel}>총 공부 시간</span>
                    <span style={styles.statValue}>{formatTime(Number(total_session_seconds))}</span>
                </div>
                <div style={styles.statRow}>
                    <span style={styles.statLabel}>이탈 횟수</span>
                    <span style={styles.statValue}>{escape_count}회</span>
                </div>
                <div style={styles.statRow}>
                    <span style={styles.statLabel}>이탈 시간</span>
                    <span style={styles.statValue}>{formatTime(Number(total_escape_seconds))}</span>
                </div>
                <div style={styles.statRow}>
                    <span style={styles.statLabel}>연속 집중 보너스</span>
                    <span style={{ ...styles.statValue, color: '#27ae60' }}>+{focus_bonus}점</span>
                </div>
            </div>

            <button style={styles.button} onClick={() => navigate('/home')}>
                홈으로 돌아가기
            </button>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '30px',
        maxWidth: '500px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '5px',
    },
    subject: {
        fontSize: '16px',
        color: '#888',
        textAlign: 'center',
        marginBottom: '30px',
    },
    scoreContainer: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f7ff',
        borderRadius: '15px',
        marginBottom: '30px',
    },
    scoreLabel: {
        fontSize: '14px',
        color: '#888',
        marginBottom: '5px',
    },
    score: {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#4A90D9',
        margin: 0,
    },
    statsContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
    },
    statRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
    },
    statLabel: {
        fontSize: '15px',
        color: '#555',
    },
    statValue: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        width: '100%',
        padding: '15px',
        backgroundColor: '#4A90D9',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};