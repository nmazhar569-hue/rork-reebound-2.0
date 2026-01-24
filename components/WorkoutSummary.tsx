import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Clock, Dumbbell, TrendingUp, Moon, Utensils, ChevronRight } from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * WorkoutSummary Component
 * 
 * Post-workout summary screen showing:
 * - Duration, volume, exercises completed
 * - Ree's post-workout analysis
 * - Recovery tips
 */

interface WorkoutStats {
    duration: number; // in seconds
    totalVolume: number; // in lbs
    exercisesCompleted: number;
    totalExercises: number;
    setsCompleted: number;
    personalBests?: string[];
}

interface RecoveryTip {
    icon: typeof Moon;
    text: string;
}

interface WorkoutSummaryProps {
    stats: WorkoutStats;
    workoutName: string;
    onViewProgress: () => void;
    onDone: () => void;
    reeAnalysis?: string;
    recoveryTips?: RecoveryTip[];
}

export function WorkoutSummary({
    stats,
    workoutName,
    onViewProgress,
    onDone,
    reeAnalysis,
    recoveryTips,
}: WorkoutSummaryProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatVolume = (volume: number) => {
        if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}k`;
        }
        return volume.toLocaleString();
    };

    const defaultRecoveryTips: RecoveryTip[] = recoveryTips || [
        { icon: Utensils, text: '30-40g protein within 2 hours' },
        { icon: Moon, text: 'Aim for 8 hours sleep tonight' },
        { icon: TrendingUp, text: 'Light stretching recommended' },
    ];

    const defaultAnalysis = reeAnalysis ||
        "Great session. You maintained consistent effort throughout. Your muscles need 48-72 hours to recover and grow stronger.";

    return (
        <View style={styles.container}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassOverlay} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Success indicator */}
                <View style={styles.successSection}>
                    <LinearGradient
                        colors={theme.gradients.tealButton}
                        style={styles.successIcon}
                    >
                        <Check size={32} color={theme.colors.textInverse} strokeWidth={3} />
                    </LinearGradient>
                    <Text style={styles.successTitle}>WORKOUT COMPLETE</Text>
                    <Text style={styles.workoutName}>{workoutName}</Text>
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Clock size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <Dumbbell size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.statValue}>{formatVolume(stats.totalVolume)} lbs</Text>
                        <Text style={styles.statLabel}>Volume</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <TrendingUp size={20} color={theme.colors.textSecondary} />
                        <Text style={styles.statValue}>{stats.exercisesCompleted}/{stats.totalExercises}</Text>
                        <Text style={styles.statLabel}>Exercises</Text>
                    </View>
                </View>

                {/* Personal bests */}
                {stats.personalBests && stats.personalBests.length > 0 && (
                    <View style={styles.pbSection}>
                        <Text style={styles.pbTitle}>🏆 Personal Bests</Text>
                        {stats.personalBests.map((pb, index) => (
                            <Text key={index} style={styles.pbText}>{pb}</Text>
                        ))}
                    </View>
                )}

                {/* Ree's analysis */}
                <View style={styles.analysisSection}>
                    <View style={styles.analysisTitleRow}>
                        <LinearGradient
                            colors={theme.gradients.primary}
                            style={styles.reeIcon}
                        >
                            <Text style={styles.reeText}>R</Text>
                        </LinearGradient>
                        <Text style={styles.analysisTitle}>Ree's Post-Workout Analysis</Text>
                    </View>
                    <Text style={styles.analysisText}>{defaultAnalysis}</Text>
                </View>

                {/* Recovery tips */}
                <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>Recovery Tips</Text>
                    {defaultRecoveryTips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <View key={index} style={styles.tipItem}>
                                <View style={styles.tipIcon}>
                                    <Icon size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.tipText}>{tip.text}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Action buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                        haptics.light();
                        onViewProgress();
                    }}
                >
                    <Text style={styles.secondaryBtnText}>View Progress</Text>
                    <ChevronRight size={18} color={theme.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                        haptics.medium();
                        onDone();
                    }}
                >
                    <LinearGradient
                        colors={theme.gradients.tealButton}
                        style={styles.primaryBtnGradient}
                    >
                        <Text style={styles.primaryBtnText}>Done</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Helper to generate Ree's analysis based on workout data
export function generatePostWorkoutAnalysis(
    stats: WorkoutStats,
    performanceNotes: Array<{ type: 'improved' | 'maintained' | 'struggled'; exercise: string }>,
    hrvChange?: number,
): string {
    const improved = performanceNotes.filter(n => n.type === 'improved').map(n => n.exercise);
    const struggled = performanceNotes.filter(n => n.type === 'struggled').map(n => n.exercise);

    let analysis = '';

    if (improved.length > 0) {
        analysis += `Great session. You increased performance on ${improved.join(', ')}—strength is building. `;
    } else {
        analysis += 'Solid effort today. Consistency is key. ';
    }

    if (struggled.length > 0) {
        analysis += `${struggled.join(', ')} felt harder today. `;
        if (hrvChange && hrvChange < -10) {
            analysis += 'Your lower HRV suggests your body needed more recovery time. ';
        } else {
            analysis += 'This is normal—fatigue accumulates through the week. ';
        }
    }

    analysis += 'Your muscles need 48-72 hours to recover and adapt.';

    return analysis;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
        gap: 24,
    },
    successSection: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    successIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        ...glassShadows.glowTeal,
    },
    successTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 2,
        marginTop: 8,
    },
    workoutName: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    pbSection: {
        backgroundColor: `${theme.colors.secondary}15`,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: `${theme.colors.secondary}30`,
    },
    pbTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    pbText: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
    analysisSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 20,
        padding: 20,
        gap: 16,
    },
    analysisTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
    analysisTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    analysisText: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        lineHeight: 23,
    },
    tipsSection: {
        gap: 12,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        padding: 14,
    },
    tipIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${theme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 16,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: `${theme.colors.primary}40`,
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    primaryBtn: {
        flex: 1,
        borderRadius: 50,
        overflow: 'hidden',
    },
    primaryBtnGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 50,
    },
    primaryBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
});

export default WorkoutSummary;
