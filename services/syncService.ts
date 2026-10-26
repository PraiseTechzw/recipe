import * as Network from 'expo-network';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

let stateSyncStarted = false;
let stateSyncTimer: ReturnType<typeof setTimeout> | undefined;
let lastLeaderboardSyncSignature: string | null = null;

function getSyncableAppState() {
  const state = useStore.getState();
  const profile = { ...state.userProfile };
  // Device-local file URIs and push tokens are not portable between devices.
  if (profile.avatar?.startsWith('file://')) delete profile.avatar;
  delete profile.pushToken;

  return {
    favorites: state.favorites,
    xpRewardedFavoriteIds: state.xpRewardedFavoriteIds,
    shoppingList: state.shoppingList,
    pantry: state.pantry,
    hasOnboarded: state.hasOnboarded,
    userProfile: profile,
    viewHistory: state.viewHistory,
    categoryScores: state.categoryScores,
    isDarkMode: state.isDarkMode,
    locale: state.locale,
    notificationPreferences: state.notificationPreferences,
    notifications: state.notifications,
  };
}

function mergeSignedInState(remoteState: any) {
  const local = getSyncableAppState();
  const remote = remoteState ?? {};
  const mergeUnique = (left: string[] = [], right: string[] = []) =>
    Array.from(new Set([...left, ...right]));
  const mergeShoppingList = (left: any[] = [], right: any[] = []) => {
    const items = new Map<string, any>();
    for (const item of [...left, ...right]) {
      const key = `${String(item.name ?? "").trim().toLowerCase()}|${String(item.quantity ?? "").trim().toLowerCase()}`;
      const existing = items.get(key);
      items.set(key, existing ? { ...existing, ...item, checked: existing.checked || item.checked } : item);
    }
    return Array.from(items.values());
  };

  const localProfile = local.userProfile;
  const remoteProfile = remote.userProfile ?? {};
  const categories = new Set([
    ...Object.keys(local.categoryScores),
    ...Object.keys(remote.categoryScores ?? {}),
  ]);

  return {
    ...local,
    ...remote,
    favorites: mergeUnique(remote.favorites, local.favorites),
    xpRewardedFavoriteIds: mergeUnique(remote.xpRewardedFavoriteIds, local.xpRewardedFavoriteIds),
    pantry: mergeUnique(remote.pantry, local.pantry),
    shoppingList: mergeShoppingList(remote.shoppingList, local.shoppingList),
    hasOnboarded: true,
    userProfile: {
      ...localProfile,
      ...remoteProfile,
      name: remoteProfile.name && remoteProfile.name !== "Guest"
        ? remoteProfile.name
        : localProfile.name,
      badges: mergeUnique(remoteProfile.badges, localProfile.badges),
      dietaryPreferences: mergeUnique(
        remoteProfile.dietaryPreferences,
        localProfile.dietaryPreferences,
      ),
      stats: { ...localProfile.stats, ...remoteProfile.stats },
    },
    viewHistory: mergeUnique(local.viewHistory, remote.viewHistory).slice(0, 20),
    categoryScores: Object.fromEntries(
      Array.from(categories, (category) => [
        category,
        Math.max(local.categoryScores[category] ?? 0, remote.categoryScores?.[category] ?? 0),
      ]),
    ),
    locale: remote.locale ?? local.locale,
    isDarkMode: remote.isDarkMode ?? local.isDarkMode,
    notificationPreferences: {
      ...local.notificationPreferences,
      ...remote.notificationPreferences,
    },
    notifications: mergeUnique(
      (remote.notifications ?? []).map((notification: any) => notification.id),
      local.notifications.map((notification) => notification.id),
    ).map((id) =>
      local.notifications.find((notification) => notification.id === id) ??
      remote.notifications.find((notification: any) => notification.id === id),
    ),
  };
}

async function ensureSupabaseSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

async function writeAppState() {
  if (!(await SyncService.checkConnectivity())) return;
  try {
    const session = await ensureSupabaseSession();
    if (!session?.user.id) return;
    const { error } = await supabase.from('chef_app_state').upsert({
      auth_user_id: session.user.id,
      state: getSyncableAppState(),
    }, { onConflict: 'auth_user_id' });
    if (error) throw error;

    const profile = getSyncableAppState().userProfile;
    const leaderboardSignature = JSON.stringify({
      authUserId: session.user.id,
      chefId: profile.id,
      name: profile.name,
      xp: profile.xp,
      weeklyXp: profile.weeklyXp ?? 0,
      weeklyXpWeek: profile.weeklyXpWeek ?? null,
      badges: profile.badges,
    });
    if (leaderboardSignature !== lastLeaderboardSyncSignature) {
      const { error: leaderboardError } = await supabase.functions.invoke('sync-leaderboard');
      if (leaderboardError) throw leaderboardError;
      lastLeaderboardSyncSignature = leaderboardSignature;
    }
  } catch (error) {
    // Local progress remains available when Supabase migrations/functions are not deployed.
    console.warn('App state or leaderboard sync unavailable; keeping progress on this device:', error);
  }
}

function scheduleAppStateSync() {
  if (stateSyncTimer) clearTimeout(stateSyncTimer);
  stateSyncTimer = setTimeout(() => { void writeAppState(); }, 1200);
}

async function waitForLocalStateHydration() {
  const persist = useStore.persist;
  if (persist.hasHydrated()) return;
  await new Promise<void>((resolve) => {
    persist.onFinishHydration(() => resolve());
  });
}

export const SyncService = {
  async checkConnectivity() {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (e) {
      console.warn('Network check failed:', e);
      return false;
    }
  },

  async syncRecipes() {
    if (!isSupabaseConfigured) return;
    await waitForLocalStateHydration();
    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      console.log('Offline: Skipping sync');
      return;
    }

    const { myRecipes, updateRecipe, userProfile } = useStore.getState();
    const session = await ensureSupabaseSession();
    if (!session?.user.id) return;
    const authUserId = session.user.id;

    // Ensure user profile exists in DB first
    if (userProfile.id) {
        try {
            let avatarUrl = userProfile.avatar;
            if (avatarUrl?.startsWith('file://')) {
              const filename = `${authUserId}/avatar.jpg`;
              const formData = new FormData();
              formData.append('file', {
                uri: avatarUrl,
                name: 'avatar.jpg',
                type: 'image/jpeg',
              } as any);
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filename, formData, { contentType: 'image/jpeg', upsert: true });
              if (uploadError) {
                console.warn('Avatar upload failed:', uploadError.message);
              } else if (uploadData) {
                avatarUrl = supabase.storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl;
                useStore.getState().setUserProfile({ avatar: avatarUrl });
              }
            }
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authUserId,
                    auth_user_id: authUserId,
                    name: userProfile.name,
                    avatar_url: avatarUrl,
                    bio: userProfile.bio,
                }, { onConflict: 'id' });
            
            if (profileError) console.warn('Profile sync error:', profileError);
        } catch (e) {
            console.warn('Profile sync failed:', e);
        }
    }

    const unsyncedRecipes = myRecipes.filter(r => !r.remoteId);

    if (unsyncedRecipes.length === 0) return;

    console.log(`Syncing ${unsyncedRecipes.length} recipes...`);

    for (const recipe of unsyncedRecipes) {
      try {
        // Remove local-only fields and format for DB
        const { id, remoteId, image, author, isTraditional, reviews, ...recipeData } = recipe;
        
        let imageUrl = typeof image === 'string' ? image : (image?.uri || null);

        // Try to upload image if it's a local URI
        if (imageUrl && imageUrl.startsWith('file://')) {
            try {
                const filename = `${authUserId}/${Date.now()}_${imageUrl.split('/').pop()}`;
                const formData = new FormData();
                formData.append('file', {
                    uri: imageUrl,
                    name: filename,
                    type: 'image/jpeg',
                } as any);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('recipes')
                    .upload(filename, formData);

                if (uploadError) {
                    console.log('Image upload skipped (Storage not configured):', uploadError.message);
                } else if (uploadData) {
                    const { data: publicUrlData } = supabase.storage
                        .from('recipes')
                        .getPublicUrl(uploadData.path);
                    imageUrl = publicUrlData.publicUrl;
                }
            } catch (imgErr) {
                console.log('Image upload logic failed:', imgErr);
            }
        }

        const { data, error } = await supabase
          .from('recipes')
          .insert([
            {
              ...recipeData,
              is_traditional: isTraditional,
              reviews_count: reviews || 0,
              author_id: authUserId,
              original_id: id,
              image_url: imageUrl,
              ingredients: recipe.ingredients, // JSONB
              steps: recipe.steps, // JSONB
            }
          ])
          .select()
          .single();

        if (error) {
            // Check if it's the "placeholder" error or connection error
            console.warn('Sync warning:', error.message);
            // If Supabase is not configured, we stop to avoid spamming errors
            if (error.message?.includes('placeholder')) {
                console.log('Supabase not configured. Sync simulated.');
                // Simulate sync for demo purposes if desired, or just return
                return; 
            }
            throw error;
        }

        if (data) {
          updateRecipe(id, { remoteId: data.id });
          console.log(`Synced recipe: ${recipe.title}`);
        }
      } catch (error) {
        console.warn(`Failed to sync recipe ${recipe.title}:`, error);
      }
    }
  },

  async initializeAppStateSync() {
    if (!isSupabaseConfigured) return;
    if (stateSyncStarted) {
      await writeAppState();
      return;
    }
    if (!(await this.checkConnectivity())) return;

    try {
      await waitForLocalStateHydration();
      const session = await ensureSupabaseSession();
      if (!session?.user.id) return;
      const { data, error } = await supabase
        .from('chef_app_state')
        .select('state')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();
      if (error) throw error;

      const remoteState = data?.state;
      if (remoteState) useStore.setState(mergeSignedInState(remoteState));
      await writeAppState();

      stateSyncStarted = true;
      useStore.subscribe((state, previous) => {
        const previousSyncable = {
          favorites: previous.favorites,
          xpRewardedFavoriteIds: previous.xpRewardedFavoriteIds,
          shoppingList: previous.shoppingList,
          pantry: previous.pantry,
          hasOnboarded: previous.hasOnboarded,
          userProfile: previous.userProfile,
          viewHistory: previous.viewHistory,
          categoryScores: previous.categoryScores,
          isDarkMode: previous.isDarkMode,
          locale: previous.locale,
          notificationPreferences: previous.notificationPreferences,
          notifications: previous.notifications,
        };
        if (JSON.stringify(getSyncableAppState()) !== JSON.stringify(previousSyncable)) {
          scheduleAppStateSync();
        }
        if (JSON.stringify(state.userProfile) !== JSON.stringify(previous.userProfile)) {
          void SyncService.syncRecipes();
        }
      });
    } catch (error) {
      console.warn('Could not initialize Supabase app state sync:', error);
      // Keep trying on later state changes if configuration becomes available.
      stateSyncStarted = false;
    }
  },

  async restoreSignedInAccountState() {
    if (!isSupabaseConfigured) return;
    try {
      await waitForLocalStateHydration();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData.session?.user.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('chef_app_state')
        .select('state')
        .eq('auth_user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data?.state) useStore.setState(mergeSignedInState(data.state));
      await writeAppState();
    } catch (error) {
      // Account sign-in should still complete if state sync is temporarily unavailable.
      console.warn('Could not restore cloud app state after sign-in:', error);
    }
  }
};
