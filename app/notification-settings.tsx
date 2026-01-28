import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();
  
  const { notificationPreferences, setNotificationPreferences } = useStore();
  const { dailyReminder, weeklyLeaderboard, newBadges, newRecipes } = notificationPreferences;

  const updatePreference = (key: keyof typeof notificationPreferences, value: boolean) => {
    setNotificationPreferences({ [key]: value });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.text }]}>
          {i18n.t("notificationSettings") || "Notification Settings"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing.m },
          ]}
        >
          {i18n.t("notificationSettingsDesc") ||
            "Manage which notifications you want to receive."}
        </Text>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={[typography.h4, { color: colors.text }]}>
                {i18n.t("dailyReminder") || "Daily Reminder"}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary }]}
              >
                {i18n.t("dailyReminderDesc") ||
                  "Get reminded to cook something new every day."}
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={(val) => updatePreference("dailyReminder", val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={[typography.h4, { color: colors.text }]}>
                {i18n.t("weeklyLeaderboard") || "Weekly Leaderboard"}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary }]}
              >
                {i18n.t("weeklyLeaderboardDesc") ||
                  "Updates on the weekly chef leaderboard."}
              </Text>
            </View>
            <Switch
              value={weeklyLeaderboard}
              onValueChange={(val) => updatePreference("weeklyLeaderboard", val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={[typography.h4, { color: colors.text }]}>
                {i18n.t("newBadges") || "New Badges"}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary }]}
              >
                {i18n.t("newBadgesDesc") ||
                  "Get notified when you unlock a new badge."}
              </Text>
            </View>
            <Switch
              value={newBadges}
              onValueChange={(val) => updatePreference("newBadges", val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={[typography.h4, { color: colors.text }]}>
                {i18n.t("newRecipes") || "New Recipes"}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary }]}
              >
                {i18n.t("newRecipesDesc") ||
                  "When new recipes are added to the community."}
              </Text>
            </View>
            <Switch
              value={newRecipes}
              onValueChange={(val) => updatePreference("newRecipes", val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#f9f9f9",
    marginLeft: 16,
  },
});
