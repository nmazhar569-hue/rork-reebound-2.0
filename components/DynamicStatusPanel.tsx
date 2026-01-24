import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import {
    Sun,
    Moon,
    CheckCircle2,
    Battery,
    Heart,
    TrendingUp,
    AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/constants/theme';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';

/**
 * DynamicStatusPanel Component
 * 
 * A single intelligent panel that changes based on:
 * - Time of day (morning vs evening)
 * - Whether user has worked out today
 * - If today is a rest day
 * - User's stress/energy levels
 */

export type PanelContext =
    | 'morning_ready'      // Morning, ready to train
    | 'post_workout'       // Just finished workout
    | 'rest_day'           // Scheduled rest day
    | 'low_energy'         // User reported low energy/high stress
    | 'evening_complete'   // Evening, workout done
    | 'evening_pending';   // Evening, workout not done

interface DynamicStatusPanelProps {
    context?: PanelContext;
    readinessScore?: number;
    sleepHours?: number;
    workoutName?: string;
    recoveryHours?: string;
    hrvTrend?: 'up' | 'down' | 'stable';
    reeGuidance?: string;
    onPress?: () => void;
}

export function DynamicStatusPanel({
    context = 'morning_ready',
    readinessScore = 78,
    sleepHours = 7.8,
    workoutName = "Leg Day",
    recoveryHours = "48-72",
    hrvTrend = 'up',
    reeGuidance,
}: DynamicStatusPanelProps) {

    // Determine content based on context
    const panelContent = useMemo(() => {
        switch (context) {
            case 'morning_ready':
                return {
                    icon: Sun,
                    iconColor: theme.colors.primary,
                    title: 'Ready to Train',
                    subtitle: `${sleepHours} hrs sleep—you're recovered`,
                    highlight: workoutName,
                    highlightLabel: "Today's Workout",
                    guidance: reeGuidance || `Your body is ready. Today's ${workoutName.toLowerCase()} workout is a go. ✓`,
                    accentColor: theme.colors.primary,
                };

            case 'post_workout':
                return {
                    icon: CheckCircle2,
                    iconColor: theme.colors.primary,
                    title: 'Workout Complete ✓',
                    subtitle: `Recovery time: ${recoveryHours}hrs needed`,
                    highlight: 'Tomorrow',
                    highlightLabel: 'Readiness Forecast',
                    guidance: reeGuidance || 'Great session. Prioritize 8hrs sleep tonight for optimal recovery.',
                    accentColor: theme.colors.primary,
                };

            case 'rest_day':
                return {
                    icon: Heart,
                    iconColor: theme.colors.secondary,
                    title: 'Active Recovery',
                    subtitle: `HRV trending ${hrvTrend}—adaptation is happening`,
                    highlight: 'Recovery',
                    highlightLabel: 'Progress',
                    guidance: reeGuidance || 'Your body is rebuilding. This rest day is progress.',
                    accentColor: theme.colors.secondary,
                };

            case 'low_energy':
                return {
                    icon: AlertCircle,
                    iconColor: theme.colors.secondary,
                    title: 'Big Day Ahead',
                    subtitle: 'Your body needs lighter work today',
                    highlight: '20-min Mobility',
                    highlightLabel: 'Suggested Alternative',
                    guidance: reeGuidance || 'Consider 20-min mobility instead. Your body will thank you.',
                    accentColor: theme.colors.secondary,
                };

            case 'evening_complete':
                return {
                    icon: Moon,
                    iconColor: theme.colors.primary,
                    title: 'Great Day',
                    subtitle: 'All goals achieved',
                    highlight: '+12 pts',
                    highlightLabel: 'Earned Today',
                    guidance: reeGuidance || 'Solid work today. Get good rest to maximize gains.',
                    accentColor: theme.colors.primary,
                };

            case 'evening_pending':
                return {
                    icon: Battery,
                    iconColor: theme.colors.secondary,
                    title: 'Evening Check',
                    subtitle: 'Workout still available if you feel ready',
                    highlight: workoutName,
                    highlightLabel: 'Pending',
                    guidance: reeGuidance || 'Listen to your body. Training late is fine if you feel good.',
                    accentColor: theme.colors.secondary,
                };

            default:
                return {
                    icon: TrendingUp,
                    iconColor: theme.colors.primary,
                    title: 'Welcome Back',
                    subtitle: 'Ready when you are',
                    highlight: 'Start',
                    highlightLabel: 'Your Journey',
                    guidance: reeGuidance || "Let's build something great together.",
                    accentColor: theme.colors.primary,
                };
        }
    }, [context, sleepHours, workoutName, recoveryHours, hrvTrend, reeGuidance]);

    const IconComponent = panelContent.icon;

    return (
        <View style={styles.container}>
            {/* Frosted glass background */}
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Inner border for specular effect */}
            <View style={styles.innerBorder} />

            {/* Content */}
            <View style={styles.content}>
                {/* Header row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: `${panelContent.accentColor}20` }]}>
                            <IconComponent size={20} color={panelContent.iconColor} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>{panelContent.title}</Text>
                            <Text style={styles.subtitle}>{panelContent.subtitle}</Text>
                        </View>
                    </View>

                    {/* Readiness score circle */}
                    <View style={[styles.scoreCircle, { borderColor: panelContent.accentColor }]}>
                        <Text style={[styles.scoreText, { color: panelContent.accentColor }]}>
                            {readinessScore}
                        </Text>
                    </View>
                </View>

                {/* Highlight section */}
                <View style={styles.highlightSection}>
                    <Text style={styles.highlightLabel}>{panelContent.highlightLabel}</Text>
                    <Text style={styles.highlightValue}>{panelContent.highlight}</Text>
                </View>

                {/* Ree's guidance */}
                <View style={styles.guidanceSection}>
                    <LinearGradient
                        colors={[`${theme.colors.primary}15`, `${theme.colors.secondary}10`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.guidanceGradient}
                    >
                        <Text style={styles.guidanceLabel}>Ree's Guidance</Text>
                        <Text style={styles.guidanceText}>{panelContent.guidance}</Text>
                    </LinearGradient>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...glassShadows.deep,
    },
    innerBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        borderRightColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomColor: 'rgba(255, 255, 255, 0.02)',
    },
    content: {
        padding: 20,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    scoreCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '800',
    },
    highlightSection: {
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 16,
    },
    highlightLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    highlightValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    guidanceSection: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    guidanceGradient: {
        padding: 16,
        borderRadius: 16,
    },
    guidanceLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    guidanceText: {
        fontSize: 15,
        color: theme.colors.text,
        lineHeight: 22,
    },
});

export default DynamicStatusPanel;
