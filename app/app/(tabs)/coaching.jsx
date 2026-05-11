import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CoachingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 코칭</Text>
      <Text style={styles.subtitle}>준비 중입니다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#888' },
});