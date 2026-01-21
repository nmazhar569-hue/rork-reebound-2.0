// iOS 26-style glassmorphism color system with mode-based theming
// Based on the Reebound design reference

export type AppMode = 'workout' | 'recovery' | 'nutrition' | 'progress' | 'ai';

export const modeColors = {
  workout: {
    primary: '#00D9A3',      // Teal
    primaryLight: '#4BFFCA',
    primaryDark: '#00B885',
    glass: 'rgba(0, 217, 163, 0.15)',
    glassHeavy: 'rgba(0, 217, 163, 0.25)',
    glow: 'rgba(0, 217, 163, 0.4)',
    gradient: ['#00D9A3', '#4BFFCA'] as const,
    gradientReverse: ['#4BFFCA', '#00D9A3'] as const,
  },
  recovery: {
    primary: '#FF8C42',      // Orange
    primaryLight: '#FFB07A',
    primaryDark: '#E5732E',
    glass: 'rgba(255, 140, 66, 0.15)',
    glassHeavy: 'rgba(255, 140, 66, 0.25)',
    glow: 'rgba(255, 140, 66, 0.4)',
    gradient: ['#FF8C42', '#FFB07A'] as const,
    gradientReverse: ['#FFB07A', '#FF8C42'] as const,
  },
  nutrition: {
    primary: '#A8D952',      // Yellow-Green
    primaryLight: '#C4E87E',
    primaryDark: '#8BBF38',
    glass: 'rgba(168, 217, 82, 0.15)',
    glassHeavy: 'rgba(168, 217, 82, 0.25)',
    glow: 'rgba(168, 217, 82, 0.4)',
    gradient: ['#A8D952', '#C4E87E'] as const,
    gradientReverse: ['#C4E87E', '#A8D952'] as const,
  },
  progress: {
    primary: '#9B6FFF',      // Purple
    primaryLight: '#BFA0FF',
    primaryDark: '#7A4FE5',
    glass: 'rgba(155, 111, 255, 0.15)',
    glassHeavy: 'rgba(155, 111, 255, 0.25)',
    glow: 'rgba(155, 111, 255, 0.4)',
    gradient: ['#9B6FFF', '#BFA0FF'] as const,
    gradientReverse: ['#BFA0FF', '#9B6FFF'] as const,
  },
  ai: {
    primary: '#00D9A3',      // Teal (same as workout)
    primaryLight: '#4BFFCA',
    primaryDark: '#00B885',
    glass: 'rgba(0, 217, 163, 0.15)',
    glassHeavy: 'rgba(0, 217, 163, 0.25)',
    glow: 'rgba(0, 217, 163, 0.4)',
    gradient: ['#00D9A3', '#4BFFCA'] as const,
    gradientReverse: ['#4BFFCA', '#00D9A3'] as const,
  },
};

// Universal iOS 26 glass styles
export const glass = {
  // Light backgrounds with blur
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lightSubtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Dark backgrounds with blur
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  darkSubtle: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  // Colored glass (mode-based)
  colored: (mode: AppMode, opacity: number = 0.15) => ({
    backgroundColor: modeColors[mode].glass.replace('0.15', opacity.toString()),
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: `${modeColors[mode].primary}40`,
  }),
};

// iOS 26 shadows with color mode support
export const glassShadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (mode: AppMode, intensity: number = 0.3) => ({
    shadowColor: modeColors[mode].primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: intensity,
    shadowRadius: 20,
    elevation: 6,
  }),
};

// iOS 26 border radius system
export const glassRadius = {
  button: 24,      // Pill-shaped buttons
  card: 20,        // Content cards
  small: 12,       // Small elements
  large: 28,       // Large cards
  full: 9999,      // Completely round
};

// Neutral colors for backgrounds and text
export const neutralColors = {
  background: '#F5F7FA',
  backgroundDark: '#E8ECF1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  text: '#1A1F36',
  textSecondary: '#6B7C93',
  textTertiary: '#9AA5B1',
  textInverted: '#FFFFFF',
  
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',
  
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
};

export default modeColors;
