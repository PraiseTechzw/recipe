import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
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
import Animated, { FadeInDown } from "react-native-reanimated";
import { AIMascot } from "../../components/ai/AIMascot";
import i18n from "../../i18n";
import { HapticService } from "../../services/haptics";
import { SyncService } from "../../services/syncService";
import { useAICaptureStore } from "../../stores/aiCaptureStore";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

const MOODS = ["Zimbabwean classic", "Quick meal", "Surprise me"] as const;

export default function CookingAgentScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { pantry, commonIngredients, userProfile } = useStore();
  const { setIngredients, setGenerationPreferences, status } = useAICaptureStore();
  const [mood, setMood] = useState<string>("");
  const [request, setRequest] = useState("");
  const [extraIngredients, setExtraIngredients] = useState("");
  const [excludedPantry, setExcludedPantry] = useState<string[]>([]);

  const pantryLabels = useMemo(
    () => pantry.map((id) => {
      const option = commonIngredients.find((item) => item.id === id);
      return option ? i18n.t(option.key) : id.replace(/[-_]/g, " ");
    }),
    [pantry, commonIngredients],
  );
  const selectedCount = pantryLabels.filter((label) => !excludedPantry.includes(label)).length;

  const makeRecipe = async () => {
    if (status === "generatingRecipe") return;
    const extras = extraIngredients.split(/[,,\n]/).map((item) => item.trim()).filter(Boolean);
    const ingredients = Array.from(new Set([
      ...pantryLabels.filter((label) => !excludedPantry.includes(label)),
      ...extras,
    ]));
    if (!ingredients.length) {
      Alert.alert("Add ingredients", "Choose ingredients from your pantry or add a few to get started.");
      return;
    }
    if (!(await SyncService.checkConnectivity())) {
      Alert.alert("You're offline", "Connect to the internet to ask the AI Chef for a recipe. Your saved pantry is still available.");
      return;
    }

    HapticService.selection();
    setIngredients(ingredients);
    setGenerationPreferences({
      mood: [mood, request.trim()].filter(Boolean).join(". "),
      timeLimit: mood === "Quick meal" ? "30 minutes" : undefined,
      diet: userProfile.dietaryPreferences?.length ? userProfile.dietaryPreferences.join(", ") : undefined,
      servings: 2,
    });
    router.push("/(ai-chef)/processing");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.brandLockup}>
            <AIMascot size={48} />
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AI Chef</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your kitchen, your way</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/(ai-chef)")} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Scan ingredients">
            <Ionicons name="camera-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(420)} style={styles.intro}>
          <Text style={[styles.kicker, { color: colors.primary }]}>LET&apos;S COOK</Text>
          <Text style={[styles.headline, { color: colors.text }]}>What sounds good today?</Text>
          <Text style={[styles.subhead, { color: colors.textSecondary }]}>Tell me what you&apos;re craving. I&apos;ll start with what you already have.</Text>
        </Animated.View>

        <View style={[styles.promptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>YOUR IDEA</Text>
          <TextInput
            value={request}
            onChangeText={setRequest}
            placeholder="Something hearty for dinner…"
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={220}
            style={[styles.promptInput, { color: colors.text }]}
            accessibilityLabel="Describe what you would like to cook"
          />
          <View style={[styles.promptFooter, { borderTopColor: colors.border }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
            <Text style={[styles.promptHint, { color: colors.textSecondary }]}>A dish, a mood, or a time limit</Text>
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>{request.length}/220</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
          {MOODS.map((item) => {
            const selected = mood === item;
            return (
              <TouchableOpacity
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => { HapticService.selection(); setMood(selected ? "" : item); }}
                style={[styles.suggestion, { backgroundColor: selected ? colors.surfaceVariant : colors.surface, borderColor: selected ? colors.secondary : colors.border }]}
              >
                {selected ? <Ionicons name="checkmark" size={15} color={colors.secondary} /> : null}
                <Text style={[styles.suggestionText, { color: selected ? colors.secondary : colors.text }]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.pantryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.pantryHeader}>
            <View style={styles.pantryTitleWrap}>
              <View style={[styles.pantryIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="basket-outline" size={18} color={colors.secondary} />
              </View>
              <View>
                <Text style={[styles.pantryTitle, { color: colors.text }]}>Your pantry</Text>
                <Text style={[styles.pantryCount, { color: colors.textSecondary }]}>{selectedCount} ingredients selected</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/pantry-check")} accessibilityRole="button">
              <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {pantryLabels.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ingredientRow}>
              {pantryLabels.map((label) => {
                const selected = !excludedPantry.includes(label);
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => setExcludedPantry((current) => selected ? [...current, label] : current.filter((item) => item !== label))}
                    style={[styles.ingredientChip, { backgroundColor: selected ? colors.surfaceVariant : colors.surface, borderColor: selected ? colors.surfaceVariant : colors.border }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    {selected ? <View style={[styles.selectedDot, { backgroundColor: colors.secondary }]} /> : null}
                    <Text style={[styles.ingredientText, { color: selected ? colors.text : colors.textSecondary }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <TouchableOpacity onPress={() => router.push("/pantry-check")} style={[styles.emptyPantry, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.emptyPantryText, { color: colors.textSecondary }]}>Add ingredients to personalize your recipe</Text>
              <Ionicons name="arrow-forward" size={17} color={colors.primary} />
            </TouchableOpacity>
          )}

          <View style={[styles.addLine, { borderTopColor: colors.border }]}>
            <Ionicons name="add" size={19} color={colors.textSecondary} />
            <TextInput
              value={extraIngredients}
              onChangeText={setExtraIngredients}
              placeholder="Add extras, separated by commas"
              placeholderTextColor={colors.textSecondary}
              style={[styles.addInput, { color: colors.text }]}
              returnKeyType="done"
              accessibilityLabel="Add another ingredient"
            />
          </View>
        </View>

        <TouchableOpacity onPress={makeRecipe} disabled={status === "generatingRecipe"} style={[styles.primaryButton, { backgroundColor: colors.primary }]} activeOpacity={0.86} accessibilityRole="button">
            <Text style={[styles.primaryButtonText, { color: isDark ? "#121212" : "#FFFFFF" }]}>Find my recipe</Text>
            <Ionicons name="arrow-forward" size={19} color={isDark ? "#121212" : "#FFFFFF"} />
        </TouchableOpacity>

        <Text style={[styles.privacyNote, { color: colors.textSecondary }]}>Nothing is added to your pantry unless you choose to save it.</Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 34 },
  header: { minHeight: 66, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerButton: { width: 42, height: 42, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  brandLockup: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 12 },
  headerTitle: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  headerSubtitle: { fontSize: 11, marginTop: 2 },
  intro: { marginTop: 25, marginBottom: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.6, fontWeight: "900", marginBottom: 8 },
  headline: { fontSize: 28, lineHeight: 34, fontWeight: "800", letterSpacing: -0.8 },
  subhead: { fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 340 },
  promptCard: { minHeight: 142, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 17, paddingTop: 16, paddingBottom: 12 },
  fieldLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  promptInput: { minHeight: 58, fontSize: 18, lineHeight: 24, fontWeight: "500", textAlignVertical: "top", padding: 0, marginTop: 10 },
  promptFooter: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  promptHint: { flex: 1, fontSize: 11 },
  characterCount: { fontSize: 10, fontVariant: ["tabular-nums"] },
  suggestionRow: { paddingTop: 12, paddingBottom: 4, gap: 8 },
  suggestion: { minHeight: 38, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 5 },
  suggestionText: { fontSize: 11, fontWeight: "700" },
  pantryCard: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 15, marginTop: 20 },
  pantryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  pantryTitleWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  pantryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pantryTitle: { fontSize: 14, fontWeight: "800" },
  pantryCount: { fontSize: 10, marginTop: 2 },
  editLink: { fontSize: 12, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 8 },
  ingredientRow: { gap: 7, paddingBottom: 2 },
  ingredientChip: { minHeight: 33, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  selectedDot: { width: 6, height: 6, borderRadius: 4 },
  ingredientText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  emptyPantry: { minHeight: 42, borderRadius: 12, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  emptyPantryText: { fontSize: 11, fontWeight: "600" },
  addLine: { minHeight: 40, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 7, flexDirection: "row", alignItems: "center", gap: 6 },
  addInput: { flex: 1, fontSize: 12, padding: 0 },
  primaryButton: { minHeight: 56, borderRadius: 17, marginTop: 19, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryButtonText: { fontSize: 15, fontWeight: "800" },
  privacyNote: { textAlign: "center", fontSize: 10, lineHeight: 15, marginTop: 12, paddingHorizontal: 12 },
});
