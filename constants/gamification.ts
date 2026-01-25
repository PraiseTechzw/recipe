export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  xpReward: number;
  category: 'cooking' | 'social' | 'collection' | 'streak';
}

export const BADGES: Badge[] = [
  {
    id: 'first_cook',
    name: 'First Cook',
    description: 'Complete your first recipe.',
    icon: '🍳',
    xpReward: 50,
    category: 'cooking'
  },
  {
    id: 'week_streak',
    name: 'Week Streak',
    description: 'Cook for 7 days in a row.',
    icon: '🔥',
    xpReward: 150,
    category: 'streak'
  },
  {
    id: 'flavor_explorer',
    name: 'Flavor Explorer',
    description: 'Try recipes from 3 different cuisines.',
    icon: '🌍',
    xpReward: 100,
    category: 'collection'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Cook a breakfast recipe before 9 AM.',
    icon: '🌅',
    xpReward: 50,
    category: 'cooking'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Cook a recipe after 10 PM.',
    icon: '🦉',
    xpReward: 50,
    category: 'cooking'
  },
  {
    id: 'healthy_habit',
    name: 'Healthy Habit',
    description: 'Cook 5 healthy recipes.',
    icon: '🥗',
    xpReward: 100,
    category: 'cooking'
  },
  {
    id: 'sweet_tooth',
    name: 'Sweet Tooth',
    description: 'Cook 3 dessert recipes.',
    icon: '🍰',
    xpReward: 75,
    category: 'cooking'
  },
  {
    id: 'master_chef',
    name: 'Master Chef',
    description: 'Reach Level 10.',
    icon: '👨‍🍳',
    xpReward: 1000,
    category: 'cooking'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Save 20 recipes.',
    icon: '🔖',
    xpReward: 50,
    category: 'collection'
  },
  {
    id: 'sharer',
    name: 'Sharer',
    description: 'Share a recipe with a friend.',
    icon: '📤',
    xpReward: 25,
    category: 'social'
  }
];

export const LEVELS = [
  { level: 1, minXP: 0, title: 'Beginner' },
  { level: 2, minXP: 100, title: 'Kitchen Helper' },
  { level: 3, minXP: 300, title: 'Home Cook' },
  { level: 4, minXP: 600, title: 'Foodie' },
  { level: 5, minXP: 1000, title: 'Sous Chef' },
  { level: 6, minXP: 1500, title: 'Chef de Partie' },
  { level: 7, minXP: 2200, title: 'Head Chef' },
  { level: 8, minXP: 3000, title: 'Executive Chef' },
  { level: 9, minXP: 4000, title: 'Culinary Master' },
  { level: 10, minXP: 5500, title: 'Legend' },
  { level: 11, minXP: 7000, title: 'Taste Wizard' },
  { level: 12, minXP: 9000, title: 'Flavor Alchemist' },
  { level: 13, minXP: 11500, title: 'Gastronomy Guru' },
  { level: 14, minXP: 14500, title: 'Kitchen Commander' },
  { level: 15, minXP: 18000, title: 'Spice Lord' },
  { level: 16, minXP: 22000, title: 'Umami Emperor' },
  { level: 17, minXP: 26500, title: 'Culinary Titan' },
  { level: 18, minXP: 31500, title: 'God of Cookery' },
  { level: 19, minXP: 37000, title: 'Universal Chef' },
  { level: 20, minXP: 43000, title: 'Cosmic Cook' },
  { level: 21, minXP: 50000, title: 'Recipe Sage' },
  { level: 22, minXP: 58000, title: 'Infinite Palate' },
  { level: 23, minXP: 67000, title: 'Eternal Chef' },
  { level: 24, minXP: 77000, title: 'Supreme Sustenance' },
  { level: 25, minXP: 88000, title: 'The Creator' },
];

export const getLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    return LEVELS.find(l => l.level === currentLevel.level + 1) || null;
};
