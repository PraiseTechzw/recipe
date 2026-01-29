import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
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
import { authService } from "../services/authService";
import { useStore } from "../store/useStore";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../theme/tokens";

const colors = COLORS.light;
const spacing = SPACING;
const radius = RADIUS;
const typography = TYPOGRAPHY;

const { width, height } = Dimensions.get("window");

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up for new users
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { session, error } = await authService.signIn(email, password);
        if (error) throw error;
        if (session) {
          setSession(session);
          // Check if profile exists (restored), if not go to onboarding, else tabs
          const { hasOnboarded } = useStore.getState();
          if (hasOnboarded) {
            router.replace("/(tabs)");
          } else {
            router.replace("/onboarding");
          }
        }
      } else {
        const { session, error } = await authService.signUp(email, password);
        if (error) throw error;
        if (session) {
          setSession(session);
          // New user -> Go to Onboarding to set profile
          router.replace("/onboarding");
        } else {
          Alert.alert(
            "Success",
            "Please check your email for the confirmation link.",
          );
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    // Guest flow -> Go to Onboarding
    router.replace("/onboarding");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1543353071-873f1753ade2?q=80&w=2070&auto=format&fit=crop",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="restaurant"
                    size={40}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.appName}>Taste of Zimbabwe</Text>
                <Text style={styles.tagline}>Discover. Cook. Share.</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, isLogin && styles.activeTab]}
                    onPress={() => setIsLogin(true)}
                  >
                    <Text
                      style={[styles.tabText, isLogin && styles.activeTabText]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, !isLogin && styles.activeTab]}
                    onPress={() => setIsLogin(false)}
                  >
                    <Text
                      style={[styles.tabText, !isLogin && styles.activeTabText]}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.welcomeText}>
                  {isLogin ? "Welcome Back!" : "Create Account"}
                </Text>
                <Text style={styles.subtitleText}>
                  {isLogin
                    ? "Sign in to access your recipes and sync your progress."
                    : "Join us to save your recipes and compete on the leaderboard."}
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? "Sign In" : "Get Started"}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={handleGuest}
                >
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  guestButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
});
