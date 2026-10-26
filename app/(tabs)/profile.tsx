import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BADGES, getLevel, getNextLevel } from "../../constants/gamification";
import i18n from "../../i18n";
import { SyncService } from "../../services/syncService";
import { ToastService } from "../../services/toast";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    userProfile,
    isDarkMode,
    toggleDarkMode,
    setLocale,
    myRecipes,
    favorites,
  } = useStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const currentLevel = getLevel(userProfile.xp);
  const nextLevel = getNextLevel(userProfile.xp);
  const xpProgress = nextLevel
    ? Math.min(
        100,
        ((userProfile.xp - currentLevel.minXP) /
          (nextLevel.minXP - currentLevel.minXP)) *
          100,
      )
    : 100;
  const pendingUploads = myRecipes.filter((recipe) => !recipe.remoteId).length;

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await SyncService.syncRecipes();
      setLastSynced(new Date().toLocaleTimeString());
      ToastService.success("Synced", "Your recipes are up to date.");
    } catch (error) {
      console.error(error);
      ToastService.error("Sync failed", "Could not sync your recipes.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(i18n.t("logOut"), "Are you sure you want to log out?", [
      { text: i18n.t("cancel"), style: "cancel" },
      {
        text: i18n.t("logOut"),
        style: "destructive",
        onPress: () => router.replace("/onboarding"),
      },
    ]);
  };

  const handleRateUs = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    } else {
      Alert.alert(i18n.t("rateUs"), "Please rate us in your app store.");
    }
  };

  const handleLanguage = () => {
    Alert.alert(i18n.t("language"), "Select Language", [
      { text: "English", onPress: () => setLocale("en") },
      { text: "Shona", onPress: () => setLocale("sn") },
      { text: "Ndebele", onPress: () => setLocale("nd") },
      { text: i18n.t("cancel"), style: "cancel" },
    ]);
  };

  const handleHelpCenter = () => {
    Alert.alert(
      i18n.t("helpCenter"),
      "Contact support at support@tasteofzimbabwe.com",
    );
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.eyebrow, { color: colors.primary }]}
            >
              ZIMBABWE TRADITIONAL RECIPES
            </Text>
            <Text style={[styles.screenTitle, { color: colors.text }]}>
              {i18n.t("profile")}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <HeaderAction
              icon="notifications-outline"
              label={i18n.t("notifications")}
              onPress={() => router.push("/notifications")}
              isDark={isDark}
            />
            <HeaderAction
              icon="settings-outline"
              label={i18n.t("settingsTitle")}
              onPress={() => router.push("/settings")}
              isDark={isDark}
            />
          </View>
        </View>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileIdentity}>
            <View style={styles.avatarFrame}>
              {userProfile.avatar ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { backgroundColor: isDark ? "#3A2A20" : "#FFF0E4" },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={28}
                    color={colors.primary}
                  />
                </View>
              )}
              <View
                style={[styles.levelDot, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.levelDotText}>{currentLevel.level}</Text>
              </View>
            </View>
            <View style={styles.profileCopy}>
              <Text
                style={[styles.name, { color: colors.text }]}
                numberOfLines={1}
              >
                {userProfile.name}
              </Text>
              <Text style={[styles.role, { color: colors.textSecondary }]}>
                {currentLevel.title}
              </Text>
              {!!userProfile.bio && (
                <Text
                  style={[styles.bio, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {userProfile.bio}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: colors.surfaceVariant },
              ]}
              onPress={() => router.push("/edit-profile")}
              accessibilityRole="button"
              accessibilityLabel={i18n.t("personalInfo")}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }] }>
              Level progress
            </Text>
            <Text style={[styles.progressValue, { color: colors.primary }] }>
              {userProfile.xp} XP
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${xpProgress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressCaption, { color: colors.textSecondary }]}>
            {nextLevel
              ? `${Math.max(0, nextLevel.minXP - userProfile.xp)} XP to ${nextLevel.title}`
              : "You’ve reached the highest level"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="flame-outline"
            value={userProfile.stats?.recipesCooked || 0}
            label="Cooked"
            colors={colors}
          />
          <StatCard
            icon="bookmark-outline"
            value={favorites.length}
            label={i18n.t("saved")}
            colors={colors}
          />
          <StatCard
            icon="share-social-outline"
            value={userProfile.stats?.sharedRecipes || 0}
            label="Shared"
            colors={colors}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.savedCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => router.push("/(tabs)/saved")}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.savedIcon,
              { backgroundColor: isDark ? "#3A2A20" : "#FFF0E4" },
            ]}
          >
            <Ionicons name="bookmark" size={22} color={colors.primary} />
          </View>
          <View style={styles.savedCopy}>
            <Text style={[styles.savedTitle, { color: colors.text }]}>
              {i18n.t("savedRecipes")}
            </Text>
            <Text style={[styles.savedSubtitle, { color: colors.textSecondary }]}>
              {favorites.length === 1
                ? "1 recipe saved for later"
                : `${favorites.length} recipes saved for later`}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.syncCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.syncCopy}>
            <View style={styles.syncTitleRow}>
              <Ionicons name="cloud-done-outline" size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Sync status
              </Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {lastSynced
                ? `Last synced ${lastSynced}`
                : pendingUploads > 0
                  ? `${pendingUploads} recipe${pendingUploads === 1 ? "" : "s"} waiting to sync`
                  : "Your recipes are up to date"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: colors.primary }]}
            onPress={handleSync}
            disabled={isSyncing}
            accessibilityRole="button"
          >
            {isSyncing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.syncButtonText}>Sync</Text>
            )}
          </TouchableOpacity>
        </View>

        {myRecipes.length > 0 && (
          <View style={styles.section}>
            <SectionHeading title="My recipes" color={colors.text} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {myRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[
                    styles.recipeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => router.push(`/cooking/${recipe.id}`)}
                  activeOpacity={0.8}
                >
                  {recipe.image ? (
                    <Image
                      source={{ uri: recipe.image }}
                      style={styles.recipeImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.recipeImage,
                        styles.recipeImageFallback,
                        { backgroundColor: colors.surfaceVariant },
                      ]}
                    >
                      <Ionicons
                        name="restaurant-outline"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.recipeTitle, { color: colors.text }]}
                  >
                    {recipe.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeading
            title={i18n.t("achievements")}
            action={`${userProfile.badges.length}/${BADGES.length}`}
            color={colors.text}
            actionColor={colors.primary}
            onAction={() => router.push("/achievements")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {BADGES.slice(0, 8).map((badge) => {
              const unlocked = userProfile.badges.includes(badge.id);
              return (
                <View
                  key={badge.id}
                  style={[
                    styles.achievementCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: unlocked ? 1 : 0.62,
                    },
                  ]}
                >
                  <Text style={styles.achievementIcon}>{badge.icon}</Text>
                  <Text
                    style={[styles.achievementName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Preferences" color={colors.text} />
          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="person-outline"
              label={i18n.t("personalInfo")}
              colors={colors}
              onPress={() => router.push("/edit-profile")}
            />
            <View
              style={[styles.settingRow, { borderBottomColor: colors.border }]}
            >
              <SettingIcon icon="moon-outline" colors={colors} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("darkMode")}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View
              style={[styles.settingRow, { borderBottomColor: colors.border }]}
            >
              <SettingIcon icon="notifications-outline" colors={colors} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {i18n.t("notifications")}
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <SettingRow
              icon="language-outline"
              label={i18n.t("language")}
              colors={colors}
              onPress={handleLanguage}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Support" color={colors.text} />
          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="help-circle-outline"
              label={i18n.t("helpCenter")}
              colors={colors}
              onPress={handleHelpCenter}
            />
            <SettingRow
              icon="star-outline"
              label={i18n.t("rateUs")}
              colors={colors}
              onPress={handleRateUs}
              last
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: isDark ? "#3A2020" : "#FDECEC" },
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={19} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            {i18n.t("logOut")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeaderAction({
  icon,
  label,
  onPress,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isDark: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.headerAction,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isDark ? colors.text : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  value,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={19} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function SectionHeading({
  title,
  action,
  color,
  actionColor,
  onAction,
}: {
  title: string;
  action?: string;
  color: string;
  actionColor?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {action && onAction && (
        <TouchableOpacity onPress={onAction} accessibilityRole="button">
          <Text style={[styles.sectionAction, { color: actionColor || color }]}>
            {action} ›
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SettingIcon({
  icon,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[
        styles.settingIcon,
        { backgroundColor: colors.surfaceVariant },
      ]}
    >
      <Ionicons name={icon} size={19} color={colors.primary} />
    </View>
  );
}

function SettingRow({
  icon,
  label,
  colors,
  onPress,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        last
          ? { borderBottomWidth: 0 }
          : { borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <SettingIcon icon={icon} colors={colors} />
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={19}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 130, gap: 16 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.3, marginBottom: 4 },
  screenTitle: { fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerAction: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  profileCard: { borderWidth: 1, borderRadius: 24, padding: 18 },
  profileIdentity: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 20 },
  avatarFrame: { position: "relative" },
  avatar: { width: 68, height: 68, borderRadius: 23 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  levelDot: { position: "absolute", right: -5, bottom: -5, minWidth: 23, height: 23, borderRadius: 12, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  levelDotText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  profileCopy: { flex: 1, minWidth: 0 },
  name: { fontSize: 21, lineHeight: 27, fontWeight: "800" },
  role: { fontSize: 13, fontWeight: "600", marginTop: 1 },
  bio: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  editButton: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: "700" },
  progressValue: { fontSize: 13, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 8 },
  progressCaption: { fontSize: 11, marginTop: 7 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, minWidth: 0, minHeight: 92, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: 11 },
  statValue: { fontSize: 20, lineHeight: 25, fontWeight: "800", marginTop: 3 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  savedCard: { minHeight: 76, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  savedIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  savedCopy: { flex: 1, minWidth: 0, gap: 3 },
  savedTitle: { fontSize: 15, fontWeight: "800" },
  savedSubtitle: { fontSize: 12 },
  syncCard: { minHeight: 76, borderRadius: 20, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  syncCopy: { flex: 1, minWidth: 0 },
  syncTitleRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "800" },
  cardSubtitle: { fontSize: 11, lineHeight: 16 },
  syncButton: { minWidth: 64, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  syncButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  section: { gap: 12 },
  sectionHeading: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  sectionAction: { fontSize: 13, fontWeight: "700" },
  horizontalList: { gap: 10, paddingRight: 20 },
  recipeCard: { width: 142, borderRadius: 17, borderWidth: 1, overflow: "hidden", paddingBottom: 10 },
  recipeImage: { width: "100%", height: 88 },
  recipeImageFallback: { alignItems: "center", justifyContent: "center" },
  recipeTitle: { fontSize: 12, fontWeight: "700", marginHorizontal: 10, marginTop: 9 },
  achievementCard: { width: 92, minHeight: 88, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, paddingVertical: 10, gap: 5 },
  achievementIcon: { fontSize: 25 },
  achievementName: { width: "100%", fontSize: 10, fontWeight: "700", textAlign: "center" },
  menuGroup: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  settingRow: { minHeight: 62, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
  logoutButton: { minHeight: 52, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  logoutText: { fontSize: 14, fontWeight: "800" },
});
