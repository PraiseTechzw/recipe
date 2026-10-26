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
import { captureAnalytics } from "../lib/posthog";
import { SyncService } from "../services/syncService";
import { ToastService } from "../services/toast";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userProfile, setUserProfile } = useStore();

  const [name, setName] = useState(userProfile.name);
  const chefLevel = userProfile.chefLevel;
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [bio, setBio] = useState(userProfile.bio || "");

  const handleSave = async () => {
    setUserProfile({
      ...userProfile,
      name,
      chefLevel,
      avatar,
      bio,
    });
    captureAnalytics("profile_updated", {
      has_avatar: Boolean(avatar),
      has_bio: Boolean(bio.trim()),
    });

    const isOnline = await SyncService.checkConnectivity();
    if (isOnline) {
      // Trigger sync if needed, or just let background sync handle it
      SyncService.syncRecipes(); // Syncs profile too
      ToastService.success(
        i18n.t("success"),
        i18n.t("profileUpdated") || "Profile Updated",
      );
    } else {
      ToastService.info(i18n.t("savedLocally"), i18n.t("syncLater"));
    }

    router.back();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{i18n.t("cancel")}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{i18n.t("editProfile")}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveText, { color: colors.primary }]}>{i18n.t("save")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: "#E65100",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
            <Text style={styles.changePhotoText}>{i18n.t("changePhoto")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t("fullName")}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={i18n.t("namePlaceholder")}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t("level") || "Chef Level"}</Text>
          <View style={styles.levelContainer}>
            <View style={[styles.levelChip, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.levelText, { color: colors.primary }]}>
                {chefLevel}
              </Text>
            </View>
          </View>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Level up by cooking more recipes and earning XP!
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{i18n.t("bioLabel")}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
            placeholder={i18n.t("bioPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoBtn: {
    padding: 8,
  },
  changePhotoText: {
    fontWeight: "600",
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
  },
  levelContainer: {
    flexDirection: "row",
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eee",
  },
  levelChipActive: {
    backgroundColor: "#FFF3E0",
    borderColor: "#E65100",
  },
  levelText: {
    fontSize: 14,
    color: "#666",
  },
  levelTextActive: {
    color: "#E65100",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
});
