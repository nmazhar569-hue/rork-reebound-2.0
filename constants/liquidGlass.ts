/**
 * Reebound Liquid Glass Design System
 * 
 * iOS 26 "Liquid Glass" inspired material design with:
 * - Frosted glass effects (backdrop-filter: blur)
 * - Deep navy backgrounds
 * - Teal/Orange accent system
 * - Subtle transparency and depth
 */

// ============================================================================
// CORE LIQUID GLASS TOKENS
// ============================================================================

export const liquidGlass = {
  // Background colors (Deep Navy)
  background: {
    primary: '#0A1628',
    secondary: '#0F1D32',
    tertiary: '#162337',
    deep: '#050D1A',
    gradient: ['#0A1628', '#050D1A', '#020617'] as const,
  },

  // Accent colors
  accent: {
    // Empowerment Teal
    primary: '#14B8A6',
    primaryLight: '#2DD4BF',
    primaryDark: '#0D9488',
    primaryMuted: 'rgba(20, 184, 166, 0.15)',
    primaryGlow: 'rgba(20, 184, 166, 0.4)',

    // Recovery Orange (Perseverance)
    secondary: '#FB923C',
    secondaryLight: '#FDBA74',
    secondaryDark: '#EA580C',
    secondaryMuted: 'rgba(251, 146, 60, 0.15)',
    secondaryGlow: 'rgba(251, 146, 60, 0.4)',

    // Backward compatibility aliases
    glow: 'rgba(20, 184, 166, 0.4)',
    muted: 'rgba(20, 184, 166, 0.15)',
  },

  // Glass surface colors (for frosted cards)
  surface: {
    // Primary glass - rgba(255, 255, 255, 0.08) as per spec
    glass: 'rgba(255, 255, 255, 0.08)',
    glassLight: 'rgba(255, 255, 255, 0.12)',
    glassMedium: 'rgba(255, 255, 255, 0.06)',
    glassDark: 'rgba(10, 22, 40, 0.8)',

    // Card backgrounds
    card: 'rgba(15, 29, 50, 0.65)',
    cardHover: 'rgba(22, 35, 55, 0.75)',
    elevated: 'rgba(22, 35, 55, 0.8)',

    // Input fields
    input: 'rgba(10, 22, 40, 0.6)',
    inputFocused: 'rgba(20, 184, 166, 0.1)',

    // New Home Screen Card Variants
    cardYellow: 'rgba(254, 243, 199, 0.95)', // #fef3c7 (Recovery)
    cardYellowDark: 'rgba(253, 230, 138, 0.95)', // #fde68a

    cardHero: 'rgba(37, 99, 235, 0.9)', // #2563eb (Workout Hero)

    cardWhite: 'rgba(255, 255, 255, 0.9)', // Clean white
    cardWhiteGlass: 'rgba(255, 255, 255, 0.15)', // Glassy white

    cardTintBlue: 'rgba(219, 234, 254, 0.9)', // #dbeafe (Ree Insight)
  },

  // Text colors (for dark background)
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    inverse: '#0A1628',
    accent: '#14B8A6',
    accentSecondary: '#FB923C',
  },

  // Border colors
  border: {
    glass: 'rgba(255, 255, 255, 0.1)',
    glassLight: 'rgba(255, 255, 255, 0.15)',
    glassMedium: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.05)',
    teal: 'rgba(20, 184, 166, 0.3)',
    orange: 'rgba(251, 146, 60, 0.3)',
    tealStrong: 'rgba(20, 184, 166, 0.5)',
    orangeStrong: 'rgba(251, 146, 60, 0.5)',
  },

  // Status colors
  status: {
    success: '#14B8A6',
    successMuted: 'rgba(20, 184, 166, 0.15)',
    warning: '#FB923C',
    warningMuted: 'rgba(251, 146, 60, 0.15)',
    danger: '#EF4444',
    dangerMuted: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoMuted: 'rgba(59, 130, 246, 0.15)',
  },

  // Progress/metric colors
  progress: {
    workout: '#14B8A6',
    recovery: '#FB923C',
    nutrition: '#FDBA74',
    sleep: '#3B82F6',
  },

  // Gradient definitions
  gradients: {
    // Holistic gradient (Teal → Orange) for Ree button rim
    primary: ['#14B8A6', '#FB923C'] as const,
    primarySoft: ['#2DD4BF', '#FDBA74'] as const,

    // Ree button specific
    reeButtonRim: ['#14B8A6', '#2DD4BF', '#FDBA74', '#FB923C'] as const,

    // Teal focused
    teal: ['#14B8A6', '#2DD4BF'] as const,
    tealGlow: ['#14B8A6', '#0D9488'] as const,

    // Orange focused
    orange: ['#FB923C', '#FDBA74'] as const,
    orangeGlow: ['#FB923C', '#EA580C'] as const,

    // Card backgrounds
    card: ['rgba(15, 29, 50, 0.7)', 'rgba(10, 22, 40, 0.6)'] as const,
    cardGlow: ['rgba(20, 184, 166, 0.1)', 'rgba(251, 146, 60, 0.08)'] as const,

    // Button gradients
    button: ['#14B8A6', '#0D9488'] as const,
    buttonSecondary: ['#FB923C', '#EA580C'] as const,

    // Background gradients
    void: ['#0A1628', '#050D1A', '#020617'] as const,
    surface: ['#0F1D32', '#0A1628'] as const,

    // Home Screen Gradients (Dark Premium)
    recoveryCard: ['rgba(66, 42, 12, 0.8)', 'rgba(50, 30, 10, 0.9)'] as const, // Dark Amber
    heroCard: ['rgba(23, 37, 84, 0.9)', 'rgba(10, 15, 30, 0.95)'] as const, // Deep Blue/Black
    insightCard: ['rgba(30, 58, 138, 0.3)', 'rgba(23, 37, 84, 0.4)'] as const, // Subtle Blue
    heroGlow: ['rgba(59, 130, 246, 0.3)', 'rgba(37, 99, 235, 0.1)'] as const,
  },
};

// ============================================================================
// GLASS COMPONENT STYLES
// ============================================================================

export const glassStyles = {
  // Standard glass card
  card: {
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
  },

  // Elevated glass card (modals, overlays)
  cardElevated: {
    backgroundColor: liquidGlass.surface.elevated,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    borderRadius: 24,
  },

  // Subtle glass card (less prominent)
  cardSubtle: {
    backgroundColor: liquidGlass.surface.glassMedium,
    borderWidth: 1,
    borderColor: liquidGlass.border.subtle,
    borderRadius: 16,
  },

  // Input fields
  input: {
    backgroundColor: liquidGlass.surface.input,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 14,
  },

  // Primary button (teal, glass effect)
  button: {
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 50,
  },

  // Secondary button (outline)
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: liquidGlass.accent.primary,
    borderRadius: 50,
  },

  // Glass button (semi-transparent)
  buttonGlass: {
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    borderRadius: 50,
  },
};

// ============================================================================
// SHADOW DEFINITIONS
// ============================================================================

export const glassShadows = {
  // Soft shadow for subtle depth
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  // Medium shadow for cards
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },

  // Deep shadow for elevated elements (spec: 0 8px 32px rgba(0,0,0,0.3))
  deep: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 10,
  },

  // Teal glow
  glowTeal: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },

  // Orange glow
  glowOrange: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },

  // Ree button glow (pulsing effect)
  glowRee: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },

  // Strong glow for the Orb/Floating button
  glowStrong: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },

  // Extra strong glow for highlight elements
  glowExtraStrong: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },

  // Backward compatibility alias for generic glow
  glow: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

export const glassLayout = {
  screenPadding: 20,
  screenPaddingTop: 60,
  cardPadding: 20,
  cardPaddingLarge: 24,
  cardRadius: 20,
  cardRadiusLarge: 24,
  buttonRadius: 50,
  itemGap: 12,
  sectionGap: 24,
  tabBarHeight: 100,
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

// ============================================================================
// BLUR INTENSITY (for expo-blur)
// ============================================================================

export const blurIntensity = {
  subtle: 20,
  light: 40,
  medium: 60,
  strong: 80,
  extraStrong: 100,
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const glassAnimation = {
  // Quick transitions
  fast: 150,
  normal: 250,
  slow: 400,

  // Spring configs
  spring: {
    stiffness: 100,
    damping: 20,
  },
  springSnappy: {
    stiffness: 400,
    damping: 30,
  },
  springGentle: {
    stiffness: 60,
    damping: 15,
  },
};

export default liquidGlass;
