import { useGamificationStore } from '@/stores/gamificationStore';
import { ACHIEVEMENTS, LEVEL_XP_THRESHOLDS } from '@/engines/gamificationEngine';
import { Achievement } from '@/types/gamification';

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Returns the current progress to the next level.
 * @returns { currentLevelXp, xpToNextLevel, progressPercent }
 */
export const useLevelProgress = () => {
  const xp = useGamificationStore((state) => state.xp);
  const level = useGamificationStore((state) => state.level);

  // Get threshold for current level (start) and next level (end)
  // Arrays are 0-indexed, Level 1 corresponds to index 0 (0 XP)
  // Level 2 corresponds to index 1 (100 XP)
  
  // XP required to reach CURRENT level (floor)
  const currentLevelFloor = getXpThresholdForLevel(level);
  
  // XP required to reach NEXT level (ceiling)
  const nextLevelCeiling = getXpThresholdForLevel(level + 1);

  const xpInCurrentLevel = xp - currentLevelFloor;
  const xpRequiredForNextLevel = nextLevelCeiling - currentLevelFloor;
  
  const progressPercent = Math.min(
    100, 
    Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100)
  );

  return {
    currentLevelXp: xpInCurrentLevel,
    xpToNextLevel: xpRequiredForNextLevel - xpInCurrentLevel,
    progressPercent,
    totalXp: xp,
    level
  };
};

/**
 * Returns a list of all unlocked badges with their details.
 */
export const useUnlockedBadges = (): Achievement[] => {
  const unlockedIds = useGamificationStore((state) => state.achievements);
  return ACHIEVEMENTS.filter((achievement) => unlockedIds.includes(achievement.id));
};

/**
 * Returns a list of locked achievements (next goals).
 */
export const useLockedAchievements = (): Achievement[] => {
  const unlockedIds = useGamificationStore((state) => state.achievements);
  return ACHIEVEMENTS.filter((achievement) => !unlockedIds.includes(achievement.id));
};

/**
 * Returns the user's weekly XP status.
 */
export const useWeeklyProgress = () => {
    const weeklyXp = useGamificationStore((state) => state.weeklyXp);
    return { weeklyXp };
};

/**
 * Returns the user's chef identity.
 */
export const useChefIdentity = () => {
    const chefId = useGamificationStore((state) => state.chefId);
    const chefName = useGamificationStore((state) => state.chefName);
    return { chefId, chefName };
};


// ============================================================================
// HELPERS
// ============================================================================

function getXpThresholdForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= LEVEL_XP_THRESHOLDS.length) {
    return LEVEL_XP_THRESHOLDS[level - 1];
  }
  
  // Fallback Formula: XP = 100 * (L-1)^1.5
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}
