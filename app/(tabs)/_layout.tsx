import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import i18n from "../../i18n";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/useTheme";

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const tabPrimary = String(colors.primary);
  const titles = useMemo(
    () => ({
      home: i18n.t("home"),
      explore: i18n.t("explore"),
      profile: i18n.t("profile"),
    }),
    [],
  );

  return (
    <Tabs
      screenOptions={{
          tabBarActiveTintColor: tabPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 20 : 12,
          left: 14,
          right: 14,
          elevation: 12,
          backgroundColor: String(colors.surface),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: String(colors.border),
          borderRadius: 26,
          height: 70,
          paddingTop: 5,
          paddingBottom: 5,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? "#000000" : "#4B2A17",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: isDark ? 0.28 : 0.12,
              shadowRadius: 14,
            },
            android: { elevation: 12 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "700",
          marginTop: 1,
          marginBottom: 1,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: titles.home,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={String(color)} focused={focused} isDark={isDark} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: titles.explore,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "compass" : "compass-outline"} color={String(color)} focused={focused} isDark={isDark} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: i18n.t("createRecipe"),
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={[
                styles.createButton,
                {
                  backgroundColor: tabPrimary,
                  borderColor: String(colors.surface),
                },
              ]}
            >
              <Ionicons
                name="add"
                size={29}
                color={isDark ? "#1E1E1E" : "#FFFFFF"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaders",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "trophy" : "trophy-outline"} color={String(color)} focused={focused} isDark={isDark} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: titles.profile,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} color={String(color)} focused={focused} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
  isDark,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
  isDark: boolean;
}) {
  return (
    <View style={styles.tabIconSlot}>
      {focused && (
        <View
          style={[
            styles.activeTabPill,
            { backgroundColor: isDark ? "#3B2B20" : "#FFF0E4" },
          ]}
        />
      )}
      <Ionicons name={name} size={21} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabIconSlot: {
    minWidth: 44,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabPill: {
    position: "absolute",
    width: 44,
    height: 30,
    borderRadius: 15,
  },
  createButton: {
    width: 54,
    height: 54,
    borderRadius: 20,
    marginTop: -16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#7C2D12",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },
});
