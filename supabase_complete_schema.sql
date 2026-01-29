-- ============================================================================
-- COMPLETE SUPABASE SCHEMA FOR RECIPE APP
-- ============================================================================
-- Includes: Anonymous Users, Recipes, AI Scans, Gamification, Social, Admin, System Health
-- ============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For search capabilities

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE recipe_status AS ENUM ('draft', 'published', 'archived', 'deleted');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE report_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE badge_type AS ENUM ('achievement', 'streak', 'community', 'special_event');
CREATE TYPE xp_event_type AS ENUM ('cook_recipe', 'create_recipe', 'daily_streak', 'share_recipe', 'review_recipe');
CREATE TYPE notification_type AS ENUM ('system', 'achievement', 'social', 'recommendation', 'reminder');
CREATE TYPE admin_role AS ENUM ('super_admin', 'moderator', 'editor', 'viewer');
CREATE TYPE scan_status AS ENUM ('uploading', 'processing', 'completed', 'failed', 'flagged');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'harassment', 'other');

-- ============================================================================
-- 2. USERS & PROFILES (Anonymous)
-- ============================================================================

-- Unifies previous 'profiles' and 'chefs' tables
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY, -- Device-generated UUID, provided by client
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  
  -- Gamification Stats (Denormalized for performance)
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1,
  chef_level_label TEXT DEFAULT 'Beginner',
  weekly_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  preferences JSONB DEFAULT '{}'::JSONB, -- dietary, units, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50)
);

-- Index for Leaderboards
CREATE INDEX idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX idx_profiles_weekly_xp ON public.profiles(weekly_xp DESC);

-- ============================================================================
-- 3. RECIPES
-- ============================================================================

CREATE TABLE public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_device_id TEXT, -- For tracking local-first sync
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status recipe_status DEFAULT 'published',
  
  -- Categorization
  category TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  cuisine TEXT,
  difficulty TEXT, -- Easy, Medium, Hard
  
  -- Details
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  calories_per_serving INTEGER,
  nutrition JSONB DEFAULT '{}'::JSONB, -- { "protein": "10g", ... }
  
  -- Structure
  ingredients JSONB DEFAULT '[]'::JSONB, -- Structured list
  steps JSONB DEFAULT '[]'::JSONB, -- Structured list
  
  -- Metadata
  source_url TEXT,
  language TEXT DEFAULT 'en',
  is_ai_generated BOOLEAN DEFAULT FALSE,
  
  -- Social Counters (Denormalized)
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_author ON public.recipes(author_id);
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_status ON public.recipes(status);
CREATE INDEX idx_recipes_search ON public.recipes USING GIN (to_tsvector('english', title || ' ' || coalesce(description, '')));

-- ============================================================================
-- 4. AI SCANS & METRICS
-- ============================================================================

CREATE TABLE public.ai_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Inputs
  image_url TEXT,
  prompt_template TEXT,
  
  -- Outputs
  generated_recipe_id UUID REFERENCES public.recipes(id), -- If converted to recipe
  raw_response JSONB,
  
  -- Metrics
  status scan_status DEFAULT 'processing',
  latency_ms INTEGER,
  cost_estimated_usd NUMERIC(10, 6),
  token_count INTEGER,
  
  -- Safety
  safety_flags JSONB DEFAULT '[]'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_scans_user ON public.ai_scans(user_id);

-- ============================================================================
-- 5. GAMIFICATION (Levels, Badges, Events)
-- ============================================================================

-- Reference table for levels
CREATE TABLE public.levels (
  level INTEGER PRIMARY KEY,
  min_xp INTEGER NOT NULL,
  title TEXT NOT NULL,
  icon_url TEXT
);

-- Badge Definitions
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY, -- e.g., 'first_cook', 'week_streak_10'
  type badge_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirements JSONB -- metadata for logic
);

-- User Badges (Many-to-Many)
CREATE TABLE public.user_badges (
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- XP History Log
CREATE TABLE public.xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type xp_event_type NOT NULL,
  amount INTEGER NOT NULL,
  metadata JSONB, -- e.g., { "recipe_id": "..." }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_events_user ON public.xp_events(user_id);

-- ============================================================================
-- 6. SOCIAL (Reviews, Reports)
-- ============================================================================

CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  image_url TEXT,
  
  status review_status DEFAULT 'approved', -- Auto-approve by default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(recipe_id, user_id)
);

CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  target_type TEXT NOT NULL, -- 'recipe', 'review', 'user'
  target_id TEXT NOT NULL,
  reason report_reason NOT NULL,
  details TEXT,
  
  status report_status DEFAULT 'open',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. ENGAGEMENT (Saves, Sessions)
-- ============================================================================

CREATE TABLE public.saved_recipes (
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'Favorites',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE public.cooking_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  step_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- 8. NOTIFICATIONS
-- ============================================================================

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB, -- Deep link data
  
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);

-- ============================================================================
-- 9. ADMIN & SYSTEM HEALTH
-- ============================================================================

-- Admin Users (Linked to Auth for security)
-- Uses existing 'admin_whitelist' if present, but redefining for completeness
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role admin_role DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Errors (Crash Reporting)
CREATE TABLE public.app_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Nullable
  error_code TEXT,
  message TEXT,
  stack_trace TEXT,
  device_info JSONB,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Sync Logs (System Health)
CREATE TABLE public.client_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  device_id TEXT,
  sync_duration_ms INTEGER,
  records_synced INTEGER,
  status TEXT, -- 'success', 'partial', 'failed'
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Helper: Service Role Only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10.1 PROFILES
-- Public Read
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Update/Insert: Restricted to Service Role (Edge Functions) to prevent impersonation
CREATE POLICY "Service Role manages profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Allow INSERT for onboarding (risk: ID collision/spam, but necessary if no auth)
CREATE POLICY "Public can create profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- 10.2 RECIPES
-- Public Read (Published only)
CREATE POLICY "Public view published recipes" ON public.recipes FOR SELECT USING (status = 'published');
-- Service Role Manage
CREATE POLICY "Service Role manages recipes" ON public.recipes FOR ALL TO service_role USING (true) WITH CHECK (true);
-- Public Insert (User created)
CREATE POLICY "Public can create recipes" ON public.recipes FOR INSERT WITH CHECK (true);

-- 10.3 ENGAGEMENT (Saves)
-- Public Read/Write (Assumes client manages ID responsibly, or use Edge Function for strictness)
CREATE POLICY "Public manage own saves" ON public.saved_recipes FOR ALL USING (true) WITH CHECK (true);

-- 10.4 ADMIN
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view admins" ON public.admin_users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ============================================================================
-- 11. REALTIME PUBLICATIONS
-- ============================================================================

-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes; -- For new feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; -- For Realtime Leaderboard

-- Note: For production leaderboards, client should subscribe with a filter (e.g., limit to top 100 or specific user)
-- to avoid receiving updates for every single user profile change.

-- ============================================================================
-- 12. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recipes_modtime BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to recalculate average rating
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.recipes
  SET 
    rating_avg = (SELECT AVG(rating) FROM public.reviews WHERE recipe_id = NEW.recipe_id),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE recipe_id = NEW.recipe_id)
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_after_review AFTER INSERT OR UPDATE OR DELETE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE update_recipe_rating();

