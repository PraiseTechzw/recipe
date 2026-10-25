import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import i18n from "../../i18n";

import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/useTheme";
import { useStore } from "@/store/useStore";
import { useMemo } from "react";

const CustomTabBarButton = ({ children, onPress, color }: any) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: "center",
      alignItems: "center",
    }}
    onPress={onPress}
  >
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: color,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const { colors } = useTheme();
  const locale = useStore((state) => state.locale);
  const tabPrimary = String(colors.primary);
  const titles = useMemo(
    () => ({
      home: i18n.t("home"),
      explore: i18n.t("explore"),
      saved: i18n.t("saved"),
      profile: i18n.t("profile"),
    }),
    [locale],
  );

  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: tabPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: String(colors.surface),
          borderTopWidth: 1,
          borderTopColor: String(colors.border),
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: titles.home,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="home" color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: titles.explore,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="compass" color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add" size={32} color="#fff" />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} color={tabPrimary} />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: titles.saved,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="heart" color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaders",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="trophy" color={String(color)} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: titles.profile,
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="person" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
