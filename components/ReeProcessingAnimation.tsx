import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { theme } from '@/constants/theme';

/**
 * ReeProcessingAnimation Component
 * 
 * Abstract liquid motion animation shown while Ree analyzes data.
 * Features teal/orange gradient flowing effect.
 */

interface ReeProcessingAnimationProps {
    message?: string;
}

export function ReeProcessingAnimation({
    message = "Analyzing your data...",
}: ReeProcessingAnimationProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const pulse1 = useRef(new Animated.Value(0.6)).current;
    const pulse2 = useRef(new Animated.Value(0.4)).current;
    const pulse3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Rotation animation
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animations with staggered timing
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse1, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse1, {
                    toValue: 0.6,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(300),
                Animated.timing(pulse2, {
                    toValue: 0.8,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse2, {
                    toValue: 0.4,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.delay(600),
                Animated.timing(pulse3, {
                    toValue: 0.6,
                    duration: 1400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse3, {
                    toValue: 0.3,
                    duration: 1400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [rotation, pulse1, pulse2, pulse3]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* Background glow effects */}
            <Animated.View style={[styles.glowRing, styles.glowRing1, { opacity: pulse1 }]}>
                <LinearGradient
                    colors={[`${theme.colors.primary}40`, 'transparent']}
                    style={styles.glowGradient}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
            </Animated.View>

            <Animated.View style={[styles.glowRing, styles.glowRing2, { opacity: pulse2 }]}>
                <LinearGradient
                    colors={[`${theme.colors.secondary}30`, 'transparent']}
                    style={styles.glowGradient}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
            </Animated.View>

            <Animated.View style={[styles.glowRing, styles.glowRing3, { opacity: pulse3 }]}>
                <LinearGradient
                    colors={[`${theme.colors.primary}20`, 'transparent']}
                    style={styles.glowGradient}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
            </Animated.View>

            {/* Rotating gradient ring */}
            <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
                <Svg width={120} height={120}>
                    <Defs>
                        <SvgGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="1" />
                            <Stop offset="50%" stopColor={theme.colors.primaryLight} stopOpacity="0.8" />
                            <Stop offset="75%" stopColor={theme.colors.secondaryLight} stopOpacity="0.6" />
                            <Stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0.4" />
                        </SvgGradient>
                    </Defs>
                    <Circle
                        cx={60}
                        cy={60}
                        r={54}
                        stroke="url(#spinnerGradient)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeDasharray="100 200"
                        fill="transparent"
                    />
                </Svg>
            </Animated.View>

            {/* Center icon */}
            <View style={styles.centerIcon}>
                <Text style={styles.reeText}>R</Text>
            </View>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Animated dots */}
            <View style={styles.dotsContainer}>
                <Animated.View style={[styles.dot, { opacity: pulse1 }]} />
                <Animated.View style={[styles.dot, { opacity: pulse2 }]} />
                <Animated.View style={[styles.dot, { opacity: pulse3 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    glowRing: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowRing1: {
        width: 180,
        height: 180,
    },
    glowRing2: {
        width: 220,
        height: 220,
    },
    glowRing3: {
        width: 260,
        height: 260,
    },
    glowGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 999,
    },
    spinnerContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIcon: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    reeText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
    },
    message: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 32,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
    },
});

export default ReeProcessingAnimation;
