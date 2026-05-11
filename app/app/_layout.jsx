import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: '회원가입' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="addsubject" options={{ title: '과목 추가' }} />
      <Stack.Screen name="result" options={{ headerShown: false }} />
      <Stack.Screen name="mypage" options={{ title: '마이페이지' }} />
    </Stack>
  );
}