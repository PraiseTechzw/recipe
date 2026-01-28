import i18n from "@/i18n";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationService } from "../services/notificationService";
import { useTheme } from "../theme/useTheme";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { notifications, markNotificationAsRead, addNotification } = useStore();

  const handleTestNotification = async () => {
    const title = "Test Notification";
    const body = "This is how your notifications will look! 🍲";

    // 1. Send local notification (system)
    await NotificationService.sendLocalNotification(title, body);

    // 2. Add to in-app store
    addNotification({
      title,
      message: body,
      type: "system",
    });

    Alert.alert("Sent!", "You should see a notification in a few seconds.");
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.text }]}>
          {i18n.t("notifications")}
        </Text>
        <TouchableOpacity
          onPress={handleTestNotification}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary }}>
              No notifications yet
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => markNotificationAsRead(item.id)}
            style={[
              styles.item,
              { borderBottomColor: colors.border },
              !item.read && { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    item.type === "achievement" ? "#FFF3E0" : "#E3F2FD",
                },
              ]}
            >
              <Ionicons
                name={
                  item.type === "achievement"
                    ? "trophy"
                    : item.type === "recipe"
                      ? "restaurant"
                      : "newspaper"
                }
                size={20}
                color={item.type === "achievement" ? "#E65100" : "#1976D2"}
              />
            </View>
            <View style={styles.content}>
              <Text
                style={[
                  typography.h4,
                  { color: colors.text },
                  !item.read && { fontWeight: "bold" },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[typography.body, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {item.message}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textTertiary }]}
              >
                {formatTime(item.time)}
              </Text>
            </View>
            {!item.read && (
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  list: {
    padding: 0,
  },
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E65100",
    marginTop: 6,
  },
});
