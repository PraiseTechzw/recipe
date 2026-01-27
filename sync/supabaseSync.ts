import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SyncResult, SyncTask } from "./syncQueue";

const DEVICE_ID_KEY = "device_uuid";

/**
 * Gets or creates a persistent anonymous Device ID.
 * This ensures we can sync user data without requiring login.
 */
export async function getDeviceId(): Promise<string> {
  try {
    let uuid = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!uuid) {
      uuid = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem(DEVICE_ID_KEY, uuid);
    }
    return uuid;
  } catch (e) {
    // Fallback if storage fails, though this implies bigger issues
    return "temp-device-" + Date.now();
  }
}

/**
 * Maps a generic SyncTask to a specific Supabase operation.
 * Handles the "Optional" rule: catches errors and returns success: false
 * so the queue manager can handle retries without crashing UI.
 */
export async function processSupabaseTask(task: SyncTask): Promise<SyncResult> {
  try {
    const deviceId = await getDeviceId();

    // Safety check: Don't attempt if URL is placeholder
    // (This prevents 404/Connection refused errors in dev)
    // Accessing internal property is risky, so we just try/catch the call.

    let error = null;

    switch (task.entity) {
      case "RECIPE":
        error = await syncRecipe(task, deviceId);
        break;
      // Add other entities here: USER_PROFILE, PANTRY, etc.
      default:
        return { success: true }; // Unknown entity, skip to avoid blocking queue
    }

    if (error) {
      console.warn(`[Sync] Supabase error for ${task.id}:`, error);
      return { success: false, error: JSON.stringify(error) };
    }

    return { success: true };
  } catch (e: any) {
    console.warn(`[Sync] Network/Logic error for ${task.id}:`, e);
    // Return false to trigger retry logic in queue
    return { success: false, error: e.message };
  }
}

// ============================================================================
// ENTITY HANDLERS
// ============================================================================

async function syncRecipe(task: SyncTask, deviceId: string) {
  const table = "recipes";
  const { payload } = task;

  // Add device_id owner to payload for RLS policies
  const dataWithOwner = { ...payload, device_id: deviceId };

  let result;

  if (task.type === "CREATE") {
    result = await supabase.from(table).insert(dataWithOwner);
  } else if (task.type === "UPDATE") {
    // Assuming payload has id
    const { id, ...updates } = dataWithOwner;
    result = await supabase
      .from(table)
      .update(updates)
      .eq("id", id)
      .eq("device_id", deviceId);
  } else if (task.type === "DELETE") {
    result = await supabase
      .from(table)
      .delete()
      .eq("id", payload.id)
      .eq("device_id", deviceId);
  }

  return result?.error;
}
