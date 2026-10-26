import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

const GRID_GAP = 12;
const GRID_PADDING = 20;
const MAX_GRID_WIDTH = 600;

export default function PantryCheckScreen() {
  const router = useRouter();
  const {
    setPantry,
    setHasOnboarded,
    commonIngredients,
    pantry,
    hasOnboarded,
  } = useStore();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columns = width >= 640 ? 4 : 3;
  const gridWidth = Math.min(width, MAX_GRID_WIDTH);
  const cardWidth = useMemo(
    () =>
      (gridWidth - GRID_PADDING * 2 - GRID_GAP * (columns - 1)) / columns,
    [columns, gridWidth],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set(pantry));
  const selectedColor = isDark ? colors.primary : "#B84400";

  const toggleIngredient = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const savePantry = () => {
    setPantry(Array.from(selected));
    if (hasOnboarded) {
      router.back();
      return;
    }
    setHasOnboarded(true);
    router.replace("/account-choice");
  };

  const handleSkip = () => {
    if (hasOnboarded) {
      router.back();
      return;
    }
    setPantry([]);
    setHasOnboarded(true);
    router.replace("/account-choice");
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { width: gridWidth }]}>
        <View style={styles.headerTop}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: isDark ? "#3A2A20" : "#FFF0E4" },
            ]}
          >
            <Ionicons name="basket-outline" size={25} color={colors.primary} />
          </View>
          <View style={styles.headingCopy}>
            <Text style={[styles.title, { color: colors.text }]}>
              {i18n.t("pantryCheck")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {i18n.t("pantrySubtitle")}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.selectionSummary,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={selected.size > 0 ? selectedColor : colors.textSecondary}
          />
          <Text style={[styles.selectionText, { color: colors.textSecondary }]}>
            {i18n.t("pantrySelectionCount", {
              selected: selected.size,
              total: commonIngredients.length,
            })}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.grid, { width: gridWidth }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridIntro}>
          <Text style={[styles.gridTitle, { color: colors.text }]}>
            {i18n.t("pantryIngredientHeading")}
          </Text>
          <Text style={[styles.gridHint, { color: colors.textSecondary }]}>
            {i18n.t("pantryIngredientHint", { total: commonIngredients.length })}
          </Text>
        </View>
        {commonIngredients.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                isSelected && styles.cardSelected,
                isSelected && {
                  backgroundColor: isDark ? "#30251E" : "#FFF4EA",
                  borderColor: isDark ? colors.primary : "#B84400",
                },
              ]}
              onPress={() => toggleIngredient(item.id)}
              activeOpacity={0.76}
              accessibilityRole="checkbox"
              accessibilityLabel={i18n.t(item.key)}
              accessibilityState={{ checked: isSelected }}
            >
              <View
                style={[
                  styles.ingredientIconWrap,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "#49351F"
                        : "#FFE4CC"
                      : colors.surfaceVariant,
                  },
                ]}
              >
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text
                style={[
                  styles.name,
                  { color: isSelected ? selectedColor : colors.text },
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {i18n.t(item.key)}
              </Text>
              {isSelected && (
                <View
                  style={[
                    styles.checkIcon,
                    { backgroundColor: selectedColor },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={isDark ? "#21170F" : "#FFFFFF"}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            width: gridWidth,
            paddingBottom: Math.max(10, insets.bottom),
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityRole="button"
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {i18n.t(hasOnboarded ? "cancel" : "skip")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={savePantry}
          style={[
            styles.continueButton,
            { backgroundColor: isDark ? "#B95D00" : "#C2410C" },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.continueText} numberOfLines={1}>
            {i18n.t("continue")}
          </Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
    alignSelf: "center",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    marginBottom: 5,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  selectionSummary: {
    alignSelf: "flex-start",
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    justifyContent: "flex-start",
    gap: GRID_GAP,
    paddingHorizontal: GRID_PADDING,
    paddingTop: 4,
    paddingBottom: 20,
  },
  gridIntro: {
    width: "100%",
    paddingHorizontal: 2,
    paddingBottom: 2,
    gap: 3,
  },
  gridTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
  },
  gridHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    aspectRatio: 1,
    minHeight: 88,
    position: "relative",
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    paddingVertical: 8,
    gap: 5,
  },
  cardSelected: {
    borderWidth: 1.5,
  },
  ingredientIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 25,
  },
  name: {
    maxWidth: "100%",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  checkIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skipButton: {
    minHeight: 50,
    minWidth: 72,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
  },
  continueButton: {
    minHeight: 52,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#8C3A13",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  continueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
  },
});
