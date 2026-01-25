-- 1. Insert Praisetech Profile
INSERT INTO public.profiles (id, name, avatar_url, bio, chef_level, xp, badges)
VALUES (
    'praisetech-official',
    'Praisetech',
    'https://github.com/shadcn.png',
    'Official account for Top Zimbabwean Recipes.',
    'Master Chef',
    99999,
    '["Verified", "Admin"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Top Recipes (Examples)
-- Note: The app's SeedService automatically syncs all recipes from data/recipes.ts to Supabase on startup.
-- Below are manual SQL statements for the same data if needed.

-- Recipe 1: Sadza & Beef Stew
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '1',
    'Sadza & Beef Stew',
    'A staple dish of thick cornmeal porridge served with tender beef stew and greens.',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000&auto=format&fit=crop',
    'Dinner',
    '["ZIMBABWEAN", "Traditional"]'::jsonb,
    '45 Mins',
    4,
    '520 Kcal',
    '[
      {"title": "Beef Stew", "data": [{"name": "Beef brisket", "quantity": "500g", "description": "Cubed into bite-sized pieces"}, {"name": "Onion", "quantity": "1", "description": "Large, finely chopped"}, {"name": "Tomatoes", "quantity": "2", "description": "Ripe, diced"}, {"name": "Kale (Covo)", "quantity": "1 Bundle", "description": "Washed and chopped"}, {"name": "Spices", "quantity": "", "description": "Salt, Pepper, Paprika to taste"}]},
      {"title": "Sadza (Pap)", "data": [{"name": "Mealie-meal", "quantity": "2 cups", "description": "White cornmeal (Upfu)"}, {"name": "Water", "quantity": "4 cups", "description": "Boiling"}]}
    ]'::jsonb,
    '[
      {"instruction": "In a large pot, brown the beef brisket pieces in oil until golden."},
      {"instruction": "Add onions and sauté until soft. Add tomatoes and cook until they break down."},
      {"instruction": "Add water/stock, cover, and simmer for 45 minutes until beef is tender."},
      {"instruction": "Add the chopped kale and simmer for another 5 minutes."},
      {"instruction": "For Sadza: Bring water to a boil. Whisk in half the mealie-meal to make a porridge."},
      {"instruction": "Cover and cook for 15 mins. Gradually add remaining mealie-meal while stirring vigorously until thick."}
    ]'::jsonb,
    true,
    4.8
);

-- Recipe 2: Dovi
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '2',
    'Dovi (Peanut Butter Stew)',
    'A rich and creamy peanut butter stew usually made with chicken or beef.',
    'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop',
    'Stew',
    '["TRENDING", "Hearty"]'::jsonb,
    '45 Mins',
    4,
    '320 Kcal',
    '[
        {"title": "Stew", "data": [{"name": "Chicken pieces", "quantity": "1kg"}, {"name": "Peanut Butter", "quantity": "1 cup", "description": "Smooth"}, {"name": "Greens", "quantity": "1 bunch", "description": "Spinach or Covo"}]}
    ]'::jsonb,
    '[
        {"instruction": "Brown the chicken pieces in a large pot with oil until golden brown.", "description": "Searing the chicken seals in the juices and adds flavor to the stew.", "image": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop"},
        {"instruction": "Add onions, garlic, and tomatoes to the pot.", "description": "Sauté the vegetables until the onions are soft and the tomatoes have broken down into a paste.", "tip": "Add a pinch of salt to help the onions sweat and release their moisture faster."},
        {"instruction": "Stir in the peanut butter until the sauce thickens", "description": "Ensure the peanut butter is fully incorporated into the broth to create a smooth, creamy base.", "tip": "Use smooth peanut butter for a velvety texture, or crunchy if you prefer a bit of texture in your Dovi.", "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop", "highlightedWord": "thickens"},
        {"instruction": "Simmer gently until the chicken is fully cooked.", "description": "Let the stew bubble on low heat. The sauce should coat the back of a spoon.", "image": "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop"},
        {"instruction": "Add the greens in the last 5 minutes of cooking.", "description": "This ensures the greens remain vibrant and retain their nutrients.", "tip": "Do not overcook the greens; they should be just wilted."}
    ]'::jsonb,
    true,
    4.9
);

-- Recipe 3: Mopane Worms
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '3',
    'Mopane Worms',
    'A high-protein traditional delicacy, crunchy and savory.',
    'https://www.tfpd.co.za/wp-content/uploads/2018/02/IMG_3592.jpg',
    'High Protein',
    '["Exotic", "Protein"]'::jsonb,
    '35 Mins',
    2,
    '200 Kcal',
    '[{"title": "Main", "data": [{"name": "Mopane Worms", "quantity": "2 cups", "description": "Dried"}]}]'::jsonb,
    '[{"instruction": "Soak worms in hot water."}, {"instruction": "Fry with onions and tomatoes."}]'::jsonb,
    true,
    0
);

-- Recipe 4: Nhopi
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '4',
    'Nhopi (Pumpkin Mash)',
    'Sweet pumpkin mash blended with peanut butter.',
    'https://images.unsplash.com/photo-1506917728037-b6af011571e2?q=80&w=1000&auto=format&fit=crop',
    'Vegetarian',
    '["Vegetarian", "Sweet"]'::jsonb,
    '25 Mins',
    4,
    '180 Kcal',
    '[]'::jsonb,
    '[]'::jsonb,
    true,
    0
);

-- Recipe 5: Mutakura
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '5',
    'Mutakura',
    'A mixture of maize and peanuts/beans boiled together.',
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=1000&auto=format&fit=crop',
    'Grains',
    '["Grains", "Filling"]'::jsonb,
    '90 Mins',
    6,
    '400 Kcal',
    '[]'::jsonb,
    '[]'::jsonb,
    true,
    0
);

-- Recipe 6: Maheu
INSERT INTO public.recipes (author_id, original_id, title, description, image_url, category, tags, time, servings, calories, ingredients, steps, is_traditional, rating)
VALUES (
    'praisetech-official',
    '6',
    'Maheu (Sorghum Drink)',
    'A traditional non-alcoholic fermented drink made from maize or sorghum meal.',
    'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1000&auto=format&fit=crop',
    'Drinks',
    '["Drinks", "Fermented", "Traditional"]'::jsonb,
    '24 Hrs',
    6,
    '150 Kcal',
    '[
        {"title": "Base", "data": [{"name": "Sorghum/Mealie Meal", "quantity": "1 cup"}, {"name": "Water", "quantity": "4 cups"}]},
        {"title": "Fermentation", "data": [{"name": "Malt/Flour", "quantity": "2 tbsp"}, {"name": "Sugar", "quantity": "to taste"}]}
    ]'::jsonb,
    '[
        {"instruction": "Boil water and mealie meal to make a thin porridge."},
        {"instruction": "Let it cool completely."},
        {"instruction": "Stir in malt or wheat flour."},
        {"instruction": "Cover and leave in a warm place for 24 hours to ferment."},
        {"instruction": "Serve chilled."}
    ]'::jsonb,
    true,
    0
);
