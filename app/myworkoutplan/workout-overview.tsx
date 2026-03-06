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
    Play,
    Clock,
    Dumbbell,
    ChevronRight,
    TrendingUp,
} from 'lucide-react-native';

import colors, { spacing, borderRadius, shadows, typography } from '@/constants/colors';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function WorkoutOverviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const { getRoutineById, getLastWorkoutForRoutine, startWorkout } = useWorkoutStore();

    const routine = getRoutineById(params.id || '');
    const lastWorkout = routine ? getLastWorkoutForRoutine(routine.id) : undefined;

    if (!routine) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workout Not Found</Text>
                    <View style={styles.backButton} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>This workout doesn't exist or was deleted.</Text>
                </View>
            </View>
        );
    }

    const handleStartWorkout = () => {
        startWorkout(routine.id);
        router.push('/myworkoutplan/active-workout');
    };

    // Format last workout date
    const lastWorkoutDate = useMemo(() => {
        if (!lastWorkout) return null;
        const date = new Date(lastWorkout.date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    }, [lastWorkout]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ready to Train?</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Workout Info */}
                <View style={styles.workoutCard}>
                    <Text style={styles.workoutName}>{routine.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Dumbbell size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{routine.exercises.length} exercises</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>~{routine.estimatedDurationMinutes} min</Text>
                        </View>
                    </View>
                </View>

                {/* Exercise List Preview */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>EXERCISES</Text>
                    {routine.exercises.map((ex, index) => {
                        const dbExercise = EXERCISE_DATABASE[ex.exerciseId];
                        return (
                            <View key={ex.id} style={styles.exerciseRow}>
                                <Text style={styles.exerciseIndex}>{index + 1}.</Text>
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>
                                        {dbExercise?.name || ex.exerciseId}
                                    </Text>
                                    <Text style={styles.exerciseMeta}>
                                        {ex.targetSets} sets × {ex.targetReps} reps
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Last Performance */}
                {lastWorkout && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>LAST TIME YOU DID THIS</Text>
                        <View style={styles.lastWorkoutCard}>
                            <View style={styles.lastWorkoutHeader}>
                                <Text style={styles.lastWorkoutDate}>{lastWorkoutDate}</Text>
                                <TrendingUp size={16} color={colors.success} />
                            </View>
                            <View style={styles.lastWorkoutStats}>
                                <View style={styles.lastStat}>
                                    <Text style={styles.lastStatValue}>
                                        {Math.floor(lastWorkout.durationSeconds / 60)}:{String(lastWorkout.durationSeconds % 60).padStart(2, '0')}
                                    </Text>
                                    <Text style={styles.lastStatLabel}>Duration</Text>
                                </View>
                                <View style={styles.lastStat}>
                                    <Text style={styles.lastStatValue}>
                                        {lastWorkout.totalVolumeLbs.toLocaleString()}
                                    </Text>
                                    <Text style={styles.lastStatLabel}>Volume (lbs)</Text>
                                </View>
                                <View style={styles.lastStat}>
                                    <Text style={styles.lastStatValue}>
                                        {lastWorkout.averageRpe.toFixed(1)}
                                    </Text>
                                    <Text style={styles.lastStatLabel}>Avg RPE</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Ree's Pre-Workout Note */}
                <View style={styles.reeCard}>
                    <Text style={styles.reeTitle}>💡 Ree's Pre-Workout Note</Text>
                    <Text style={styles.reeText}>
                        {lastWorkout
                            ? "Focus on progressive overload—try to beat your numbers from last time. Even one extra rep counts as progress."
                            : "This is your first time doing this workout. Focus on good form and finding your working weights. You'll build from here."}
                    </Text>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Start Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
                <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
                    <Play size={22} color={colors.surface} fill={colors.surface} />
                    <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
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
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },

    // Workout Card
    workoutCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.medium,
    },
    workoutName: {
        ...typography.title,
        marginBottom: spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        gap: spacing.xl,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    metaText: {
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

    // Exercise List
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    exerciseIndex: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textTertiary,
        width: 28,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        ...typography.body,
        fontWeight: '500',
        marginBottom: 2,
    },
    exerciseMeta: {
        ...typography.caption,
    },

    // Last Workout
    lastWorkoutCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.soft,
    },
    lastWorkoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    lastWorkoutDate: {
        ...typography.body,
        fontWeight: '600',
    },
    lastWorkoutStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    lastStat: {
        alignItems: 'center',
    },
    lastStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    lastStatLabel: {
        ...typography.caption,
        marginTop: 2,
    },

    // Ree Card
    reeCard: {
        backgroundColor: colors.primaryMuted,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
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

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        ...shadows.glow(colors.primary),
    },
    startButtonText: {
        color: colors.surface,
        fontSize: 18,
        fontWeight: '700',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
});
