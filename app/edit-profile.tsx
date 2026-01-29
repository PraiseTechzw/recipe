import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { SyncService } from "../services/syncService";
import { ToastService } from "../services/toast";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useStore();

  const [name, setName] = useState(userProfile.name);
  const chefLevel = userProfile.chefLevel;
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [bio, setBio] = useState(userProfile.bio || "");
  const [country, setCountry] = useState(
    COUNTRIES.find((c) => c.name === userProfile.country) || DEFAULT_COUNTRY,
  );
  const [showCountryModal, setShowCountryModal] = useState(false);

  const handleSave = async () => {
    setUserProfile({
      ...userProfile,
      name,
      chefLevel,
      avatar,
      bio,
      country: country.name, // Store name
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

  const selectPresetAvatar = (seed: string) => {
    setAvatar(`https://api.dicebear.com/7.x/avataaars/png?seed=${seed}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.cancelText}>{i18n.t("cancel")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t("editProfile")}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>{i18n.t("save")}</Text>
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

        {/* Preset Avatars */}
        <View style={styles.formGroup}>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t("fullName")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={i18n.t("namePlaceholder")}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Country</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={{ fontSize: 16, color: "#333" }}>
              {country.flag} {country.name}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t("level") || "Chef Level"}</Text>
          <View style={styles.levelContainer}>
            <View style={[styles.levelChip, styles.levelChipActive]}>
              <Text style={[styles.levelText, styles.levelTextActive]}>
                {chefLevel}
              </Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Level up by cooking more recipes and earning XP!
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t("bioLabel")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={i18n.t("bioPlaceholder")}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: "#666",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
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
    color: "#E65100",
    fontWeight: "600",
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#333",
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
