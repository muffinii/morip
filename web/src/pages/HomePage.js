import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import BottomNav from '../components/BottomNav';

export default function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const nickname = localStorage.getItem('nickname');
    const [subjects, setSubjects] = useState([]);
    const [isStudying, setIsStudying] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [dailyStats, setDailyStats] = useState(null);
    const [newSubject, setNewSubject] = useState('');
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [escapeSeconds, setEscapeSeconds] = useState(0);
    const [isEscaped, setIsEscaped] = useState(false);
    const [escapeId, setEscapeId] = useState(null);
    const timerRef = useRef(null);
    const escapeTimerRef = useRef(null);

    useEffect(() => {
        if (!token) { navigate('/'); return; }
        loadSubjects();
        loadDailyStats();
    }, []);

    useEffect(() => {
        if (isStudying) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isStudying]);

    useEffect(() => {
        if (isEscaped) {
            escapeTimerRef.current = setInterval(() => {
                setEscapeSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(escapeTimerRef.current);
    }, [isEscaped]);

    useEffect(() => {
        const handleVisibility = async () => {
            if (document.hidden && isStudying && sessionId) {
                try {
                    const data = await api('/escapes', 'POST', { session_id: sessionId }, token);
                    setEscapeId(data.escape_id);
                    setIsEscaped(true);
                } catch (error) {
                    console.error('이탈 기록 실패', error);
                }
            } else if (!document.hidden && escapeId) {
                try {
                    await api(`/escapes/${escapeId}`, 'PUT', null, token);
                    setEscapeId(null);
                    setIsEscaped(false);
                } catch (error) {
                    console.error('이탈 복귀 실패', error);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isStudying, sessionId, escapeId]);

    const loadSubjects = async () => {
        try {
            const data = await api('/subjects', 'GET', null, token);
            setSubjects(data);
        } catch (error) { console.error(error); }
    };

    const loadDailyStats = async () => {
        try {
            const data = await api('/report/daily', 'GET', null, token);
            setDailyStats(data.data);
        } catch (error) { console.error(error); }
    };

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startStudy = async (subject) => {
        try {
            const data = await api('/sessions', 'POST', { subject_id: subject.subject_id }, token);
            setSessionId(data.session_id);
            setSelectedSubject(subject);
            setIsStudying(true);
            setSeconds(0);
            setEscapeSeconds(0);
            setIsEscaped(false);
        } catch (error) { alert('세션을 시작할 수 없습니다'); }
    };

    const endStudy = async () => {
        if (!window.confirm('공부를 종료하시겠습니까?')) return;
        try {
            clearInterval(timerRef.current);
            clearInterval(escapeTimerRef.current);
            const data = await api(`/sessions/${sessionId}`, 'PUT', null, token);
            setIsStudying(false);
            setIsEscaped(false);
            setSelectedSubject(null);
            loadSubjects();
            loadDailyStats();
            alert(`공부 완료!\n집중력 점수: ${data.focus_score}점\n이탈 횟수: ${data.escape_count}회`);
        } catch (error) { alert('세션 종료에 실패했습니다'); }
    };

    const addSubject = async () => {
        if (!newSubject.trim()) { alert('과목 이름을 입력해주세요'); return; }
        try {
            await api('/subjects', 'POST', { name: newSubject }, token);
            setNewSubject('');
            setShowAddSubject(false);
            loadSubjects();
        } catch (error) { alert('과목 추가에 실패했습니다'); }
    };

    if (isStudying) {
        return (
            <div style={styles.timerContainer}>
                <p style={styles.studyingSubject}>{selectedSubject.name}</p>
                <h1 style={styles.timer}>{formatTime(seconds)}</h1>
                <p style={styles.studyingLabel}>{isEscaped ? '이탈 중...' : '집중 중...'}</p>
                {escapeSeconds > 0 && (
                    <div style={styles.escapeInfo}>
                        <p style={styles.escapeText}>이탈 시간: {formatTime(escapeSeconds)}</p>
                    </div>
                )}
                <button style={styles.stopButton} onClick={endStudy}>공부 종료</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>기록</h1>
                <div style={styles.profileButton} onClick={() => navigate('/mypage')}>
                    <svg width="20" height="20" fill="#94a3b8" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
            </div>

            <div style={styles.dailyCard}>
                <h3 style={styles.dailyTitle}>오늘의 공부</h3>
                <div style={styles.dailyStats}>
                    <div style={styles.dailyStat}>
                        <p style={styles.dailyNumber}>{formatTime(dailyStats ? dailyStats.total_study_seconds : 0)}</p>
                        <p style={styles.dailyLabel}>공부 시간</p>
                    </div>
                    <div style={styles.dailyStat}>
                        <p style={styles.dailyNumber}>{dailyStats ? dailyStats.avg_score : 0}점</p>
                        <p style={styles.dailyLabel}>평균 집중</p>
                    </div>
                </div>
            </div>

            <h3 style={styles.sectionTitle}>무엇을 공부할까요?</h3>

            <div style={styles.subjectList}>
                {subjects.map((item) => (
                    <div key={item.subject_id} style={styles.subjectItem} onClick={() => startStudy(item)}>
                        <div>
                            <p style={styles.subjectText}>{item.name}</p>
                            <p style={styles.subjectTime}>{formatTime(item.today_seconds)}</p>
                        </div>
                        <span style={styles.playIcon}>▶</span>
                    </div>
                ))}
            </div>

            {showAddSubject ? (
                <div style={styles.addForm}>
                    <input
                        style={styles.input}
                        placeholder="과목 이름 (예: 수학)"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                    />
                    <div style={styles.addFormButtons}>
                        <button style={styles.addConfirmButton} onClick={addSubject}>추가</button>
                        <button style={styles.addCancelButton} onClick={() => setShowAddSubject(false)}>취소</button>
                    </div>
                </div>
            ) : (
                <div style={styles.addButton} onClick={() => setShowAddSubject(true)}>+ 과목 추가</div>
            )}

            <BottomNav />
        </div>
    );
}

const styles = {
    container: {
        padding: '50px 20px 80px 20px',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#fff',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    headerTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        margin: 0,
    },
    profileButton: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
    },
    dailyCard: {
        backgroundColor: '#f0f7ff',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '25px',
    },
    dailyTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '15px',
        marginTop: 0,
    },
    dailyStats: {
        display: 'flex',
        justifyContent: 'space-around',
    },
    dailyStat: {
        textAlign: 'center',
    },
    dailyNumber: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#4A90D9',
        margin: 0,
    },
    dailyLabel: {
        fontSize: '12px',
        color: '#888',
        marginTop: '4px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    subjectList: {
        flex: 1,
    },
    subjectItem: {
        padding: '14px',
        borderRadius: '10px',
        border: '1px solid #eee',
        marginBottom: '8px',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
    },
    subjectText: {
        fontSize: '15px',
        color: '#333',
        margin: 0,
        fontWeight: 'bold',
    },
    subjectTime: {
        fontSize: '13px',
        color: '#888',
        margin: '4px 0 0 0',
    },
    playIcon: {
        fontSize: '18px',
        color: '#4A90D9',
    },
    addButton: {
        padding: '12px',
        borderRadius: '10px',
        border: '1px solid #4A90D9',
        textAlign: 'center',
        color: '#4A90D9',
        cursor: 'pointer',
        marginTop: '10px',
        fontSize: '15px',
    },
    addForm: {
        marginTop: '10px',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '16px',
        boxSizing: 'border-box',
        marginBottom: '10px',
    },
    addFormButtons: {
        display: 'flex',
        gap: '8px',
    },
    addConfirmButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#4A90D9',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    addCancelButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#eee',
        color: '#555',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    timerContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
    },
    studyingSubject: {
        fontSize: '20px',
        color: '#aaa',
        marginBottom: '20px',
    },
    timer: {
        fontSize: '72px',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '10px',
    },
    studyingLabel: {
        fontSize: '16px',
        color: '#4A90D9',
        marginBottom: '40px',
    },
    escapeInfo: {
        marginBottom: '40px',
        padding: '10px 20px',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderRadius: '10px',
    },
    escapeText: {
        color: '#e74c3c',
        fontSize: '14px',
        margin: 0,
    },
    stopButton: {
        padding: '15px 40px',
        backgroundColor: '#4A90D9',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};