const colors = {
  // Primary - Vibrant Teal/Cyan (brightened for better contrast)
  primary: '#00D9A3',
  primaryLight: '#4BFFCA',
  primaryDark: '#00B885',
  primaryMuted: 'rgba(0, 217, 163, 0.15)',
  
  // Accent - Warm Coral/Orange (more vibrant)
  accent: '#FF6B4A',
  accentLight: '#FF9478',
  accentDark: '#E5512E',
  accentMuted: 'rgba(255, 107, 74, 0.15)',
  
  // Legacy alias for backwards compatibility
  secondary: '#FF6B4A',
  secondaryLight: '#FF9478',
  secondaryDark: '#E5512E',
  
  // Functional Colors (more vibrant for better visibility)
  success: '#00D9A3',
  successMuted: 'rgba(0, 217, 163, 0.15)',
  warning: '#FFB84D',
  warningMuted: 'rgba(255, 184, 77, 0.15)',
  danger: '#FF5757',
  dangerMuted: 'rgba(255, 87, 87, 0.15)',
  error: '#FF5757',
  errorLight: 'rgba(255, 87, 87, 0.15)',
  info: '#4DA6FF',
  infoMuted: 'rgba(77, 166, 255, 0.15)',

  // Backgrounds (cleaner, more modern)
  background: '#FAFBFC',
  backgroundWarm: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDim: '#F5F7FA',
  
  // Typography (better contrast)
  text: '#1A1F36',
  textSecondary: '#6B7C93',
  textTertiary: '#9AA5B1',
  textInverted: '#FFFFFF',

  // Borders & Dividers (cleaner, more defined)
  border: '#E4E7EB',
  borderLight: '#F0F3F7',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  
  // Overlays
  overlay: 'rgba(26, 31, 54, 0.4)',
  overlayLight: 'rgba(26, 31, 54, 0.1)',
  
  // Gradient colors (for LinearGradient usage)
  gradientStart: '#00D9A3',
  gradientEnd: '#FF6B4A',
  gradientMid: '#7DD4B8',
};

export const gradients = {
  // Main gradient - teal to coral (for progress, focus, state)
  primary: ['#00D9A3', '#FF6B4A'] as const,
  primarySoft: ['#4BFFCA', '#FF9478'] as const,
  primarySubtle: ['rgba(0, 217, 163, 0.12)', 'rgba(255, 107, 74, 0.12)'] as const,
  
  // Surface gradients (very subtle depth)
  surface: ['#FFFFFF', '#FAFBFC'] as const,
  surfaceWarm: ['#FFFFFF', '#FDFCFA'] as const,
  
  // State gradients
  ready: ['#00D9A3', '#4BFFCA'] as const,
  caution: ['#FFB84D', '#FF6B4A'] as const,
  rest: ['#FF6B4A', '#FF5757'] as const,
  
  // Card backgrounds (ultra subtle)
  cardGlow: ['rgba(0, 217, 163, 0.08)', 'rgba(255, 107, 74, 0.05)'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#1A1F36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A1F36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lifted: {
    shadowColor: '#1A1F36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 6,
  }),
  glowSoft: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  }),
};

export const typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  caption: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
};

export const layout = {
  screenPadding: 20,
  screenPaddingTop: 60,
  cardPadding: 22,
  cardPaddingLarge: 26,
  tabBarHeight: 100,
  itemGap: 14,
  sectionGap: 24,
};

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    tension: 40,
    friction: 7,
  },
};

export default colors;
