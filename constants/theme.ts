/**
 * Reebound Design System - Central Theme Export
 * 
 * This file provides a unified export for all design system constants,
 * making it easy to import consistent styles throughout the app.
 * 
 * Usage:
 * import { theme, gradients, shadows } from '@/constants/theme';
 */

import colors, {
    gradients as colorGradients,
    spacing,
    borderRadius,
    shadows as colorShadows,
    typography,
    layout,
    animation
} from './colors';

import {
    liquidGlass,
    glassStyles,
    glassShadows,
    glassLayout,
    blurIntensity,
    glassAnimation
} from './liquidGlass';

// ============================================================================
// UNIFIED THEME OBJECT
// ============================================================================

export const theme = {
    // ===== COLORS =====
    colors: {
        // Backgrounds
        background: '#0A1628',
        backgroundDeep: '#050D1A',
        backgroundWarm: '#0F1D32',

        // Primary - Empowerment Teal
        primary: '#14B8A6',
        primaryLight: '#2DD4BF',
        primaryDark: '#0D9488',

        // Secondary - Recovery Orange
        secondary: '#FB923C',
        secondaryLight: '#FDBA74',
        secondaryDark: '#EA580C',

        // Text
        text: '#FFFFFF',
        textSecondary: '#94A3B8',
        textTertiary: '#64748B',
        textInverse: '#0A1628',

        // Status
        success: '#14B8A6',
        warning: '#FB923C',
        danger: '#EF4444',
        info: '#3B82F6',

        // Glass surfaces
        glass: 'rgba(255, 255, 255, 0.08)',
        glassLight: 'rgba(255, 255, 255, 0.12)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
    },

    // ===== GRADIENTS =====
    gradients: {
        // Holistic (Teal → Orange) - Ree button rim
        primary: ['#14B8A6', '#FB923C'] as const,
        reeButton: ['#14B8A6', '#2DD4BF', '#FDBA74', '#FB923C'] as const,

        // Teal focused
        teal: ['#14B8A6', '#2DD4BF'] as const,
        tealButton: ['#14B8A6', '#0D9488'] as const,

        // Orange focused
        orange: ['#FB923C', '#FDBA74'] as const,
        orangeButton: ['#FB923C', '#EA580C'] as const,

        // Background
        void: ['#0A1628', '#050D1A', '#020617'] as const,
    },

    // ===== SPACING =====
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },

    // ===== BORDER RADIUS (16-24px per spec) =====
    radius: {
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
        full: 9999,
    },

    // ===== SHADOWS =====
    shadows: {
        // spec: 0 8px 32px rgba(0,0,0,0.3)
        card: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 32,
            elevation: 8,
        },
        glowTeal: {
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 6,
        },
        glowOrange: {
            shadowColor: '#FB923C',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 6,
        },
    },

    // ===== TYPOGRAPHY =====
    typography: {
        // Headings (24-32pt, Bold)
        heading: {
            fontSize: 28,
            fontWeight: '700' as const,
            color: '#FFFFFF',
            letterSpacing: -0.5,
        },
        headingLarge: {
            fontSize: 32,
            fontWeight: '700' as const,
            color: '#FFFFFF',
            letterSpacing: -0.6,
        },
        // Body (16pt, Regular)
        body: {
            fontSize: 16,
            color: '#FFFFFF',
            lineHeight: 24,
        },
        bodySecondary: {
            fontSize: 16,
            color: '#94A3B8',
            lineHeight: 24,
        },
        // Metrics (18pt, Medium)
        metric: {
            fontSize: 18,
            fontWeight: '500' as const,
            color: '#FFFFFF',
        },
        // Caption
        caption: {
            fontSize: 13,
            color: '#64748B',
        },
    },

    // ===== LAYOUT =====
    layout: {
        screenPadding: 20,
        cardPadding: 20,
        tabBarHeight: 100,
        gap: 12,
        sectionGap: 24,
    },
};

// ============================================================================
// GLASS CARD PRESETS
// ============================================================================

export const glassCard = {
    // Standard frosted card
    default: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 8,
    },
    // Elevated (modals)
    elevated: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 12,
    },
    // Teal glow
    tealGlow: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(20, 184, 166, 0.3)',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 6,
    },
};

// ============================================================================
// BUTTON PRESETS
// ============================================================================

export const buttonStyles = {
    // Primary teal button
    primary: {
        backgroundColor: '#14B8A6',
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    // Outline button
    outline: {
        backgroundColor: 'transparent',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#14B8A6',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    // Glass button
    glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
};

// Re-export all original exports for backward compatibility
export {
    colors as colorPalette,
    colorGradients,
    spacing,
    borderRadius,
    colorShadows,
    typography,
    layout,
    animation,
    liquidGlass,
    glassStyles,
    glassShadows,
    glassLayout,
    blurIntensity,
    glassAnimation,
};

export default theme;
