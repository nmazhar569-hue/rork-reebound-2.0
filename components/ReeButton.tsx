import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * ReeButton Component
 * 
 * Circular button with gradient rim (Teal → Orange) for triggering Ree's analysis.
 * Features:
 * - Gradient rim: Teal (left) → Orange (right) smooth blend
 * - Subtle pulsing glow when new insights available
 * - Semi-transparent glass effect center
 * - Avatar icon placeholder
 */

interface ReeButtonProps {
    onPress: () => void;
    hasNewInsights?: boolean;
    size?: number;
}

export function ReeButton({
    onPress,
    hasNewInsights = false,
    size = 72,
}: ReeButtonProps) {
    // Pulsing animation for new insights
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (hasNewInsights) {
            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Glow animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.7,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.4,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
            glowAnim.setValue(0.4);
        }
    }, [hasNewInsights, pulseAnim, glowAnim]);

    const handlePress = () => {
        haptics.medium();
        onPress();
    };

    const rimWidth = 3;
    const innerSize = size - (rimWidth * 2);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                style={styles.touchable}
            >
                <Animated.View
                    style={[
                        styles.buttonWrapper,
                        {
                            width: size,
                            height: size,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                >
                    {/* Gradient rim using SVG for smooth teal → orange blend */}
                    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
                        <Defs>
                            <SvgGradient id="rimGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                                <Stop offset="0%" stopColor={theme.colors.primary} />
                                <Stop offset="50%" stopColor={theme.colors.primaryLight} />
                                <Stop offset="75%" stopColor={theme.colors.secondaryLight} />
                                <Stop offset="100%" stopColor={theme.colors.secondary} />
                            </SvgGradient>
                        </Defs>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={(size / 2) - (rimWidth / 2)}
                            stroke="url(#rimGradient)"
                            strokeWidth={rimWidth}
                            fill="transparent"
                        />
                    </Svg>

                    {/* Inner glass circle */}
                    <View style={[styles.innerCircle, { width: innerSize, height: innerSize }]}>
                        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.glassOverlay} />

                        {/* Avatar icon */}
                        <View style={styles.avatarContainer}>
                            <Image
                                source={require('@/assets/images/ree-avatar.png')}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* Pulsing glow effect when new insights */}
                    {hasNewInsights && (
                        <Animated.View
                            style={[
                                styles.glowEffect,
                                {
                                    width: size + 20,
                                    height: size + 20,
                                    opacity: glowAnim,
                                },
                            ]}
                        />
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* Label */}
            <Text style={styles.label}>Ree Analysis</Text>

            {/* Notification dot for new insights */}
            {hasNewInsights && (
                <View style={styles.notificationDot} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
    },
    touchable: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        ...glassShadows.glowTeal,
    },
    innerCircle: {
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(10, 22, 40, 0.8)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        padding: 6, // Add some padding so the image doesn't touch the rim exactly
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    glowEffect: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: theme.colors.primary,
        zIndex: -1, // Ensure glow is behind the button
    },
    notificationDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.secondary,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },
});

export default ReeButton;
