import * as Network from 'expo-network';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

let stateSyncStarted = false;
let stateSyncTimer: ReturnType<typeof setTimeout> | undefined;

function getSyncableAppState() {
  const state = useStore.getState();
  const profile = { ...state.userProfile };
  // Device-local file URIs and push tokens are not portable between devices.
  if (profile.avatar?.startsWith('file://')) delete profile.avatar;
  delete profile.pushToken;

  return {
    favorites: state.favorites,
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
  } catch (error) {
    // Local state remains available when anonymous auth or the migration is not configured.
    console.warn('App state sync unavailable; keeping changes on this device:', error);
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

    // Ensure user profile exists in DB first
    if (userProfile.id) {
        try {
            let avatarUrl = userProfile.avatar;
            if (avatarUrl?.startsWith('file://')) {
              const filename = `${userProfile.id}/avatar.jpg`;
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
                    id: userProfile.id,
                    name: userProfile.name,
                    avatar_url: avatarUrl,
                    bio: userProfile.bio,
                    xp: userProfile.xp,
                    chef_level: userProfile.chefLevel,
                    badges: userProfile.badges,
                    stats: userProfile.stats,
                    dietary_preferences: userProfile.dietaryPreferences,
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
                const filename = `${Date.now()}_${imageUrl.split('/').pop()}`;
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
              author_id: userProfile.id, // Using the public ID
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
    if (stateSyncStarted) return;
    if (!isSupabaseConfigured) return;
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

      const localState = useStore.getState();
      const remoteState = data?.state;
      const localIsNew = !localState.hasOnboarded && localState.userProfile.name === 'Guest';
      if (remoteState && localIsNew) {
        useStore.setState(remoteState);
      } else {
        await writeAppState();
      }

      stateSyncStarted = true;
      useStore.subscribe((state, previous) => {
        const previousSyncable = {
          favorites: previous.favorites,
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
  }
};
