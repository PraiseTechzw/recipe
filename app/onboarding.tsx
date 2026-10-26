import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useObserve } from "expo-observe";
import {
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
import i18n from "../i18n";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";
import { getChefAvatarUri } from "../utils/chefIdentity";

const CHEF_AVATARS = [
  { seed: "Tariro", background: "ffe1c2" },
  { seed: "Kudzai", background: "ffd8d2" },
  { seed: "Nyasha", background: "f6d9e8" },
  { seed: "Tendai", background: "e8ddff" },
  { seed: "Rudo", background: "d8e7ff" },
  { seed: "Farai", background: "d4f0e3" },
  { seed: "Tawanda", background: "fff0b8" },
  { seed: "Rutendo", background: "d7f0f2" },
].map(({ seed, background }) => ({
  seed,
  uri: getChefAvatarUri(seed, background),
}));

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "sn", name: "Shona", nativeName: "ChiShona" },
  { code: "nd", name: "Ndebele", nativeName: "isiNdebele" },
] as const;

export default function UserInfoScreen() {
  const { markInteractive } = useObserve();
  const router = useRouter();
  const { setUserProfile, setLocale, locale, dietaryOptions, experienceLevels } = useStore();
  const { colors, isDark } = useTheme();

  const [step, setStep] = useState<"language" | "about">("language");
  const [selectedLocale, setSelectedLocale] = useState(
    locale === "sn" || locale === "nd" ? locale : "en",
  );

  const [name, setName] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Home Cook" | "Pro">(
    "Beginner",
  );
  const [diet, setDiet] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(CHEF_AVATARS[0].uri);

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const toggleDiet = (item: string) => {
    if (item === "None") {
      setDiet(diet.includes("None") ? [] : ["None"]);
      return;
    }
    if (diet.includes(item)) {
      setDiet(diet.filter((i) => i !== item));
    } else {
      setDiet([...diet.filter((i) => i !== "None"), item]);
    }
  };

  const handleNext = () => {
    if (step === "language") {
      setLocale(selectedLocale);
      setStep("about");
      return;
    }

    if (name.trim().length === 0) {
      // Show error or shake
      return;
    }

    setUserProfile({
      name: name.trim(),
      chefLevel: level,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === "language" ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Choose your language</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sarudza mutauro · Khetha ulimi · Choose your language
              </Text>
            </View>
            <View style={styles.languageList}>
              {LANGUAGES.map((language) => {
                const selected = selectedLocale === language.code;
                return (
                  <TouchableOpacity
                    key={language.code}
                    onPress={() => setSelectedLocale(language.code)}
                    style={[
                      styles.languageCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selected && styles.languageCardSelected,
                      selected && { backgroundColor: isDark ? "#3A2A20" : "#FFF8F0" },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${language.name}, ${language.nativeName}${selected ? ", selected" : ""}`}
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.languageCopy}>
                      <Text
                        style={[
                          styles.languageName,
                          { color: selected ? (isDark ? colors.primary : "#B84400") : colors.text },
                        ]}
                      >
                        {language.name}
                      </Text>
                      <Text style={[styles.languageNativeName, { color: colors.textSecondary }]}>
                        {language.nativeName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.languageRadio,
                        selected && styles.languageRadioSelected,
                        { borderColor: selected ? colors.primary : colors.border },
                      ]}
                    >
                      {selected && <View style={styles.languageRadioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.progressRow}>
                <TouchableOpacity
                  onPress={() => setStep("language")}
                  style={styles.stepBack}
                  accessibilityRole="button"
                  accessibilityLabel={i18n.t("goBack")}
                >
                  <Ionicons name="chevron-back" size={16} color={isDark ? colors.primary : "#B84400"} />
                  <Text style={[styles.stepLabel, { color: isDark ? colors.primary : "#B84400" }]}>{i18n.t("onboardingStepTwo")}</Text>
                </TouchableOpacity>
                <View style={[styles.progressTrack, { backgroundColor: isDark ? "#4A3A30" : "#E9DED4" }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{i18n.t("onboardingTitle")}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{i18n.t("onboardingSubtitle")}</Text>
            </View>

            <View style={[styles.avatarCard, { backgroundColor: isDark ? "#2A211C" : "#FFF3E9", borderColor: isDark ? "#49382E" : "#F3E1D3" }]}>
              <View style={styles.avatarCardTop}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.avatarContainer}
                  accessibilityRole="button"
                  accessibilityLabel={i18n.t("chooseProfilePhoto")}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={42} color="#E65100" />
                    </View>
                  )}
                  <View style={styles.editIcon}>
                    <Ionicons name="camera" size={17} color="#fff" />
                  </View>
                </TouchableOpacity>
                <View style={styles.avatarCopy}>
                  <Text style={[styles.avatarTitle, { color: colors.text }]}>{i18n.t("chefAvatar")}</Text>
                  <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>{i18n.t("chooseProfilePhoto")}</Text>
                </View>
              </View>
              <Text style={[styles.avatarChoiceLabel, { color: colors.textSecondary }]}>{i18n.t("chooseCartoonAvatar")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarChoices}
              >
                {CHEF_AVATARS.map((choice) => {
                  const selected = avatar === choice.uri;
                  return (
                    <TouchableOpacity
                      key={choice.seed}
                      onPress={() => setAvatar(choice.uri)}
                      style={[styles.avatarChoice, selected && styles.avatarChoiceSelected]}
                      accessibilityRole="button"
                      accessibilityLabel={`${choice.seed} ${i18n.t("cartoonAvatar")}${selected ? ", selected" : ""}`}
                      accessibilityState={{ selected }}
                    >
                      <Image source={{ uri: choice.uri }} style={styles.avatarChoiceImage} contentFit="cover" />
                      {selected && <View style={styles.avatarCheck}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{i18n.t("nameLabel")}</Text>
              <View style={[styles.nameField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={i18n.t("namePlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  maxLength={40}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{i18n.t("experienceLabel")}</Text>
              <View style={styles.optionsRow}>
                {experienceLevels.map((l) => {
                  const selected = level === l;
                  const icon = l === "Beginner"
                    ? "school-outline"
                    : l === "Pro"
                      ? "medal-outline"
                      : "home-outline";
                  return (
                    <TouchableOpacity
                      key={l}
                      style={[
                        styles.optionCard,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        selected && styles.optionSelected,
                        selected && { backgroundColor: isDark ? "#3A2A20" : "#FFF4EA" },
                      ]}
                      onPress={() => setLevel(l as "Beginner" | "Home Cook" | "Pro")}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <View
                        style={[
                          styles.experienceIconWrap,
                          {
                            backgroundColor: selected
                              ? isDark
                                ? "#49351F"
                                : "#FFE4CC"
                              : colors.surfaceVariant,
                          },
                        ]}
                      >
                        <Ionicons name={icon} size={20} color={selected ? (isDark ? colors.primary : "#B84400") : colors.textSecondary} />
                      </View>
                      <Text style={[styles.optionText, { color: selected ? (isDark ? colors.primary : "#B84400") : colors.textSecondary }, selected && styles.optionTextSelected]}>{getLevelLabel(l)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>{i18n.t("dietaryLabel")}</Text>
              <View style={styles.chipsContainer}>
                {dietaryOptions.map((d) => {
                  const selected = diet.includes(d);
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        selected && styles.chipSelected,
                        selected && { backgroundColor: isDark ? "#63370E" : "#B84400", borderColor: isDark ? "#FFB866" : "#B84400" },
                      ]}
                      onPress={() => toggleDiet(d)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      {selected && <Ionicons name="checkmark" size={14} color={isDark ? "#FFE3C2" : "#fff"} />}
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selected && styles.chipTextSelected, selected && { color: isDark ? "#FFE3C2" : "#fff" }]}>{getDietLabel(d)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={step === "about" && name.trim().length === 0}
          style={[
            styles.button,
            { backgroundColor: isDark ? "#B95D00" : "#C2410C" },
            step === "about" && name.trim().length === 0 && styles.buttonDisabled,
          ]}
        >
          <Text style={[styles.buttonText, step === "about" && name.trim().length === 0 && styles.buttonTextDisabled]}>{i18n.t("continue")}</Text>
          <Ionicons name="arrow-forward" size={20} color={step === "about" && name.trim().length === 0 ? "#4A4540" : "#fff"} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E9DED4",
    overflow: "hidden",
  },
  stepBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    minHeight: 32,
    paddingRight: 4,
  },
  progressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#E65100",
  },
  stepLabel: {
    color: "#E65100",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 0,
  },
  languageList: {
    gap: 12,
  },
  languageCard: {
    minHeight: 82,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8E1DA",
    backgroundColor: "#FFFFFF",
  },
  languageCardSelected: {
    borderWidth: 2,
    borderColor: "#E65100",
    backgroundColor: "#FFF8F0",
  },
  languageCopy: {
    gap: 3,
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  languageName: {
    color: "#24201D",
    fontSize: 18,
    fontWeight: "700",
  },
  languageNativeName: {
    color: "#77716C",
    fontSize: 14,
  },
  languageRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CFC7C0",
    alignItems: "center",
    justifyContent: "center",
  },
  languageRadioSelected: {
    borderColor: "#E65100",
  },
  languageRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E65100",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    flexShrink: 1,
    lineHeight: 39,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  nameField: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    paddingVertical: 12,
    color: "#1a1a1a",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: 76,
    minHeight: 82,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  optionSelected: {
    backgroundColor: "#FFF4EA",
    borderColor: "#E65100",
    borderWidth: 1.5,
  },
  experienceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    color: "#757575",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 13,
    flexShrink: 1,
  },
  optionTextSelected: {
    fontWeight: "bold",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    minHeight: 42,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E0DC",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    position: "relative",
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#8C4A22",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
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
    width: 29,
    height: 29,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarCard: {
    padding: 16,
    marginBottom: 26,
    borderRadius: 24,
    borderWidth: 1,
  },
  avatarCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarCopy: {
    flex: 1,
    gap: 5,
  },
  avatarTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  avatarHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  avatarChoiceLabel: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 19,
  },
  avatarChoices: {
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  avatarChoice: {
    width: 58,
    height: 58,
    borderRadius: 29,
    padding: 3,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarChoiceSelected: {
    borderColor: "#E65100",
    backgroundColor: "#FFF3E0",
  },
  avatarChoiceImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  avatarCheck: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#E65100",
    borderWidth: 2,
    borderColor: "#FFF3E9",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#D8D2CC",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextDisabled: {
    color: "#49433D",
  },
});
