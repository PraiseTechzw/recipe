import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { authService } from "../services/authService";
import { useStore } from "../store/useStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale, isDarkMode, toggleDarkMode, session } = useStore();
  // const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          await authService.signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      i18n.t("deleteAccount"),
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Logic to delete account
            router.replace("/onboarding");
          },
        },
      ],
    );
  };

  const changeLanguage = () => {
    const options = [
      { text: "English", onPress: () => setLocale("en") },
      { text: "Shona", onPress: () => setLocale("sn") },
      { text: "Ndebele", onPress: () => setLocale("nd") },
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert(
      i18n.t("language"),
      "Select Language / Sarudza Mutauro / Khetha Ulimi",
      options as any,
    );
  };

  const getLanguageName = () => {
    switch (locale) {
      case "en":
        return "English";
      case "sn":
        return "Shona";
      case "nd":
        return "Ndebele";
      default:
        return "English";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t("settingsTitle")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {session ? (
            <TouchableOpacity style={styles.item} onPress={handleSignOut}>
              <View style={styles.itemLeft}>
                <Ionicons name="log-out-outline" size={22} color="#666" />
                <Text style={styles.itemText}>
                  Sign Out ({session.user.email})
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push("/auth")}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="log-in-outline" size={22} color="#666" />
                <Text style={styles.itemText}>Sign In / Restore Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t("appPreferences")}</Text>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons name="moon-outline" size={22} color="#666" />
              <Text style={styles.itemText}>{i18n.t("darkMode")}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#eee", true: "#E65100" }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push("/notification-settings")}
          >
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={22} color="#666" />
              <Text style={styles.itemText}>{i18n.t("notifications")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t("content")}</Text>

          <TouchableOpacity style={styles.item} onPress={changeLanguage}>
            <View style={styles.itemLeft}>
              <Ionicons name="language-outline" size={22} color="#666" />
              <Text style={styles.itemText}>{i18n.t("language")}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#999", marginRight: 8 }}>
                {getLanguageName()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons name="download-outline" size={22} color="#666" />
              <Text style={styles.itemText}>{i18n.t("offlineData")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t("about")}</Text>

          <TouchableOpacity style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#666"
              />
              <Text style={styles.itemText}>{i18n.t("version")}</Text>
            </View>
            <Text style={{ color: "#999" }}>2.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons name="document-text-outline" size={22} color="#666" />
              <Text style={styles.itemText}>{i18n.t("terms")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <View style={styles.itemLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#666"
              />
              <Text style={styles.itemText}>{i18n.t("privacy")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>{i18n.t("deleteAccount")}</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
    textTransform: "uppercase",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  deleteButton: {
    alignItems: "center",
    padding: 16,
    marginTop: 20,
  },
  deleteText: {
    color: "#D32F2F",
    fontWeight: "600",
  },
});
