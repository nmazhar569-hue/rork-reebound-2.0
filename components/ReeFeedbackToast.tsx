import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, Activity, AlertCircle, Lightbulb } from 'lucide-react-native';

import { theme } from '@/constants/theme';

/**
 * ReeFeedbackToast Component
 * 
 * Real-time feedback toast that appears after logging each set.
 * Shows encouragement, progress notes, or suggestions.
 */

export type FeedbackType = 'progress' | 'encouragement' | 'suggestion' | 'warning';

interface ReeFeedbackToastProps {
    visible: boolean;
    type: FeedbackType;
    message: string;
    emoji?: string;
    onDismiss: () => void;
    autoDismiss?: boolean;
    dismissDelay?: number;
}

export function ReeFeedbackToast({
    visible,
    type,
    message,
    emoji,
    onDismiss,
    autoDismiss = true,
    dismissDelay = 4000,
}: ReeFeedbackToastProps) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Animate in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    tension: 100,
                    friction: 12,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss
            if (autoDismiss) {
                const timer = setTimeout(() => {
                    handleDismiss();
                }, dismissDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [visible, autoDismiss, dismissDelay, translateY, opacity]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    if (!visible) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'progress':
                return {
                    icon: TrendingUp,
                    iconColor: theme.colors.primary,
                    bgColor: `${theme.colors.primary}15`,
                    borderColor: `${theme.colors.primary}30`,
                };
            case 'encouragement':
                return {
                    icon: Activity,
                    iconColor: theme.colors.primary,
                    bgColor: `${theme.colors.primary}15`,
                    borderColor: `${theme.colors.primary}30`,
                };
            case 'suggestion':
                return {
                    icon: Lightbulb,
                    iconColor: theme.colors.secondary,
                    bgColor: `${theme.colors.secondary}15`,
                    borderColor: `${theme.colors.secondary}30`,
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    iconColor: theme.colors.secondary,
                    bgColor: `${theme.colors.secondary}15`,
                    borderColor: `${theme.colors.secondary}30`,
                };
        }
    };

    const typeStyles = getTypeStyles();
    const Icon = typeStyles.icon;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: typeStyles.bgColor,
                    borderColor: typeStyles.borderColor,
                },
            ]}
        >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {emoji ? (
                        <Text style={styles.emoji}>{emoji}</Text>
                    ) : (
                        <Icon size={20} color={typeStyles.iconColor} />
                    )}
                </View>

                <Text style={styles.message}>{message}</Text>

                <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn}>
                    <X size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// Helper to generate feedback based on set performance
export function generateSetFeedback(
    currentReps: number,
    currentWeight: number,
    previousReps?: number,
    previousWeight?: number,
    setNumber?: number,
    targetReps?: string,
): { type: FeedbackType; message: string; emoji?: string } {

    // First set of workout
    if (setNumber === 1) {
        return {
            type: 'encouragement',
            message: `Great start! ${currentReps} reps at ${currentWeight} lbs.`,
            emoji: '💪',
        };
    }

    // Comparing to previous session
    if (previousReps && previousWeight) {
        const weightDiff = currentWeight - previousWeight;
        const repsDiff = currentReps - previousReps;

        // Weight increased
        if (weightDiff > 0) {
            return {
                type: 'progress',
                message: `You're up ${weightDiff} lbs from last week. Nice progress!`,
                emoji: '📈',
            };
        }

        // Reps improved at same weight
        if (weightDiff === 0 && repsDiff > 0) {
            return {
                type: 'progress',
                message: `${currentReps} reps—that's ${repsDiff} more than last time. You're progressing!`,
                emoji: '💪',
            };
        }

        // Reps dropped significantly
        if (repsDiff < -3) {
            return {
                type: 'suggestion',
                message: `${currentReps} reps this set (down from ${previousReps}). Fatigue is normal. Consider resting 30s longer or dropping weight 5-10 lbs.`,
            };
        }

        // Performance similar
        return {
            type: 'encouragement',
            message: `Solid set. ${currentReps} × ${currentWeight} lbs in the books.`,
        };
    }

    // Default encouragement
    return {
        type: 'encouragement',
        message: `Set logged: ${currentReps} × ${currentWeight} lbs`,
    };
}

// Generate post-exercise feedback
export function generateExerciseFeedback(
    sets: Array<{ reps: number; weight: number }>,
    targetReps?: string,
    previousBest?: { reps: number; weight: number },
): { type: FeedbackType; message: string; emoji?: string } {

    const avgReps = sets.reduce((sum, s) => sum + s.reps, 0) / sets.length;
    const maxWeight = Math.max(...sets.map(s => s.weight));
    const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);

    // Check if ready to progress
    if (avgReps >= 10 && sets.every(s => s.reps >= 8)) {
        return {
            type: 'progress',
            message: `${sets.map(s => s.reps).join(', ')} reps at ${maxWeight} lbs. You're ready to move up to ${maxWeight + 5} lbs next session.`,
            emoji: '🎯',
        };
    }

    // Compared to previous best
    if (previousBest && maxWeight > previousBest.weight) {
        return {
            type: 'progress',
            message: `New personal best! ${maxWeight} lbs is ${maxWeight - previousBest.weight} lbs heavier than before.`,
            emoji: '🏆',
        };
    }

    // Struggled
    if (avgReps < 6) {
        return {
            type: 'suggestion',
            message: `You hit ${sets.map(s => s.reps).join(', ')} reps. Consider dropping weight 5-10% next time for better form and muscle activation.`,
        };
    }

    // Standard completion
    return {
        type: 'encouragement',
        message: `Exercise complete. ${sets.length} sets, ${totalReps} total reps at ${maxWeight} lbs.`,
        emoji: '✅',
    };
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 18,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
    dismissBtn: {
        padding: 4,
    },
});

export default ReeFeedbackToast;
