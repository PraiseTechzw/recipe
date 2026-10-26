import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useObserve } from "expo-observe";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { SyncService } from "../services/syncService";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

type AuthMode = "signup" | "login";

export default function AccountAccessScreen() {
  const { markInteractive } = useObserve();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { colors, isDark } = useTheme();
  const setHasOnboarded = useStore((state) => state.setHasOnboarded);
  const [mode, setMode] = useState<AuthMode>(params.mode === "login" ? "login" : "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setError("");
    setNotice("");

    if (!isSupabaseConfigured) {
      setError(i18n.t("authNotConfigured"));
      return;
    }
    if (!cleanEmail.includes("@")) {
      setError(i18n.t("emailInvalid"));
      return;
    }
    if (password.length < 6) {
      setError(i18n.t("passwordTooShort"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: useStore.getState().userProfile.name },
          },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          // Keep the local guest progress in place until email verification and login.
          setMode("login");
          setNotice(i18n.t("emailVerificationNotice"));
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInError) throw signInError;
      }

      await SyncService.restoreSignedInAccountState();
      setHasOnboarded(true);
      router.replace("/(tabs)");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : i18n.t("authError"),
      );
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel={i18n.t("goBack")}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>{i18n.t("goBack")}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: isDark ? "#3A2A20" : "#FFF0E4" }]}>
              <Ionicons name={mode === "signup" ? "person-add-outline" : "person-outline"} size={25} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t(mode === "signup" ? "createAccountTitle" : "loginTitle")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {i18n.t("accountChoiceSubtitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>{i18n.t("emailAddress")}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={19} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder={i18n.t("emailAddress")}
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { color: colors.text, marginTop: 18 }]}>{i18n.t("password")}</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder={i18n.t("passwordHint")}
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                textContentType={mode === "signup" ? "newPassword" : "password"}
                returnKeyType="go"
                onSubmitEditing={submit}
              />
            </View>

            {!!notice && (
              <View style={[styles.message, { backgroundColor: isDark ? "#1D3527" : "#EAF6ED" }]}>
                <Ionicons name="mail-open-outline" size={19} color={isDark ? "#81C784" : "#2E7D32"} />
                <Text style={[styles.messageText, { color: isDark ? "#C8E6C9" : "#245B2A" }]}>{notice}</Text>
              </View>
            )}
            {!!error && (
              <View style={[styles.message, { backgroundColor: isDark ? "#3A2020" : "#FDECEC" }]}>
                <Ionicons name="alert-circle-outline" size={19} color={colors.error} />
                <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={submit}
              disabled={busy}
              style={[styles.submitButton, { backgroundColor: isDark ? "#B95D00" : "#C2410C", opacity: busy ? 0.75 : 1 }]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {i18n.t(mode === "signup" ? "createAndSave" : "loginAndRestore")}
                  </Text>
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => changeMode(mode === "signup" ? "login" : "signup")}
            style={styles.modeSwitch}
            accessibilityRole="button"
          >
            <Text style={[styles.modeSwitchText, { color: isDark ? colors.primary : "#B84400" }]}>
              {i18n.t(mode === "signup" ? "alreadyHaveAccount" : "needAccount")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  content: { width: "100%", maxWidth: 560, alignSelf: "center", padding: 24, paddingBottom: 34 },
  backButton: { minHeight: 42, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 2, marginBottom: 18 },
  backText: { fontSize: 14, fontWeight: "700" },
  header: { alignItems: "center", marginBottom: 30 },
  headerIcon: { width: 56, height: 56, borderRadius: 19, alignItems: "center", justifyContent: "center", marginBottom: 15 },
  title: { fontSize: 28, lineHeight: 35, fontWeight: "800", textAlign: "center", marginBottom: 7 },
  subtitle: { maxWidth: 420, fontSize: 14, lineHeight: 21, textAlign: "center" },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  inputWrap: { minHeight: 56, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 15 },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 16 },
  message: { flexDirection: "row", alignItems: "flex-start", gap: 9, borderRadius: 14, padding: 13, marginTop: 16 },
  messageText: { flex: 1, fontSize: 13, lineHeight: 19 },
  submitButton: { minHeight: 58, borderRadius: 29, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 24 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center", flexShrink: 1 },
  modeSwitch: { minHeight: 54, alignItems: "center", justifyContent: "center", marginTop: 8 },
  modeSwitchText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
});
