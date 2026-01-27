import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import i18n from '../../i18n';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#E65100',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#E65100',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E65100', // Override with brand color
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 70, // Taller tab bar
          paddingBottom: 10,
          ...Platform.select({
             ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
             },
             android: {
                elevation: 8,
             }
          })
        },
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: -5,
        }
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('home'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: i18n.t('explore'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="compass" color={color} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <Ionicons name="add" size={32} color="#fff" />,
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: i18n.t('saved'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="heart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaders',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="trophy" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('profile'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="person" color={color} />,
        }}
      />

    </Tabs>
  );
}
