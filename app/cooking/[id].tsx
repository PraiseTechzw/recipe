import { ErrorState } from "@/components/feedback/ErrorState";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../../i18n";
import { supabase } from "../../lib/supabase";
import { ToastService } from "../../services/toast";
import { useStore } from "../../store/useStore";

const { width, height } = Dimensions.get("window");

// --- Confetti Component ---
const CONFETTI_COLORS = [
  "#E65100",
  "#FF9800",
  "#FFCC80",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
];
const CONFETTI_COUNT = 40;

const ConfettiPiece = ({ index }: { index: number }) => {
  const randomX = Math.random() * width;
  const randomDelay = Math.random() * 1000;
  const randomDuration = 2500 + Math.random() * 1500;
  const randomColor =
    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const randomRotate = Math.random() * 360;

  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      randomDelay,
      withTiming(height + 50, {
        duration: randomDuration,
        easing: Easing.linear,
      }),
    );
    rotate.value = withDelay(
      randomDelay,
      withTiming(randomRotate + 360 * 2, { duration: randomDuration }),
    );
    opacity.value = withDelay(
      randomDelay + randomDuration * 0.8,
      withTiming(0, { duration: 500 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: randomX },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        style,
        { backgroundColor: randomColor, left: 0 },
      ]}
    />
  );
};

const ConfettiSystem = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
};

// --- Main Screen ---

export default function CookingModeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addXP, incrementStat, recipes, myRecipes } = useStore();

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // Default 15 mins
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerControls, setShowTimerControls] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tips State
  const [showTip, setShowTip] = useState(false);

  // Voice Tooltip
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  // Timer Effect
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setTimerActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            ToastService.info("Timer Done!", "Your timer has finished.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);
    const recipeId = Array.isArray(id) ? id[0] : id;

    // 1. Check Store (Offline First)
    const localRecipe =
      recipes.find((r) => r.id === recipeId) ||
      myRecipes.find((r) => r.id === recipeId);

    if (localRecipe) {
      setRecipe(localRecipe);
      setLoading(false);
      return;
    }

    // 2. Fallback to Supabase
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (data) {
        setRecipe({
          id: data.id,
          title: data.title,
          image: data.image,
          time: data.time,
          category: data.category,
          description: data.description,
          ingredients: data.ingredients || [],
          steps: data.steps || [],
          calories: data.calories || "N/A",
          tags: data.tags || ["Community"],
          servings: data.servings || "2-4",
        });
      } else {
        setError("Recipe not found");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (recipe && currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setShowTip(false); // Auto-collapse tip on new step

      // Toast milestone (e.g., halfway)
      if (currentStepIndex + 2 === Math.ceil(recipe.steps.length / 2)) {
        ToastService.info("Halfway there!", "You're making great progress.");
      }
    } else {
      finishRecipe();
    }
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setShowTip(false);
    }
  };

  const handleRepeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    ToastService.info("Step Repeated", "Read it again carefully!");
  };

  // Constants
  const XP_REWARD_PER_RECIPE = 50;

  const finishRecipe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addXP(XP_REWARD_PER_RECIPE);
    incrementStat("recipesCooked");
    incrementStat("daysStreak"); // Simple logic, assumes daily use
    setIsCompleted(true);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimerActive(!timerActive);
  };

  const adjustTimer = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimerSeconds((prev) => Math.max(0, prev + seconds));
  };

  const handleVoicePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowVoiceTooltip(true);
    setTimeout(() => setShowVoiceTooltip(false), 3000);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  if (!recipe || !recipe.steps) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <ErrorState
          title={i18n.t("recipeNotFound")}
          message={i18n.t("recipeNotFound")}
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.title}
        </Text>

        <TouchableOpacity
          style={[styles.timerPill, timerActive && styles.timerPillActive]}
          onPress={() => setShowTimerControls(!showTimerControls)}
        >
          <Ionicons
            name={timerActive ? "timer" : "timer-outline"}
            size={18}
            color={timerActive ? "#FFF" : "#E65100"}
          />
          <Text
            style={[styles.timerText, timerActive && styles.timerTextActive]}
          >
            {formatTime(timerSeconds)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer Controls (Collapsible) */}
      {showTimerControls && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOut}
          style={styles.timerControls}
        >
          <View style={styles.timerAdjustRow}>
            <TouchableOpacity
              onPress={() => adjustTimer(-60)}
              style={styles.timerAdjustBtn}
            >
              <Text style={styles.timerAdjustText}>-1m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => adjustTimer(-10)}
              style={styles.timerAdjustBtn}
            >
              <Text style={styles.timerAdjustText}>-10s</Text>
            </TouchableOpacity>
            <Text style={styles.timerBigText}>{formatTime(timerSeconds)}</Text>
            <TouchableOpacity
              onPress={() => adjustTimer(10)}
              style={styles.timerAdjustBtn}
            >
              <Text style={styles.timerAdjustText}>+10s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => adjustTimer(60)}
              style={styles.timerAdjustBtn}
            >
              <Text style={styles.timerAdjustText}>+1m</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timerActionRow}>
            <TouchableOpacity
              onPress={toggleTimer}
              style={[
                styles.timerActionBtn,
                { backgroundColor: timerActive ? "#FF9800" : "#4CAF50" },
              ]}
            >
              <Ionicons
                name={timerActive ? "pause" : "play"}
                size={20}
                color="#FFF"
              />
              <Text style={styles.timerActionText}>
                {timerActive ? "Pause" : "Start"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setTimerActive(false);
                setTimerSeconds(15 * 60);
              }}
              style={[styles.timerActionBtn, { backgroundColor: "#F44336" }]}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.timerActionText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${((currentStepIndex + 1) / steps.length) * 100}%` },
            ]}
            layout={Layout.springify()}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Card */}
        <Animated.View
          key={`step-${currentStepIndex}`}
          entering={SlideInDown.springify().damping(15)}
          style={styles.stepCard}
        >
          {/* Media */}
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: currentStep.image || recipe.image }}
              style={styles.mediaImage}
              contentFit="cover"
            />
          </View>

          {/* Large Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {currentStep.highlightedWord ? (
                <>
                  {
                    currentStep.instruction.split(
                      currentStep.highlightedWord,
                    )[0]
                  }
                  <Text style={styles.highlightedWord}>
                    {currentStep.highlightedWord}
                  </Text>
                  {
                    currentStep.instruction.split(
                      currentStep.highlightedWord,
                    )[1]
                  }
                </>
              ) : (
                currentStep.instruction
              )}
            </Text>

            {currentStep.description && (
              <Text style={styles.descriptionText}>
                {currentStep.description}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Chef's Tip (Collapsible) */}
        {currentStep.tip && (
          <View style={styles.tipWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync();
                setShowTip(!showTip);
              }}
              style={styles.tipHeader}
            >
              <View style={styles.tipTitleRow}>
                <MaterialIcons name="lightbulb" size={22} color="#E65100" />
                <Text style={styles.tipHeaderTitle}>Chef&apos;s Tip</Text>
              </View>
              <Ionicons
                name={showTip ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {showTip && (
              <Animated.View
                entering={FadeInDown}
                exiting={FadeOut}
                style={styles.tipContent}
              >
                <Text style={styles.tipText}>{currentStep.tip}</Text>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnSecondary,
              currentStepIndex === 0 && styles.disabledBtn,
            ]}
            onPress={handlePrev}
            disabled={currentStepIndex === 0}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={currentStepIndex === 0 ? "#CCC" : "#333"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnSecondary]}
            onPress={handleRepeat}
          >
            <Ionicons name="repeat" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary]}
            onPress={handleNext}
          >
            <Text style={styles.navBtnTextPrimary}>
              {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
            </Text>
            <Ionicons
              name={
                currentStepIndex === steps.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Fake Voice Button */}
        <View style={styles.voiceContainer}>
          {showVoiceTooltip && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.voiceTooltip}
            >
              <Text style={styles.voiceTooltipText}>
                Voice commands coming soon!
              </Text>
              <View style={styles.voiceTooltipArrow} />
            </Animated.View>
          )}
          <TouchableOpacity style={styles.voiceBtn} onPress={handleVoicePress}>
            <Ionicons name="mic-off" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Completion Modal */}
      <Modal visible={isCompleted} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ConfettiSystem />
          <Animated.View
            entering={SlideInDown.springify()}
            style={styles.completionCard}
          >
            <Text style={styles.completionTitle}>Delicious! 🎉</Text>
            <Text style={styles.completionSubtitle}>
              You&apos;ve completed {recipe.title}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+50</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="flame" size={24} color="#E65100" />
                <Text style={styles.statLabel}>Streak kept</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rateBtn}
              onPress={() =>
                ToastService.success("Thanks!", "Rating submitted")
              }
            >
              <Text style={styles.rateBtnText}>Rate this Recipe</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name="star-outline"
                    size={20}
                    color="#FFF"
                  />
                ))}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.doneBtnText}>Back to Recipes</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },
  iconButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 10,
    color: "#333",
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  timerPillActive: {
    backgroundColor: "#E65100",
    borderColor: "#E65100",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
    marginLeft: 6,
    fontVariant: ["tabular-nums"],
  },
  timerTextActive: {
    color: "#FFF",
  },
  timerControls: {
    backgroundColor: "#FFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    zIndex: 9,
  },
  timerAdjustRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timerAdjustBtn: {
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  timerAdjustText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  timerBigText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    fontVariant: ["tabular-nums"],
  },
  timerActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  timerActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  timerActionText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E65100",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  mediaContainer: {
    width: "100%",
    height: 220,
    backgroundColor: "#EEE",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  instructionContainer: {
    padding: 24,
  },
  instructionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#222",
    lineHeight: 32,
    marginBottom: 16,
  },
  highlightedWord: {
    color: "#E65100",
    textDecorationLine: "underline",
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  tipWrapper: {
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE0B2",
    overflow: "hidden",
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  tipTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
  },
  tipContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tipText: {
    fontSize: 15,
    color: "#4E342E",
    lineHeight: 22,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  navBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  navBtnSecondary: {
    width: 56,
    backgroundColor: "#F5F5F5",
  },
  navBtnPrimary: {
    flex: 1,
    backgroundColor: "#E65100",
    flexDirection: "row",
    gap: 8,
  },
  navBtnTextPrimary: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  voiceContainer: {
    alignItems: "center",
    marginTop: 8,
    position: "relative",
    zIndex: 20,
  },
  voiceBtn: {
    padding: 8,
  },
  voiceTooltip: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  voiceTooltipText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  voiceTooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completionCard: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#DDD",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  rateBtn: {
    backgroundColor: "#FF9800",
    width: "100%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  rateBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  doneBtn: {
    padding: 16,
  },
  doneBtnText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  confetti: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -10,
  },
});
