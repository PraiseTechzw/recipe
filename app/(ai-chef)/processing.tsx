import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AIMascot } from "../../components/ai/AIMascot";
import { useAICaptureStore } from "../../stores/aiCaptureStore";
import { useTheme } from "../../theme/useTheme";

const STEPS = [
  { key: "preparing", title: "Preparing your request", detail: "Applying your ingredients and preferences.", icon: "options-outline" },
  { key: "searching", title: "Checking your cookbook", detail: "Looking for a useful match in your saved recipes.", icon: "search-outline" },
  { key: "writing", title: "Building your recipe", detail: "Creating clear quantities and cooking instructions.", icon: "create-outline" },
  { key: "checking", title: "Reviewing the details", detail: "Checking that the recipe has the required structure.", icon: "shield-checkmark-outline" },
] as const;

const STAGE_INDEX = { preparing: 0, searching: 1, writing: 2, checking: 3, complete: 4, error: -1 } as const;

export default function AIRecipeProcessingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const status = useAICaptureStore((state) => state.status);
  const ingredients = useAICaptureStore((state) => state.editedIngredients);
  const preferences = useAICaptureStore((state) => state.generationPreferences);
  const recipe = useAICaptureStore((state) => state.generatedRecipe);
  const error = useAICaptureStore((state) => state.error);
  const stage = useAICaptureStore((state) => state.agentStage);
  const generateRecipe = useAICaptureStore((state) => state.generateRecipe);
  const setAgentStage = useAICaptureStore((state) => state.setAgentStage);
  const started = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const failed = status === "error" || stage === "error";

  useEffect(() => {
    if (started.current || status === "generatingRecipe" || status === "showingResults") return;
    if (!ingredients.length) {
      router.back();
      return;
    }
    started.current = true;
    void generateRecipe(preferences, setAgentStage);
  }, [generateRecipe, ingredients.length, preferences, router, setAgentStage, status]);

  useEffect(() => {
    if (status !== "showingResults" || !recipe) return;
    const timer = setTimeout(() => router.replace("/(ai-chef)/result"), 700);
    return () => clearTimeout(timer);
  }, [recipe, router, status]);

  useEffect(() => {
    if (failed || status === "showingResults") return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [failed, startedAt, status]);

  const retry = () => {
    started.current = true;
    setStartedAt(Date.now());
    setElapsed(0);
    void generateRecipe(preferences, setAgentStage);
  };

  const activeIndex = STAGE_INDEX[stage];
  const stageTitle = stage === "complete" ? "Your recipe is ready" : stage === "preparing" ? "Getting the kitchen ready" : stage === "searching" ? "Finding a good starting point" : stage === "writing" ? "Creating something delicious" : "Checking your recipe";
  const stageDetail = stage === "complete" ? "Opening your personalized recipe now." : stage === "preparing" ? "We’re sending your ingredients and preferences to the AI Chef." : stage === "searching" ? "The AI Chef is checking for relevant ideas in your cookbook." : stage === "writing" ? "Your recipe is being drafted with practical steps and quantities." : "Making sure the recipe is complete and ready to cook.";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel="Cancel recipe generation">
            <Ionicons name="close" size={21} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topLabel, { color: colors.textSecondary }]}>AI CHEF · RECIPE STUDIO</Text>
          <View style={{ width: 42 }} />
        </View>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <View style={[styles.mascotHalo, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
            <AIMascot size={150} animated={stage !== "complete" && !failed} />
            {stage !== "complete" && !failed ? (
              <View style={[styles.liveBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.liveText, { color: colors.primary }]}>WORKING</Text>
              </View>
            ) : null}
            {stage === "complete" ? (
              <View style={[styles.liveBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="checkmark-circle" size={17} color={colors.success} />
                <Text style={[styles.liveText, { color: colors.success }]}>READY</Text>
              </View>
            ) : null}
          </View>
          <Animated.Text key={failed ? "failed" : stage} entering={FadeIn.duration(220)} style={[styles.title, { color: colors.text }]}>
            {failed ? "We hit a small pause" : stageTitle}
          </Animated.Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {failed ? error?.message || "The recipe could not be completed. Your ingredients are still here, so you can try again." : stageDetail}
          </Text>
          {!failed ? <Text style={[styles.elapsed, { color: colors.textSecondary }]}>{elapsed > 0 ? `Working · ${elapsed}s` : "Starting your request"}</Text> : null}
        </Animated.View>

        {!failed ? (
          <Animated.View entering={FadeInDown.delay(120).duration(420)} style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.timelineHeading}>
              <Text style={[styles.timelineTitle, { color: colors.text }]}>Your recipe, step by step</Text>
              <Text style={[styles.timelineCaption, { color: colors.textSecondary }]}>{ingredients.length} ingredients</Text>
            </View>
            {STEPS.map((item, index) => {
              const complete = activeIndex > index || stage === "complete";
              const active = activeIndex === index;
              const tone = complete ? colors.success : active ? colors.primary : colors.textSecondary;
              return (
                <View key={item.key} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View style={[styles.stepIcon, { backgroundColor: complete || active ? colors.surfaceVariant : colors.background, borderColor: active ? colors.primary : colors.border }]}>
                      {complete ? <Ionicons name="checkmark" size={16} color={colors.success} /> : active ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name={item.icon as any} size={16} color={colors.textSecondary} />}
                    </View>
                    {index < STEPS.length - 1 ? <View style={[styles.connector, { backgroundColor: complete ? colors.success : colors.border }]} /> : null}
                  </View>
                  <View style={styles.stepCopy}>
                    <Text style={[styles.stepTitle, { color: active || complete ? colors.text : colors.textSecondary }]}>{item.title}</Text>
                    <Text style={[styles.stepDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
                  </View>
                  <Text style={[styles.stepState, { color: tone }]}>{complete ? "DONE" : active ? "NOW" : "NEXT"}</Text>
                </View>
              );
            })}
            <View style={[styles.ingredientSummary, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="basket-outline" size={17} color={colors.primary} />
              <Text numberOfLines={2} style={[styles.ingredientSummaryText, { color: colors.textSecondary }]}>{ingredients.join(" · ")}</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.errorIcon, { backgroundColor: `${colors.error}18` }]}>
              <Ionicons name="cloud-offline-outline" size={22} color={colors.error} />
            </View>
            <View style={styles.errorCopy}>
              <Text style={[styles.errorTitle, { color: colors.text }]}>Your ingredients are saved</Text>
              <Text style={[styles.errorDetail, { color: colors.textSecondary }]}>Nothing was added to your pantry. Retry when you’re ready.</Text>
            </View>
          </Animated.View>
        )}

        {failed ? (
          <TouchableOpacity onPress={retry} style={[styles.primaryButton, { backgroundColor: colors.primary }]} accessibilityRole="button">
            <Ionicons name="refresh" size={19} color={isDark ? "#121212" : "#FFFFFF"} />
            <Text style={[styles.primaryButtonText, { color: isDark ? "#121212" : "#FFFFFF" }]}>Try again</Text>
            <View style={{ width: 19 }} />
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.footerNote, { color: colors.textSecondary }]}>Your pantry won’t change. You choose whether to save the recipe.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 28 },
  topBar: { height: 58, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", alignItems: "center" },
  topLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  hero: { alignItems: "center", paddingTop: 18, paddingBottom: 24 },
  mascotHalo: { width: 192, height: 192, borderRadius: 96, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", marginBottom: 23 },
  liveBadge: { position: "absolute", bottom: 8, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 11, paddingVertical: 7 },
  liveText: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 25, lineHeight: 31, fontWeight: "800", letterSpacing: -0.5, textAlign: "center" },
  subtitle: { maxWidth: 330, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  elapsed: { fontSize: 11, fontWeight: "700", marginTop: 12 },
  timelineCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 22, padding: 18 },
  timelineHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  timelineTitle: { fontSize: 14, fontWeight: "800" },
  timelineCaption: { fontSize: 10, fontWeight: "600" },
  stepRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 11 },
  stepRail: { width: 30, height: 64, alignItems: "center", justifyContent: "center" },
  stepIcon: { zIndex: 1, width: 29, height: 29, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  connector: { position: "absolute", top: 45, bottom: -19, width: 2 },
  stepCopy: { flex: 1, paddingVertical: 9 },
  stepTitle: { fontSize: 12, fontWeight: "700" },
  stepDetail: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  stepState: { fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  ingredientSummary: { minHeight: 42, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 9, marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  ingredientSummaryText: { flex: 1, fontSize: 10, lineHeight: 15 },
  errorCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  errorIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  errorCopy: { flex: 1 },
  errorTitle: { fontSize: 13, fontWeight: "800" },
  errorDetail: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  primaryButton: { minHeight: 54, borderRadius: 16, marginTop: 15, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  primaryButtonText: { fontSize: 14, fontWeight: "800" },
  footerNote: { textAlign: "center", fontSize: 10, lineHeight: 15, marginTop: 15, paddingHorizontal: 14 },
});
