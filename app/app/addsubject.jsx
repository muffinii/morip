import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../src/api/client';

export default function AddSubjectScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '과목 이름을 입력해주세요');
      return;
    }

    try {
      const data = await api('/subjects', 'POST', { name }, token);
      Alert.alert('성공', '과목이 추가되었습니다');
      router.back();
    } catch (error) {
      Alert.alert('오류', '과목 추가에 실패했습니다');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>과목 추가</Text>

      <TextInput
        style={styles.input}
        placeholder="과목 이름 (예: 수학)"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>추가하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90D9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});