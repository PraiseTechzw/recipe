import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/feedback/EmptyState";
import { Skeleton } from "../../components/feedback/Skeleton";
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

export default function HomeScreen() {
  const router = useRouter();
  const { colors, shadows, isDark } = useTheme();
  const {
    viewHistory,
    categoryScores,
    hasOnboarded,
    shoppingList,
    userProfile,
    pantry,
    recipes,
  } = useStore();

  const [featuredRecipes, setFeaturedRecipes] = useState(recipes.slice(0, 3));
  const [dailyPick, setDailyPick] = useState(recipes[1] || recipes[0]);
  const [pantryRecipes, setPantryRecipes] = useState<typeof recipes>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    if (smartRecs.length > 0) {
      setFeaturedRecipes(smartRecs.slice(0, 5));
    }

    // 3. Pantry Matches
    const matched = getPantryMatches(pantry, recipes);
    setPantryRecipes(matched);
  }, [recipes, viewHistory, categoryScores, pantry]);

  useEffect(() => {
    const init = async () => {
      await loadData();
      // Simulate network delay for skeletons
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };
    init();
  }, [loadData]);

  const onRefresh = async () => {
    HapticService.selection();
    setRefreshing(true);
    await loadData();
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      ToastService.success(
        i18n.t("refreshed") || "Refreshed",
        "Latest recipes loaded",
      );
      HapticService.success();
    }, 1000);
  };

  const handleRecipePress = (id: string) => {
    HapticService.light();
    router.push(`/recipe/${id}`);
  };

  const getDifficulty = (stepsCount: number): string => {
    if (stepsCount <= 5) return "Easy";
    if (stepsCount <= 10) return "Medium";
    return "Hard";
  };

  const renderFeaturedSkeleton = () => (
    <View style={{ flexDirection: "row", gap: 16, paddingHorizontal: 20 }}>
      {[1, 2].map((i) => (
        <View key={i} style={{ width: 280 }}>
          <Skeleton
            height={200}
            borderRadius={24}
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
          <View>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {i18n.t("subGreeting")}
            </Text>
            <Text style={[styles.mainGreeting, { color: colors.text }]}>
              {userProfile.name}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
                shadows.small,
              ]}
              onPress={() => {
                HapticService.selection();
                router.push("/(tabs)/explore");
              }}
              accessibilityLabel="Search"
            >
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.surface },
                shadows.small,
              ]}
              onPress={() => {
                HapticService.selection();
                router.push("/shopping-list");
              }}
              accessibilityLabel="Shopping List"
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
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                HapticService.selection();
                router.push("/(tabs)/profile");
              }}
              accessibilityLabel="Profile"
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
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={20} color="#fff" />
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
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* AI Chef Hero */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.greetingSection}
          >
            {/* AI Chef Hero Card */}
            <Link href="/(ai-chef)" asChild>
              <TouchableOpacity activeOpacity={0.9} style={styles.aiHeroCard}>
                <LinearGradient
                  colors={[colors.primary, "#E65100"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.aiGradient}
                >
                  <View style={styles.aiContent}>
                    <View style={styles.aiTextContainer}>
                      <View style={styles.aiBadge}>
                        <Ionicons name="sparkles" size={12} color="#E65100" />
                        <Text style={styles.aiBadgeText}>NEW</Text>
                      </View>
                      <Text style={styles.aiTitle}>AI Chef Assistant</Text>
                      <Text style={styles.aiDescription}>
                        Snap a photo of ingredients to generate recipes
                        instantly.
                      </Text>
                    </View>
                    <View style={styles.aiIconContainer}>
                      <Ionicons
                        name="camera"
                        size={48}
                        color="rgba(255,255,255,0.9)"
                      />
                      <View style={styles.aiIconOverlay}>
                        <Ionicons name="scan-outline" size={24} color="#fff" />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Featured Section */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
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
                decelerationRate="fast"
                snapToInterval={300} // card width + margin
              >
                {featuredRecipes.map((recipe, index) => (
                  <Animated.View
                    key={recipe.id}
                    entering={FadeInRight.delay(200 + index * 100).springify()}
                  >
                    <TouchableOpacity
                      style={[
                        styles.featuredCard,
                        {
                          backgroundColor: colors.surface,
                          shadowColor: shadows.medium.shadowColor,
                        },
                      ]}
                      onPress={() => handleRecipePress(recipe.id)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.imageContainer}>
                        <Image
                          source={{ uri: recipe.image }}
                          style={styles.featuredImage}
                          contentFit="cover"
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.4)"]}
                          style={styles.imageOverlay}
                        />
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.ratingText}>
                            {recipe.rating ? recipe.rating.toFixed(1) : "New"}
                          </Text>
                        </View>
                        <View style={styles.timeBadge}>
                          <Ionicons name="time" size={12} color="#fff" />
                          <Text style={styles.timeText}>{recipe.time}</Text>
                        </View>
                      </View>
                      <View style={styles.cardContent}>
                        <Text
                          style={[styles.featuredTitle, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {recipe.title}
                        </Text>
                        <View style={styles.authorRow}>
                          <Image
                            source={{ uri: recipe.author?.avatar }}
                            style={styles.smallAvatar}
                          />
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
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
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

          {/* Recipe of the Day */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={{ marginTop: 24 }}
          >
            <SectionHeader
              title={i18n.t("recipeOfTheDay")}
              style={{ paddingHorizontal: 20 }}
            />

            <View style={{ paddingHorizontal: 20 }}>
              {isLoading ? (
                <Skeleton height={320} borderRadius={24} />
              ) : dailyPick ? (
                <TouchableOpacity
                  style={[
                    styles.dailyCard,
                    {
                      backgroundColor: colors.surface,
                      shadowColor: shadows.large.shadowColor,
                    },
                  ]}
                  onPress={() => handleRecipePress(dailyPick.id)}
                  activeOpacity={0.95}
                >
                  <Image
                    source={{ uri: dailyPick.image }}
                    style={styles.dailyImage}
                    contentFit="cover"
                    transition={1000}
                  />
                  <LinearGradient
                    colors={[
                      "transparent",
                      "rgba(0,0,0,0.2)",
                      "rgba(0,0,0,0.8)",
                    ]}
                    style={styles.dailyOverlay}
                  >
                    <View style={styles.dailyHeader}>
                      <View style={styles.dailyBadge}>
                        <Text style={styles.dailyBadgeText}>DAILY PICK</Text>
                      </View>
                    </View>
                    <View style={styles.dailyContent}>
                      <Text style={styles.dailyTitle}>{dailyPick.title}</Text>
                      <Text style={styles.dailyDesc} numberOfLines={2}>
                        {dailyPick.description}
                      </Text>
                      <View style={styles.dailyMeta}>
                        <View style={styles.dailyMetaItem}>
                          <Ionicons
                            name="flame-outline"
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.dailyMetaText}>
                            {dailyPick.calories || "350"} kcal
                          </Text>
                        </View>
                        <View style={styles.dailyMetaDivider} />
                        <View style={styles.dailyMetaItem}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="#fff"
                          />
                          <Text style={styles.dailyMetaText}>
                            {dailyPick.time}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <EmptyState
                  title="No Daily Pick"
                  description="Check back later for today's featured recipe."
                  icon="calendar-outline"
                  style={{ height: 250, borderRadius: 24 }}
                />
              )}
            </View>
          </Animated.View>

          {/* Cook with your Pantry */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={{ marginTop: 32 }}
          >
            <SectionHeader
              title="Cook with your Pantry"
              style={{ paddingHorizontal: 20 }}
            />

            <View style={{ paddingHorizontal: 20 }}>
              {pantry.length === 0 ? (
                <EmptyState
                  title="Your pantry is empty"
                  description="Add ingredients to get personalized recommendations."
                  icon="basket-outline"
                  actionLabel="Check Pantry"
                  onAction={() => {
                    HapticService.selection();
                    router.push("/pantry-check");
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 24,
                    padding: 32,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderStyle: "dashed",
                  }}
                />
              ) : pantryRecipes.length > 0 ? (
                <View style={{ gap: 16 }}>
                  {pantryRecipes.map((recipe) => (
                    <RecipeCardUI
                      key={recipe.id}
                      title={recipe.title}
                      imageUrl={recipe.image}
                      duration={parseInt(recipe.time) || 30}
                      difficulty={getDifficulty(recipe.steps.length)}
                      rating={recipe.rating}
                      onPress={() => handleRecipePress(recipe.id)}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="No matches found"
                  description="Try adding more ingredients to your pantry."
                  icon="nutrition-outline"
                  actionLabel="Update Pantry"
                  onAction={() => {
                    HapticService.selection();
                    router.push("/pantry-check");
                  }}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 24,
                    padding: 24,
                  }}
                />
              )}
            </View>
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
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  levelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  greetingSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  subGreeting: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  mainGreeting: {
    fontSize: 22,
    fontWeight: "800",
  },
  aiHeroCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  aiGradient: {
    flexDirection: "row",
    padding: 24,
    alignItems: "center",
  },
  aiContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#E65100",
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  aiDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  aiIconOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#E65100",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
  },
  filterIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 20,
  },
  featuredCard: {
    width: 280,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  ratingBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    backdropFilter: "blur(10px)", // Works on iOS
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  timeBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  cardContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    lineHeight: 24,
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
  authorName: {
    fontSize: 14,
    fontWeight: "500",
  },
  dailyCard: {
    borderRadius: 24,
    overflow: "hidden",
    height: 320,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  dailyImage: {
    width: "100%",
    height: "100%",
  },
  dailyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 24,
  },
  dailyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dailyBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dailyBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#E65100",
    letterSpacing: 0.5,
  },
  dailyContent: {
    gap: 8,
  },
  dailyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dailyDesc: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    marginBottom: 12,
  },
  dailyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dailyMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dailyMetaText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  dailyMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
