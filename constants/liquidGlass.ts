export const liquidGlass = {
  background: {
    primary: '#0A1A1F',
    secondary: '#0D2229',
    tertiary: '#112A33',
    gradient: ['#0A1A1F', '#0D2229', '#0A1A1F'] as const,
  },
  
  accent: {
    primary: '#00D9B8',
    secondary: '#20E3B2',
    tertiary: '#4FFFDC',
    muted: 'rgba(0, 217, 184, 0.15)',
    glow: 'rgba(0, 217, 184, 0.3)',
  },
  
  surface: {
    glass: 'rgba(20, 50, 60, 0.6)',
    glassLight: 'rgba(30, 70, 85, 0.5)',
    glassDark: 'rgba(10, 30, 40, 0.8)',
    card: 'rgba(20, 55, 65, 0.65)',
    cardHover: 'rgba(25, 65, 80, 0.7)',
    elevated: 'rgba(30, 80, 95, 0.5)',
  },
  
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.45)',
    inverse: '#0A1A1F',
    accent: '#00D9B8',
  },
  
  border: {
    glass: 'rgba(0, 217, 184, 0.2)',
    glassLight: 'rgba(255, 255, 255, 0.1)',
    glassMedium: 'rgba(0, 217, 184, 0.3)',
    subtle: 'rgba(255, 255, 255, 0.05)',
  },
  
  status: {
    success: '#00D9B8',
    successMuted: 'rgba(0, 217, 184, 0.15)',
    warning: '#FFB84D',
    warningMuted: 'rgba(255, 184, 77, 0.15)',
    danger: '#FF6B6B',
    dangerMuted: 'rgba(255, 107, 107, 0.15)',
    info: '#4DA6FF',
    infoMuted: 'rgba(77, 166, 255, 0.15)',
  },
  
  progress: {
    workout: '#00D9B8',
    recovery: '#FF6B9D',
    nutrition: '#FFB84D',
    progress: '#4DA6FF',
  },
  
  gradients: {
    primary: ['#00D9B8', '#00A896'] as const,
    accent: ['#20E3B2', '#00D9B8'] as const,
    card: ['rgba(20, 55, 65, 0.7)', 'rgba(15, 45, 55, 0.6)'] as const,
    glow: ['rgba(0, 217, 184, 0.2)', 'rgba(0, 217, 184, 0.05)'] as const,
    button: ['#00D9B8', '#00C4A7'] as const,
    warmAccent: ['#FF6B9D', '#FF8A65'] as const,
  },
};

export const glassStyles = {
  card: {
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
  },
  cardElevated: {
    backgroundColor: liquidGlass.surface.elevated,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassMedium,
    borderRadius: 24,
  },
  input: {
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    borderRadius: 14,
  },
  button: {
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 50,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: liquidGlass.accent.primary,
    borderRadius: 50,
  },
};

export const glassShadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: liquidGlass.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  glowStrong: {
    shadowColor: liquidGlass.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const glassLayout = {
  screenPadding: 20,
  screenPaddingTop: 60,
  cardPadding: 20,
  cardRadius: 20,
  cardRadiusLarge: 24,
  buttonRadius: 50,
  itemGap: 12,
  sectionGap: 24,
  tabBarHeight: 100,
};

export default liquidGlass;
