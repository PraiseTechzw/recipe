import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "../../components/ui/Chip";
import { HapticService } from "../../services/haptics";
import { SyncService } from "../../services/syncService";
import { useAICaptureStore } from "../../stores/aiCaptureStore";

const LOADING_STEPS = [
  "Analyzing image...",
  "Detecting ingredients...",
  "Creating recipe...",
];

export default function ReviewScreen() {
  const router = useRouter();

  // Store integration
  const {
    imageUri,
    imageBase64,
    status,
    extractedIngredients,
    editedIngredients,
    extractIngredients,
    addIngredient,
    removeIngredient,
    generateRecipe,
    error,
  } = useAICaptureStore();

  // Global store for pantry
  const pantry = useStore((state) => state.pantry) || [];

  const [newIngredient, setNewIngredient] = useState("");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Auto-trigger extraction on mount if needed
  useEffect(() => {
    if (
      status === "reviewingImage" &&
      imageBase64 &&
      extractedIngredients.length === 0
    ) {
      extractIngredients(imageBase64);
    }
  }, [status, imageBase64, extractedIngredients.length]);

  // Handle navigation on success
  useEffect(() => {
    if (status === "showingResults") {
      router.push("/(ai-chef)/result");
    }
  }, [status]);

  // Handle errors
  useEffect(() => {
    if (error) {
      if (error.type === "validation" || error.type === "ai") {
        Alert.alert("Generation Issue", error.message, [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => generateRecipe() },
        ]);
      } else {
        Alert.alert("Error", error.message);
      }
    }
  }, [error]);

  const isExtracting = status === "extractingIngredients";
  const isGenerating = status === "generatingRecipe";
  const isLoading = isExtracting || isGenerating;

  // Loading Steps Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000); // Change message every 2s
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Pulse Animation for CTA
  useEffect(() => {
    if (!isLoading && editedIngredients.length > 0) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isLoading, editedIngredients.length]);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      addIngredient(newIngredient.trim());
      setNewIngredient("");
      HapticService.selection();
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    HapticService.light();
    removeIngredient(ingredient);
  };

  const handleGenerate = async () => {
    const isOnline = await SyncService.checkConnectivity();
    if (!isOnline) {
      Alert.alert(
        "Offline",
        "Internet is required for AI generation. You can try again later or create a recipe manually.",
        [
          { text: "OK", style: "cancel" },
          {
            text: "Create Manually",
            onPress: () => {
              // Reset AI flow and go to create tab
              // We could pass data, but for now just redirect
              router.push("/(tabs)/create");
            },
          },
        ],
      );
      return;
    }

    if (editedIngredients.length === 0) {
      Alert.alert("No Ingredients", "Please add at least one ingredient.");
      return;
    }

    HapticService.selection();
    generateRecipe();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <OfflineBanner />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Ingredients</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Captured Image */}
          <View style={styles.imageContainer}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="cover"
              />
            )}
            <View style={styles.imageOverlay} />
            <Text style={styles.imageLabel}>Captured Image</Text>
          </View>

          {/* Ingredients List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                We found these ingredients:
              </Text>
              {isExtracting && (
                <ActivityIndicator size="small" color="#E65100" />
              )}
            </View>

            <Text style={styles.sectionSubtitle}>
              Tap to remove, or add missing ones below.
            </Text>

            <View style={styles.chipContainer}>
              {editedIngredients.map((ing, index) => (
                <Animated.View
                  key={`${ing}-${index}`}
                  layout={LinearTransition.springify()}
                  entering={FadeIn.delay(index * 50)}
                  exiting={FadeOut}
                >
                  <Chip
                    label={ing}
                    active={true}
                    onPress={() => handleRemoveIngredient(ing)}
                    style={styles.chip}
                  />
                </Animated.View>
              ))}

              {!isExtracting && editedIngredients.length === 0 && (
                <Text style={styles.emptyText}>
                  No ingredients found yet. Add some manually!
                </Text>
              )}

              {isExtracting && editedIngredients.length === 0 && (
                <Text style={styles.emptyText}>Analyzing image...</Text>
              )}
            </View>
          </View>

          {/* Add Manual */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add another ingredient..."
              value={newIngredient}
              onChangeText={setNewIngredient}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={styles.addButton}
              disabled={isLoading}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Pantry Suggestions */}
          {!isLoading &&
            pantry.filter((i) => !editedIngredients.includes(i)).length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { marginTop: 16, marginBottom: 8 },
                  ]}
                >
                  From your pantry
                </Text>
                <View style={styles.chipContainer}>
                  {pantry
                    .filter((i) => !editedIngredients.includes(i))
                    .map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        active={false}
                        onPress={() => {
                          addIngredient(item);
                          HapticService.selection();
                        }}
                        style={styles.chip}
                      />
                    ))}
                </View>
              </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          <Animated.View
            style={[
              styles.generateButton,
              isLoading && styles.disabledButton,
              !isLoading && pulseStyle,
            ]}
          >
            {isLoading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Animated.Text
                  key={loadingStepIndex} // Re-animate on text change
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={styles.generateButtonText}
                >
                  {isExtracting
                    ? "Analyzing..."
                    : LOADING_STEPS[loadingStepIndex]}
                </Animated.Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.generateButtonText}>Generate Recipe</Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 200,
    width: "100%",
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  imageLabel: {
    position: "absolute",
    bottom: 12,
    left: 16,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E65100",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  generateButton: {
    backgroundColor: "#E65100",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#FFB74D",
    elevation: 0,
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
