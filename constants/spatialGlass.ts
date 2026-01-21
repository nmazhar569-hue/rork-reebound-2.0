/**
 * Liquid Glass / VisionOS Spatial Design System
 * 
 * This is NOT standard glassmorphism. This is Spatial Glass with:
 * - Physical depth and Z-axis layering
 * - Luminance layers that catch light
 * - Specular edges (3D ridge effect)
 * - Color-aware shadows
 * - Interactive physics (lift, brighten, glow)
 */

import { ViewStyle, TextStyle } from 'react-native';
import { modeColors, AppMode } from './modeColors';

// ============================================================================
// LAYER 0: Background (Deep, Vibrant Foundation)
// ============================================================================

export const spatialBackgrounds = {
  light: {
    gradient: ['#F5F7FA', '#E8ECF1', '#DFE4E9'] as const,
    vibrant: ['#E3F2FD', '#F3E5F5', '#FFF3E0'] as const,
  },
  dark: {
    gradient: ['#0A0E14', '#151B24', '#1F2733'] as const,
    vibrant: ['#1A1F3A', '#2D1F3A', '#1F3A2D'] as const,
  },
};

// ============================================================================
// CORE SPATIAL GLASS MATERIAL
// ============================================================================

/**
 * The base glass material with physical properties
 * - High blur strength (25-40px equivalent)
 * - Luminance layer (catches light)
 * - Color saturation boost
 */
export const glassLayers = {
  /**
   * LAYER 1: Canvas Glass (Main container)
   * The primary glass sheet that sits above the background
   */
  canvas: {
    light: {
      // Luminance layer - white with low opacity
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      // Specular edge - creates 3D ridge effect
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      // Soft, wide shadow
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 8,
    },
    dark: {
      backgroundColor: 'rgba(30, 30, 30, 0.22)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 8,
    },
  },

  /**
   * LAYER 2: Control Glass (Buttons, Cards, Interactive Elements)
   * Brighter and more opaque than Layer 1 - closer to user
   */
  control: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 6,
    },
    dark: {
      backgroundColor: 'rgba(50, 50, 50, 0.4)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 6,
    },
  },

  /**
   * LAYER 3: Elevated Glass (Modal, Floating Elements)
   * Highest Z-index - brightest material
   */
  elevated: {
    light: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.8)',
      shadowColor: 'rgba(0, 0, 0, 0.12)',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 1,
      shadowRadius: 40,
      elevation: 12,
    },
    dark: {
      backgroundColor: 'rgba(70, 70, 70, 0.5)',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 1,
      shadowRadius: 40,
      elevation: 12,
    },
  },
};

// ============================================================================
// SPECULAR EDGE SYSTEM (3D Ridge Effect)
// ============================================================================

/**
 * Creates the illusion of a physical glass edge that catches light
 * Top/left edges are brighter, bottom/right are darker
 */
export const specularEdge = {
  light: {
    top: 'rgba(255, 255, 255, 0.4)',
    left: 'rgba(255, 255, 255, 0.4)',
    bottom: 'rgba(0, 0, 0, 0.05)',
    right: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    top: 'rgba(255, 255, 255, 0.4)',
    left: 'rgba(255, 255, 255, 0.4)',
    bottom: 'rgba(0, 0, 0, 0.2)',
    right: 'rgba(0, 0, 0, 0.3)',
  },
};

// ============================================================================
// COLORED SHADOWS (Mode-Aware Glows)
// ============================================================================

/**
 * Shadows derived from the object's color, not just black
 * Creates a soft glow effect that feels more natural
 */
export const coloredShadows = (mode: AppMode, theme: 'light' | 'dark') => {
  const colors = modeColors[mode];
  const baseOpacity = theme === 'light' ? 0.2 : 0.4;
  
  return {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: baseOpacity,
    shadowRadius: 25,
    elevation: 8,
  };
};

// ============================================================================
// INTERACTION PHYSICS
// ============================================================================

/**
 * Physical behaviors for touch interactions
 */
export const interactionPhysics = {
  /**
   * Hover/Touch State: Element "lifts" toward user
   * - Scale up 2%
   * - Increase shadow intensity
   * - Brighten luminance layer
   */
  hover: {
    scale: 1.02,
    shadowMultiplier: 1.5,
    brightnessBoost: 0.1, // Add 10% more white opacity
  },

  /**
   * Active/Press State: Element compresses slightly
   */
  active: {
    scale: 0.98,
    shadowMultiplier: 0.7,
    brightnessBoost: 0,
  },

  /**
   * Transition timing for physics-based animations
   */
  timing: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design standard easing
  },
};

// ============================================================================
// BLUR STRENGTHS
// ============================================================================

/**
 * React Native BlurView intensity values
 * Note: React Native doesn't have backdrop-filter, we use BlurView component
 */
export const blurStrength = {
  canvas: 95,    // Main container - strongest blur
  control: 80,   // Interactive elements - medium blur
  elevated: 90,  // Floating elements - strong blur
  subtle: 60,    // Background accents - light blur
};

// ============================================================================
// BORDER RADIUS (Spatial Design Language)
// ============================================================================

export const spatialRadius = {
  small: 12,
  medium: 18,
  large: 24,
  card: 20,
  button: 16,
  modal: 28,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a complete glass card style for a given layer and theme
 */
export function createGlassCard(
  layer: 'canvas' | 'control' | 'elevated',
  theme: 'light' | 'dark',
  mode?: AppMode
): ViewStyle {
  const baseStyle = glassLayers[layer][theme];
  
  return {
    ...baseStyle,
    borderRadius: spatialRadius.card,
    overflow: 'hidden',
    // Add colored shadow if mode is provided
    ...(mode ? coloredShadows(mode, theme) : {}),
  };
}

/**
 * Generate hover state for an interactive element
 */
export function createHoverState(
  baseStyle: ViewStyle,
  theme: 'light' | 'dark'
): ViewStyle {
  const physics = interactionPhysics.hover;
  const baseColor = theme === 'light' 
    ? 'rgba(255, 255, 255, 0.4)' 
    : 'rgba(50, 50, 50, 0.4)';
  
  // Parse base opacity and add brightness boost
  const baseOpacity = parseFloat(baseColor.split(',')[3]?.replace(')', '') || '0.4');
  const newOpacity = Math.min(baseOpacity + physics.brightnessBoost, 0.9);
  
  const newColor = theme === 'light'
    ? `rgba(255, 255, 255, ${newOpacity})`
    : `rgba(70, 70, 70, ${newOpacity})`;
  
  return {
    ...baseStyle,
    backgroundColor: newColor,
    transform: [{ scale: physics.scale }],
  };
}

/**
 * Typography for spatial glass UI
 * Text must be high-contrast to remain readable through glass
 */
export const spatialTypography = {
  light: {
    primary: '#0A0E14',
    secondary: '#4A5568',
    tertiary: '#718096',
    inverted: '#FFFFFF',
  },
  dark: {
    primary: '#FFFFFF',
    secondary: '#CBD5E0',
    tertiary: '#A0AEC0',
    inverted: '#0A0E14',
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  backgrounds: spatialBackgrounds,
  layers: glassLayers,
  edges: specularEdge,
  shadows: coloredShadows,
  physics: interactionPhysics,
  blur: blurStrength,
  radius: spatialRadius,
  typography: spatialTypography,
  createCard: createGlassCard,
  createHover: createHoverState,
};
