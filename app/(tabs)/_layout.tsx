import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import i18n from "../../i18n";

import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      justifyContent: "center",
      alignItems: "center",
      top: -10, // Slight lift to center it visually in taller tab bar
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#E65100",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#E65100",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E65100", // Override with brand color
        tabBarInactiveTintColor: "#9CA3AF", // Neutral gray
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false, // Clean, icon-only look
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          height: Platform.select({ ios: 85, android: 70 }),
          paddingTop: 10,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            android: {
              elevation: 8,
            },
          }),
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
            <Ionicons name="add" size={28} color="#fff" />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
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
