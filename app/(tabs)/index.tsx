import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useObserve } from "expo-observe";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/feedback/EmptyState";
import { Skeleton } from "../../components/feedback/Skeleton";
import { AIMascot } from "../../components/ai/AIMascot";
import Logo from "../../components/Logo";
import { RecipeCardUI } from "../../components/ui/RecipeCardUI";
import { SectionHeader } from "../../components/ui/SectionHeader";
import i18n from "../../i18n";
import { HapticService } from "../../services/haptics";
import {
  getPantryMatches,
  getRecipeOfTheDay,
  getRecommendedRecipes,
} from "../../services/recommendations";
import { ToastService } from "../../services/toast";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";
import { NativeRecipeAd } from "../../components/ads/NativeRecipeAd";

export default function HomeScreen() {
  const { markInteractive } = useObserve();
  const router = useRouter();
  const { colors, shadows, isDark } = useTheme();
  const {
    viewHistory,
    categoryScores,
    hasOnboarded,
    shoppingList,
    userProfile,
    pantry,
    commonIngredients,
    recipes,
  } = useStore();
  const selectedPantryItems = commonIngredients.filter((item) =>
    pantry.includes(item.id),
  );

  const [featuredRecipes, setFeaturedRecipes] = useState(recipes.slice(0, 3));
  const [dailyPick, setDailyPick] = useState<(typeof recipes)[number] | undefined>(
    recipes[1] || recipes[0],
  );
  const [pantryRecipes, setPantryRecipes] = useState<typeof recipes>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [dailyFloat] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const dailyMotion = Animated.loop(
      Animated.sequence([
        Animated.timing(dailyFloat, {
          toValue: -4,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(dailyFloat, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    dailyMotion.start();
    return () => dailyMotion.stop();
  }, [dailyFloat]);

  // Onboarding Check
  useEffect(() => {
    if (!hasOnboarded) {
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasOnboarded, router]);

  const loadData = useCallback(async () => {
    // 1. Daily Rotation
    setDailyPick(getRecipeOfTheDay(recipes));

    // 2. Smart Recommendations
    const smartRecs = getRecommendedRecipes(
      viewHistory,
      categoryScores,
      recipes,
    );
    setFeaturedRecipes(
      (smartRecs.length > 0 ? smartRecs : recipes).slice(0, 5),
    );

    // 3. Pantry Matches
    const matched = getPantryMatches(pantry, recipes);
    setPantryRecipes(matched);
  }, [recipes, viewHistory, categoryScores, pantry]);

  useEffect(() => {
    let isActive = true;
    const init = async () => {
      await loadData();
      if (isActive) {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };
    void init();
    return () => {
      isActive = false;
    };
  }, [loadData, fadeAnim]);

  useEffect(() => {
    if (hasOnboarded && !isLoading) markInteractive();
  }, [hasOnboarded, isLoading, markInteractive]);

  const onRefresh = async () => {
    HapticService.selection();
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    ToastService.success(
      i18n.t("refreshed") || "Refreshed",
      "Latest recipes loaded",
    );
    HapticService.success();
  };

  const handleRecipePress = (id: string) => {
    HapticService.light();
    router.push(`/recipe/${id}`);
  };

  const renderFeaturedSkeleton = () => (
    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 20 }}>
      {[1, 2].map((i) => (
        <View key={i} style={{ width: 280 }}>
          <Skeleton
            height={180}
            borderRadius={12}
            style={{ marginBottom: 12 }}
          />
          <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={16} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Logo
            size="medium"
            color={colors.text}
            mutedColor={colors.textSecondary}
          />
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                shadows.small,
              ]}
              onPress={() => {
                HapticService.selection();
                router.push("/shopping-list");
              }}
              accessibilityRole="button"
              accessibilityLabel={i18n.t("shoppingList")}
            >
              <Ionicons name="basket-outline" size={24} color={colors.text} />
              {shoppingList.length > 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {shoppingList.length > 9 ? "9+" : shoppingList.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                HapticService.selection();
                router.push("/(tabs)/profile");
              }}
              accessibilityRole="button"
              accessibilityLabel={i18n.t("profile")}
            >
              <View style={styles.avatarContainer}>
                {userProfile.avatar ? (
                  <Image
                    source={{ uri: userProfile.avatar }}
                    style={[styles.avatar, { borderColor: colors.surface }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      {
                        borderColor: colors.surface,
                        backgroundColor: colors.surfaceVariant,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={20} color={colors.textSecondary} />
                  </View>
                )}
                <View
                  style={[
                    styles.levelBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={styles.levelText}>
                    {userProfile.chefLevel.charAt(0)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 132 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Welcome, search and quick actions */}
          <Animated.View
            style={[styles.greetingSection, { opacity: fadeAnim }]}
          >
            <Text style={[styles.welcomeEyebrow, { color: colors.primary }]}>
              {i18n.t("greeting")}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.mainGreeting, { color: colors.text }]}
            >
              {userProfile.name}
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {i18n.t("subGreeting")}
            </Text>

            <Link
              href={{
                pathname: "/(tabs)/explore",
                params: { autoFocus: "true" },
              }}
              asChild
            >
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.searchBar,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ])}
                accessibilityRole="button"
                accessibilityLabel={i18n.t("searchPlaceholderHome")}
              >
                <View
                  style={[
                    styles.searchIconWrap,
                    { backgroundColor: isDark ? "#30251E" : "#FFF0E4" },
                  ]}
                >
                  <Ionicons name="search" size={18} color={colors.primary} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.placeholderText, { color: colors.textSecondary }]}
                >
                  {i18n.t("searchPlaceholderHome")}
                </Text>
                <Ionicons name="arrow-forward" size={17} color={colors.textSecondary} />
              </TouchableOpacity>
            </Link>

            <View style={styles.quickActions}>
              <Link href="/(ai-chef)/agent" asChild>
                <TouchableOpacity
                  style={styles.quickActionTouch}
                  activeOpacity={0.86}
                  accessibilityRole="button"
                  accessibilityLabel={i18n.t("aiGenerate")}
                >
                  <LinearGradient
                    colors={isDark ? ["#BA5A08", "#5E7743"] : ["#C34813", "#8B6D2E"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.aiAction}
                  >
                    <View style={styles.quickActionIcon}>
                      <AIMascot size={28} />
                    </View>
                    <Text style={styles.quickActionText} numberOfLines={1}>
                      {i18n.t("aiGenerate")}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                style={[
                  styles.pantryAction,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => router.push("/pantry-check")}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`${i18n.t("myPantry")}, ${pantry.length} ingredients`}
              >
                <Ionicons name="basket-outline" size={18} color={colors.primary} />
                <Text style={[styles.pantryActionText, { color: colors.text }]} numberOfLines={1}>
                  {i18n.t("myPantry")}
                </Text>
                <Text style={[styles.pantryCount, { color: colors.textSecondary }]}>
                  {pantry.length}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Pantry recipes, with today's pick first */}
          <Animated.View style={{ opacity: fadeAnim, marginTop: 4 }}>
            <SectionHeader
              title={i18n.t("myPantry")}
              actionLabel={i18n.t("editPantry")}
              onAction={() => router.push("/pantry-check")}
              style={{ paddingHorizontal: 20 }}
            />

            <View style={styles.pantryIngredientsRow}>
              <Text style={[styles.pantrySummary, { color: colors.textSecondary }]}>
                {i18n.t("pantrySelectionSummary", { count: pantry.length })}
              </Text>
              {pantry.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pantryChips}
                >
                  {selectedPantryItems.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.pantryChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                    >
                      <Text style={styles.pantryChipIcon}>{item.icon}</Text>
                      <Text numberOfLines={1} style={[styles.pantryChipText, { color: colors.text }]}>
                        {i18n.t(item.key)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.homeFeatureScroller}
              contentContainerStyle={styles.pantryRecipeList}
              decelerationRate="fast"
              snapToInterval={298}
              snapToAlignment="start"
            >
              {isLoading ? (
                <Skeleton height={270} width={286} borderRadius={24} />
              ) : dailyPick ? (
                <Animated.View style={{ transform: [{ translateY: dailyFloat }] }}>
                  <RecipeCardUI
                    title={dailyPick.title}
                    imageUrl={dailyPick.image}
                    duration={parseInt(dailyPick.time) || 30}
                    difficulty={dailyPick.steps.length <= 5 ? "Easy" : dailyPick.steps.length <= 10 ? "Medium" : "Hard"}
                    category={dailyPick.category}
                    badgeLabel={i18n.t("todaysPick")}
                    rating={dailyPick.rating}
                    cardWidth={286}
                    onPress={() => handleRecipePress(dailyPick.id)}
                  />
                </Animated.View>
              ) : null}

              {!isLoading && pantryRecipes.map((recipe) => (
                <RecipeCardUI
                  key={recipe.id}
                  title={recipe.title}
                  imageUrl={recipe.image}
                  duration={parseInt(recipe.time) || 30}
                  difficulty={recipe.steps.length <= 5 ? "Easy" : recipe.steps.length <= 10 ? "Medium" : "Hard"}
                  rating={recipe.rating}
                  cardWidth={286}
                  onPress={() => handleRecipePress(recipe.id)}
                />
              ))}
            </ScrollView>

            {!isLoading && pantry.length === 0 && (
              <EmptyState
                title="Your pantry is empty"
                description="Add ingredients to get personalized recommendations."
                icon="basket-outline"
                actionLabel="Check Pantry"
                onAction={() => router.push("/pantry-check")}
                style={{ marginHorizontal: 20, marginTop: 8, backgroundColor: colors.surfaceVariant, borderRadius: 16 }}
              />
            )}
            {!isLoading && pantry.length > 0 && pantryRecipes.length === 0 && (
              <EmptyState
                title="No pantry matches yet"
                description="Add a few more ingredients to find recipes you can make."
                icon="nutrition-outline"
                actionLabel="Update Pantry"
                onAction={() => router.push("/pantry-check")}
                style={{ marginHorizontal: 20, marginTop: 8, backgroundColor: colors.surfaceVariant, borderRadius: 16 }}
              />
            )}
          </Animated.View>

          <NativeRecipeAd />

          {/* Featured Section */}
          <Animated.View style={{ opacity: fadeAnim, marginTop: 30 }}>
            <SectionHeader
              title={i18n.t("featured")}
              actionLabel={i18n.t("seeAll")}
              onAction={() => {
                HapticService.selection();
                router.push("/(tabs)/explore");
              }}
              style={{ paddingHorizontal: 20 }}
            />

            {isLoading ? (
              renderFeaturedSkeleton()
            ) : featuredRecipes.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={styles.featuredList}
              >
                {featuredRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.featuredCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => handleRecipePress(recipe.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.imageContainer}>
                      {recipe.image ? (
                        <Image
                          source={
                            typeof recipe.image === "string"
                              ? { uri: recipe.image }
                              : recipe.image
                          }
                          style={styles.featuredImage}
                          contentFit="cover"
                          transition={180}
                        />
                      ) : (
                        <View
                          style={[
                            styles.featuredFallback,
                            { backgroundColor: colors.surfaceVariant },
                          ]}
                        >
                          <Ionicons
                            name="restaurant-outline"
                            size={30}
                            color={colors.textSecondary}
                          />
                        </View>
                      )}
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#E65100" />
                        <Text style={styles.ratingText}>
                          {recipe.rating ? recipe.rating.toFixed(1) : "New"}
                        </Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText} numberOfLines={1}>
                          {recipe.category}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.featuredTitle, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {recipe.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.authorRow}>
                        {recipe.author?.avatar ? (
                          <Image
                            source={{ uri: recipe.author.avatar }}
                            style={styles.smallAvatar}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.smallAvatar,
                              styles.authorFallback,
                              { backgroundColor: colors.surfaceVariant },
                            ]}
                          >
                            <Ionicons
                              name="person"
                              size={12}
                              color={colors.textSecondary}
                            />
                          </View>
                        )}
                        <Text
                          style={[
                            styles.authorName,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {recipe.author?.name}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.metaText,
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
            ) : (
              <EmptyState
                title="No featured recipes"
                icon="restaurant-outline"
                style={{ height: 200 }}
              />
            )}
          </Animated.View>


        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  greetingSection: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  welcomeEyebrow: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "800",
    marginBottom: 2,
  },
  mainGreeting: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.9,
    marginBottom: 3,
  },
  subGreeting: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 58,
    borderRadius: 19,
    borderWidth: 1,
    gap: 11,
    shadowColor: "#3D2918",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },
  quickActionTouch: {
    flex: 1,
  },
  aiAction: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderRadius: 17,
  },
  quickActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },
  pantryAction: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 8,
  },
  pantryActionText: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  pantryCount: {
    fontSize: 10,
    fontWeight: "800",
  },
  pantryContents: {
    gap: 8,
    marginBottom: 14,
  },
  pantryHeaderRow: {
    minHeight: 44,
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pantryHeading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  dailyHeaderPill: {
    minHeight: 34,
    maxWidth: 172,
    borderRadius: 17,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dailyHeaderPillText: {
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },
  pantrySummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  editPantryText: {
    fontSize: 12,
    fontWeight: "800",
  },
  pantrySummary: {
    fontSize: 12,
    fontWeight: "700",
  },
  pantryIngredientsRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 9,
  },
  pantryChips: {
    gap: 8,
    paddingRight: 20,
  },
  pantryChip: {
    minHeight: 34,
    maxWidth: 180,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pantryChipIcon: {
    fontSize: 14,
  },
  pantryChipText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
  },
  pantryRecipeScroller: {
    marginHorizontal: -20,
  },
  pantryRecipeList: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  homeFeatureScroller: {
    marginHorizontal: -20,
  },
  homeFeatureList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  pantryFeatureCard: {
    width: 292,
    height: 236,
    padding: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  pantryFeatureTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pantryFeatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pantryFeatureCountWrap: {
    flex: 1,
  },
  pantryFeatureCount: {
    fontSize: 23,
    lineHeight: 27,
    fontWeight: "900",
  },
  pantryFeatureCountLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  pantryFeatureTitle: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800",
    marginTop: 10,
  },
  pantryFeatureDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  pantryFeatureChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  pantryFeatureChip: {
    minHeight: 28,
    maxWidth: 105,
    borderRadius: 14,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pantryMoreText: {
    fontSize: 12,
    fontWeight: "800",
  },
  pantryFeatureAdd: {
    minHeight: 38,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pantryFeatureAddText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  pantryFeatureEdit: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    borderRadius: 20,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 168,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    maxWidth: "58%",
    minHeight: 25,
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: "rgba(35,43,31,0.82)",
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "500",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dailyCard: {
    height: 284,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  dailyImage: {
    width: "100%",
    height: "100%",
  },
  dailyImageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
  },
  dailyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dailyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dailyBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mediumAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  authorNameLight: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  dailyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 32,
  },
  dailyDesc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  dailyCta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginTop: 4,
  },
  dailyCtaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  dailyCtaIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
