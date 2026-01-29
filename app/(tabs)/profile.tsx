import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BADGES, getLevel, getNextLevel } from "../../constants/gamification";
import i18n from "../../i18n";
import { SyncService } from "../../services/syncService";
import { ToastService } from "../../services/toast";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { userProfile, toggleDarkMode, setLocale, myRecipes } = useStore();
  const { colors, typography, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const pendingUploads = myRecipes.filter((r) => !r.remoteId).length;

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    ToastService.info("Syncing", "Starting sync process...");

    try {
      await SyncService.syncRecipes();
      setLastSynced(new Date().toLocaleTimeString());
      ToastService.success("Synced", "Recipes synced successfully!");
    } catch (error) {
      console.error(error);
      ToastService.error("Sync Failed", "Could not sync recipes.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(i18n.t("logOut"), "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // In a real app, clear auth tokens here
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const handleRateUs = async () => {
    if (await StoreReview.hasAction()) {
      StoreReview.requestReview();
    } else {
      Alert.alert("Rate Us", "Please rate us on the App Store!");
    }
  };

  const handleHelpCenter = () => {
    Alert.alert(
      i18n.t("helpCenter"),
      "Contact support at support@tasteofzimbabwe.com",
    );
  };

  const handleLanguage = () => {
    Alert.alert("Language", "Select Language", [
      { text: "English", onPress: () => setLocale("en") },
      { text: "Shona", onPress: () => setLocale("sn") },
      { text: "Ndebele", onPress: () => setLocale("nd") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const currentLevel = getLevel(userProfile.xp);
  const nextLevel = getNextLevel(userProfile.xp);

  const xpProgress = nextLevel
    ? ((userProfile.xp - currentLevel.minXP) /
        (nextLevel.minXP - currentLevel.minXP)) *
      100
    : 100;

  // const AnimatedTouchableOpacity =
  //   Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Modern Header Section */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[colors.primary, "#E65100"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientHeader, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/settings")}
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View style={styles.profileContent}>
                <View style={styles.avatarWrapper}>
                  {userProfile.avatar ? (
                    <Image
                      source={{ uri: userProfile.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: "#E65100",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Ionicons name="person" size={40} color="#fff" />
                    </View>
                  )}
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{currentLevel.level}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push("/edit-profile")}
                  >
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.name}>{userProfile.name}</Text>
                <Text style={styles.title}>{currentLevel.title}</Text>
                {userProfile.bio ? (
                  <Text style={styles.bio}>{userProfile.bio}</Text>
                ) : null}

                {/* XP Progress Bar */}
                <View style={styles.xpContainer}>
                  <View style={styles.xpInfo}>
                    <Text style={styles.xpText}>{userProfile.xp} XP</Text>
                    <Text style={styles.xpText}>
                      {nextLevel ? `${nextLevel.minXP} XP` : "MAX"}
                    </Text>
                  </View>
                  <View style={styles.xpTrack}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.xpFill,
                        { width: `${Math.min(xpProgress, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.xpNext}>
                    {nextLevel
                      ? `${nextLevel.minXP - userProfile.xp} XP to ${nextLevel.title}`
                      : "Max Level Reached!"}
                  </Text>
                </View>

                {/* Badges Preview */}
                <View style={styles.miniBadgesSection}>
                  <View style={styles.miniBadgesHeader}>
                    <Text style={styles.miniBadgesTitle}>Recent Badges</Text>
                    <TouchableOpacity
                      onPress={() => router.push("/achievements")}
                    >
                      <Text style={styles.miniBadgesLink}>View all</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.miniBadgesList}>
                    {userProfile.badges.slice(0, 4).map((badgeId) => {
                      const badge = BADGES.find((b) => b.id === badgeId);
                      if (!badge) return null;
                      return (
                        <View key={badgeId} style={styles.miniBadgeItem}>
                          <Text style={styles.miniBadgeIcon}>{badge.icon}</Text>
                        </View>
                      );
                    })}
                    {userProfile.badges.length === 0 && (
                      <Text style={styles.noBadgesText}>
                        No badges yet. Keep cooking!
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* Decorative Curve */}
          <View
            style={[styles.curveLayer, { backgroundColor: colors.background }]}
          />
        </View>

        {/* Leaderboard Entry - Premium & Integrated */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <TouchableOpacity
            style={[
              styles.leaderboardRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/leaderboard")}
            activeOpacity={0.7}
          >
            <View style={styles.leaderboardIconContainer}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={[styles.leaderboardTitle, { color: colors.text }]}>
                Leaderboard
              </Text>
              <Text
                style={[
                  styles.leaderboardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Compare your cooking stats
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Sync Status Widget */}
        <Animated.View entering={FadeInUp.delay(250).springify()}>
          <View
            style={[
              styles.syncWidget,
              {
                backgroundColor: colors.surface,
                shadowColor: isDark ? "#000" : "#000",
              },
            ]}
          >
            <View style={styles.syncInfo}>
              <Text style={[styles.syncTitle, { color: colors.text }]}>
                Sync Status
              </Text>
              <Text
                style={[styles.syncSubtitle, { color: colors.textSecondary }]}
              >
                {lastSynced
                  ? `Last synced: ${lastSynced}`
                  : "Not synced recently"}
              </Text>
              <Text
                style={[styles.syncSubtitle, { color: colors.textSecondary }]}
              >
                {pendingUploads > 0
                  ? `${pendingUploads} pending upload${pendingUploads !== 1 ? "s" : ""}`
                  : "All recipes synced"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.syncButton,
                { backgroundColor: colors.primary },
                isSyncing && styles.syncButtonDisabled,
              ]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.syncButtonText}>Sync Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.statsGrid}>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : "#FFF3E0",
                  },
                ]}
              >
                <Ionicons
                  name="restaurant"
                  size={22}
                  color={isDark ? colors.primary : "#E65100"}
                />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userProfile.stats?.recipesCooked || 0}
              </Text>
              <Text style={styles.statLabel}>Cooked</Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : "#E3F2FD",
                  },
                ]}
              >
                <Ionicons
                  name="bookmark"
                  size={22}
                  color={isDark ? "#64B5F6" : "#1976D2"}
                />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userProfile.stats?.savedRecipes || 0}
              </Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.statIcon,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : "#F3E5F5",
                  },
                ]}
              >
                <Ionicons
                  name="share-social"
                  size={22}
                  color={isDark ? "#BA68C8" : "#7B1FA2"}
                />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {userProfile.stats?.sharedRecipes || 0}
              </Text>
              <Text style={styles.statLabel}>Shared</Text>
            </View>
          </View>
        </Animated.View>

        {/* My Recipes Section */}
        {myRecipes.length > 0 && (
          <Animated.View entering={FadeInUp.delay(350).springify()}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  My Recipes
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>
                    {myRecipes.length}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesList}
              >
                {myRecipes.map((recipe, i) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => router.push(`/cooking/${recipe.id}`)}
                  >
                    <Image
                      source={recipe.image}
                      style={styles.recipeImage}
                      contentFit="cover"
                    />
                    <View style={styles.recipeInfo}>
                      <Text
                        style={[styles.recipeTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {recipe.title}
                      </Text>
                      <View style={styles.recipeMeta}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.recipeTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {recipe.time}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {/* Badges Section (Trophy Case) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {i18n.t("achievements")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/achievements")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {userProfile.badges.length}/{BADGES.length} &gt;
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesList}
            decelerationRate="fast"
            snapToInterval={100}
          >
            {BADGES.map((badge, i) => {
              const isUnlocked = userProfile.badges.includes(badge.id);
              return (
                <Animated.View
                  entering={FadeInRight.delay(400 + i * 100).springify()}
                  key={badge.id}
                >
                  <View
                    style={[
                      styles.badgeCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                      !isUnlocked && {
                        backgroundColor: isDark ? "#222" : "#f5f5f5",
                        opacity: 0.5,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeIconContainer,
                        !isUnlocked && styles.badgeIconLocked,
                      ]}
                    >
                      <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                      {isUnlocked && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.badgeName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {badge.name}
                    </Text>
                    <Text
                      style={[styles.badgeReward, { color: colors.primary }]}
                    >
                      +{badge.xpReward} XP
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>

        {/* Menu Actions */}
        <View style={styles.menuContainer}>
          <Text style={[styles.menuHeader, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>
          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <MenuOption
              icon="person-outline"
              label={i18n.t("personalInfo")}
              onPress={() => router.push("/edit-profile")}
              colors={colors}
              isDark={isDark}
            />
            <View
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.menuIconBox,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : "#F3E5F5",
                  },
                ]}
              >
                <Ionicons name="moon-outline" size={20} color="#7B1FA2" />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {i18n.t("darkMode")}
              </Text>
              <Switch
                value={isDark} // Use isDark from theme (synced with store)
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.menuIconBox,
                  {
                    backgroundColor: isDark ? colors.surfaceVariant : "#FFEBEE",
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#D32F2F"
                />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {i18n.t("notifications")}
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <MenuOption
              icon="language-outline"
              label="Language"
              color="#009688"
              bg={isDark ? colors.surfaceVariant : "#E0F2F1"}
              onPress={handleLanguage}
              colors={colors}
              isDark={isDark}
            />
          </View>

          <Text style={[styles.menuHeader, { color: colors.textSecondary }]}>
            SUPPORT
          </Text>
          <View
            style={[
              styles.menuGroup,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <MenuOption
              icon="help-circle-outline"
              label={i18n.t("helpCenter")}
              onPress={handleHelpCenter}
              colors={colors}
              isDark={isDark}
            />
            <MenuOption
              icon="star-outline"
              label={i18n.t("rateUs")}
              onPress={handleRateUs}
              colors={colors}
              isDark={isDark}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? "rgba(211, 47, 47, 0.2)" : "#FFEBEE",
              },
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#D32F2F"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.logoutText}>{i18n.t("logOut")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function MenuOption({
  icon,
  label,
  color = "#E65100",
  bg = "#FFF3E0",
  onPress,
  colors,
  isDark,
}: {
  icon: any;
  label: string;
  color?: string;
  bg?: string;
  onPress?: () => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIconBox,
          { backgroundColor: isDark ? colors.surfaceVariant : bg },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.menuText, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 10,
    position: "relative",
  },
  gradientHeader: {
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
  },
  curveLayer: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  leaderboardRowDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  leaderboardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF9C4", // Light yellow/gold
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: "#888",
  },
  profileContent: {
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.8)",
  },
  levelBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#FFD700",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E65100",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
    fontWeight: "500",
  },
  bio: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  xpContainer: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  xpInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  xpTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  xpFill: {
    height: "100%",
    borderRadius: 4,
  },
  xpNext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: -20,
    zIndex: 1,
  },
  statCard: {
    backgroundColor: "#fff",
    width: width / 3 - 20,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardDark: {
    backgroundColor: "#1E1E1E",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    color: "#E65100",
    fontWeight: "600",
    fontSize: 14,
  },
  badgesList: {
    paddingRight: 20,
    gap: 12,
  },
  badgeCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    width: 100,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeCardDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  badgeLocked: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  badgeIconLocked: {
    backgroundColor: "#EEE",
  },
  badgeEmoji: {
    fontSize: 24,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  recipeCardDark: {
    backgroundColor: "#1E1E1E",
  },
  recipeImage: {
    width: "100%",
    height: 100,
  },
  recipeInfo: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: "#999",
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#4CAF50",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
    height: 32, // limit lines
  },
  badgeReward: {
    fontSize: 10,
    color: "#E65100",
    fontWeight: "bold",
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#999",
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 1.2,
  },
  menuGroup: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  menuGroupDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuItemDark: {
    backgroundColor: "#1E1E1E",
    borderBottomColor: "#333",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  textDark: {
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFEBEE",
    marginBottom: 20,
  },
  logoutText: {
    color: "#D32F2F",
    fontWeight: "bold",
    fontSize: 16,
  },
  miniBadgesSection: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 12,
  },
  miniBadgesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  miniBadgesTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  miniBadgesLink: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  miniBadgesList: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  miniBadgeItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  miniBadgeIcon: {
    fontSize: 18,
  },
  noBadgesText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontStyle: "italic",
  },
  syncWidget: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2,
  },
  syncWidgetDark: {
    backgroundColor: "#1E1E1E",
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  syncSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  syncButton: {
    backgroundColor: "#E65100",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
