import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * VoidBackground Component
 * 
 * The "Void" - A deep navy background that creates a calm, premium feeling.
 * Light originates from the top (the "Ree" intelligence).
 * This is the global background for the entire app.
 * 
 * Background: #0A1628 (Deep Navy)
 */

interface VoidBackgroundProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'warm' | 'subtle';
    showGlow?: boolean;
}

export function VoidBackground({
    children,
    style,
    variant = 'default',
    showGlow = true,
}: VoidBackgroundProps) {
    const insets = useSafeAreaInsets();

    // Deep Navy gradient palette
    const gradientColors = {
        default: ['#0A1628', '#050D1A', '#020617'] as const,
        warm: ['#0F1D32', '#0A1628', '#050D1A'] as const,
        subtle: ['#0A1628', '#0A1628', '#050D1A'] as const,
    };

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={gradientColors[variant]}
                locations={[0, 0.5, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {/* Subtle teal radial glow at top - representing Ree's presence */}
            {showGlow && <View style={styles.topGlow} />}
            <View style={[styles.content, { paddingTop: insets.top }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628', // Deep Navy base
    },
    topGlow: {
        position: 'absolute',
        top: -120,
        left: '20%',
        right: '20%',
        height: 300,
        borderRadius: 150,
        // Teal glow (#14B8A6) - subtle presence
        backgroundColor: 'rgba(20, 184, 166, 0.06)',
        transform: [{ scaleX: 2.5 }],
    },
    content: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
});

export default VoidBackground;
