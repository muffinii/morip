import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../src/api/client';
import Svg, { Path } from 'react-native-svg';

export default function HomeScreen() {
    const { token, nickname } = useLocalSearchParams();
    const router = useRouter();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isStudying, setIsStudying] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [seconds, setSeconds] = useState(0);
    const [dailyStats, setDailyStats] = useState(null);
    const timerRef = useRef(null);
    const [escapeId, setEscapeId] = useState(null);
    const appState = useRef(AppState.currentState);
    const [escapeSeconds, setEscapeSeconds] = useState(0);
    const [isEscaped, setIsEscaped] = useState(false);
    const escapeTimerRef = useRef(null);

    useEffect(() => {
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

    // 이탈 감지
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            // 앱이 백그라운드로 갈 때 (이탈 시작)
            if (appState.current === 'active' && nextAppState.match(/inactive|background/) && isStudying && sessionId) {
                try {
                    const data = await api('/escapes', 'POST', { session_id: sessionId }, token);
                    setEscapeId(data.escape_id);
                    setIsEscaped(true);
                } catch (error) {
                    console.error('이탈 기록 실패', error);
                }
            }

            // 앱으로 다시 돌아올 때 (이탈 복귀)
            if (appState.current.match(/inactive|background/) && nextAppState === 'active' && escapeId) {
                try {
                    await api(`/escapes/${escapeId}`, 'PUT', null, token);
                    setEscapeId(null);
                    setIsEscaped(false);
                } catch (error) {
                    console.error('이탈 복귀 기록 실패', error);
                }
            }

            appState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [isStudying, sessionId, escapeId]);

    // 이탈 시간 타이머
    useEffect(() => {
        if (isEscaped) {
            escapeTimerRef.current = setInterval(() => {
                setEscapeSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(escapeTimerRef.current);
    }, [isEscaped]);

    const loadSubjects = async () => {
        try {
            const data = await api('/subjects', 'GET', null, token);
            setSubjects(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadDailyStats = async () => {
        try {
            const data = await api('/report/daily', 'GET', null, token);
            setDailyStats(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const formatTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatStudyTime = (totalSeconds) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startStudyWithSubject = async (subject) => {
        try {
            const data = await api('/sessions', 'POST', { subject_id: subject.subject_id }, token);
            setSessionId(data.session_id);
            setSelectedSubject(subject);
            setIsStudying(true);
            setSeconds(0);
            setEscapeSeconds(0);  // 추가
            setIsEscaped(false);  // 추가
        } catch (error) {
            Alert.alert('오류', '세션을 시작할 수 없습니다');
        }
    };

    const endStudy = async () => {
        Alert.alert('공부 종료', '공부를 종료하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '종료',
                onPress: async () => {
                    try {
                        clearInterval(timerRef.current);
                        const data = await api(`/sessions/${sessionId}`, 'PUT', null, token);
                        setIsStudying(false);
                        setSelectedSubject(null);
                        loadDailyStats();

                        router.push({
                            pathname: '/result',
                            params: {
                                token, nickname,
                                focus_score: data.focus_score,
                                escape_count: data.escape_count,
                                total_session_seconds: data.total_session_seconds,
                                total_escape_seconds: data.total_escape_seconds,
                                focus_bonus: data.focus_bonus,
                                subject_name: selectedSubject.name
                            }
                        });
                    } catch (error) {
                        Alert.alert('오류', '세션 종료에 실패했습니다');
                    }
                }
            }
        ]);
    };

    // 공부 중일 때 - 타이머 화면
    if (isStudying) {
        return (
            <View style={styles.timerContainer}>
                <Text style={styles.studyingSubject}>{selectedSubject.name}</Text>
                <Text style={styles.timer}>{formatTime(seconds)}</Text>
                <Text style={styles.studyingLabel}>
                    {isEscaped ? '이탈 중...' : '집중 중...'}
                </Text>

                {escapeSeconds > 0 && (
                    <View style={styles.escapeInfo}>
                        <Text style={styles.escapeText}>
                            이탈 시간: {formatTime(escapeSeconds)}
                        </Text>
                    </View>
                )}

                <TouchableOpacity style={styles.stopButton} onPress={endStudy}>
                    <Text style={styles.stopButtonText}>공부 종료</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 과목 선택 화면
    return (
        <View style={styles.container}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>기록</Text>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => router.push({ pathname: '/mypage', params: { token, nickname } })}
                >
                    <Svg width={20} height={20} fill="#94a3b8" viewBox="0 0 24 24">
                        <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </Svg>
                </TouchableOpacity>
            </View>

            {/* 오늘 공부 요약 */}
            <View style={styles.dailyCard}>
                <Text style={styles.dailyTitle}>오늘의 공부</Text>
                <View style={styles.dailyStats}>
                    <View style={styles.dailyStat}>
                        <Text style={styles.dailyNumber}>
                            {formatStudyTime(dailyStats ? dailyStats.total_study_seconds : 0)}
                        </Text>
                        <Text style={styles.dailyLabel}>공부 시간</Text>
                    </View>
                    <View style={styles.dailyStat}>
                        <Text style={styles.dailyNumber}>
                            {dailyStats ? dailyStats.avg_score : 0}점
                        </Text>
                        <Text style={styles.dailyLabel}>평균 집중</Text>
                    </View>
                </View>
            </View>

            {/* 과목 선택 */}
            <Text style={styles.sectionTitle}>과목</Text>

            <FlatList
                data={subjects}
                keyExtractor={(item) => item.subject_id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.subjectItem}
                        onPress={() => {
                            setSelectedSubject(item);
                            startStudyWithSubject(item);
                        }}
                    >
                        <View style={styles.subjectRow}>
                            <View>
                                <Text style={styles.subjectText}>{item.name}</Text>
                                <Text style={styles.subjectTime}>{formatStudyTime(item.today_seconds)}</Text>
                            </View>
                            <Text style={styles.playIcon}>▶</Text>
                        </View>
                    </TouchableOpacity>
                )}
                style={styles.subjectList}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push({ pathname: '/addsubject', params: { token } })}
            >
                <Text style={styles.addButtonText}>+ 과목 추가</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dailyCard: {
        backgroundColor: '#f0f7ff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
    },
    dailyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    dailyStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    dailyStat: {
        alignItems: 'center',
    },
    dailyNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90D9',
    },
    dailyLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    subjectList: {
        maxHeight: 200,
    },
    subjectItem: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
    },
    subjectSelected: {
        backgroundColor: '#4A90D9',
        borderColor: '#4A90D9',
    },
    subjectText: {
        fontSize: 15,
        color: '#333',
    },
    subjectTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#4A90D9',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    addButtonText: {
        color: '#4A90D9',
        fontSize: 15,
    },
    startButton: {
        backgroundColor: '#4A90D9',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    studyingSubject: {
        fontSize: 20,
        color: '#aaa',
        marginBottom: 20,
    },
    timer: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    studyingLabel: {
        fontSize: 16,
        color: '#4A90D9',
        marginBottom: 60,
    },
    stopButton: {
        backgroundColor: '#4A90D9',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
    },
    stopButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subjectRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    subjectTime: {
        fontSize: 13,
        color: '#888',
    },
    playIcon: {
        fontSize: 18,
        color: '#4A90D9',
    },
    escapeInfo: {
        marginBottom: 40,
        padding: 10,
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderRadius: 10,
    },
    escapeText: {
        color: '#e74c3c',
        fontSize: 14,
    },
});