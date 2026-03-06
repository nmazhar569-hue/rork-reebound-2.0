import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Check,
    TrendingUp,
    Clock,
    Dumbbell,
    ChevronRight,
    Star,
    Share2,
    Calendar
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { liquidGlass, glassStyles, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';

const FEEDBACK_ISSUES = [
    'Too difficult',
    'Ran out of time',
    'Low energy',
    'Soreness',
    'Equipment busy',
    'No issues!',
];

export default function WorkoutSummaryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { history } = useWorkoutStore();

    // Get the most recent completed workout
    const workout = history[0];

    const [difficultyRating, setDifficultyRating] = useState(5);
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Initial success haptic
    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    if (!workout) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.emptyState}>
                    <Dumbbell size={48} color={liquidGlass.text.tertiary} />
                    <Text style={styles.emptyText}>No recent workout found</Text>
                    <TouchableOpacity
                        style={styles.goBackButton}
                        onPress={() => router.replace('/myworkoutplan')}
                    >
                        <Text style={styles.goBackButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Format duration
    const durationFormatted = useMemo(() => {
        const mins = Math.floor(workout.durationSeconds / 60);
        const secs = workout.durationSeconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }, [workout.durationSeconds]);

    // Calculate performance highlights
    const highlights = useMemo(() => {
        const results: string[] = [];

        // High volume
        if (workout.totalVolumeLbs > 10000) {
            results.push(`🔥 Moved a massive ${workout.totalVolumeLbs.toLocaleString()} lbs!`);
        } else if (workout.totalVolumeLbs > 5000) {
            results.push(`💪 Strong work! ${workout.totalVolumeLbs.toLocaleString()} lbs volume.`);
        }

        // Good intensity
        if (workout.averageRpe >= 7.5 && workout.averageRpe <= 8.5) {
            results.push('✨ Perfect intensity zone maintained.');
        }

        // Completed all exercises
        const skippedCount = workout.exercises.filter((ex) => ex.sets.length === 0).length;
        if (skippedCount === 0) {
            results.push('✅ Full workout completed. No skips!');
        }

        if (results.length === 0) {
            results.push('Consistency is key. Great job showing up!');
        }

        return results;
    }, [workout]);

    const toggleIssue = (issue: string) => {
        Haptics.selectionAsync();
        setSelectedIssues((prev) =>
            prev.includes(issue)
                ? prev.filter((i) => i !== issue)
                : [...prev, issue]
        );
    };

    const handleSubmitFeedback = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFeedbackSubmitted(true);
        // In a real app, this would update the workout record
    };

    const handleDone = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace('/myworkoutplan');
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Header */}
                <View style={styles.successHeader}>
                    <View style={styles.successIcon}>
                        <Check size={40} color={liquidGlass.text.inverse} />
                    </View>
                    <Text style={styles.successTitle}>Workout Complete!</Text>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDate}>
                        {new Date(workout.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })} at {new Date(workout.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Clock size={20} color={liquidGlass.accent.primary} />
                        <Text style={styles.statValue}>{durationFormatted}</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Dumbbell size={20} color={liquidGlass.accent.secondary} />
                        <Text style={styles.statValue}>{workout.totalVolumeLbs.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Lbs Volume</Text>
                    </View>
                    <View style={styles.statCard}>
                        <TrendingUp size={20} color={liquidGlass.status.success} />
                        <Text style={styles.statValue}>{workout.averageRpe.toFixed(1)}</Text>
                        <Text style={styles.statLabel}>Avg RPE</Text>
                    </View>
                </View>

                {/* Performance Highlights */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>HIGHLIGHTS</Text>
                    <View style={styles.highlightsCard}>
                        {highlights.map((highlight, index) => (
                            <View key={index} style={styles.highlightRow}>
                                <Star size={16} color={liquidGlass.accent.secondary} fill={liquidGlass.accent.secondary} />
                                <Text style={styles.highlightText}>{highlight}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Exercise Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SUMMARY</Text>
                    {workout.exercises.map((ex, index) => {
                        const dbExercise = EXERCISE_DATABASE[ex.exerciseId];
                        const totalReps = ex.sets.reduce((sum, s) => sum + s.reps, 0);
                        const avgWeight = ex.sets.length > 0
                            ? ex.sets.reduce((sum, s) => sum + s.weight, 0) / ex.sets.length
                            : 0;
                        const isSkipped = ex.sets.length === 0;

                        return (
                            <View key={`${ex.exerciseId}_${index}`} style={[styles.exerciseRow, isSkipped && styles.exerciseRowSkipped]}>
                                <View style={styles.exerciseInfo}>
                                    <Text style={[styles.exerciseName, isSkipped && styles.textSkipped]}>
                                        {dbExercise?.name || ex.exerciseId}
                                    </Text>
                                    {!isSkipped ? (
                                        <Text style={styles.exerciseStats}>
                                            {ex.sets.length} sets • {totalReps} total reps
                                            {avgWeight > 0 ? ` @ ${avgWeight.toFixed(0)} lbs avg` : ''}
                                        </Text>
                                    ) : (
                                        <Text style={styles.mappedSkippedText}>Skipped</Text>
                                    )}
                                </View>
                                {!isSkipped && (
                                    <View style={styles.checkBadge}>
                                        <Check size={12} color={liquidGlass.text.inverse} />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Ree's Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>REE'S INSIGHTS</Text>
                    <View style={styles.reeCard}>
                        <View style={styles.reeHeader}>
                            <View style={styles.reeAvatar}><Text style={{ fontSize: 16 }}>R</Text></View>
                            <Text style={styles.reeTitle}>Recovery Focus</Text>
                        </View>
                        <Text style={styles.reeText}>
                            Great session! Your localized fatigue in {workout.exercises.length > 2 ? 'these muscle groups' : 'this workout'} suggests you hit the hypertrophy target well.
                        </Text>
                        <View style={styles.reeDivider} />
                        <View style={styles.reeSection}>
                            <Text style={styles.reeBullet}>• Hydrate with at least 24oz water now.</Text>
                            <Text style={styles.reeBullet}>• Protein window is open — aim for 30g.</Text>
                            <Text style={styles.reeBullet}>• Next session: {new Date(new Date().setDate(new Date().getDate() + 2)).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
                        </View>
                    </View>
                </View>

                {/* Feedback Section */}
                {!feedbackSubmitted ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>FEEDBACK</Text>
                        <View style={styles.feedbackCard}>
                            <Text style={styles.feedbackQuestion}>How did it feel?</Text>

                            {/* Difficulty Slider */}
                            <View style={styles.sliderContainer}>
                                <Text style={styles.sliderLabel}>Easy</Text>
                                <View style={styles.sliderTrack}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                        <TouchableOpacity
                                            key={value}
                                            style={[
                                                styles.sliderDot,
                                                difficultyRating === value && styles.sliderDotActive,
                                                difficultyRating > value && styles.sliderDotFilled,
                                            ]}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setDifficultyRating(value);
                                            }}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.sliderLabel}>Hard</Text>
                            </View>

                            <Text style={styles.feedbackQuestion}>Issues?</Text>
                            <View style={styles.issuesGrid}>
                                {FEEDBACK_ISSUES.map((issue) => (
                                    <TouchableOpacity
                                        key={issue}
                                        style={[
                                            styles.issueChip,
                                            selectedIssues.includes(issue) && styles.issueChipSelected,
                                        ]}
                                        onPress={() => toggleIssue(issue)}
                                    >
                                        <Text style={[
                                            styles.issueChipText,
                                            selectedIssues.includes(issue) && styles.issueChipTextSelected,
                                        ]}>
                                            {issue}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.feedbackThanks}>
                        <Check size={20} color={liquidGlass.status.success} />
                        <Text style={styles.feedbackThanksText}>
                            Feedback saved. Adapting next workout...
                        </Text>
                    </View>
                )}

            </ScrollView>

            {/* Sticky Done Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                    <ChevronRight size={20} color={liquidGlass.text.inverse} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: liquidGlass.text.secondary,
        marginVertical: 20,
    },
    goBackButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 50,
        ...glassShadows.glow,
    },
    goBackButtonText: {
        color: liquidGlass.text.inverse,
        fontWeight: '600',
    },

    // Success Header
    successHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: liquidGlass.status.success,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...glassShadows.glowStrong,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 8,
    },
    workoutName: {
        fontSize: 18,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
        marginBottom: 4,
    },
    workoutDate: {
        fontSize: 14,
        color: liquidGlass.text.tertiary,
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.soft,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        fontVariant: ['tabular-nums'],
    },
    statLabel: {
        fontSize: 11,
        color: liquidGlass.text.tertiary,
        textTransform: 'uppercase',
    },

    // Sections
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: liquidGlass.text.tertiary,
        marginBottom: 16,
        letterSpacing: 1,
    },

    // Highlights
    highlightsCard: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        gap: 12,
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    highlightText: {
        flex: 1,
        fontSize: 15,
        color: liquidGlass.text.secondary,
        lineHeight: 22,
    },

    // Exercise Breakdown
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: liquidGlass.surface.glassLight,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: liquidGlass.border.subtle,
    },
    exerciseRowSkipped: {
        opacity: 0.5,
        backgroundColor: 'transparent',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    textSkipped: {
        textDecorationLine: 'line-through',
        color: liquidGlass.text.tertiary,
    },
    exerciseStats: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    mappedSkippedText: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
        fontStyle: 'italic',
    },
    checkBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: liquidGlass.status.success,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Ree Card
    reeCard: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    reeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    reeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: liquidGlass.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    reeText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
        lineHeight: 24,
    },
    reeDivider: {
        height: 1,
        backgroundColor: liquidGlass.border.glass,
        marginVertical: 16,
    },
    reeSection: {
        gap: 8,
    },
    reeBullet: {
        fontSize: 14,
        color: liquidGlass.text.tertiary,
    },

    // Feedback
    feedbackCard: {
        ...glassStyles.card, // Reuse shared code
        padding: 24,
        backgroundColor: liquidGlass.surface.glass,
        ...glassShadows.medium,
    },
    feedbackQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    sliderLabel: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        width: 40,
        textAlign: 'center',
    },
    sliderTrack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 30,
    },
    sliderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: liquidGlass.surface.glassDark,
    },
    sliderDotActive: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: liquidGlass.accent.primary,
        borderWidth: 4,
        borderColor: liquidGlass.surface.glass,
        ...glassShadows.glow,
    },
    sliderDotFilled: {
        backgroundColor: liquidGlass.accent.muted,
    },
    issuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    issueChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 50,
        backgroundColor: liquidGlass.surface.glassDark,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    issueChipSelected: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    issueChipText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    issueChipTextSelected: {
        color: liquidGlass.text.inverse,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        ...glassShadows.glow,
    },
    submitButtonText: {
        color: liquidGlass.text.inverse,
        fontWeight: '700',
        fontSize: 16,
    },
    feedbackThanks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: liquidGlass.status.successMuted,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.3)',
    },
    feedbackThanksText: {
        color: liquidGlass.status.success,
        fontWeight: '600',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    doneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 18,
        borderRadius: 50,
        ...glassShadows.glow,
        elevation: 10,
    },
    doneButtonText: {
        color: liquidGlass.text.inverse,
        fontSize: 18,
        fontWeight: '700',
    },
});