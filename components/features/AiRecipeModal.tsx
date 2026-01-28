import React from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';

interface AiRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  isGenerating: boolean;
  aiRecipe: any;
  onSave: () => void;
}

export const AiRecipeModal = ({ visible, onClose, isGenerating, aiRecipe, onSave }: AiRecipeModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E65100" />
              <Text style={styles.loadingText}>{i18n.t("analyzing")}</Text>
              <Text style={styles.loadingSubText}>{i18n.t("poweredBy")}</Text>
            </View>
          ) : aiRecipe ? (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.aiTitle}>{aiRecipe.title}</Text>
                <Text style={styles.aiDescription}>{aiRecipe.description}</Text>

                <View style={styles.aiMetaRow}>
                  <View style={styles.aiMetaItem}>
                    <Ionicons name="time-outline" size={16} color="#E65100" />
                    <Text style={styles.aiMetaText}>{aiRecipe.time}</Text>
                  </View>
                  <View style={styles.aiMetaItem}>
                    <Ionicons name="flame-outline" size={16} color="#E65100" />
                    <Text style={styles.aiMetaText}>{aiRecipe.calories}</Text>
                  </View>
                </View>

                <Text style={styles.aiSectionTitle}>Ingredients</Text>
                {aiRecipe.ingredients?.map((ing: any, i: number) => (
                  <Text key={i} style={styles.aiListItem}>
                    • {ing.quantity} {ing.name}
                  </Text>
                ))}

                <Text style={styles.aiSectionTitle}>Steps</Text>
                {aiRecipe.steps?.map((step: string, i: number) => (
                  <View key={i} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}

                <View style={{ height: 80 }} />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={onSave}
                >
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>
                    {i18n.t("saveRecipe")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </View>
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
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    width: "100%",
    maxHeight: "80%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  aiDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  aiMetaRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  aiMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  aiMetaText: {
    marginLeft: 6,
    color: "#666",
    fontWeight: "500",
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    marginTop: 8,
  },
  aiListItem: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    paddingLeft: 8,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  modalActions: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  saveButton: {
    backgroundColor: "#E65100",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#E65100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF3E0",
    color: "#E65100",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
});
