import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticService } from "../../services/haptics";
import { SyncService } from "../../services/syncService";
import { ToastService } from "../../services/toast";
import { useAICaptureStore } from "../../stores/aiCaptureStore";

export default function ResultScreen() {
  const router = useRouter();

  // Store integration
  const {
    generatedRecipe: recipe,
    imageUri,
    saveGeneratedRecipeToLocalStore,
    regenerate,
    resetFlow,
    status,
  } = useAICaptureStore();

  const [activeTab, setActiveTab] = useState<
    "overview" | "ingredients" | "steps" | "nutrition"
  >("overview");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // If no recipe in store, we shouldn't be here
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No recipe generated.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    HapticService.selection();

    try {
      saveGeneratedRecipeToLocalStore();

      // Trigger Success Animation
      setShowSuccess(true);
      HapticService.success();

      // Delay navigation to show animation
      setTimeout(() => {
        ToastService.success("Saved!", "Recipe added to your cookbook.");
        resetFlow();
        router.push("/(tabs)/saved");
      }, 1500);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save recipe.");
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    HapticService.selection();
    Alert.alert(
      "Regenerate Recipe?",
      "This will replace the current recipe with a new one based on the same ingredients. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: async () => {
            const isOnline = await SyncService.checkConnectivity();
            if (!isOnline) {
              Alert.alert(
                "Offline",
                "Please connect to the internet to regenerate.",
              );
              return;
            }

            try {
              await regenerate(true); // true = confirm (already confirmed by alert)
              ToastService.success(
                "Regenerated!",
                "Here is a new recipe for you.",
              );
              HapticService.success();
            } catch (e) {
              // Store handles error state
              Alert.alert("Error", "Failed to regenerate recipe.");
            }
          },
        },
      ],
    );
  };

  const handleCookNow = () => {
    HapticService.selection();

    // Create a temporary recipe object for cooking mode
    const cookingRecipe = {
      id: "ai-temp",
      title: recipe.title,
      image: imageUri,
      time: `${recipe.time_minutes} mins`,
      category: recipe.category,
      description: recipe.description,
      ingredients: [
        {
          title: "Main Ingredients",
          data: recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity,
          })),
        },
      ],
      steps: recipe.steps.map((s) => ({
        instruction:
          s.text + (s.timer_minutes ? ` (Timer: ${s.timer_minutes} mins)` : ""),
        tip: s.tip,
      })),
      calories: recipe.nutrition?.calories
        ? `${recipe.nutrition.calories} kcal`
        : undefined,
      tags: ["AI Generated"],
      servings: recipe.servings,
    };

    router.push({
      pathname: "/cooking/ai-temp",
      params: { recipeParams: JSON.stringify(cookingRecipe) },
    });
  };

  const handleClose = () => {
    Alert.alert(
      "Discard Recipe?",
      "If you leave now, this recipe will be lost unless you save it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            resetFlow();
            router.dismissAll(); // Or router.push('/(tabs)')
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  const isRegenerating = status === "generatingRecipe";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your AI Recipe</Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity
            onPress={handleRegenerate}
            disabled={isRegenerating || isSaving}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={isRegenerating ? "#ccc" : "#E65100"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          {/* Image */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
            />
          )}

          {/* Title & Info */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{recipe.time_minutes} mins</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color="#666" />
                <Text style={styles.metaText}>
                  {recipe.nutrition?.calories || "N/A"} kcal
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="restaurant-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{recipe.servings} servings</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {["overview", "ingredients", "steps", "nutrition"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "overview" && (
              <Animated.View entering={FadeIn.duration(300)}>
                <Text style={styles.sectionHeader}>Why this recipe?</Text>
                <Text style={styles.bodyText}>
                  Based on your ingredients ({recipe.ingredients.length}), we
                  created this {recipe.category} dish.
                </Text>
                <View style={{ height: 10 }} />
                <Text style={styles.sectionHeader}>Tags</Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>AI Generated</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{recipe.category}</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {activeTab === "ingredients" && (
              <Animated.View entering={FadeIn.duration(300)}>
                {recipe.ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.ingredientText}>
                      <Text style={{ fontWeight: "600" }}>{ing.quantity} </Text>
                      {ing.name}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}

            {activeTab === "steps" && (
              <Animated.View entering={FadeIn.duration(300)}>
                {recipe.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepText}>{step.text}</Text>
                      {step.timer_minutes && (
                        <View style={styles.timerBadge}>
                          <Ionicons
                            name="timer-outline"
                            size={14}
                            color="#E65100"
                          />
                          <Text style={styles.timerText}>
                            {step.timer_minutes}m timer
                          </Text>
                        </View>
                      )}
                      {step.tip && (
                        <View style={styles.tipBox}>
                          <Ionicons
                            name="bulb-outline"
                            size={16}
                            color="#F57C00"
                          />
                          <Text style={styles.tipText}>{step.tip}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {activeTab === "nutrition" && (
              <Animated.View entering={FadeIn.duration(300)}>
                {recipe.nutrition && (
                  <View style={styles.nutritionGrid}>
                    {Object.entries(recipe.nutrition).map(([key, value]) => (
                      <View key={key} style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{value}</Text>
                        <Text style={styles.nutritionLabel}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#E65100" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="bookmark-outline"
                size={20}
                color="#E65100"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveButtonText}>Save Recipe</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cookButton} onPress={handleCookNow}>
          <Ionicons
            name="flame"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.cookButtonText}>Cook Now</Text>
        </TouchableOpacity>
      </View>

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.successOverlay}
        >
          <Animated.View
            entering={ZoomIn.springify()}
            exiting={ZoomOut}
            style={styles.successCircle}
          >
            <Ionicons name="checkmark" size={50} color="#fff" />
          </Animated.View>
          <Text style={styles.successText}>Recipe Saved!</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#E65100",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    paddingBottom: 100,
  },
  image: {
    width: "100%",
    height: 250,
  },
  infoSection: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#E65100",
  },
  tabText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#E65100",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#666",
  },
  ingredientRow: {
    flexDirection: "row",
    marginBottom: 12,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 16,
    color: "#E65100",
    marginRight: 8,
    marginTop: 2,
  },
  ingredientText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    flex: 1,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E65100",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: "#E65100",
    fontWeight: "500",
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#0277BD",
    flex: 1,
    lineHeight: 20,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  nutritionItem: {
    width: "45%",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    paddingBottom: 30, // Safe area
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E65100",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E65100",
  },
  cookButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E65100",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  cookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});
