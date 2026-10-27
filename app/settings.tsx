import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";
import { useAds } from "../components/ads/AdsProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { privacyOptionsRequired, showPrivacyOptions } = useAds();
  const { locale, setLocale, isDarkMode, toggleDarkMode, analyticsEnabled, setAnalyticsEnabled } = useStore();
  const appVersion = Constants.expoConfig?.version || "2.0.2";

  const changeLanguage = () => {
    Alert.alert(i18n.t("language"), "Select your app language", [
      { text: "English", onPress: () => setLocale("en") },
      { text: "Shona", onPress: () => setLocale("sn") },
      { text: "Ndebele", onPress: () => setLocale("nd") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const languageName = locale === "sn" ? "Shona" : locale === "nd" ? "Ndebele" : "English";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{i18n.t("settingsTitle")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>Make Zimbabwe Traditional Recipes work the way you like.</Text>

        <SettingsSection title={i18n.t("appPreferences")} colors={colors}>
          <View style={styles.item}>
            <SettingLabel icon="moon-outline" label={i18n.t("darkMode")} colors={colors} />
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" />
          </View>
          <SettingsLink icon="notifications-outline" label={i18n.t("notifications")} colors={colors} onPress={() => router.push("/notification-settings")} />
        </SettingsSection>

        <SettingsSection title={i18n.t("content")} colors={colors}>
          <SettingsLink icon="language-outline" label={i18n.t("language")} value={languageName} colors={colors} onPress={changeLanguage} />
          <SettingsLink icon="cloud-download-outline" label={i18n.t("offlineData")} colors={colors} onPress={() => router.push("/offline-data")} last />
        </SettingsSection>

        <SettingsSection title="Privacy" colors={colors}>
          <View style={styles.item}>
            <SettingLabel icon="analytics-outline" label="Share app usage data" colors={colors} />
            <Switch value={analyticsEnabled} onValueChange={setAnalyticsEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#FFFFFF" accessibilityLabel="Share app usage data with PostHog" />
          </View>
          <Text style={[styles.privacyNote, { color: colors.textSecondary }]}>Optional, anonymous screen and feature counts help improve the app. Recipe details, ingredients, AI prompts, email, and touch recordings are not sent. Change this any time.</Text>
          {privacyOptionsRequired ? <SettingsLink icon="options-outline" label="Manage ad privacy choices" colors={colors} onPress={() => void showPrivacyOptions()} last /> : null}
        </SettingsSection>

        <SettingsSection title={i18n.t("about")} colors={colors}>
          <View style={styles.item}>
            <SettingLabel icon="information-circle-outline" label={i18n.t("version")} colors={colors} />
            <Text style={[styles.valueText, { color: colors.textSecondary }]}>v{appVersion}</Text>
          </View>
          <SettingsLink icon="document-text-outline" label={i18n.t("terms")} colors={colors} onPress={() => router.push({ pathname: "/legal/[document]", params: { document: "terms" } })} />
          <SettingsLink icon="shield-checkmark-outline" label={i18n.t("privacy")} colors={colors} onPress={() => router.push({ pathname: "/legal/[document]", params: { document: "privacy" } })} last />
        </SettingsSection>

        <View style={[styles.brandNote, { backgroundColor: isDark ? colors.surfaceVariant : "#FFF0E4" }]}>
          <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.textSecondary }]}>Celebrating Zimbabwean food, one recipe at a time.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, colors, children }: { title: string; colors: ReturnType<typeof useTheme>["colors"]; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

function SettingLabel({ icon, label, colors }: { icon: keyof typeof Ionicons.glyphMap; label: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return (
    <View style={styles.itemLeft}>
      <View style={[styles.itemIcon, { backgroundColor: colors.surfaceVariant }]}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <Text style={[styles.itemText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function SettingsLink({ icon, label, value, colors, onPress, last = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; colors: ReturnType<typeof useTheme>["colors"]; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.item, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.72} accessibilityRole="button">
      <SettingLabel icon={icon} label={label} colors={colors} />
      <View style={styles.itemRight}>
        {value ? <Text style={[styles.valueText, { color: colors.textSecondary }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900" },
  content: { padding: 20, paddingBottom: 42 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 22, marginTop: 2 },
  sectionWrap: { marginBottom: 22 },
  sectionTitle: { marginLeft: 4, marginBottom: 9, fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  section: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, overflow: "hidden" },
  item: { minHeight: 62, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 11 },
  itemIcon: { width: 36, height: 36, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  itemText: { fontSize: 14, fontWeight: "700" },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 7 },
  valueText: { fontSize: 12, fontWeight: "700" },
  brandNote: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 16 },
  brandText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  privacyNote: { fontSize: 12, lineHeight: 18, paddingHorizontal: 14, paddingBottom: 14, marginTop: -3 },
});
