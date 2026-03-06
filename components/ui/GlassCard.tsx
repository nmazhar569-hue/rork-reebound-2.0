import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

/**
 * Reebound Liquid Glass Design System - GlassCard Component
 * 
 * Premium glass panel with blur, glow, and micro-interactions.
 * Implements iOS 26 "Liquid Glass" material design with:
 * - Deep navy background (#0A1628)
 * - Frosted glass effect (backdrop-filter: blur(20px))
 * - Semi-transparent surfaces (rgba(255,255,255,0.08))
 * - Teal/Orange accent glows
 */

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'elevated' | 'subtle' | 'solid';
    glowColor?: 'teal' | 'orange' | 'gradient' | 'none';
    interactive?: boolean;
    onPress?: () => void;
    padding?: number;
    noPadding?: boolean;
}

export function GlassCard({
    children,
    style,
    variant = 'default',
    glowColor = 'none',
    interactive = false,
    onPress,
    padding,
    noPadding = false,
}: GlassCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            if (interactive) {
                scale.value = withSpring(0.97, { stiffness: 400, damping: 20 });
            }
        })
        .onEnd(() => {
            if (interactive) {
                scale.value = withSpring(1, { stiffness: 400, damping: 20 });
                if (onPress) {
                    onPress();
                }
            }
        })
        .onFinalize(() => {
            scale.value = withSpring(1, { stiffness: 400, damping: 20 });
        });

    const variantStyles = {
        default: styles.default,
        elevated: styles.elevated,
        subtle: styles.subtle,
        solid: styles.solid,
    };

    const glowStyles = {
        teal: styles.glowTeal,
        orange: styles.glowOrange,
        gradient: styles.glowGradient,
        none: {},
    };

    const contentPadding = noPadding ? 0 : (padding ?? 20);

    const content = (
        <View style={[styles.container, variantStyles[variant], glowStyles[glowColor], style]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.innerBorder} />
            <View style={[styles.content, { padding: contentPadding }]}>
                {children}
            </View>
        </View>
    );

    if (interactive) {
        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View style={animatedStyle}>
                    {content}
                </Animated.View>
            </GestureDetector>
        );
    }

    return content;
}

/**
 * Reebound Liquid Glass Design Tokens
 */
export const liquidGlassTokens = {
    // Deep Navy Background
    background: {
        primary: '#0A1628',
        secondary: '#0F1D32',
        deep: '#050D1A',
    },

    // The Void - Deep space gradient background
    voidGradient: {
        colors: ['#0A1628', '#050D1A', '#020617'],
        locations: [0, 0.5, 1],
        start: { x: 0.5, y: 0 },
        end: { x: 0.5, y: 1 },
    },

    // Glass material properties (spec: rgba(255,255,255,0.08))
    glass: {
        background: 'rgba(255, 255, 255, 0.08)',
        backgroundElevated: 'rgba(255, 255, 255, 0.12)',
        blur: 20, // backdrop-filter: blur(20px)
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
    },

    // Accent colors with glow
    accents: {
        teal: {
            color: '#14B8A6',
            light: '#2DD4BF',
            dark: '#0D9488',
            glow: 'rgba(20, 184, 166, 0.4)',
            glowRadius: 16,
        },
        orange: {
            color: '#FB923C',
            light: '#FDBA74',
            dark: '#EA580C',
            glow: 'rgba(251, 146, 60, 0.4)',
            glowRadius: 16,
        },
    },

    // Text colors (for navy background)
    text: {
        primary: '#FFFFFF',
        secondary: '#94A3B8',
        tertiary: '#64748B',
        accent: '#14B8A6',
        accentSecondary: '#FB923C',
    },

    // Gradients
    gradients: {
        // Holistic gradient (Ree button rim)
        primary: ['#14B8A6', '#FB923C'],
        reeButton: ['#14B8A6', '#2DD4BF', '#FDBA74', '#FB923C'],
        teal: ['#14B8A6', '#2DD4BF'],
        orange: ['#FB923C', '#FDBA74'],
    },

    // Spring physics for animations
    spring: {
        stiffness: 100,
        damping: 20,
    },
    springSnappy: {
        stiffness: 400,
        damping: 30,
    },
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // spec: glass container color
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    default: {
        // spec: 0 8px 32px rgba(0,0,0,0.3)
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 8,
    },
    elevated: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 12,
    },
    subtle: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    solid: {
        backgroundColor: 'rgba(15, 29, 50, 0.9)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 8,
    },
    glowTeal: {
        shadowColor: '#14B8A6',
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    glowOrange: {
        shadowColor: '#FB923C',
        shadowOpacity: 0.4,
        shadowRadius: 16,
    },
    glowGradient: {
        // For gradient glow, we'd need multiple shadow layers
        // Using teal as primary glow
        shadowColor: '#14B8A6',
        shadowOpacity: 0.35,
        shadowRadius: 20,
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        borderWidth: 1,
        // Specular edge - top/left brighter
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderRightColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomColor: 'rgba(255, 255, 255, 0.02)',
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
});

export default GlassCard;
