import { EmptyState } from "@/components/feedback/EmptyState";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../../i18n";
import type { Recipe } from "../../models/recipe";
import { HapticService } from "../../services/haptics";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2;

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { favorites, recipes, myRecipes, toggleFavorite } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const savedRecipes = useMemo(() => {
    const byId = new Map<string, Recipe>();
    [...recipes, ...myRecipes].forEach((recipe) => byId.set(recipe.id, recipe));
    return favorites.map((id) => byId.get(id)).filter((recipe): recipe is Recipe => Boolean(recipe));
  }, [favorites, myRecipes, recipes]);

  const categoryOptions = useMemo(
    () => ["All", ...new Set(savedRecipes.map((recipe) => recipe.category).filter(Boolean))],
    [savedRecipes],
  );

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return savedRecipes.filter((recipe) => {
      const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
      const matchesQuery = !query || recipe.title.toLocaleLowerCase().includes(query) || recipe.category.toLocaleLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, savedRecipes, searchQuery]);

  const renderCard = (recipe: Recipe, index: number) => (
    <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
      <TouchableOpacity activeOpacity={0.88} accessibilityRole="button" accessibilityLabel={`Open saved recipe ${recipe.title}`}>
        <Animated.View entering={FadeInDown.delay(index * 55).springify()} style={[styles.card, { width: CARD_WIDTH, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl }, shadows.small]}>
          <View style={styles.imageFrame}>
            <Image
              source={typeof recipe.image === "string" ? { uri: recipe.image } : recipe.image || require("../../assets/images/placeholder.png")}
              style={[styles.image, { backgroundColor: colors.surfaceVariant }]}
              contentFit="cover"
              transition={180}
            />
            <View style={styles.imageShade} />
            <View style={[styles.timeBadge, { backgroundColor: "rgba(0,0,0,0.58)" }]}>
              <Ionicons name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.timeText}>{recipe.time || "—"}</Text>
            </View>
            <TouchableOpacity
              onPress={() => { HapticService.selection(); toggleFavorite(recipe.id); }}
              style={[styles.removeButton, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${recipe.title} from saved recipes`}
            >
              <Ionicons name="heart" size={17} color={colors.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{recipe.title}</Text>
            <View style={styles.cardMeta}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]} numberOfLines={1}>{recipe.category}</Text>
              {typeof recipe.rating === "number" && recipe.rating > 0 ? (
                <View style={styles.rating}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{recipe.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + spacing.m }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[typography.h1, { color: colors.text }]}>{i18n.t("savedRecipes")}</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 3 }]}>
            {savedRecipes.length} {i18n.t("items")} saved for later
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="bookmark" size={17} color={colors.primary} />
          <Text style={[styles.countText, { color: colors.text }]}>{filteredRecipes.length}</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={i18n.t("searchSaved")}
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          accessibilityLabel={i18n.t("searchSaved")}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery("")} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categoryOptions.map((category, index) => {
          const selected = activeCategory === category;
          return (
            <Animated.View key={category} entering={FadeInRight.delay(index * 35)}>
              <TouchableOpacity
                onPress={() => { HapticService.selection(); setActiveCategory(category); }}
                style={[styles.categoryChip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, borderRadius: radius.round }]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.categoryChipText, { color: selected ? (isDark ? "#121212" : "#FFFFFF") : colors.textSecondary }]}>{category}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      {filteredRecipes.length === 0 ? (
        <EmptyState
          title={savedRecipes.length === 0 ? i18n.t("noSavedRecipes") : "No matching recipes"}
          description={savedRecipes.length === 0 ? i18n.t("saveRecipesMessage") : "Try another search or category."}
          actionLabel={savedRecipes.length === 0 ? i18n.t("browseRecipes") : undefined}
          onAction={savedRecipes.length === 0 ? () => router.push("/(tabs)/explore") : undefined}
          icon="bookmark-outline"
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.gridColumn}>
              {filteredRecipes.filter((_, index) => index % 2 === 0).map((recipe, index) => renderCard(recipe, index))}
            </View>
            <View style={styles.gridColumn}>
              {filteredRecipes.filter((_, index) => index % 2 === 1).map((recipe, index) => renderCard(recipe, index))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { minHeight: 68, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerCopy: { flex: 1 },
  countBadge: { minWidth: 58, height: 40, borderRadius: 14, paddingHorizontal: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  countText: { fontSize: 13, fontWeight: "800" },
  searchBox: { height: 48, marginHorizontal: 20, marginTop: 12, paddingHorizontal: 13, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 10 },
  searchInput: { flex: 1, height: "100%", fontSize: 13 },
  categories: { paddingHorizontal: 20, paddingVertical: 15, gap: 8 },
  categoryChip: { minHeight: 33, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, justifyContent: "center" },
  categoryChipText: { fontSize: 11, fontWeight: "700" },
  grid: { paddingHorizontal: 18, paddingBottom: 110, paddingTop: 2 },
  gridRow: { flexDirection: "row", justifyContent: "space-between" },
  gridColumn: { width: CARD_WIDTH, gap: 12 },
  card: { borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", marginBottom: 2 },
  imageFrame: { height: 138, position: "relative" },
  image: { width: "100%", height: "100%" },
  imageShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 44, backgroundColor: "rgba(0,0,0,0.12)" },
  timeBadge: { position: "absolute", left: 8, bottom: 8, minHeight: 24, borderRadius: 9, paddingHorizontal: 7, flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  removeButton: { position: "absolute", top: 8, right: 8, width: 31, height: 31, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  cardBody: { paddingHorizontal: 10, paddingVertical: 10 },
  cardTitle: { minHeight: 36, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 7, gap: 5 },
  categoryText: { flex: 1, fontSize: 9, fontWeight: "600" },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 9, fontWeight: "700" },
});
