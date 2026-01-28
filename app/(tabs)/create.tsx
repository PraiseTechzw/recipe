import { Input } from "@/components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../../i18n";
import { Recipe } from "../../models/recipe";
import { SyncService } from "../../services/syncService";
import { ToastService } from "../../services/toast";
import { useStore } from "../../store/useStore";

export default function CreateScreen() {
  const router = useRouter();
  const { addXP, addRecipe, userProfile } = useStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [servings, setServings] = useState("");

  // Dynamic lists
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);

  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    time?: string;
    servings?: string;
    ingredients?: string;
    steps?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = i18n.t("required");
      isValid = false;
    }
    if (!description.trim()) {
      newErrors.description = i18n.t("required");
      isValid = false;
    }
    if (!time.trim()) {
      newErrors.time = i18n.t("required");
      isValid = false;
    }
    if (!servings.trim()) {
      newErrors.servings = i18n.t("required");
      isValid = false;
    } else if (isNaN(Number(servings))) {
      newErrors.servings = i18n.t("invalidNumber");
      isValid = false;
    }

    const validIngredients = ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = i18n.t("atLeastOneIngredient");
      isValid = false;
    }

    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      newErrors.steps = i18n.t("atLeastOneStep");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5, // Compression hint: reduced quality
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      ToastService.error(
        i18n.t("error"),
        i18n.t("imagePickerError") || "Failed to pick image",
      );
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
    if (errors.ingredients) {
      setErrors({ ...errors, ingredients: undefined });
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleStepChange = (text: string, index: number) => {
    const newSteps = [...steps];
    newSteps[index] = text;
    setSteps(newSteps);
    if (errors.steps) {
      setErrors({ ...errors, steps: undefined });
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      ToastService.error(i18n.t("validationError"), i18n.t("checkFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        title,
        description,
        image: image
          ? { uri: image }
          : { uri: "https://via.placeholder.com/400x200?text=No+Image" },
        category: "User Recipe",
        tags: [],
        time,
        servings: parseInt(servings) || 2,
        calories: "N/A",
        ingredients: [
          {
            title: "Ingredients",
            data: ingredients.filter((i) => i.trim()).map((i) => ({ name: i })),
          },
        ],
        steps: steps.filter((s) => s.trim()).map((s) => ({ instruction: s })),
        isTraditional: false,
        author: {
          name: userProfile.name,
          avatar: userProfile.avatar || "",
        },
        rating: 0,
        reviews: 0,
      };

      // Save to local store
      addRecipe(newRecipe);

      // Attempt to sync (if service exists)
      SyncService.syncRecipes().catch((err) =>
        console.log("Background sync failed", err),
      );

      addXP(50);

      ToastService.success(i18n.t("success"), i18n.t("recipeCreated"));

      setTimeout(() => {
        setTitle("");
        setDescription("");
        setTime("");
        setServings("");
        setIngredients([""]);
        setSteps([""]);
        setImage(null);
        router.push("/(tabs)/profile");
      }, 1500);
    } catch (error) {
      console.error(error);
      ToastService.error(i18n.t("error"), i18n.t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{i18n.t("createTitle")}</Text>
            <Text style={styles.headerSubtitle}>
              {i18n.t("createSubtitle")}
            </Text>
          </View>

          {/* Image Upload */}
          <View>
            <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.uploadedImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="camera" size={32} color="#E65100" />
                </View>
              )}
              {!image && (
                <Text style={styles.uploadText}>{i18n.t("addPhoto")}</Text>
              )}
              {image && (
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {image && (
              <TouchableOpacity
                onPress={removeImage}
                style={styles.removeImageButton}
              >
                <Text style={styles.removeImageText}>
                  {i18n.t("removePhoto") || "Remove Photo"}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.hintText}>
              {i18n.t("imageUploadHint") ||
                "Tap to upload (Images will be compressed)"}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Input
              label={i18n.t("recipeTitle")}
              placeholder={i18n.t("recipeTitlePlaceholder")}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              error={errors.title}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label={i18n.t("prepTime")}
                placeholder={i18n.t("prepTimePlaceholder")}
                value={time}
                onChangeText={(text) => {
                  setTime(text);
                  if (errors.time) setErrors({ ...errors, time: undefined });
                }}
                error={errors.time}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label={i18n.t("servings")}
                placeholder={i18n.t("servingsPlaceholder")}
                keyboardType="numeric"
                value={servings}
                onChangeText={(text) => {
                  setServings(text);
                  if (errors.servings)
                    setErrors({ ...errors, servings: undefined });
                }}
                error={errors.servings}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Input
              label={i18n.t("description")}
              placeholder={i18n.t("descriptionPlaceholder")}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors({ ...errors, description: undefined });
              }}
              error={errors.description}
              style={styles.textArea}
            />
          </View>

          {/* Ingredients */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{i18n.t("ingredients")}</Text>
            </View>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.dynamicRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder={`${i18n.t("ingredientsPlaceholder")} ${index + 1}`}
                    value={ingredient}
                    onChangeText={(text) => handleIngredientChange(text, index)}
                  />
                </View>
                {ingredients.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveIngredient(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={styles.addButton}
            >
              <Ionicons name="add-circle-outline" size={20} color="#E65100" />
              <Text style={styles.addButtonText}>
                {i18n.t("addIngredient") || "Add Ingredient"}
              </Text>
            </TouchableOpacity>
            {errors.ingredients && (
              <Text style={styles.errorText}>{errors.ingredients}</Text>
            )}
          </View>

          {/* Steps */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{i18n.t("steps")}</Text>
            </View>
            {steps.map((step, index) => (
              <View key={index} style={styles.dynamicRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder={`${i18n.t("stepsPlaceholder")} ${index + 1}`}
                    multiline
                    value={step}
                    onChangeText={(text) => handleStepChange(text, index)}
                  />
                </View>
                {steps.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveStep(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handleAddStep} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={20} color="#E65100" />
              <Text style={styles.addButtonText}>
                {i18n.t("addStep") || "Add Step"}
              </Text>
            </TouchableOpacity>
            {errors.steps && (
              <Text style={styles.errorText}>{errors.steps}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{i18n.t("publish")}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  imageUpload: {
    height: 200,
    backgroundColor: "#FFF3E0",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E65100",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: {
    color: "#E65100",
    fontWeight: "600",
    fontSize: 16,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  editBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#E65100",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  textArea: {
    height: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#E65100",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#ffccbc",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  dynamicRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  removeButton: {
    padding: 10,
    marginLeft: 4,
    justifyContent: "center",
    height: 50,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E65100",
    borderRadius: 12,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addButtonText: {
    color: "#E65100",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  removeImageButton: {
    alignSelf: "center",
    padding: 8,
    marginTop: 4,
  },
  removeImageText: {
    color: "#FF5252",
    fontSize: 14,
    fontWeight: "500",
  },
  hintText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 24,
  },
});
