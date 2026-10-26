import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useTheme } from "../theme/useTheme";

const BENEFITS = [
  { key: "accountBenefitSync", icon: "phone-portrait-outline" },
  { key: "accountBenefitProfile", icon: "person-circle-outline" },
  { key: "accountBenefitProgress", icon: "bookmark-outline" },
] as const;

export default function AccountChoiceScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const openAccount = (mode: "signup" | "login") => {
    router.push({ pathname: "/account-access", params: { mode } });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: isDark ? "#3A2A20" : "#FFF0E4" }]}>
            <Ionicons name="restaurant" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: isDark ? colors.primary : "#B84400" }]}>
            {i18n.t("account")}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {i18n.t("accountChoiceTitle")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {i18n.t("accountChoiceSubtitle")}
          </Text>
        </View>

        <View style={[styles.benefitsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {BENEFITS.map((benefit, index) => (
            <View key={benefit.key} style={[styles.benefitRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={[styles.benefitIconWrap, { backgroundColor: isDark ? "#30251E" : "#FFF4EA" }]}>
                <Ionicons name={benefit.icon} size={20} color={isDark ? colors.primary : "#B84400"} />
              </View>
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {i18n.t(benefit.key)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => openAccount("signup")}
            style={[styles.primaryButton, { backgroundColor: isDark ? "#B95D00" : "#C2410C" }]}
            accessibilityRole="button"
          >
            <Ionicons name="person-add-outline" size={19} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{i18n.t("createAccount")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openAccount("login")}
            style={[styles.loginButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            accessibilityRole="button"
          >
            <Text style={[styles.loginButtonText, { color: colors.text }]}>
              {i18n.t("login")}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.guestNote, { backgroundColor: isDark ? "#202020" : "#F1F0ED" }]}>
          <Ionicons name="information-circle-outline" size={19} color={colors.textSecondary} />
          <Text style={[styles.guestNoteText, { color: colors.textSecondary }]}>
            {i18n.t("accountGuestNote")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={styles.guestButton}
          accessibilityRole="button"
        >
          <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>
            {i18n.t("continueAsGuest")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
  },
  hero: { alignItems: "center", marginBottom: 26 },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: "center", maxWidth: 420 },
  benefitsCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, marginBottom: 24 },
  benefitRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 12 },
  benefitIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  benefitText: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  actions: { gap: 12 },
  primaryButton: { minHeight: 56, borderRadius: 28, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 18 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", flexShrink: 1, textAlign: "center" },
  loginButton: { minHeight: 54, borderRadius: 27, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 18 },
  loginButtonText: { fontSize: 15, fontWeight: "700" },
  guestNote: { borderRadius: 15, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 9, marginTop: 18 },
  guestNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  guestButton: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 4 },
  guestButtonText: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});
