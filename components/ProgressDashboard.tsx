import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Target,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    ChevronRight,
    Calendar,
    Dumbbell,
    Moon,
} from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * ProgressDashboard Component
 * 
 * Main progress view showing:
 * - Goal tracking card with progress bar
 * - What's working (positive insights)
 * - One thing to improve
 * - See all data button
 */

// Types
export interface UserGoal {
    id: string;
    type: 'strength' | 'endurance' | 'body_comp' | 'consistency';
    title: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    estimatedCompletion?: string;
    trend: 'ahead' | 'on_track' | 'behind';
}

export interface Insight {
    id: string;
    type: 'positive' | 'improvement';
    icon: typeof TrendingUp;
    title: string;
    detail: string;
    actionable?: boolean;
}

interface ProgressDashboardProps {
    goal: UserGoal;
    positiveInsights: Insight[];
    improvementInsight: Insight;
    onSeeAllData: () => void;
    onGoalPress?: () => void;
    onInsightPress?: (insight: Insight) => void;
}

export function ProgressDashboard({
    goal,
    positiveInsights,
    improvementInsight,
    onSeeAllData,
    onGoalPress,
    onInsightPress,
}: ProgressDashboardProps) {
    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

    const getTrendColor = (trend: UserGoal['trend']) => {
        switch (trend) {
            case 'ahead': return theme.colors.primary;
            case 'on_track': return theme.colors.primary;
            case 'behind': return theme.colors.secondary;
        }
    };

    const getTrendText = (trend: UserGoal['trend']) => {
        switch (trend) {
            case 'ahead': return 'Ahead of schedule';
            case 'on_track': return 'On track';
            case 'behind': return 'May need adjustment';
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Goal Card */}
            <TouchableOpacity
                style={styles.goalCard}
                onPress={() => {
                    haptics.light();
                    onGoalPress?.();
                }}
                activeOpacity={0.9}
            >
                <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.goalCardInner} />

                <View style={styles.goalContent}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalIconContainer}>
                            <Target size={20} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.goalLabel}>YOUR GOAL</Text>
                    </View>

                    <Text style={styles.goalTitle}>{goal.title}</Text>

                    {/* Progress display */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressValues}>
                            <Text style={styles.currentValue}>
                                {goal.currentValue}
                                <Text style={styles.unit}> {goal.unit}</Text>
                            </Text>
                            <Text style={styles.targetValue}>/ {goal.targetValue} {goal.unit}</Text>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressBarBg}>
                            <LinearGradient
                                colors={theme.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${progress}%` }]}
                            />
                        </View>

                        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    </View>

                    {/* Trend and estimate */}
                    <View style={styles.goalFooter}>
                        <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor(goal.trend)}20` }]}>
                            <TrendingUp size={14} color={getTrendColor(goal.trend)} />
                            <Text style={[styles.trendText, { color: getTrendColor(goal.trend) }]}>
                                {getTrendText(goal.trend)}
                            </Text>
                        </View>
                        {goal.estimatedCompletion && (
                            <Text style={styles.estimateText}>Est. {goal.estimatedCompletion}</Text>
                        )}
                    </View>

                    {/* Ree's note */}
                    <View style={styles.reeNote}>
                        <Text style={styles.reeNoteLabel}>Ree:</Text>
                        <Text style={styles.reeNoteText}>
                            Gaining 2-3 lbs/month. Keep this pace.
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* What's Working */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <CheckCircle2 size={18} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>WHAT'S WORKING</Text>
                </View>

                <View style={styles.insightsCard}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.cardInner} />

                    {positiveInsights.map((insight, index) => {
                        const Icon = insight.icon;
                        return (
                            <TouchableOpacity
                                key={insight.id}
                                style={[
                                    styles.insightItem,
                                    index < positiveInsights.length - 1 && styles.insightItemBorder,
                                ]}
                                onPress={() => {
                                    haptics.light();
                                    onInsightPress?.(insight);
                                }}
                            >
                                <View style={styles.insightIcon}>
                                    <Icon size={16} color={theme.colors.primary} />
                                </View>
                                <View style={styles.insightContent}>
                                    <Text style={styles.insightTitle}>{insight.title}</Text>
                                    <Text style={styles.insightDetail}>{insight.detail}</Text>
                                </View>
                                {insight.actionable && (
                                    <ChevronRight size={18} color={theme.colors.textTertiary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* One Thing to Improve */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <AlertTriangle size={18} color={theme.colors.secondary} />
                    <Text style={styles.sectionTitle}>ONE THING TO IMPROVE</Text>
                </View>

                <TouchableOpacity
                    style={styles.improvementCard}
                    onPress={() => {
                        haptics.light();
                        onInsightPress?.(improvementInsight);
                    }}
                    activeOpacity={0.9}
                >
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={[styles.cardInner, { borderColor: `${theme.colors.secondary}30` }]} />

                    <View style={styles.improvementContent}>
                        <View style={[styles.insightIcon, { backgroundColor: `${theme.colors.secondary}20` }]}>
                            <improvementInsight.icon size={16} color={theme.colors.secondary} />
                        </View>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>{improvementInsight.title}</Text>
                            <Text style={styles.insightDetail}>{improvementInsight.detail}</Text>
                        </View>
                        <ChevronRight size={18} color={theme.colors.secondary} />
                    </View>

                    <Text style={styles.tapHint}>Tap for suggestions</Text>
                </TouchableOpacity>
            </View>

            {/* See All Data Button */}
            <TouchableOpacity
                style={styles.seeAllBtn}
                onPress={() => {
                    haptics.medium();
                    onSeeAllData();
                }}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                    style={styles.seeAllGradient}
                >
                    <Text style={styles.seeAllText}>See All Data</Text>
                    <ChevronRight size={20} color={theme.colors.text} />
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Placeholder data for demo
export const placeholderGoal: UserGoal = {
    id: '1',
    type: 'strength',
    title: 'Bench Press: 185 → 225 lbs',
    currentValue: 185,
    targetValue: 225,
    unit: 'lbs',
    estimatedCompletion: 'June 2026',
    trend: 'on_track',
};

export const placeholderPositiveInsights: Insight[] = [
    {
        id: '1',
        type: 'positive',
        icon: Calendar,
        title: 'Consistency: 92%',
        detail: 'Higher than 85% of users this month',
    },
    {
        id: '2',
        type: 'positive',
        icon: TrendingUp,
        title: 'Strength up 8%',
        detail: 'Squat increased from 185 to 200 lbs',
        actionable: true,
    },
    {
        id: '3',
        type: 'positive',
        icon: Moon,
        title: 'Sleep improved',
        detail: '7.5 hrs avg (up from 6.8 hrs)',
    },
];

export const placeholderImprovementInsight: Insight = {
    id: 'improvement-1',
    type: 'improvement',
    icon: Dumbbell,
    title: 'Posterior chain volume',
    detail: 'Back and hamstrings have 40% less volume than anterior. Add 1-2 pulling exercises.',
    actionable: true,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 24,
        paddingBottom: 100,
    },
    goalCard: {
        borderRadius: 24,
        overflow: 'hidden',
        ...glassShadows.deep,
    },
    goalCardInner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    goalContent: {
        padding: 24,
        gap: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    goalIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${theme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    goalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },
    progressSection: {
        gap: 8,
    },
    progressValues: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    currentValue: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.text,
    },
    unit: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    targetValue: {
        fontSize: 16,
        color: theme.colors.textTertiary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        textAlign: 'right',
    },
    goalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    trendText: {
        fontSize: 13,
        fontWeight: '600',
    },
    estimateText: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    reeNote: {
        flexDirection: 'row',
        gap: 6,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    reeNoteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    reeNoteText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.textTertiary,
        letterSpacing: 1,
    },
    insightsCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    cardInner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    insightItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    insightIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightContent: {
        flex: 1,
        gap: 2,
    },
    insightTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    insightDetail: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    improvementCard: {
        borderRadius: 20,
        overflow: 'hidden',
        ...glassShadows.soft,
    },
    improvementContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    tapHint: {
        fontSize: 12,
        color: theme.colors.secondary,
        textAlign: 'center',
        paddingBottom: 12,
        marginTop: -8,
    },
    seeAllBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    seeAllGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
});

export default ProgressDashboard;
