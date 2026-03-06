import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Utensils, Calendar, TrendingUp, LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * QuickActions Component
 * 
 * Contextual quick action buttons below the Ree button.
 * Actions change based on context (workout ready, rest day, etc.)
 */

interface QuickAction {
    id: string;
    label: string;
    icon: LucideIcon;
    variant: 'primary' | 'secondary' | 'glass';
    onPress: () => void;
}

interface QuickActionsProps {
    actions?: QuickAction[];
    onStartWorkout?: () => void;
    onLogNutrition?: () => void;
    onViewProgress?: () => void;
    onViewPlan?: () => void;
}

export function QuickActions({
    actions,
    onStartWorkout,
    onLogNutrition,
    onViewProgress,
    onViewPlan,
}: QuickActionsProps) {
    // Default actions if not provided
    const defaultActions: QuickAction[] = [
        {
            id: 'start-workout',
<<<<<<< HEAD
            label: 'View Workout Plan',
=======
            label: 'Start Workout',
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
            icon: Play,
            variant: 'primary',
            onPress: onStartWorkout || (() => { }),
        },
        {
            id: 'log-nutrition',
            label: 'Log Nutrition',
            icon: Utensils,
            variant: 'glass',
            onPress: onLogNutrition || (() => { }),
        },
    ];

    const displayActions = actions || defaultActions;

    const handlePress = (action: QuickAction) => {
        haptics.light();
        action.onPress();
    };

    return (
        <View style={styles.container}>
            {displayActions.map((action) => (
                <QuickActionButton
                    key={action.id}
                    action={action}
                    onPress={() => handlePress(action)}
                />
            ))}
        </View>
    );
}

interface QuickActionButtonProps {
    action: QuickAction;
    onPress: () => void;
}

function QuickActionButton({ action, onPress }: QuickActionButtonProps) {
    const Icon = action.icon;

    if (action.variant === 'primary') {
        return (
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={theme.gradients.tealButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButton}
                >
                    <Icon size={18} color={theme.colors.textInverse} />
                    <Text style={styles.primaryLabel}>{action.label}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (action.variant === 'secondary') {
        return (
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={onPress}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={theme.gradients.orangeButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButton}
                >
                    <Icon size={18} color={theme.colors.textInverse} />
                    <Text style={styles.primaryLabel}>{action.label}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Glass variant
    return (
        <TouchableOpacity
            style={[styles.buttonContainer, styles.glassButton]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassContent}>
                <Icon size={18} color={theme.colors.primary} />
                <Text style={styles.glassLabel}>{action.label}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        ...glassShadows.soft,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    primaryLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textInverse,
    },
    glassButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        zIndex: 1,
    },
    glassLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
});

export default QuickActions;
