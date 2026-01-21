const colors = {
  // Primary Active - Teal Blue (Momentum)
  primary: '#00C2B8',
  primaryLight: '#33D4CB',
  primaryDark: '#009E95',
  primaryMuted: 'rgba(0, 194, 184, 0.15)',
  
  // Primary Recovery - Warm Orange (Recovery)
  accent: '#FF7A50',
  accentLight: '#FF9B7A',
  accentDark: '#E55A30',
  accentMuted: 'rgba(255, 122, 80, 0.15)',
  
  // Legacy alias for backwards compatibility
  secondary: '#FF7A50',
  secondaryLight: '#FF9B7A',
  secondaryDark: '#E55A30',
  
  // Functional Colors
  success: '#00C2B8',
  successMuted: 'rgba(0, 194, 184, 0.15)',
  warning: '#FFB84D',
  warningMuted: 'rgba(255, 184, 77, 0.15)',
  danger: '#FF5757',
  dangerMuted: 'rgba(255, 87, 87, 0.15)',
  error: '#FF5757',
  errorLight: 'rgba(255, 87, 87, 0.15)',
  info: '#4DA6FF',
  infoMuted: 'rgba(77, 166, 255, 0.15)',

  // Backgrounds (clean, light off-white)
  background: '#F8F9FB',
  backgroundWarm: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDim: '#F2F4F7',
  
  // Workout-specific backgrounds
  workoutBackground: '#F5F7FA',
  workoutSurface: 'rgba(255, 255, 255, 0.92)',
  workoutCardBg: 'rgba(255, 255, 255, 0.85)',
  
  // Typography
  text: '#1A1F36',
  textSecondary: '#6B7C93',
  textTertiary: '#9AA5B1',
  textInverted: '#FFFFFF',

  // Borders & Dividers
  border: '#E4E7EB',
  borderLight: '#F0F3F7',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  borderTeal: 'rgba(0, 194, 184, 0.3)',
  
  // Overlays
  overlay: 'rgba(26, 31, 54, 0.4)',
  overlayLight: 'rgba(26, 31, 54, 0.1)',
  
  // Gradient colors (Momentum & Recovery Flow)
  gradientStart: '#00C2B8',
  gradientEnd: '#FF7A50',
  gradientMid: '#7DD4B8',
};

export const gradients = {
  // Core Momentum & Recovery gradient
  primary: ['#00C2B8', '#FF7A50'] as const,
  primarySoft: ['#33D4CB', '#FF9B7A'] as const,
  primarySubtle: ['rgba(0, 194, 184, 0.12)', 'rgba(255, 122, 80, 0.12)'] as const,
  
  // Active workout gradients (teal-focused)
  active: ['#00C2B8', '#33D4CB'] as const,
  activeGlow: ['#00C2B8', '#009E95'] as const,
  
  // Recovery gradients (orange-focused)
  recovery: ['#FF7A50', '#FF9B7A'] as const,
  recoveryGlow: ['#FF7A50', '#E55A30'] as const,
  
  // Surface gradients
  surface: ['#FFFFFF', '#F8F9FB'] as const,
  surfaceWarm: ['#FFFFFF', '#FDFCFA'] as const,
  workoutBg: ['#F5F7FA', '#EEF1F5'] as const,
  
  // State gradients
  ready: ['#00C2B8', '#33D4CB'] as const,
  caution: ['#FFB84D', '#FF7A50'] as const,
  rest: ['#FF7A50', '#FF9B7A'] as const,
  
  // Card backgrounds
  cardGlow: ['rgba(0, 194, 184, 0.08)', 'rgba(255, 122, 80, 0.05)'] as const,
  cardTeal: ['rgba(0, 194, 184, 0.06)', 'rgba(0, 194, 184, 0.02)'] as const,
  
  // Button gradients
  startButton: ['#00C2B8', '#009E95'] as const,
  finishButton: ['#FF7A50', '#E55A30'] as const,
  completionWave: ['#00C2B8', '#FF7A50'] as const,
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
