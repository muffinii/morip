import { Tabs } from 'expo-router';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

function RecordIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
      <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Svg>
  );
}

function StatsIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
      <Path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </Svg>
  );
}

function CoachingIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function FriendsIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
      <Path d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#cbd5e1',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: '기록',
          tabBarIcon: ({ color }) => <RecordIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          headerShown: false,
          tabBarLabel: '통계',
          tabBarIcon: ({ color }) => <StatsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="coaching"
        options={{
          headerShown: false,
          tabBarLabel: '코칭',
          tabBarIcon: ({ color }) => <CoachingIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          headerShown: false,
          tabBarLabel: '친구',
          tabBarIcon: ({ color }) => <FriendsIcon color={color} />,
        }}
      />
    </Tabs>
  );
}