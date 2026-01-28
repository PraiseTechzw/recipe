import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useStore } from "../store/useStore";

export default function UserInfoScreen() {
  const router = useRouter();
  const { setUserProfile, dietaryOptions, experienceLevels } = useStore();

  const [name, setName] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Home Cook" | "Pro">(
    "Beginner",
  );
  const [diet, setDiet] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const toggleDiet = (item: string) => {
    if (diet.includes(item)) {
      setDiet(diet.filter((i) => i !== item));
    } else {
      setDiet([...diet, item]);
    }
  };

  const handleNext = () => {
    if (name.trim().length === 0) {
      // Show error or shake
      return;
    }

    setUserProfile({
      name: name.trim(),
      chefLevel: "Beginner", // Start everyone as Beginner
      dietaryPreferences: diet,
      avatar: avatar || undefined,
    });

    // Go to Pantry Check next, instead of straight to tabs
    router.replace("/pantry-check");
  };

  const getLevelLabel = (l: string) => {
    switch (l) {
      case "Beginner":
        return i18n.t("beginner");
      case "Home Cook":
        return i18n.t("homeCook");
      case "Pro":
        return i18n.t("pro");
      default:
        return l;
    }
  };

  const getDietLabel = (d: string) => {
    switch (d) {
      case "Vegetarian":
        return i18n.t("vegetarian");
      case "Vegan":
        return i18n.t("vegan");
      case "Gluten-Free":
        return i18n.t("glutenFree");
      case "Halal":
        return i18n.t("halal");
      case "None":
        return i18n.t("none");
      default:
        return d;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t("onboardingTitle")}</Text>
          <Text style={styles.subtitle}>{i18n.t("onboardingSubtitle")}</Text>
        </View>

        {/* Chef Avatar */}
        <View style={styles.centerSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="#E65100" />
              </View>
            )}
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.uploadText}>{i18n.t("uploadPhoto")}</Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>{i18n.t("nameLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={i18n.t("namePlaceholder")}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Chef Level */}
        <View style={styles.section}>
          <Text style={styles.label}>{i18n.t("experienceLabel")}</Text>
          <View style={styles.optionsRow}>
            {experienceLevels.map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.optionCard,
                  level === l && styles.optionSelected,
                ]}
                onPress={() => setLevel(l as any)}
              >
                <Text
                  style={[
                    styles.optionText,
                    level === l && styles.optionTextSelected,
                  ]}
                >
                  {getLevelLabel(l)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.label}>{i18n.t("dietaryLabel")}</Text>
          <View style={styles.chipsContainer}>
            {dietaryOptions.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, diet.includes(d) && styles.chipSelected]}
                onPress={() => toggleDiet(d)}
              >
                <Text
                  style={[
                    styles.chipText,
                    diet.includes(d) && styles.chipTextSelected,
                  ]}
                >
                  {getDietLabel(d)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            name.trim().length === 0 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={name.trim().length === 0}
        >
          <Text style={styles.buttonText}>{i18n.t("continue")}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  scrollContent: {
    padding: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#E0E0E0",
    fontSize: 20,
    paddingVertical: 8,
    color: "#1a1a1a",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#FFF3E0",
    borderColor: "#E65100",
  },
  optionText: {
    color: "#757575",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#E65100",
    fontWeight: "bold",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  chipSelected: {
    backgroundColor: "#E65100",
  },
  chipText: {
    color: "#666",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E65100",
    borderStyle: "dashed",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E65100",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  uploadText: {
    color: "#E65100",
    fontWeight: "600",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#E65100",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#FFCCBC",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
