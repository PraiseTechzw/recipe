import * as Network from "expo-network";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";

export const SyncService = {
  async checkConnectivity() {
    try {
      const state = await Network.getNetworkStateAsync();
      return state.isConnected && state.isInternetReachable;
    } catch (e) {
      console.warn("Network check failed:", e);
      return false;
    }
  },

  async syncRecipes() {
    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      console.log("Offline: Skipping sync");
      return;
    }

    const { myRecipes, updateRecipe, userProfile } = useStore.getState();

    // Ensure user profile exists in DB first
    if (userProfile.id) {
      try {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userProfile.id,
            name: userProfile.name,
            avatar_url: userProfile.avatar,
            bio: userProfile.bio,
            country: userProfile.country,
            xp: userProfile.xp,
            chef_level: userProfile.chefLevel,
            badges: userProfile.badges,
            stats: userProfile.stats,
          },
          { onConflict: "id" },
        );

        if (profileError) console.warn("Profile sync error:", profileError);
      } catch (e) {
        console.warn("Profile sync failed:", e);
      }
    }

    const unsyncedRecipes = myRecipes.filter((r) => !r.remoteId);

    if (unsyncedRecipes.length === 0) return;

    console.log(`Syncing ${unsyncedRecipes.length} recipes...`);

    for (const recipe of unsyncedRecipes) {
      try {
        // Remove local-only fields and format for DB
        const {
          id,
          remoteId,
          image,
          author,
          isTraditional,
          reviews,
          ...recipeData
        } = recipe;

        let imageUrl = typeof image === "string" ? image : image?.uri || null;

        // Try to upload image if it's a local URI
        if (imageUrl && imageUrl.startsWith("file://")) {
          try {
            const filename = `${Date.now()}_${imageUrl.split("/").pop()}`;
            const formData = new FormData();
            formData.append("file", {
              uri: imageUrl,
              name: filename,
              type: "image/jpeg",
            } as any);

            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("recipes").upload(filename, formData);

            if (uploadError) {
              console.log(
                "Image upload skipped (Storage not configured):",
                uploadError.message,
              );
            } else if (uploadData) {
              const { data: publicUrlData } = supabase.storage
                .from("recipes")
                .getPublicUrl(uploadData.path);
              imageUrl = publicUrlData.publicUrl;
            }
          } catch (imgErr) {
            console.log("Image upload logic failed:", imgErr);
          }
        }

        const { data, error } = await supabase
          .from("recipes")
          .upsert(
            {
              author_id: userProfile.id,
              original_id: id,
              title: recipeData.title,
              description: recipeData.description,
              image_url: imageUrl,
              category: recipeData.category,
              tags: recipeData.tags,
              time: recipeData.time,
              servings: recipeData.servings,
              calories: recipeData.calories,
              ingredients: recipeData.ingredients,
              steps: recipeData.steps,
              is_traditional: isTraditional,
            },
            { onConflict: "original_id" }, // Use original_id to prevent dupes if remoteId missing?
            // Actually, if we have remoteId, we should use it.
            // But for now, we assume simple sync.
          )
          .select();

        if (error) {
          console.error(`Failed to sync recipe ${recipe.title}:`, error);
        } else if (data && data[0]) {
          // Update local recipe with remote ID
          updateRecipe(id, { remoteId: data[0].id });
        }
      } catch (e) {
        console.error(`Sync error for ${recipe.title}:`, e);
      }
    }
  },

  async pullUserRecipes() {
    const isOnline = await this.checkConnectivity();
    if (!isOnline) return;

    const { userProfile, addRecipe, myRecipes } = useStore.getState();

    if (!userProfile.id) return;

    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("author_id", userProfile.id);

      if (error) {
        console.error("Error pulling recipes:", error);
        return;
      }

      if (data && data.length > 0) {
        const localRemoteIds = new Set(
          myRecipes.map((r) => r.remoteId).filter(Boolean),
        );

        data.forEach((remoteRecipe) => {
          if (!localRemoteIds.has(remoteRecipe.id)) {
            const newRecipe: any = {
              id: remoteRecipe.id,
              remoteId: remoteRecipe.id,
              title: remoteRecipe.title,
              description: remoteRecipe.description,
              image: remoteRecipe.image_url,
              category: remoteRecipe.category,
              tags: remoteRecipe.tags || [],
              time: remoteRecipe.time,
              servings: remoteRecipe.servings,
              calories: remoteRecipe.calories,
              ingredients: remoteRecipe.ingredients || [],
              steps: remoteRecipe.steps || [],
              isTraditional: remoteRecipe.is_traditional,
              rating: remoteRecipe.rating,
              author: {
                name: userProfile.name,
                avatar: userProfile.avatar,
                country: userProfile.country,
              },
            };
            addRecipe(newRecipe);
          }
        });
      }
    } catch (e) {
      console.warn("Pull recipes failed:", e);
    }
  },
};
