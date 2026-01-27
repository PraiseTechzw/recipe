import { LEVELS } from '@/constants/gamification';

/**
 * Chef Identity Utilities
 * Handles deterministic avatar generation and level-based titles.
 */

// A palette of nice chef-appropriate colors
const AVATAR_COLORS = [
  '#FF5722', // Deep Orange
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

/**
 * Generates a deterministic avatar seed (color + initials logic)
 * The seed is just a string that we can parse later, or use as a key.
 * Format: "v1:{colorIndex}:{initials}"
 * For now, we just return a random string that persists, 
 * and the UI derives color from the hash of this string.
 */
export function generateAvatarSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Derives a background color from a string seed/ID deterministically.
 */
export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Gets the Chef Title based on current Level (1-based).
 */
export function getChefTitle(level: number): string {
  // LEVELS is sorted 1..25
  // We find the entry matching the level
  const match = LEVELS.find(l => l.level === level);
  return match ? match.title : 'Novice Chef';
}

/**
 * Gets the initials from a chef name (max 2 chars).
 */
export function getChefInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
