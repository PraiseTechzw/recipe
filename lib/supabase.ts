import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your own Supabase project URL and Anon Key
// You can find these in your Supabase Dashboard -> Settings -> API
const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Ensure URL is valid to prevent crash
const isValidUrl = (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'));

const SUPABASE_URL = isValidUrl(envUrl) ? envUrl! : 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = envKey || 'placeholder-anon-key';

if (!isValidUrl(envUrl)) {
  console.warn('⚠️ Supabase URL is missing or invalid in .env. Using placeholder. Real-time features will not work.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
