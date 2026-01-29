import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COUNTRIES, DEFAULT_COUNTRY } from "../constants/countries";
import i18n from "../i18n";
import { authService } from "../services/authService";
import { useStore } from "../store/useStore";

const AVATAR_SEEDS = [
  "Chef Gordon",
  "Jamie O",
  "Nigella L",
  "Massimo B",
  "Heston B",
  "Felix",
  "Aneka",
  "Zack",
  "Molly",
  "Bear",
  "Chef",
  "Tasty",
  "Spicy",
  "Sweet",
  "Salty",
];

export default function UserInfoScreen() {
  const router = useRouter();
  const { setUserProfile, dietaryOptions, experienceLevels, userProfile } =
    useStore();

  const [name, setName] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [level, setLevel] = useState<"Beginner" | "Home Cook" | "Pro">(
    "Beginner",
  );
  const [diet, setDiet] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill if restoring profile
    if (userProfile.name && userProfile.name !== "Guest") {
      setName(userProfile.name);
    }
    if (userProfile.country) {
      const c = COUNTRIES.find((c) => c.name === userProfile.country);
      if (c) setCountry(c);
    }
    if (userProfile.avatar) {
      setAvatar(userProfile.avatar);
    }
    if (userProfile.chefLevel) {
      // @ts-ignore
      setLevel(userProfile.chefLevel);
    }
    if (userProfile.dietaryPreferences) {
      setDiet(userProfile.dietaryPreferences);
    }
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const selectPresetAvatar = (seed: string) => {
    setAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`);
  };

  const toggleDiet = (item: string) => {
    if (diet.includes(item)) {
      setDiet(diet.filter((i) => i !== item));
    } else {
      setDiet([...diet, item]);
    }
  };

  const handleNext = async () => {
    if (name.trim().length === 0) {
      return;
    }

    const updates = {
      name: name.trim(),
      chefLevel: level,
      dietaryPreferences: diet,
      avatar: avatar || undefined,
      country: country.name,
    };

    setUserProfile(updates);

    // Sync to Supabase if authenticated
    const session = useStore.getState().session;
    if (session) {
      await authService.linkProfile(session.user.id);
    }

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

        {/* Preset Avatars */}
        <View style={styles.section}>
          <Text style={styles.label}>Or choose a chef avatar:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarList}
          >
            {AVATAR_SEEDS.map((seed) => (
              <TouchableOpacity
                key={seed}
                onPress={() => selectPresetAvatar(seed)}
                style={styles.presetAvatarBtn}
              >
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`,
                  }}
                  style={[
                    styles.presetAvatar,
                    avatar?.includes(seed) && styles.presetAvatarSelected,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
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

        {/* Country Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.inputText}>
              {country.flag} {country.name}
            </Text>
          </TouchableOpacity>
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

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.signInText}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setCountry(item);
                  setShowCountryModal(false);
                }}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                {country.code === item.code && (
                  <Ionicons name="checkmark" size={20} color="#E65100" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
    paddingVertical: 8,
  },
  inputText: {
    fontSize: 20,
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
    marginBottom: 20,
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
  avatarList: {
    paddingVertical: 8,
    gap: 12,
  },
  presetAvatarBtn: {
    padding: 2,
  },
  presetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
  },
  presetAvatarSelected: {
    borderWidth: 3,
    borderColor: "#E65100",
  },
  signInButton: {
    marginTop: 20,
    alignItems: "center",
  },
  signInText: {
    color: "#757575",
    fontSize: 14,
  },
  signInLink: {
    color: "#E65100",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalClose: {
    fontSize: 16,
    color: "#E65100",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});
