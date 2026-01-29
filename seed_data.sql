-- ============================================================================
-- SEED DATA FOR RECIPE APP
-- ============================================================================

-- 1. LEVELS (XP Thresholds)
-- Logic: Level N requires roughly 100 * N^1.5 XP
INSERT INTO public.levels (level, min_xp, title) VALUES
(1, 0, 'Novice Cook'),
(2, 100, 'Kitchen Helper'),
(3, 300, 'Line Cook'),
(4, 600, 'Sous Chef'),
(5, 1000, 'Head Chef'),
(6, 1500, 'Executive Chef'),
(7, 2100, 'Master Chef'),
(8, 2800, 'Culinary Legend'),
(9, 3600, 'Flavor Alchemist'),
(10, 4500, 'God of Food')
ON CONFLICT (level) DO NOTHING;

-- 2. BADGES
INSERT INTO public.badges (id, type, name, description, xp_reward, icon_url) VALUES
('first_cook', 'achievement', 'First Dish', 'Completed your first cooking session', 50, 'badge_first_cook.png'),
('streak_3', 'streak', '3 Day Streak', 'Cooked or logged in for 3 consecutive days', 100, 'badge_streak_3.png'),
('streak_7', 'streak', 'Weekly Warrior', 'Cooked or logged in for 7 consecutive days', 300, 'badge_streak_7.png'),
('social_share', 'community', 'Sharing is Caring', 'Shared a recipe with a friend', 25, 'badge_share.png'),
('recipe_creator', 'achievement', 'Recipe Author', 'Created and published your first recipe', 150, 'badge_creator.png'),
('healthy_choice', 'achievement', 'Health Nut', 'Cooked 5 healthy recipes', 75, 'badge_healthy.png')
ON CONFLICT (id) DO NOTHING;

-- 3. CATEGORIES (Used in Frontend, stored here for reference/initial data if using a table, but schema uses text)
-- If we had a categories table, we'd insert here. Since it's text, we just document common ones.

-- 4. SAMPLE ADMIN (Requires Auth ID - Placeholder)
-- INSERT INTO public.admin_users (id, email, role) VALUES ('UUID_FROM_AUTH', 'admin@example.com', 'super_admin');

-- 5. SAMPLE RECIPES (Optional)
-- INSERT INTO public.recipes ...
