import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HomeScreen() {
  const { nickname } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nickname}님 환영합니다!</Text>
      <Text style={styles.subtitle}>타이머 추가 예정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
});