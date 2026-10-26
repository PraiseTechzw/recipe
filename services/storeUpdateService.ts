import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";
import { Alert, Linking } from "react-native";

const UPDATE_FEED_URL = "https://praisetechzw.github.io/recipe/update.json";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.appixiasoftwares.tasteofzimbabwe";
const LAST_CHECK_KEY = "store-update:last-check";
const LAST_PROMPTED_KEY = "store-update:last-prompted-version";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

type UpdateFeed = { version?: string; storeUrl?: string; minimumVersion?: string };

function compareVersions(left: string, right: string): number {
  const a = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const b = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export async function checkForStoreUpdate(): Promise<void> {
  if (isRunningInExpoGo()) return;

  const lastCheck = Number(await AsyncStorage.getItem(LAST_CHECK_KEY)) || 0;
  if (Date.now() - lastCheck < CHECK_INTERVAL_MS) return;
  await AsyncStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

  try {
    const response = await fetch(UPDATE_FEED_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return;

    const feed = (await response.json()) as UpdateFeed;
    const currentVersion = Constants.expoConfig?.version;
    const latestVersion = feed.version;
    if (!currentVersion || !latestVersion || compareVersions(latestVersion, currentVersion) <= 0) return;

    const lastPrompted = await AsyncStorage.getItem(LAST_PROMPTED_KEY);
    if (lastPrompted === latestVersion) return;
    await AsyncStorage.setItem(LAST_PROMPTED_KEY, latestVersion);

    Alert.alert(
      "A new version is ready",
      `Zimbabwe Traditional Recipes ${latestVersion} is available on Google Play. Update for the latest improvements and fixes.`,
      [
        { text: "Later", style: "cancel" },
        {
          text: "Update",
          onPress: () => void Linking.openURL(feed.storeUrl || PLAY_STORE_URL),
        },
      ],
      { cancelable: true },
    );
  } catch {
    // Update checks are best-effort and should never interrupt app startup.
  }
}
