import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "../i18n";
import { useStore } from "../store/useStore";

export default function PantryCheckScreen() {
  const router = useRouter();
  const { setPantry, setHasOnboarded, commonIngredients } = useStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleIngredient = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  const handleContinue = () => {
    setPantry(Array.from(selected));
    setHasOnboarded(true);
    router.replace("/(tabs)");
  };

  const handleSkip = () => {
    setHasOnboarded(true);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t("pantryCheck")}</Text>
        <Text style={styles.subtitle}>{i18n.t("pantrySubtitle")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {commonIngredients.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, selected.has(item.id) && styles.cardSelected]}
            onPress={() => toggleIngredient(item.id)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text
              style={[
                styles.name,
                selected.has(item.id) && styles.nameSelected,
              ]}
            >
              {i18n.t(item.key)}
            </Text>
            {selected.has(item.id) && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#E65100" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>{i18n.t("skip")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>
            {i18n.t("showRecipes")} ({selected.size})
          </Text>
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
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    lineHeight: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    width: "30%", // roughly 3 columns
    aspectRatio: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    padding: 8,
  },
  cardSelected: {
    backgroundColor: "#FFF3E0",
    borderColor: "#E65100",
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  nameSelected: {
    color: "#E65100",
  },
  checkIcon: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#E65100",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
