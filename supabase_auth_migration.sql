-- Migration to add Auth support to Profiles
-- Run this in your Supabase SQL Editor

-- 1. Add user_id column to profiles table to link with Supabase Auth
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- 3. Update RLS policies (Optional but recommended for security)
-- Allow users to update only their own profile
-- (Keeping existing permissive policies for now to maintain Guest mode compatibility,
--  but you can tighten this later)

-- 4. Function to automatically link profile on signup (Optional, if we used triggers)
-- For now, we will handle linking in the client app logic (authService.ts).
