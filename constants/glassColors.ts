/**
 * Reebound Glass Colors
 * 
 * iOS-inspired glassmorphism color system optimized for dark navy backgrounds.
 * These colors create the frosted glass effect characteristic of iOS 26 Liquid Glass.
 */

const glassColors = {
  // Glass surfaces with blur (for dark backgrounds)
  glass: {
    // Spec: rgba(255, 255, 255, 0.08) for containers
    ultraLight: 'rgba(255, 255, 255, 0.12)',
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.06)',
    dark: 'rgba(255, 255, 255, 0.04)',
    subtle: 'rgba(255, 255, 255, 0.02)',
  },

  // Tinted glass surfaces (with color)
  glassTinted: {
    teal: 'rgba(20, 184, 166, 0.1)',
    tealStrong: 'rgba(20, 184, 166, 0.15)',
    orange: 'rgba(251, 146, 60, 0.1)',
    orangeStrong: 'rgba(251, 146, 60, 0.15)',
  },

  // Dark glass for overlays
  glassDark: {
    light: 'rgba(10, 22, 40, 0.5)',
    medium: 'rgba(10, 22, 40, 0.7)',
    heavy: 'rgba(10, 22, 40, 0.85)',
    solid: 'rgba(10, 22, 40, 0.95)',
  },

  // Borders with glass effect
  glassBorder: {
    ultraLight: 'rgba(255, 255, 255, 0.15)',
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.05)',
    teal: 'rgba(20, 184, 166, 0.3)',
    orange: 'rgba(251, 146, 60, 0.3)',
  },

  // Shadows for depth (spec: 0 8px 32px rgba(0,0,0,0.3))
  glassShadow: {
    soft: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.25)',
    strong: 'rgba(0, 0, 0, 0.3)',
    deep: 'rgba(0, 0, 0, 0.4)',
  },
};

// Enhanced shadows for glassmorphism
export const glassShadows = {
  // Subtle card shadow
  card: {
    shadowColor: glassColors.glassShadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  // Elevated card shadow (spec: 0 8px 32px rgba(0,0,0,0.3))
  cardElevated: {
    shadowColor: glassColors.glassShadow.strong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
  },
  // Floating elements (modals, overlays)
  floating: {
    shadowColor: glassColors.glassShadow.deep,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 12,
  },
  // Teal glow effect
  glowTeal: {
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  // Orange glow effect
  glowOrange: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};

// Backdrop blur values (for expo-blur BlurView)
export const blurIntensity = {
  subtle: 15,
  light: 30,
  medium: 50,
  strong: 70,
  extraStrong: 90,
};

export default glassColors;
