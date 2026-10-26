import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { RecipeCardUI } from "../../components/ui/RecipeCardUI";
import i18n from "../../i18n";
import { HapticService } from "../../services/haptics";
import { getPantryMatches } from "../../services/recommendations";
import { SyncService } from "../../services/syncService";
import { useAICaptureStore } from "../../stores/aiCaptureStore";
import { useStore } from "../../store/useStore";
import { useTheme } from "../../theme/useTheme";

const MOODS = [
  { label: "Quick & easy", icon: "flash-outline", minutes: "30 minutes" },
  { label: "Traditional", icon: "leaf-outline", minutes: "" },
  { label: "Comfort food", icon: "heart-outline", minutes: "" },
  { label: "Surprise me", icon: "sparkles-outline", minutes: "" },
] as const;

export default function CookingAgentScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { pantry, commonIngredients, recipes, myRecipes, userProfile } = useStore();
  const { setIngredients, generateRecipe, status } = useAICaptureStore();
  const [mood, setMood] = useState<string>("");
  const [request, setRequest] = useState("");
  const [extraIngredients, setExtraIngredients] = useState("");
  const [excludedPantry, setExcludedPantry] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const orbPulse = useSharedValue(1);
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbPulse.value }],
  }));

  useEffect(() => {
    orbPulse.value = withRepeat(
      withSequence(withTiming(1.055, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1,
      true,
    );
  }, [orbPulse]);

  useEffect(() => {
    if (!isGenerating) {
      setThinkingStep(0);
      return;
    }
    const timer = setInterval(() => setThinkingStep((step) => (step + 1) % 3), 2200);
    return () => clearInterval(timer);
  }, [isGenerating]);

  const pantryLabels = useMemo(() => pantry.map((id) => {
    const option = commonIngredients.find((item) => item.id === id);
    return option ? i18n.t(option.key) : id.replace(/[-_]/g, " ");
  }), [pantry, commonIngredients]);
  const matches = useMemo(() => getPantryMatches(pantry, [...myRecipes, ...recipes]), [pantry, myRecipes, recipes]);

  const makeRecipe = async () => {
    if (isGenerating) return;
    const extras = extraIngredients.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    const ingredients = Array.from(new Set([...pantryLabels.filter((label) => !excludedPantry.includes(label)), ...extras]));
    if (!ingredients.length) {
      Alert.alert("Add ingredients", "Choose pantry ingredients or type a few ingredients so your chef can get started.");
      return;
    }
    const online = await SyncService.checkConnectivity();
    if (!online) {
      Alert.alert("You're offline", "Your pantry matches are available offline. Connect to the internet to ask the AI chef for a new recipe.");
      return;
    }
    HapticService.selection();
    setIsGenerating(true);
    try {
      setIngredients(ingredients);
      await generateRecipe({
        mood: [mood, request.trim()].filter(Boolean).join(". "),
        timeLimit: mood === "Quick & easy" ? "30 minutes" : undefined,
        diet: userProfile.dietaryPreferences?.length ? userProfile.dietaryPreferences.join(", ") : undefined,
        servings: 2,
      });
      const generated = useAICaptureStore.getState();
      if (!generated.generatedRecipe) {
        throw new Error(generated.error?.message || "The chef could not make a recipe this time.");
      }
      router.push("/(ai-chef)/result");
    } catch (error) {
      Alert.alert("Chef needs another try", error instanceof Error ? error.message : "The recipe could not be generated. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={21} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR COOKING COMPANION</Text>
            <Text style={[styles.title, { color: colors.text }]}>AI Chef</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(ai-chef)")} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityLabel="Scan ingredients with camera">
            <Ionicons name="camera-outline" size={21} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.duration(450).springify()} style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <Animated.View style={[styles.heroIconAura, { backgroundColor: `${colors.primary}12` }, orbStyle]}>
              <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}20` }]}><Ionicons name="sparkles" size={24} color={colors.primary} /></View>
            </Animated.View>
            <View style={[styles.agentBadge, { backgroundColor: `${colors.secondary}16` }]}><View style={[styles.onlineDot, { backgroundColor: colors.secondary }]} /><Text style={[styles.agentBadgeText, { color: colors.secondary }]}>READY TO COOK</Text></View>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Let’s make something good.</Text>
          <Text style={[styles.heroCopy, { color: colors.textSecondary }]}>I’ll check your pantry, learn what you’re craving, and suggest a recipe that fits.</Text>
          <View style={[styles.agentSteps, { borderTopColor: colors.border }]}>
            {[{ title: "Your pantry", detail: "Use what you have", icon: "basket-outline" }, { title: "Your mood", detail: "Tell me what sounds good", icon: "chatbubble-ellipses-outline" }, { title: "Your recipe", detail: "Cook something great", icon: "restaurant-outline" }].map((step, index) => (
              <View key={step.title} style={styles.agentStep}>
                <View style={[styles.stepIcon, { backgroundColor: index === 0 ? `${colors.primary}18` : colors.surfaceVariant }]}><Ionicons name={step.icon as any} size={15} color={index === 0 ? colors.primary : colors.textSecondary} /></View>
                <View><Text style={[styles.stepLabel, { color: colors.text }]}>{step.title}</Text><Text style={[styles.stepDetail, { color: colors.textSecondary }]}>{step.detail}</Text></View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>What sounds good?</Text><Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Pick a direction or tell me in your own words.</Text></Animated.View>
        <View style={styles.moodGrid}>{MOODS.map((item) => {
          const selected = mood === item.label;
          return <Animated.View key={item.label} layout={Layout.springify()}><TouchableOpacity accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { HapticService.selection(); setMood(selected ? "" : item.label); }} style={[styles.moodChip, { backgroundColor: selected ? `${colors.primary}14` : colors.surface, borderColor: selected ? colors.primary : colors.border }]}>
            <Ionicons name={item.icon as any} size={17} color={selected ? colors.primary : colors.textSecondary} /><Text style={[styles.moodText, { color: selected ? colors.primary : colors.text }]}>{item.label}</Text>{selected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
          </TouchableOpacity></Animated.View>;
        })}</View>
        <View style={[styles.requestBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textSecondary} /><TextInput value={request} onChangeText={setRequest} placeholder="e.g. Something filling with a little heat…" placeholderTextColor={colors.textSecondary} multiline style={[styles.requestInput, { color: colors.text }]} accessibilityLabel="Describe what you feel like eating" /></View>

        <View style={styles.sectionHeading}><View style={styles.rowBetween}><Text style={[styles.sectionTitle, { color: colors.text }]}>In your pantry</Text><TouchableOpacity onPress={() => router.push("/pantry-check")}><Text style={[styles.editLink, { color: colors.primary }]}>Edit pantry</Text></TouchableOpacity></View><Text style={[styles.sectionHint, { color: colors.textSecondary }]}>{pantryLabels.length ? `${pantryLabels.length - excludedPantry.length} ingredients selected · tap to remove` : "Add ingredients to get more personal ideas"}</Text></View>
        {pantryLabels.length ? <View style={styles.ingredientWrap}>{pantryLabels.map((label) => { const selected = !excludedPantry.includes(label); return <TouchableOpacity key={label} onPress={() => setExcludedPantry((current) => selected ? [...current, label] : current.filter((item) => item !== label))} style={[styles.ingredientChip, { backgroundColor: selected ? colors.surface : colors.surfaceVariant, borderColor: selected ? colors.border : colors.primary }]}><Ionicons name={selected ? "checkmark-circle" : "add-circle-outline"} size={15} color={selected ? colors.secondary : colors.primary} /><Text style={[styles.ingredientText, { color: selected ? colors.text : colors.textSecondary }]}>{label}</Text></TouchableOpacity>; })}</View> : <TouchableOpacity onPress={() => router.push("/pantry-check")} style={[styles.emptyPantry, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="basket-outline" size={20} color={colors.primary} /><Text style={[styles.emptyPantryText, { color: colors.text }]}>Choose what you have</Text><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></TouchableOpacity>}
        <TextInput value={extraIngredients} onChangeText={setExtraIngredients} placeholder="Add anything else (comma separated)" placeholderTextColor={colors.textSecondary} style={[styles.extraInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]} />

        <TouchableOpacity onPress={makeRecipe} disabled={isGenerating || status === "generatingRecipe"} style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: isGenerating ? 0.75 : 1 }]}>
          {isGenerating ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles" size={19} color="#fff" />}
          <Text style={styles.primaryButtonText}>{isGenerating ? "Creating your recipe…" : "Find my next meal"}</Text>
          {!isGenerating && <Ionicons name="arrow-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        {isGenerating && <Animated.View entering={FadeInDown.duration(300)} style={[styles.thinkingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.thinkingIcon, { backgroundColor: `${colors.primary}18` }]}><Ionicons name={thinkingStep === 0 ? "basket-outline" : thinkingStep === 1 ? "sparkles-outline" : "restaurant-outline"} size={18} color={colors.primary} /></View><View style={styles.thinkingCopy}><Text style={[styles.thinkingTitle, { color: colors.text }]}>{["Checking your ingredients", "Matching your mood", "Putting your recipe together"][thinkingStep]}</Text><Text style={[styles.thinkingHint, { color: colors.textSecondary }]}>Your pantry and preferences guide this recipe.</Text></View><ActivityIndicator size="small" color={colors.primary} /></Animated.View>}
        <Text style={[styles.finePrint, { color: colors.textSecondary }]}>Your pantry stays as-is. You choose what to save.</Text>

        {pantry.length > 0 && <View style={styles.matchesSection}><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Already in your cookbook</Text><Text style={[styles.sectionHint, { color: colors.textSecondary }]}>Ideas that match ingredients you have.</Text></View>{matches.length ? matches.slice(0, 3).map((recipe) => <RecipeCardUI key={recipe.id} title={recipe.title} imageUrl={recipe.image} duration={Number.parseInt(recipe.time, 10) || 30} difficulty="Pantry match" category={recipe.category} rating={recipe.rating} onPress={() => router.push(`/recipe/${recipe.id}`)} />) : <Text style={[styles.noMatches, { color: colors.textSecondary }]}>I couldn’t find a close match yet. Ask me to create something from your pantry above.</Text>}</View>}
        <TouchableOpacity onPress={() => router.push("/(ai-chef)")} style={styles.scanLink}><Ionicons name="scan-outline" size={18} color={colors.primary} /><Text style={[styles.scanLinkText, { color: colors.primary }]}>Scan ingredients with your camera</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  headerTitle: { flex: 1 }, eyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.15 }, title: { fontSize: 25, fontWeight: "800", marginTop: 1 },
  iconButton: { width: 42, height: 42, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 24, padding: 20, borderWidth: StyleSheet.hairlineWidth, marginTop: 6 }, heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }, heroIconAura: { width: 54, height: 54, borderRadius: 20, alignItems: "center", justifyContent: "center" }, heroIcon: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center" }, heroTitle: { fontSize: 21, fontWeight: "800", letterSpacing: -0.5 }, heroCopy: { fontSize: 14, lineHeight: 21, marginTop: 7 },
  agentBadge: { borderRadius: 99, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 7 }, onlineDot: { width: 6, height: 6, borderRadius: 4 }, agentBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  agentSteps: { flexDirection: "column", gap: 13, marginTop: 19, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth }, agentStep: { flexDirection: "row", alignItems: "center", gap: 10 }, stepIcon: { width: 31, height: 31, borderRadius: 11, alignItems: "center", justifyContent: "center" }, stepLabel: { fontSize: 12, fontWeight: "700" }, stepDetail: { fontSize: 10, marginTop: 2 },
  sectionHeading: { marginTop: 23, marginBottom: 10 }, sectionTitle: { fontSize: 17, fontWeight: "800" }, sectionHint: { fontSize: 12, marginTop: 4 }, rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, editLink: { fontSize: 12, fontWeight: "700" },
  moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, moodChip: { minHeight: 42, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 7 }, moodText: { fontSize: 12, fontWeight: "700" }, requestBox: { minHeight: 66, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10, marginTop: 10, flexDirection: "row", alignItems: "flex-start", gap: 9 }, requestInput: { flex: 1, fontSize: 13, lineHeight: 19, padding: 0, textAlignVertical: "top", minHeight: 42 },
  ingredientWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, ingredientChip: { borderRadius: 99, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 8, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 6 }, ingredientText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" }, emptyPantry: { borderWidth: 1, borderStyle: "dashed", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 }, emptyPantryText: { flex: 1, fontSize: 13, fontWeight: "700" }, extraInput: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 12, marginTop: 10, fontSize: 13 },
  primaryButton: { minHeight: 56, borderRadius: 17, marginTop: 17, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, primaryButtonText: { color: "#fff", fontSize: 14, fontWeight: "800", flex: 1 }, thinkingCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 17, marginTop: 11, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 }, thinkingIcon: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center" }, thinkingCopy: { flex: 1 }, thinkingTitle: { fontSize: 12, fontWeight: "700" }, thinkingHint: { fontSize: 10, lineHeight: 15, marginTop: 3 }, finePrint: { textAlign: "center", marginTop: 9, fontSize: 11 }, matchesSection: { marginTop: 8 }, noMatches: { fontSize: 13, lineHeight: 19, paddingVertical: 10 }, scanLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 25, padding: 12 }, scanLinkText: { fontSize: 13, fontWeight: "700" },
});
