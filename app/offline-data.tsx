import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/useTheme";
import { useStore } from "../store/useStore";
import { SyncService } from "../services/syncService";
import { ToastService } from "../services/toast";

export default function OfflineDataScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { recipes, myRecipes, pantry, favorites } = useStore();
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshConnection = useCallback(async () => {
    setIsChecking(true);
    setIsOnline(await SyncService.checkConnectivity());
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refreshConnection(), 0);
    return () => clearTimeout(timer);
  }, [refreshConnection]);

  const syncNow = async () => {
    if (!isOnline) {
      ToastService.info("You're offline", "Your saved recipes and pantry remain on this device.");
      return;
    }
    setIsSyncing(true);
    try {
      await SyncService.syncRecipes();
      ToastService.success("Sync complete", "Your local recipes were checked for sync.");
    } catch {
      ToastService.error("Sync failed", "Your local data is still available on this device.");
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingRecipes = myRecipes.filter((recipe) => !recipe.remoteId).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Offline data</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statusIcon, { backgroundColor: isOnline ? colors.success + "18" : colors.warning + "20" }]}>
            <Ionicons name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"} size={25} color={isOnline ? colors.success : colors.warning} />
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>{isChecking ? "Checking connection…" : isOnline ? "You're online" : "You're offline"}</Text>
            <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>Recipes and pantry selections saved on this device are available without internet.</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available on this device</Text>
        <View style={[styles.dataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DataRow icon="book-outline" label="Recipes" value={`${recipes.length + myRecipes.length}`} colors={colors} />
          <DataRow icon="bookmark-outline" label="Saved recipes" value={`${favorites.length}`} colors={colors} />
          <DataRow icon="basket-outline" label="Pantry ingredients" value={`${pantry.length}`} colors={colors} last />
        </View>

        <View style={[styles.syncCard, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.syncHeading}>
            <Ionicons name="sync-outline" size={19} color={colors.primary} />
            <Text style={[styles.syncTitle, { color: colors.text }]}>Recipe sync</Text>
          </View>
          <Text style={[styles.syncDescription, { color: colors.textSecondary }]}>
            {pendingRecipes === 0 ? "Your created recipes are up to date." : `${pendingRecipes} created ${pendingRecipes === 1 ? "recipe is" : "recipes are"} waiting to sync.`}
          </Text>
          <TouchableOpacity onPress={syncNow} disabled={isSyncing || isChecking} style={[styles.syncButton, { backgroundColor: colors.primary, opacity: isSyncing ? 0.7 : 1 }]}>
            {isSyncing ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="sync" size={17} color="#FFFFFF" />}
            <Text style={styles.syncButtonText}>{isSyncing ? "Syncing…" : "Sync now"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={refreshConnection} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={16} color={colors.primary} />
          <Text style={[styles.refreshText, { color: colors.primary }]}>Check connection again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DataRow({ icon, label, value, colors, last = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; colors: ReturnType<typeof useTheme>["colors"]; last?: boolean }) {
  return (
    <View style={[styles.dataRow, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={styles.dataLabel}>
        <Ionicons name={icon} size={19} color={colors.textSecondary} />
        <Text style={[styles.dataText, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.dataValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  content: { padding: 20, paddingBottom: 40 },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 17, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, marginBottom: 24 },
  statusIcon: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  statusDescription: { fontSize: 12, lineHeight: 17 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 11 },
  dataCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, overflow: "hidden", marginBottom: 22 },
  dataRow: { minHeight: 54, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dataLabel: { flexDirection: "row", alignItems: "center", gap: 10 },
  dataText: { fontSize: 14, fontWeight: "700" },
  dataValue: { fontSize: 13, fontWeight: "800" },
  syncCard: { padding: 17, borderRadius: 18 },
  syncHeading: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  syncTitle: { fontSize: 15, fontWeight: "800" },
  syncDescription: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  syncButton: { minHeight: 45, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  syncButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  refreshButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 16 },
  refreshText: { fontSize: 12, fontWeight: "800" },
});
