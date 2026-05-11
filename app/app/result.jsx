import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultScreen() {
  const router = useRouter();
  const {
    token,
    nickname,
    focus_score,
    escape_count,
    total_session_minutes,
    total_escape_minutes,
    focus_bonus,
    subject_name
  } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>공부 완료!</Text>
      <Text style={styles.subject}>{subject_name}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>집중력 점수</Text>
        <Text style={styles.score}>{focus_score}점</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 공부 시간</Text>
          <Text style={styles.statValue}>{total_session_minutes}분</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>이탈 횟수</Text>
          <Text style={styles.statValue}>{escape_count}회</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>이탈 시간</Text>
          <Text style={styles.statValue}>{total_escape_minutes}분</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>연속 집중 보너스</Text>
          <Text style={[styles.statValue, { color: '#27ae60' }]}>+{focus_bonus}점</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace({ pathname: '/home', params: { token, nickname } })}
      >
        <Text style={styles.buttonText}>홈으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subject: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f0f7ff',
    borderRadius: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  statsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 15,
    color: '#555',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#4A90D9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});