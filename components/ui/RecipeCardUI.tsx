import i18n from "@/i18n";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "./Card";
import { XPBadge } from "./XPBadge";

interface RecipeCardProps {
  title: string;
  imageUrl?: string | number | ImageSource;
  duration: number;
  difficulty: string;
  category?: string;
  badgeLabel?: string;
  xp?: number;
  rating?: number;
  isFavorite?: boolean;
  cardWidth?: number;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export function RecipeCardUI({
  title,
  imageUrl,
  duration,
  difficulty,
  category,
  badgeLabel,
  xp,
  rating,
  isFavorite,
  cardWidth,
  onPress,
  onFavoritePress,
}: RecipeCardProps) {
  const { colors, spacing, radius, shadows, isDark } = useTheme();

  const imageSource =
    typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl;

  return (
    <Card
      onPress={onPress}
      variant="outlined"
      style={{
        ...styles.card,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        width: cardWidth ?? ("100%" as const),
        ...shadows.small,
      }}
    >
      <View style={styles.imageFrame}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            transition={240}
          />
        ) : (
          <View
            style={[
              styles.imageFallback,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.fallbackMark,
                { backgroundColor: isDark ? "#49301B" : "#FFF0DF" },
              ]}
            >
              <Ionicons name="restaurant" size={30} color={colors.primary} />
            </View>
            <Text
              style={[styles.fallbackLabel, { color: colors.textSecondary }]}
            >
              Zimbabwe Traditional Recipes
            </Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.56)"]}
          style={styles.imageShade}
          pointerEvents="none"
        />

        {badgeLabel ? (
          <View
            style={[styles.featureBadge, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.featureBadgeText} numberOfLines={1}>
              {badgeLabel}
            </Text>
          </View>
        ) : category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          </View>
        ) : null}

        {rating !== undefined && rating > 0 && (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={13} color="#D68A1F" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
        {!!xp && (
          <View
            style={[
              styles.xpBadge,
              { top: spacing.s, left: spacing.s + (badgeLabel ? 8 : 0) },
            ]}
          >
            <XPBadge xp={xp} />
          </View>
        )}
        {!!onFavoritePress && (
          <TouchableOpacity
            onPress={onFavoritePress}
            style={[
              styles.favoriteButton,
              { top: spacing.s, right: spacing.s, borderRadius: radius.round },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? "Remove from saved recipes" : "Save recipe"
            }
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={19}
              color={isFavorite ? colors.error : "#38281E"}
            />
          </TouchableOpacity>
        )}

        <View style={styles.imageMetaRow}>
          <View style={styles.imageMetaPill}>
            <Ionicons name="time-outline" size={13} color="#FFFFFF" />
            <Text style={styles.imageMetaText}>{duration} min</Text>
          </View>
          <View style={styles.imageMetaPill}>
            <Ionicons name="flame-outline" size={13} color="#FFFFFF" />
            <Text style={styles.imageMetaText}>{difficulty}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.footer}>
          {category && badgeLabel ? (
            <Text
              style={[styles.categoryLabel, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {category}
            </Text>
          ) : (
            <Text style={[styles.openLabel, { color: colors.primary }]}>
              {i18n.t("startCooking")}
            </Text>
          )}
          <View
            style={[
              styles.arrowButton,
              { backgroundColor: isDark ? "#49301B" : "#FFF0DF" },
            ]}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  imageFrame: {
    width: "100%",
    height: 172,
    position: "relative",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fallbackMark: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackLabel: { fontSize: 11, fontWeight: "700" },
  imageShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
  },
  featureBadge: {
    position: "absolute",
    top: 11,
    left: 11,
    minHeight: 29,
    maxWidth: "68%",
    borderRadius: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  featureBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  categoryBadge: {
    position: "absolute",
    top: 11,
    left: 11,
    maxWidth: "65%",
    minHeight: 27,
    borderRadius: 14,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  categoryText: { color: "#38281E", fontSize: 10, fontWeight: "800" },
  ratingPill: {
    position: "absolute",
    top: 11,
    right: 11,
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  ratingText: { fontSize: 11, color: "#38281E", fontWeight: "900" },
  xpBadge: { position: "absolute" },
  favoriteButton: {
    position: "absolute",
    top: 48,
    right: 11,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  imageMetaRow: {
    position: "absolute",
    left: 11,
    bottom: 10,
    flexDirection: "row",
    gap: 7,
  },
  imageMetaPill: {
    minHeight: 25,
    borderRadius: 13,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(25,22,19,0.62)",
  },
  imageMetaText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  content: { paddingHorizontal: 15, paddingTop: 13, paddingBottom: 12 },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
    minHeight: 42,
    letterSpacing: -0.15,
  },
  footer: {
    minHeight: 32,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openLabel: { fontSize: 12, fontWeight: "900" },
  categoryLabel: { flex: 1, marginRight: 8, fontSize: 11, fontWeight: "700" },
  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
