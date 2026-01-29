import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInRight, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../../i18n";
import { HapticService } from "../../services/haptics";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, shadows, radius } = useTheme();
  const { favorites, recipes } = useStore();
  // const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredRecipes = useMemo(() => {
    let result = recipes.filter((r) => favorites.includes(r.id));

    if (activeCategory !== "All") {
      result = result.filter((r) => r.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [favorites, recipes, searchQuery, activeCategory]);

  const CompactRecipeCard = ({
    recipe,
    index,
  }: {
    recipe: any;
    index: number;
  }) => (
    <Link href={`/recipe/${recipe.id}`} asChild>
      <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: spacing.m }}>
        <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderRadius: radius.m },
              shadows.small,
            ]}
          >
            <Image
              source={
                recipe.image
                  ? { uri: recipe.image }
                  : require("../../assets/images/placeholder.png")
              }
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.cardOverlay}>
              <View style={styles.cardBadge}>
                <Ionicons name="time-outline" size={12} color="#fff" />
                <Text style={styles.cardBadgeText}>{recipe.time}</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text
                style={[typography.h4, { color: colors.text }]}
                numberOfLines={2}
              >
                {recipe.title}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {recipe.rating || 0}
                  </Text>
                </View>
                <Text
                  style={[typography.caption, { color: colors.textSecondary }]}
                >
                  {recipe.calories !== "N/A" ? recipe.calories : ""}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <View>
          <Text style={[typography.h1, { color: colors.text }]}>
            {i18n.t("savedRecipes")}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {filteredRecipes.length} {i18n.t("items")} • {activeCategory}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={i18n.t("searchSaved")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                HapticService.light();
                setSearchQuery("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {[{ id: "all", name: "All" }, ...categories].map((cat, index) => (
            <Animated.View
              key={cat.id}
              entering={FadeInRight.delay(index * 50).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  activeCategory === cat.name && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  { borderRadius: radius.full },
                ]}
                onPress={() => {
                  HapticService.selection();
                  setActiveCategory(cat.name);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeCategory === cat.name && { color: "#fff" },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ padding: spacing.m }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "48%" }}>
              <Skeleton
                height={200}
                style={{ marginBottom: spacing.m, borderRadius: radius.m }}
              />
              <Skeleton
                height={200}
                style={{ marginBottom: spacing.m, borderRadius: radius.m }}
              />
            </View>
            <View style={{ width: "48%" }}>
              <Skeleton
                height={200}
                style={{ marginBottom: spacing.m, borderRadius: radius.m }}
              />
              <Skeleton
                height={200}
                style={{ marginBottom: spacing.m, borderRadius: radius.m }}
              />
            </View>
          </View>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matches found" : i18n.t("noSavedRecipes")}
          message={
            searchQuery
              ? "Try a different search term"
              : i18n.t("saveRecipesMessage")
          }
          actionLabel={!searchQuery ? i18n.t("browseRecipes") : undefined}
          onAction={
            !searchQuery ? () => router.push("/(tabs)/explore") : undefined
          }
          icon="bookmark-outline"
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.row}>
            <View style={styles.column}>
              {filteredRecipes
                .filter((_, i) => i % 2 === 0)
                .map((item, index) => (
                  <CompactRecipeCard
                    key={item.id}
                    recipe={item}
                    index={index}
                  />
                ))}
            </View>
            <View style={styles.column}>
              {filteredRecipes
                .filter((_, i) => i % 2 !== 0)
                .map((item, index) => (
                  <CompactRecipeCard
                    key={item.id}
                    recipe={item}
                    index={index}
                  />
                ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontWeight: "600",
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  filterBtnDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchContainerDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    fontWeight: "500",
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 4,
  },
  filterChipDark: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  filterChipActive: {
    backgroundColor: "#E65100",
    borderColor: "#E65100",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  gridContent: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: COLUMN_WIDTH,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#1E1E1E",
  },
  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  cardOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  caloriesText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: -40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: "#E65100",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  textDark: {
    color: "#fff",
  },
  textSubDark: {
    color: "#aaa",
  },
});
