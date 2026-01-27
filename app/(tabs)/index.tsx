import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import Logo from "../../components/Logo";
import { RecipeCardUI } from "../../components/ui/RecipeCardUI";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { RECIPES } from "../../data/recipes";
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
  const { colors, spacing, typography } = useTheme();
  const {
    viewHistory,
    categoryScores,
    hasOnboarded,
    shoppingList,
    userProfile,
    pantry,
  } = useStore();

  const [featuredRecipes, setFeaturedRecipes] = useState(RECIPES.slice(0, 3));
  const [dailyPick, setDailyPick] = useState(RECIPES[1]);
  const [pantryRecipes, setPantryRecipes] = useState<typeof RECIPES>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Onboarding Check
  useEffect(() => {
    if (!hasOnboarded) {
      const timer = setTimeout(() => {
        router.replace("/onboarding");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasOnboarded]);

  const loadData = async () => {
    // 1. Daily Rotation
    setDailyPick(getRecipeOfTheDay());

    // 2. Smart Recommendations
    const smartRecs = getRecommendedRecipes(viewHistory, categoryScores);
    if (smartRecs.length > 0) {
      setFeaturedRecipes(smartRecs.slice(0, 5));
    }

    // 3. Pantry Matches
    const matched = getPantryMatches(pantry);
    setPantryRecipes(matched);
  };

  useEffect(() => {
    const init = async () => {
      await loadData();
      // Simulate network delay for skeletons
      setTimeout(() => {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 1000);
    };
    init();
  }, [viewHistory, categoryScores, pantry]);

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
          <Logo size="medium" />
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                HapticService.selection();
                router.push("/shopping-list");
              }}
              accessibilityLabel="Shopping List"
            >
              <Ionicons name="basket-outline" size={24} color={colors.text} />
              {shoppingList.length > 0 && <View style={styles.badge} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                HapticService.selection();
                router.push("/(tabs)/profile");
              }}
              accessibilityLabel="Profile"
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                  style={styles.avatar}
                />
                <View
                  style={[
                    styles.levelBadge,
                    { backgroundColor: colors.primary },
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
          {/* Greeting & Search */}
          <Animated.View
            style={[styles.greetingSection, { opacity: fadeAnim }]}
          >
            <Text style={[styles.mainGreeting, { color: colors.text }]}>
              {i18n.t("greeting")}, {userProfile.name}!
            </Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              {i18n.t("subGreeting")}
            </Text>

            <Link href="/(tabs)/explore" asChild>
              <TouchableOpacity
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <Ionicons name="search" size={24} color={colors.primary} />
                <Text
                  style={[
                    styles.placeholderText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {i18n.t("searchPlaceholderHome")}
                </Text>
                <LinearGradient
                  colors={[colors.primary, "#E65100"]}
                  style={styles.aiButtonHome}
                >
                  <Ionicons name="scan-outline" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Featured Section */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <SectionHeader
              title={i18n.t("featured")}
              actionLabel={i18n.t("seeAll")}
              onAction={() => router.push("/(tabs)/explore")}
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
                      { backgroundColor: colors.surface },
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
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#E65100" />
                        <Text style={styles.ratingText}>
                          {recipe.rating || 4.8}
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

          {/* Recipe of the Day */}
          <Animated.View style={{ opacity: fadeAnim, marginTop: 24 }}>
            <SectionHeader
              title={i18n.t("recipeOfTheDay")}
              style={{ paddingHorizontal: 20 }}
            />

            <View style={{ paddingHorizontal: 20 }}>
              {isLoading ? (
                <View>
                  <Skeleton height={250} borderRadius={16} />
                </View>
              ) : dailyPick ? (
                <TouchableOpacity
                  style={styles.dailyCard}
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
                      "rgba(0,0,0,0.6)",
                      "rgba(0,0,0,0.9)",
                    ]}
                    style={styles.dailyOverlay}
                  >
                    <View style={styles.dailyHeader}>
                      <View style={styles.dailyBadge}>
                        <Text style={styles.dailyBadgeText}>DAILY PICK</Text>
                      </View>
                      <View style={styles.authorContainer}>
                        <Image
                          source={{ uri: dailyPick.author?.avatar }}
                          style={styles.mediumAvatar}
                        />
                        <Text style={styles.authorNameLight}>
                          {dailyPick.author?.name}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dailyTitle}>{dailyPick.title}</Text>
                    <Text style={styles.dailyDesc} numberOfLines={1}>
                      {dailyPick.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>

          {/* Cook with your Pantry */}
          <Animated.View style={{ opacity: fadeAnim, marginTop: 32 }}>
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
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: 12,
                    padding: 24,
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
                      difficulty="Medium" // Hardcoded for now as it's not in model
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
                    borderRadius: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E65100",
    borderWidth: 1,
    borderColor: "#fff",
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  mainGreeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
  },
  aiButtonHome: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
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
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  dailyImage: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "#E65100",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    borderColor: "#fff",
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
});
