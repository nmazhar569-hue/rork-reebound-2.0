
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Check, Clock, Calendar, ChevronRight, BarChart2, TrendingUp, TrendingDown, Moon, Sun, Wind } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { RecoveryPlan } from '@/types/recovery';
import { RECOVERY_PROTOCOLS } from '@/constants/recoveryProtocols';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface RecoveryDashboardProps {
    plan: RecoveryPlan;
    onLogActivity: (activityType: string) => void;
    onExitPlan: () => void;
}

// Helper to format metric display
const formatMetric = (current: number, start: number, type: 'energy' | 'sleep' | 'soreness') => {
    if (current === undefined || current === null || current === 0) return { value: '-', trend: 'neutral', sub: 'No Data' };

    const diff = current - start;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    let subText = '';

    if (type === 'soreness') {
        // For soreness, down is good/green
        trend = diff < 0 ? 'down' : diff > 0 ? 'up' : 'neutral';
        subText = start ? `was ${start.toFixed(1)}` : 'No baseline';
        return {
            value: current <= 3 ? 'Mild' : current <= 6 ? 'Mod' : 'Severe',
            trend, // This needs to be interpreted by color logic later
            sub: subText
        };
    }

    // Energy/Sleep: Up is good
    trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
    const unit = type === 'sleep' ? 'h' : '';

    return {
        value: `${current.toFixed(1)}${unit}`,
        trend,
        sub: start ? `from ${start.toFixed(1)}${unit}` : 'No baseline'
    };
};

export function RecoveryDashboard({ plan, onLogActivity, onExitPlan }: RecoveryDashboardProps) {
    const insets = useSafeAreaInsets();

    // Load checklist from protocols based on plan type
    const protocolItems = RECOVERY_PROTOCOLS[plan.type] || [];

    // Merge protocol items with completed status (mock logic for now, should come from plan tracking)
    // In a real app, we'd check plan.dailyLogs[currentDay] to see what's checked off.
    const checklist = protocolItems.map(item => ({
        ...item,
        completed: false // Default to false for now until we hook up real tracking state
    }));

    const progressPercent = (plan.daysCompleted / plan.totalDays) * 100;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}>

                {/* Header section with Progress */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onExitPlan} style={styles.backButton}>
                        <Text style={styles.backText}>← Recovery</Text>
                    </TouchableOpacity>
                    <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.type.replace('_', ' ')}</Text>
                    </View>
                </View>

                <View style={styles.progressCard}>
                    <LinearGradient
                        colors={[liquidGlass.surface.glass, liquidGlass.surface.glassDark]}
                        style={styles.glassBackground}
                    />
                    <View style={styles.progressHeader}>
                        <Text style={styles.dayText}>Day {plan.currentDay} of {plan.totalDays}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>ON TRACK</Text>
                        </View>
                    </View>

                    <Text style={styles.progressTitle}>{Math.round(progressPercent)}% Complete</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                    </View>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateText}>Started {new Date(plan.startDate).toLocaleDateString()}</Text>
                        <Text style={styles.dateText}>Ends {new Date(plan.endDate).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Daily Metrics Row */}
                <Text style={styles.sectionTitle}>TODAY'S METRICS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
                    {(() => {
                        const energy = formatMetric(plan.metrics.current.energy, plan.metrics.start.energy, 'energy');
                        const sleep = formatMetric(plan.metrics.current.sleepHours, plan.metrics.start.sleepHours, 'sleep');
                        const soreness = formatMetric(plan.metrics.current.sorenessScore, plan.metrics.start.sorenessScore, 'soreness');

                        return (
                            <>
                                <MetricCard
                                    label="Energy"
                                    value={energy.value}
                                    trend={energy.trend}
                                    subValue={energy.sub}
                                    icon={<TrendingUp size={16} color={energy.trend === 'up' ? colors.success : energy.trend === 'down' ? colors.error : colors.text} />}
                                />
                                <MetricCard
                                    label="Sleep"
                                    value={sleep.value}
                                    trend={sleep.trend}
                                    subValue={sleep.sub}
                                    icon={<Moon size={16} color={colors.accent} />}
                                />
                                <MetricCard
                                    label="Soreness"
                                    value={soreness.value}
                                    trend={soreness.trend}
                                    subValue={soreness.sub}
                                    // For soreness, trending down is GOOD (success color)
                                    icon={<TrendingDown size={16} color={soreness.trend === 'down' ? colors.success : soreness.trend === 'up' ? colors.error : colors.text} />}
                                />
                            </>
                        );
                    })()}
                </ScrollView>

                {/* Ree's Daily Guidance - Pop-up Bubble Style */}
                <View style={styles.reeBubbleContainer}>
                    <View style={styles.reeAvatarContainer}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryLight]} // Using primary teal gradient
                            style={styles.reeAvatar}
                        >
                            <Text style={styles.reeAvatarText}>R</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.reeBubble}>
                        <View style={styles.bubbleArrow} />
                        <Text style={styles.reeTitle}>Ree</Text>
                        <Text style={styles.reeText}>
                            "Sleep protocol is working! You've hit 7.3 hrs average (up from 6.9).
                            Keep it up for one more week and we'll see that energy score break 7.0."
                        </Text>
                    </View>
                </View>

                {/* Daily Checklist */}
                <Text style={styles.sectionTitle}>TODAY'S FOCUS</Text>
                <View style={styles.checklistContainer}>
                    {checklist.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.checklistItem, item.completed && styles.checklistCompleted]}
                            onPress={() => item.completed ? null : onLogActivity(item.title)}
                        >
                            <View style={[styles.checkBox, item.completed && styles.checkBoxChecked]}>
                                {item.completed && <Check size={14} color={liquidGlass.text.inverse} />}
                            </View>
                            <View style={styles.checkContent}>
                                <Text style={[styles.checkTitle, item.completed && styles.textCompleted]}>{item.title}</Text>
                                <Text style={styles.checkSub}>
                                    {item.duration || item.target || 'Tap to Log'}
                                </Text>
                            </View>
                            {item.completed ? (
                                <Text style={styles.completedLabel}>Done</Text>
                            ) : (
                                <ChevronRight size={16} color={liquidGlass.text.tertiary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

// Helper Component for Metrics
const MetricCard = ({ label, value, trend, subValue, icon }: any) => (
    <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>{label}</Text>
            {icon}
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricSub}>{subValue}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.primary,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    backText: {
        color: liquidGlass.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    planBadge: {
        backgroundColor: liquidGlass.surface.glassLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    planBadgeText: {
        color: colors.accent,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    progressCard: {
        height: 180,
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        overflow: 'hidden',
        ...glassShadows.medium,
    },
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayText: {
        color: liquidGlass.text.primary,
        fontSize: 18,
        fontWeight: '700',
    },
    statusBadge: {
        backgroundColor: colors.success + '20',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    statusText: {
        color: colors.success,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    progressTitle: {
        color: liquidGlass.text.secondary,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 3,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateText: {
        color: liquidGlass.text.tertiary,
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        color: liquidGlass.text.tertiary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    metricsRow: {
        paddingBottom: 24,
        gap: 12,
    },
    metricCard: {
        width: 110,
        height: 100,
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        justifyContent: 'space-between',
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        color: liquidGlass.text.secondary,
        fontSize: 12,
        fontWeight: '600',
    },
    metricValue: {
        color: liquidGlass.text.primary,
        fontSize: 22,
        fontWeight: '700',
    },
    metricSub: {
        color: liquidGlass.text.tertiary,
        fontSize: 11,
    },
    reeBubbleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 30,
        paddingHorizontal: 4,
    },
    reeAvatarContainer: {
        marginRight: 10,
        paddingBottom: 4,
    },
    reeAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...glassShadows.glowTeal,
    },
    reeAvatarText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '900',
    },
    reeBubble: {
        flex: 1,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    bubbleArrow: {
        position: 'absolute',
        bottom: 0,
        left: -8,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderRightColor: 'transparent',
        borderTopColor: liquidGlass.border.glassLight,
        // Note: CSS triangles are tricky with borders. 
        // Simplified: Just use border radius manipulation for now (borderBottomLeftRadius: 4 above handles most of the feel)
    },
    reeTitle: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    reeText: {
        color: liquidGlass.text.secondary,
        fontSize: 14,
        lineHeight: 20,
    },
    checklistContainer: {
        gap: 12,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: liquidGlass.surface.card,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        gap: 16,
    },
    checklistCompleted: {
        backgroundColor: liquidGlass.surface.glassDark,
        borderColor: 'transparent',
        opacity: 0.8,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: liquidGlass.text.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkBoxChecked: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    checkContent: {
        flex: 1,
        justifyContent: 'center',
    },
    checkTitle: {
        color: liquidGlass.text.primary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    textCompleted: {
        color: liquidGlass.text.tertiary,
        textDecorationLine: 'line-through',
    },
    checkSub: {
        color: liquidGlass.text.tertiary,
        fontSize: 13,
    },
    completedLabel: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '700',
    },
});
