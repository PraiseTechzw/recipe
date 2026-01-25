import * as Network from 'expo-network';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const SyncService = {
  async checkConnectivity() {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.isConnected && state.isInternetReachable;
    } catch (e) {
      console.warn('Network check failed:', e);
      return false;
    }
  },

  async syncRecipes() {
    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      console.log('Offline: Skipping sync');
      return;
    }

    const { myRecipes, updateRecipe, userProfile } = useStore.getState();

    // Ensure user profile exists in DB first
    if (userProfile.id) {
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userProfile.id,
                    name: userProfile.name,
                    avatar_url: userProfile.avatar,
                    bio: userProfile.bio,
                    xp: userProfile.xp,
                    chef_level: userProfile.chefLevel,
                    badges: userProfile.badges,
                    stats: userProfile.stats
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
            if (error.message?.includes('placeholder') || !supabase.supabaseUrl.includes('supabase.co')) {
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
  }
};
