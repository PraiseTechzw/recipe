import {
    ACHIEVEMENTS,
    LEVEL_XP_THRESHOLDS,
} from "@/engines/gamificationEngine";
import { useGamificationStore } from "@/stores/gamificationStore";

/**
 * Returns the progress percentage to the next level (0-1).
 */
export const selectProgressToNextLevel = (
  xp: number,
  level: number,
): number => {
  // If max level in static table
  if (level >= LEVEL_XP_THRESHOLDS.length) {
    // For infinite levels, we can just show progress within the current calculated bracket
    // Or just return 1 if we treat 20 as max for UI purposes
    // But since we have a formula, let's try to show progress.

    // XP for current level start
    const currentLevelXP = Math.floor(100 * Math.pow(level - 1, 1.5));
    // XP for next level start
    const nextLevelXP = Math.floor(100 * Math.pow(level, 1.5));

    const needed = nextLevelXP - currentLevelXP;
    const gained = xp - currentLevelXP;

    return Math.min(1, Math.max(0, gained / needed));
  }

  const currentLevelXP = LEVEL_XP_THRESHOLDS[level - 1];
  const nextLevelXP = LEVEL_XP_THRESHOLDS[level];

  const needed = nextLevelXP - currentLevelXP;
  const gained = xp - currentLevelXP;

  return Math.min(1, Math.max(0, gained / needed));
};

/**
 * Returns list of unlocked badge objects.
 */
export const selectUnlockedBadges = (unlockedIds: string[]) => {
  return ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).map((a) => ({
    id: a.id,
    title: a.title,
    icon: a.badgeIcon,
    rarity: a.rarity,
  }));
};

/**
 * Hook to access gamification UI data easily.
 */
export const useGamificationData = () => {
  const xp = useGamificationStore((s) => s.xp);
  const level = useGamificationStore((s) => s.level);
  const achievements = useGamificationStore((s) => s.achievements);
  const weeklyXp = useGamificationStore((s) => s.weeklyXp);
  const chefName = useGamificationStore((s) => s.chefName);

  return {
    level,
    xp,
    weeklyXp,
    chefName,
    progress: selectProgressToNextLevel(xp, level),
    badges: selectUnlockedBadges(achievements),
    totalBadgesCount: ACHIEVEMENTS.length,
    unlockedBadgesCount: achievements.length,
  };
};
