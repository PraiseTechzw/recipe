import { Tabs } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import i18n from "../../i18n";

import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

const CustomTabBarButton = ({ children, onPress, colors, bgColor }: any) => (
  <TouchableOpacity
    style={{
      justifyContent: "center",
      alignItems: "center",
      top: -24, // Lifted more for better prominence
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View
      style={{
        width: 64, // Slightly larger
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 4,
        borderColor: bgColor, // Matches tab bar background for seamless cutout
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  // Define tab bar background to ensure consistency
  const tabBarBackground = isDark ? colors.surfaceVariant : colors.surface;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 24, // More breathing room
          left: 24,
          right: 24,
          height: 72,
          backgroundColor: tabBarBackground,
          borderRadius: 36,
          borderTopWidth: 0,
          elevation: 12, // Stronger shadow for floating effect
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          paddingBottom: 0,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 72,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t("home"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: i18n.t("explore"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "compass" : "compass-outline"}
              color={color}
            />
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
            <CustomTabBarButton
              {...props}
              colors={colors}
              bgColor={tabBarBackground}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: i18n.t("saved"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t("profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              size={24}
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
