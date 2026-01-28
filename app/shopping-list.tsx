import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    Swipeable,
} from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import i18n from "../i18n";
import { HapticService } from "../services/haptics";
import { ToastService } from "../services/toast";
import { useStore } from "../store/useStore";

export default function ShoppingListScreen() {
  const router = useRouter();
  const {
    shoppingList,
    addToShoppingList,
    toggleShoppingItem,
    removeFromShoppingList,
    clearShoppingList,
  } = useStore();
  const [newItemName, setNewItemName] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // Group items
  const pendingItems = shoppingList.filter((item) => !item.checked);
  const completedItems = shoppingList.filter((item) => item.checked);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    HapticService.medium();
    addToShoppingList([{ name: newItemName.trim(), quantity: "1" }]);
    setNewItemName("");
    ToastService.success(
      i18n.t("addedTo") + " " + i18n.t("shoppingList"),
      newItemName.trim(),
    );
  };

  const handleToggle = (id: string) => {
    HapticService.light();
    toggleShoppingItem(id);
  };

  const handleDelete = (item: {
    id: string;
    name: string;
    quantity?: string;
  }) => {
    HapticService.warning();
    removeFromShoppingList(item.id);

    ToastService.action(
      i18n.t("removed"),
      item.name,
      i18n.t("undo") || "Undo",
      () => {
        addToShoppingList([
          { name: item.name, quantity: item.quantity || "1" },
        ]);
      }
    );
  };

  const handleClear = () => {
    Alert.alert(i18n.t("clear"), i18n.t("clearListConfirm"), [
      { text: i18n.t("cancel"), style: "cancel" },
      {
        text: i18n.t("clear"),
        style: "destructive",
        onPress: clearShoppingList,
      },
    ]);
  };

  const renderRightActions = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(item)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  const ShoppingItemRow = ({ item }: { item: any }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <Animated.View
        layout={Layout.springify()}
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.itemRow, item.checked && styles.itemChecked]}
      >
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => handleToggle(item.id)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.checkbox, item.checked && styles.checkboxChecked]}
          >
            {item.checked && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, item.checked && styles.textChecked]}>
              {item.name}
            </Text>
            {item.quantity && (
              <Text style={styles.itemQuantity}>{item.quantity}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{i18n.t("shoppingList")}</Text>
          <TouchableOpacity
            onPress={handleClear}
            disabled={shoppingList.length === 0}
          >
            <Text
              style={[
                styles.clearText,
                shoppingList.length === 0 && styles.disabledText,
              ]}
            >
              {i18n.t("clear")}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quick Add Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={i18n.t("addItem") || "Add item..."}
                value={newItemName}
                onChangeText={setNewItemName}
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !newItemName.trim() && styles.addButtonDisabled,
                ]}
                onPress={handleAddItem}
                disabled={!newItemName.trim()}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {shoppingList.length === 0 ? (
              <EmptyState
                title={
                  i18n.t("emptyShoppingList") || "Your shopping list is empty"
                }
                description={
                  i18n.t("emptyShoppingListDesc") ||
                  "Add ingredients from recipes or manually add items above."
                }
                icon="basket-outline"
                style={{ marginTop: 40 }}
              />
            ) : (
              <View style={styles.listContainer}>
                {/* Pending Items */}
                <View style={styles.section}>
                  {pendingItems.map((item) => (
                    <ShoppingItemRow key={item.id} item={item} />
                  ))}
                </View>

                {/* Completed Items */}
                {completedItems.length > 0 && (
                  <View style={styles.completedSection}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.easeInEaseOut,
                        );
                        setShowCompleted(!showCompleted);
                      }}
                    >
                      <Text style={styles.sectionTitle}>
                        {i18n.t("completed") || "Completed"} (
                        {completedItems.length})
                      </Text>
                      <Ionicons
                        name={showCompleted ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#757575"
                      />
                    </TouchableOpacity>

                    {showCompleted && (
                      <View style={styles.section}>
                        {completedItems.map((item) => (
                          <ShoppingItemRow key={item.id} item={item} />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  clearText: {
    color: "#FF5252",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledText: {
    color: "#E0E0E0",
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E65100",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: "#FFCCBC",
    shadowOpacity: 0,
    elevation: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#E65100",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  completedSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRow: {
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  itemChecked: {
    backgroundColor: "#FAFAFA",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  textChecked: {
    color: "#9E9E9E",
    textDecorationLine: "line-through",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
});
