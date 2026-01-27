export type AchievementRarity = 'common' | 'rare' | 'epic';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: AchievementRarity;
  xpReward: number;
  badgeIcon: string;
  condition: (stats: UserStats, session?: any) => boolean;
}

export interface UserStats {
  recipesCompleted: number;
  streakDays: number;
  lastCookDate: number | null; // Timestamp
  pantryMatches: number;
  reviewsCount: number;
  cuisinesCount: number; // Distinct cuisines cooked
  totalCooks: number; // Might be same as recipesCompleted, or include repeats
  shares: number;
  favorites: number;
  healthyCount: number;
  dessertCount: number;
  pausesInLastSession?: number; // Transient, for achievement check
  timeDiffInLastSession?: number; // Transient, estimated - actual (minutes)
}

export interface UserGamificationState {
  xp: number;
  level: number;
  achievements: string[]; // IDs of unlocked achievements
  stats: UserStats;
}

export type GamificationEventType = 
  | 'RECIPE_COMPLETED' 
  | 'REVIEW_ADDED' 
  | 'RECIPE_SHARED' 
  | 'RECIPE_FAVORITED';

export interface GamificationEventPayload {
  recipeId?: string;
  recipeCategory?: string;
  recipeTags?: string[]; // e.g., ["Healthy", "Dessert"]
  isPantryMatch?: boolean;
  stepStreakCount?: number; // How many steps done without pause
  pausesCount?: number;
  timeEstimated?: number; // minutes
  timeActual?: number; // minutes
  isNewCuisine?: boolean; // Calculated by caller or engine? Engine might not know history of cuisines without full list. 
                          // Better: Engine updates stats.cuisinesCount if new. 
                          // But stats only stores count. We need a set of cuisines in stats to know if new.
                          // For simplicity, let's assume stats tracks unique cuisines or payload tells us.
                          // Let's add `cookedCuisines: string[]` to stats.
}

// Extending stats for implementation detail
export interface ExtendedUserStats extends UserStats {
  cookedCuisines: string[];
}

export interface GamificationEvent {
  type: GamificationEventType;
  payload: GamificationEventPayload;
}

export interface GamificationResult {
  newState: UserGamificationState;
  xpAwarded: number;
  levelUp: boolean;
  levelBefore: number;
  levelAfter: number;
  newAchievements: Achievement[]; // Full objects of newly unlocked
  messages: string[]; // "Level Up!", "Achievement Unlocked: X"
}
