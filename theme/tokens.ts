// Design System Tokens

export const COLORS = {
  light: {
    primary: '#E65100', // Orange 900
    primaryLight: '#FFCC80', // Orange 200
    secondary: '#2E7D32', // Green 800
    background: '#F8F9FA', // Grey 50
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    text: '#212121', // Grey 900
    textSecondary: '#757575', // Grey 600
    border: '#E0E0E0', // Grey 300
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
    // Rarity colors
    common: '#2196F3',
    rare: '#FF9800',
    epic: '#9C27B0',
    legendary: '#FFD700',
  },
  dark: {
    primary: '#FF9800', // Orange 500
    primaryLight: '#FFE0B2', // Orange 100
    secondary: '#66BB6A', // Green 400
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    error: '#CF6679',
    success: '#81C784',
    warning: '#FFD54F',
    info: '#64B5F6',
    // Rarity colors
    common: '#64B5F6',
    rare: '#FFB74D',
    epic: '#BA68C8',
    legendary: '#FFD700',
  },
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  round: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
