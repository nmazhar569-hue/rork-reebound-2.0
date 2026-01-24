/**
 * Reebound Global Design System - Color Palette
 * 
 * Brand Philosophy:
 * - Empowerment (Teal): Active energy, momentum, readiness
 * - Recovery (Orange): Warmth, perseverance, restoration
 * - Holistic (Gradient): The balance between action and rest
 */

const colors = {
  // ============================================================================
  // PRIMARY - Empowerment Teal
  // ============================================================================
  primary: '#14B8A6',
  primaryLight: '#2DD4BF',
  primaryDark: '#0D9488',
  primaryMuted: 'rgba(20, 184, 166, 0.15)',
  primaryGlow: 'rgba(20, 184, 166, 0.4)',

  // ============================================================================
  // SECONDARY - Recovery Orange (Perseverance)
  // ============================================================================
  accent: '#FB923C',
  accentLight: '#FDBA74',
  accentDark: '#EA580C',
  accentMuted: 'rgba(251, 146, 60, 0.15)',
  accentGlow: 'rgba(251, 146, 60, 0.4)',

  // Legacy alias for backwards compatibility
  secondary: '#FB923C',
  secondaryLight: '#FDBA74',
  secondaryDark: '#EA580C',

  // ============================================================================
  // FUNCTIONAL COLORS
  // ============================================================================
  success: '#14B8A6',
  successMuted: 'rgba(20, 184, 166, 0.15)',
  warning: '#FB923C',
  warningMuted: 'rgba(251, 146, 60, 0.15)',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoMuted: 'rgba(59, 130, 246, 0.15)',

  // ============================================================================
  // BACKGROUNDS - Deep Navy Theme
  // ============================================================================
  background: '#0A1628',
  backgroundDeep: '#050D1A',
  backgroundWarm: '#0F1D32',
  surface: '#0F1D32',
  surfaceElevated: '#162337',
  surfaceDim: '#050D1A',

  // Workout-specific backgrounds
  workoutBackground: '#0A1628',
  workoutSurface: 'rgba(15, 29, 50, 0.92)',
  workoutCardBg: 'rgba(22, 35, 55, 0.85)',

  // ============================================================================
  // TYPOGRAPHY - Light text for dark background
  // ============================================================================
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverted: '#0A1628',

  // ============================================================================
  // BORDERS & DIVIDERS
  // ============================================================================
  border: '#1E3A5F',
  borderLight: '#162337',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderTeal: 'rgba(20, 184, 166, 0.3)',
  borderOrange: 'rgba(251, 146, 60, 0.3)',

  // ============================================================================
  // OVERLAYS
  // ============================================================================
  overlay: 'rgba(10, 22, 40, 0.7)',
  overlayLight: 'rgba(10, 22, 40, 0.4)',
  overlayHeavy: 'rgba(10, 22, 40, 0.9)',

  // ============================================================================
  // GRADIENT COLORS
  // ============================================================================
  gradientStart: '#14B8A6',
  gradientEnd: '#FB923C',
  gradientMid: '#7DD4B0',
};

// ============================================================================
// GRADIENT DEFINITIONS
// ============================================================================
export const gradients = {
  // Core Holistic gradient (Teal to Orange - Ree button rim, accents)
  primary: ['#14B8A6', '#FB923C'] as const,
  primarySoft: ['#2DD4BF', '#FDBA74'] as const,
  primarySubtle: ['rgba(20, 184, 166, 0.12)', 'rgba(251, 146, 60, 0.12)'] as const,

  // Ree Button gradient (circular rim effect)
  reeButton: ['#14B8A6', '#2DD4BF', '#FB923C', '#FDBA74'] as const,
  reeButtonRim: ['#14B8A6', '#FB923C'] as const,

  // Active workout gradients (teal-focused)
  active: ['#14B8A6', '#2DD4BF'] as const,
  activeGlow: ['#14B8A6', '#0D9488'] as const,

  // Recovery gradients (orange-focused)
  recovery: ['#FB923C', '#FDBA74'] as const,
  recoveryGlow: ['#FB923C', '#EA580C'] as const,

  // Surface gradients (Deep Navy theme)
  surface: ['#0F1D32', '#0A1628'] as const,
  surfaceWarm: ['#162337', '#0F1D32'] as const,
  workoutBg: ['#0A1628', '#0F1D32'] as const,
  voidGradient: ['#0A1628', '#050D1A', '#020617'] as const,

  // State gradients
  ready: ['#14B8A6', '#2DD4BF'] as const,
  caution: ['#FB923C', '#14B8A6'] as const,
  rest: ['#FB923C', '#FDBA74'] as const,

  // Card backgrounds (subtle glow)
  cardGlow: ['rgba(20, 184, 166, 0.12)', 'rgba(251, 146, 60, 0.08)'] as const,
  cardTeal: ['rgba(20, 184, 166, 0.1)', 'rgba(20, 184, 166, 0.04)'] as const,
  cardOrange: ['rgba(251, 146, 60, 0.1)', 'rgba(251, 146, 60, 0.04)'] as const,

  // Button gradients
  startButton: ['#14B8A6', '#0D9488'] as const,
  finishButton: ['#FB923C', '#EA580C'] as const,
  completionWave: ['#14B8A6', '#FB923C'] as const,
};

// ============================================================================
// SPACING SYSTEM
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

// ============================================================================
// BORDER RADIUS - iOS 26 Liquid Glass (smooth, rounded)
// ============================================================================
export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 36,
  full: 9999,
};

// ============================================================================
// SHADOW SYSTEM - Subtle, deep shadows
// ============================================================================
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  lifted: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },
  // Deep shadow for liquid glass cards
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 8,
  },
  // Colored glow shadows
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  }),
  glowSoft: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  }),
  // Teal glow preset
  glowTeal: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  // Orange glow preset
  glowOrange: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  // Headings (24-32pt, Bold)
  largeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  title2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.4,
  },
  // Section titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // Body text (16pt, Regular)
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // Data/Metrics (18pt, Medium)
  metric: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: colors.text,
  },
  metricLarge: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  // Captions & Labels
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
    letterSpacing: 0.8,
  },
};

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================
export const layout = {
  screenPadding: 20,
  screenPaddingTop: 60,
  cardPadding: 20,
  cardPaddingLarge: 24,
  tabBarHeight: 100,
  itemGap: 12,
  sectionGap: 24,
};

// ============================================================================
// ANIMATION TIMINGS
// ============================================================================
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  xslow: 600,
  spring: {
    tension: 40,
    friction: 7,
  },
  springSnappy: {
    tension: 400,
    friction: 30,
  },
};

export default colors;
