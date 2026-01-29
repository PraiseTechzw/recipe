import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { SyncService } from "./syncService";

export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Automatically link the current profile to the new user
        await this.linkProfile(data.user.id);
        useStore.getState().setSession(data.session);

        // Pull user recipes from cloud
        await SyncService.pullUserRecipes();
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Try to restore the profile associated with this user
        const restored = await this.restoreProfile(data.user.id);

        // If no profile found, link the current one
        if (!restored) {
          await this.linkProfile(data.user.id);
        }

        useStore.getState().setSession(data.session);

        // Pull user recipes from cloud
        await SyncService.pullUserRecipes();
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Sign out
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      useStore.getState().setSession(null);
      // Optional: Clear local data or keep it?
      // Keeping it fits "offline-first", but might confuse users if they expect a clear slate.
      // For now, we keep the data on device.

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Link the current local profile to the authenticated user ID
   */
  async linkProfile(userId: string) {
    const profile = useStore.getState().userProfile;

    // update profile in supabase with user_id
    const { error } = await supabase
      .from("profiles")
      .update({ user_id: userId })
      .eq("id", profile.id);

    if (error) {
      console.error("Error linking profile:", error);
      // Fallback: If update failed (maybe profile doesn't exist yet?), upsert it
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: profile.id,
        name: profile.name,
        avatar_url: profile.avatar,
        bio: profile.bio,
        country: profile.country,
        chef_level: profile.chefLevel,
        xp: profile.xp,
        badges: profile.badges,
        stats: profile.stats,
        dietary_preferences: profile.dietaryPreferences,
        user_id: userId,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        console.error("Error upserting linked profile:", upsertError);
      }
    }
  },

  /**
   * Restore profile from Supabase based on user_id
   */
  async restoreProfile(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Update local store with restored data
    useStore.getState().setUserProfile({
      id: data.id,
      name: data.name,
      avatar: data.avatar_url,
      bio: data.bio,
      country: data.country,
      chefLevel: data.chef_level,
      xp: data.xp,
      badges:
        typeof data.badges === "string" ? JSON.parse(data.badges) : data.badges,
      stats:
        typeof data.stats === "string" ? JSON.parse(data.stats) : data.stats,
      dietaryPreferences:
        typeof data.dietary_preferences === "string"
          ? JSON.parse(data.dietary_preferences)
          : data.dietary_preferences,
    });

    // If name is set, mark as onboarded
    if (data.name && data.name !== "Guest") {
      useStore.getState().setHasOnboarded(true);
    }

    // Also fetch user's recipes if needed (not implemented here, can be done via sync)

    return true;
  },
};
