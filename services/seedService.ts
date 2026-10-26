import { supabase } from '../lib/supabase';
import { RECIPES } from '../data/recipes';

const PRAISETECH_ID = 'praisetechzw';

export const SeedService = {
  async seedInitialData() {
    console.log('🌱 Starting seed process...');

    // 1. Ensure Praise Masunga's official public chef profile exists
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: PRAISETECH_ID,
        name: 'Praise Masunga',
        avatar_url: 'https://github.com/PraiseTechzw.png',
        bio: 'Official account for Zimbabwe Traditional Recipes.',
        chef_level: 'Master Chef',
        xp: 99999,
        badges: ['Verified', 'Admin'],
      }, { onConflict: 'id' });

      if (profileError) console.error('Failed to sync official profile:', profileError);
    } catch (e) {
      console.error('Official profile sync failed:', e);
    }

    // 2. Sync Top Recipes
    for (const recipe of RECIPES) {
      try {
        // Check if recipe exists (by original_id or title)
        const { data: existing } = await supabase
          .from('recipes')
          .select('id')
          .eq('original_id', recipe.id)
          .eq('author_id', PRAISETECH_ID)
          .single();

        if (!existing) {
          console.log(`Uploading recipe: ${recipe.title}`);
          
          const { error: recipeError } = await supabase
            .from('recipes')
            .insert({
              author_id: PRAISETECH_ID,
              original_id: recipe.id,
              title: recipe.title,
              description: recipe.description,
              image_url: typeof recipe.image === 'string' ? recipe.image : null, // Handle require() images later if needed
              category: recipe.category,
              tags: recipe.tags,
              time: recipe.time,
              servings: recipe.servings,
              calories: recipe.calories,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              is_traditional: recipe.isTraditional,
              rating: recipe.rating || 0,
            });

          if (recipeError) {
             console.error(`Failed to upload ${recipe.title}:`, recipeError);
          }
        } else {
            // console.log(`Skipping ${recipe.title} (already exists)`);
        }
      } catch (e) {
        console.error(`Recipe seed failed for ${recipe.title}:`, e);
      }
    }

    console.log('✅ Seed process completed.');
  }
};
