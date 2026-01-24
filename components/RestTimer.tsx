import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Plus, SkipForward } from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

/**
 * RestTimer Component
 * 
 * Circular countdown timer with teal → orange gradient progress.
 * Features:
 * - Circular progress indicator
 * - Skip and +30s buttons
 * - Notification when complete
 */

interface RestTimerProps {
    duration: number; // in seconds
    onComplete: () => void;
    onSkip?: () => void;
    isActive: boolean;
}

export function RestTimer({
    duration,
    onComplete,
    onSkip,
    isActive,
}: RestTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [totalDuration, setTotalDuration] = useState(duration);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        haptics.notification('success');
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, onComplete, timeLeft]);

    // Update progress animation
    useEffect(() => {
        const progress = (totalDuration - timeLeft) / totalDuration;
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    }, [timeLeft, totalDuration, progressAnim]);

    const handleAddTime = () => {
        haptics.light();
        setTimeLeft(prev => prev + 30);
        setTotalDuration(prev => prev + 30);
    };

    const handleSkip = () => {
        haptics.medium();
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setTimeLeft(0);
        onSkip?.();
        onComplete();
    };

    // Reset when duration changes
    useEffect(() => {
        setTimeLeft(duration);
        setTotalDuration(duration);
    }, [duration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const size = 160;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const progress = (totalDuration - timeLeft) / totalDuration;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.container}>
            {/* Timer circle */}
            <View style={styles.timerCircle}>
                <Svg width={size} height={size} style={styles.progressRing}>
                    {/* Background circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />

                    {/* Progress circle */}
                    <Defs>
                        <SvgGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={theme.colors.primary} />
                            <Stop offset="100%" stopColor={theme.colors.secondary} />
                        </SvgGradient>
                    </Defs>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#timerGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>

                {/* Timer display */}
                <View style={styles.timerDisplay}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <Text style={styles.timerLabel}>Rest Time</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} onPress={handleAddTime}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <Plus size={18} color={theme.colors.text} />
                    <Text style={styles.controlText}>+30s</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <SkipForward size={18} color={theme.colors.primary} />
                    <Text style={[styles.controlText, { color: theme.colors.primary }]}>Skip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 24,
    },
    timerCircle: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressRing: {
        position: 'absolute',
    },
    timerDisplay: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 36,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 2,
    },
    timerLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    controls: {
        flexDirection: 'row',
        gap: 16,
    },
    controlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        backgroundColor: `${theme.colors.primary}15`,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}30`,
        overflow: 'hidden',
    },
    controlText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
});

export default RestTimer;
