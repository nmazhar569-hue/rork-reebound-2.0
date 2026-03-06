import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    TrendingUp,
    Calendar,
} from 'lucide-react-native';

import colors, { spacing, borderRadius, shadows, typography } from '@/constants/colors';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function ExerciseHistoryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ exerciseId: string }>();
    const insets = useSafeAreaInsets();

    const { getExerciseHistory } = useWorkoutStore();

    const exercise = EXERCISE_DATABASE[params.exerciseId || ''];
    const history = getExerciseHistory(params.exerciseId || '', 20);

    // Calculate progress stats
    const progressStats = useMemo(() => {
        if (history.length < 2) return null;

        const latest = history[0];
        const oldest = history[history.length - 1];

        const latestMaxWeight = Math.max(...latest.sets.map((s) => s.weight));
        const oldestMaxWeight = Math.max(...oldest.sets.map((s) => s.weight));
        const weightChange = latestMaxWeight - oldestMaxWeight;

        const latestTotalReps = latest.sets.reduce((sum, s) => sum + s.reps, 0);
        const oldestTotalReps = oldest.sets.reduce((sum, s) => sum + s.reps, 0);
        const repChange = latestTotalReps - oldestTotalReps;

        return {
            weightChange,
            repChange,
            sessionsTracked: history.length,
        };
    }, [history]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!exercise) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Exercise Not Found</Text>
                    <View style={styles.backButton} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Exercise History</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Exercise Info */}
                <View style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseCategory}>
                        {exercise.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ')} • {exercise.movement_type.charAt(0).toUpperCase() + exercise.movement_type.slice(1)}
                    </Text>
                </View>

                {/* Progress Summary */}
                {progressStats && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>PROGRESS SUMMARY</Text>
                        <View style={styles.progressCard}>
                            <View style={styles.progressRow}>
                                <TrendingUp size={20} color={
                                    progressStats.weightChange >= 0 ? colors.success : colors.warning
                                } />
                                <Text style={styles.progressText}>
                                    {progressStats.weightChange >= 0 ? '+' : ''}
                                    {progressStats.weightChange} lbs since you started tracking
                                </Text>
                            </View>
                            <View style={styles.progressRow}>
                                <Calendar size={20} color={colors.primary} />
                                <Text style={styles.progressText}>
                                    {progressStats.sessionsTracked} sessions tracked
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Ree's Analysis */}
                {progressStats && progressStats.weightChange > 0 && (
                    <View style={styles.reeCard}>
                        <Text style={styles.reeTitle}>💡 Ree's Analysis</Text>
                        <Text style={styles.reeText}>
                            Your {exercise.name.toLowerCase()} has increased by {progressStats.weightChange} lbs.
                            You're progressing at a healthy rate. Keep focusing on form and consistent effort.
                        </Text>
                    </View>
                )}

                {/* History List */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>WORKOUT HISTORY</Text>

                    {history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No history yet. Complete a workout with this exercise to start tracking.
                            </Text>
                        </View>
                    ) : (
                        history.map((session, index) => {
                            const totalVolume = session.sets.reduce(
                                (sum, s) => sum + (s.reps * s.weight),
                                0
                            );

                            return (
                                <View key={`${session.date}_${index}`} style={styles.sessionCard}>
                                    <View style={styles.sessionHeader}>
                                        <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                                        <Text style={styles.sessionVolume}>
                                            {totalVolume.toLocaleString()} lbs
                                        </Text>
                                    </View>

                                    <View style={styles.setsContainer}>
                                        {session.sets.map((set, setIndex) => (
                                            <View key={set.id || setIndex} style={styles.setRow}>
                                                <Text style={styles.setLabel}>Set {setIndex + 1}:</Text>
                                                <Text style={styles.setDetails}>
                                                    {set.reps} reps @ {set.weight || 'BW'} lbs
                                                </Text>
                                                <Text style={styles.setRpe}>RPE {set.rpe}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={{ height: insets.bottom + spacing.xxl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.sectionTitle,
    },
    content: {
        padding: spacing.lg,
    },

    // Exercise Card
    exerciseCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.soft,
    },
    exerciseName: {
        ...typography.title,
        marginBottom: spacing.xs,
    },
    exerciseCategory: {
        ...typography.body,
        color: colors.textSecondary,
    },

    // Sections
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        ...typography.label,
        marginBottom: spacing.md,
    },

    // Progress Card
    progressCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.soft,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    progressText: {
        ...typography.body,
    },

    // Ree Card
    reeCard: {
        backgroundColor: colors.primaryMuted,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    reeTitle: {
        ...typography.sectionTitle,
        marginBottom: spacing.sm,
    },
    reeText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },

    // Empty State
    emptyState: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Session Card
    sessionCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sessionDate: {
        ...typography.sectionTitle,
    },
    sessionVolume: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    setsContainer: {
        gap: spacing.xs,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    setLabel: {
        ...typography.bodySmall,
        color: colors.textTertiary,
        width: 50,
    },
    setDetails: {
        ...typography.body,
        flex: 1,
    },
    setRpe: {
        ...typography.caption,
        color: colors.textSecondary,
    },
});
