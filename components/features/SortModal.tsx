import i18n from "@/i18n";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export type SortOption = "newest" | "time" | "calories" | "rating";

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: SortOption;
  onSelectSort: (option: SortOption) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  sortBy,
  onSelectSort,
}) => {
  const { colors } = useTheme();

  const options: { id: SortOption; label: string; icon: string }[] = [
    { id: "newest", label: "Newest", icon: "sparkles-outline" },
    { id: "time", label: "Cooking Time", icon: "time-outline" },
    { id: "rating", label: "Top Rated", icon: "star-outline" },
    { id: "calories", label: "Calories (Low to High)", icon: "flame-outline" },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={[styles.sortModalContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sortTitle, { color: colors.text }]}>
            {i18n.t("sortBy") || "Sort By"}
          </Text>

          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                { borderBottomColor: colors.border },
                sortBy === option.id && {
                  backgroundColor: colors.primary + "15", // 15 = approx 8% opacity hex
                  borderColor: "transparent",
                },
              ]}
              onPress={() => {
                onSelectSort(option.id);
                onClose();
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={
                    sortBy === option.id ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.sortText,
                    {
                      color:
                        sortBy === option.id
                          ? colors.primary
                          : colors.textSecondary,
                    },
                    sortBy === option.id && styles.sortTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              {sortBy === option.id && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sortModalContent: {
    borderRadius: 24,
    width: "80%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  sortTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  sortText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  sortTextActive: {
    fontWeight: "700",
  },
});
