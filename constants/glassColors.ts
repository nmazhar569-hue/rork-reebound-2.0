// iOS-inspired glassmorphism color system
const glassColors = {
  // Base glass surfaces with blur
  glass: {
    light: 'rgba(255, 255, 255, 0.70)',
    medium: 'rgba(255, 255, 255, 0.55)',
    dark: 'rgba(255, 255, 255, 0.40)',
    subtle: 'rgba(255, 255, 255, 0.25)',
  },
  
  // Tinted glass surfaces
  glassTinted: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.65)',
    dark: 'rgba(255, 255, 255, 0.45)',
  },
  
  // Dark glass for overlays
  glassDark: {
    light: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(0, 0, 0, 0.25)',
    dark: 'rgba(0, 0, 0, 0.40)',
  },
  
  // Borders with glass effect
  glassBorder: {
    light: 'rgba(255, 255, 255, 0.40)',
    medium: 'rgba(255, 255, 255, 0.30)',
    subtle: 'rgba(255, 255, 255, 0.18)',
  },
  
  // Shadows for depth
  glassShadow: {
    soft: 'rgba(0, 0, 0, 0.08)',
    medium: 'rgba(0, 0, 0, 0.12)',
    strong: 'rgba(0, 0, 0, 0.20)',
  },
};

// Enhanced shadows for glassmorphism
export const glassShadows = {
  card: {
    shadowColor: glassColors.glassShadow.soft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  cardElevated: {
    shadowColor: glassColors.glassShadow.medium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 6,
  },
  floating: {
    shadowColor: glassColors.glassShadow.strong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 36,
    elevation: 8,
  },
};

// Backdrop blur values (for iOS BlurView)
export const blurIntensity = {
  subtle: 15,
  light: 30,
  medium: 50,
  strong: 80,
  extraStrong: 100,
};

export default glassColors;
