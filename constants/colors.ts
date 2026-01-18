const colors = {
  // Primary - Soft Teal/Cyan
  primary: '#3ECFCF',
  primaryLight: '#6EDEDE',
  primaryDark: '#28A8A8',
  primaryMuted: 'rgba(62, 207, 207, 0.12)',
  
  // Accent - Warm Coral/Orange
  accent: '#F28B6A',
  accentLight: '#F7AC94',
  accentDark: '#E06B48',
  accentMuted: 'rgba(242, 139, 106, 0.12)',
  
  // Legacy alias for backwards compatibility
  secondary: '#F28B6A',
  secondaryLight: '#F7AC94',
  secondaryDark: '#E06B48',
  
  // Functional Colors (softened, rounded feel)
  success: '#5ABF8C',
  successMuted: 'rgba(90, 191, 140, 0.12)',
  warning: '#F6B04A',
  warningMuted: 'rgba(246, 176, 74, 0.12)',
  danger: '#EF8080',
  dangerMuted: 'rgba(239, 128, 128, 0.12)',
  info: '#6BC4E0',
  infoMuted: 'rgba(107, 196, 224, 0.12)',

  // Backgrounds (warm, calm)
  background: '#F9FAFB',
  backgroundWarm: '#FDFCFB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceDim: '#F5F6F7',
  
  // Typography (softer contrast)
  text: '#2A3540',
  textSecondary: '#6B7C87',
  textTertiary: '#A3B0B8',
  textInverted: '#FFFFFF',

  // Borders & Dividers (invisible, flow-based)
  border: '#EEF1F3',
  borderLight: '#F5F7F8',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  
  // Overlays
  overlay: 'rgba(42, 53, 64, 0.35)',
  overlayLight: 'rgba(42, 53, 64, 0.08)',
  
  // Gradient colors (for LinearGradient usage)
  gradientStart: '#3ECFCF',
  gradientEnd: '#F28B6A',
  gradientMid: '#7DD4B8',
};

export const gradients = {
  // Main gradient - teal to coral (for progress, focus, state)
  primary: ['#3ECFCF', '#F28B6A'] as const,
  primarySoft: ['#6EDEDE', '#F7AC94'] as const,
  primarySubtle: ['rgba(62, 207, 207, 0.10)', 'rgba(242, 139, 106, 0.10)'] as const,
  
  // Surface gradients (very subtle depth)
  surface: ['#FFFFFF', '#FAFBFC'] as const,
  surfaceWarm: ['#FFFFFF', '#FDFCFA'] as const,
  
  // State gradients
  ready: ['#5ABF8C', '#3ECFCF'] as const,
  caution: ['#F6B04A', '#F28B6A'] as const,
  rest: ['#F28B6A', '#EF8080'] as const,
  
  // Card backgrounds (ultra subtle)
  cardGlow: ['rgba(62, 207, 207, 0.06)', 'rgba(242, 139, 106, 0.03)'] as const,
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
    shadowColor: '#2A3540',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2A3540',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  lifted: {
    shadowColor: '#2A3540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  }),
  glowSoft: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
