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
    GripVertical,
    Pencil,
    Trash2,
    Plus,
    Check,
    AlertCircle,
} from 'lucide-react-native';

import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WorkoutExercise, WorkoutRoutine } from '@/types/workout';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ParsedExercise {
    exerciseId: string;
    targetSets: number;
    targetReps: string;
    notes?: string;
}

export default function WorkoutReviewScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name: string;
        day: string;
        duration: string;
        exercises: string;
    }>();
    const insets = useSafeAreaInsets();
    const { addRoutine, preferences } = useWorkoutStore();

    const exercises: ParsedExercise[] = useMemo(() => {
        if (!params.exercises) return [];
        try {
            return JSON.parse(params.exercises);
        } catch {
            return [];
        }
    }, [params.exercises]);

    const dayNumber = parseInt(params.day || '0', 10);
    const estimatedDuration = parseInt(params.duration || '45', 10);

    // Calculate workout stats
    const stats = useMemo(() => {
        let totalSets = 0;
        const muscleGroups: Record<string, number> = {};

        exercises.forEach((ex) => {
            totalSets += ex.targetSets;
            const dbExercise = EXERCISE_DATABASE[ex.exerciseId];
            if (dbExercise) {
                const category = dbExercise.category;
                muscleGroups[category] = (muscleGroups[category] || 0) + ex.targetSets;
            }
        });

        return {
            totalSets,
            totalExercises: exercises.length,
            muscleGroups,
        };
    }, [exercises]);

    // Generate Ree's analysis
    const reeAnalysis = useMemo(() => {
        const warnings: string[] = [];
        const positives: string[] = [];

        // Check total volume
        if (stats.totalSets < 8) {
            warnings.push("Volume is on the lower side. Consider adding 1-2 more exercises for better stimulus.");
        } else if (stats.totalSets > 25) {
            warnings.push("High volume workout. Make sure you have enough time and energy for quality reps.");
        } else {
            positives.push(`${stats.totalSets} total sets—within the optimal range.`);
        }

        // Check exercise count
        if (stats.totalExercises < 3) {
            warnings.push("Only a few exercises. This might be a quick session.");
        } else if (stats.totalExercises > 8) {
            warnings.push("Many exercises. Consider if you can maintain quality across all of them.");
        }

        // Positive feedback
        if (stats.totalExercises >= 3 && stats.totalExercises <= 6) {
            positives.push("Good exercise variety without overwhelming volume.");
        }

        return { warnings, positives };
    }, [stats]);

    const handleSave = () => {
        // Convert to WorkoutExercise format
        const workoutExercises: WorkoutExercise[] = exercises.map((ex, index) => ({
            id: `exercise_${Date.now()}_${index}`,
            exerciseId: ex.exerciseId,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            sets: [],
            notes: ex.notes,
        }));

        const routine: WorkoutRoutine = {
            id: `routine_${Date.now()}`,
            name: params.name || 'Untitled Workout',
            scheduledDay: dayNumber,
            exercises: workoutExercises,
            estimatedDurationMinutes: estimatedDuration,
        };

        addRoutine(routine);

        // Navigate to success or home
        router.replace('/myworkoutplan');
    };

    const handleAddMore = () => {
        router.push({
            pathname: '/myworkoutplan/select-exercises',
            params: {
                name: params.name,
                day: params.day,
                duration: params.duration,
                selectedExercises: params.exercises,
            },
        });
    };

    const handleRemoveExercise = (index: number) => {
        const updated = [...exercises];
        updated.splice(index, 1);
        router.setParams({ exercises: JSON.stringify(updated) });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Workout</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Workout Header */}
                <View style={styles.workoutHeader}>
                    <Text style={styles.workoutName}>{params.name || 'Untitled Workout'}</Text>
                    <Text style={styles.workoutMeta}>
                        {DAY_NAMES[dayNumber]} • Estimated {estimatedDuration} minutes
                    </Text>
                </View>

                {/* Exercise List */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>EXERCISES</Text>

                    {exercises.length === 0 ? (
                        <View style={styles.emptyExercises}>
                            <Text style={styles.emptyText}>No exercises added yet</Text>
                            <TouchableOpacity style={styles.addExerciseLink} onPress={handleAddMore}>
                                <Plus size={16} color={liquidGlass.accent.primary} />
                                <Text style={styles.addExerciseLinkText}>Add Exercises</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        exercises.map((ex, index) => {
                            const dbExercise = EXERCISE_DATABASE[ex.exerciseId];
                            return (
                                <View key={`${ex.exerciseId}_${index}`} style={styles.exerciseRow}>
                                    <View style={styles.dragHandle}>
                                        <GripVertical size={20} color={liquidGlass.text.tertiary} />
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseNumber}>{index + 1}.</Text>
                                        <View style={styles.exerciseDetails}>
                                            <Text style={styles.exerciseName}>
                                                {dbExercise?.name || ex.exerciseId}
                                            </Text>
                                            <Text style={styles.exerciseSetsReps}>
                                                {ex.targetSets} sets × {ex.targetReps} reps
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.exerciseActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleRemoveExercise(index)}
                                        >
                                            <Trash2 size={18} color={liquidGlass.status.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    {exercises.length > 0 && (
                        <TouchableOpacity style={styles.addMoreButton} onPress={handleAddMore}>
                            <Plus size={18} color={liquidGlass.accent.primary} />
                            <Text style={styles.addMoreText}>Add Another Exercise</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Summary Stats */}
                {exercises.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>WORKOUT SUMMARY</Text>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Sets:</Text>
                                <Text style={styles.summaryValue}>{stats.totalSets}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Exercises:</Text>
                                <Text style={styles.summaryValue}>{stats.totalExercises}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Estimated Time:</Text>
                                <Text style={styles.summaryValue}>{estimatedDuration} min</Text>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.muscleLabel}>Muscle Groups Targeted:</Text>
                            {Object.entries(stats.muscleGroups).map(([muscle, sets]) => (
                                <View key={muscle} style={styles.muscleRow}>
                                    <Text style={styles.muscleName}>{muscle}:</Text>
                                    <Text style={styles.muscleSets}>{sets} sets</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Ree's Analysis */}
                {exercises.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>REE'S ANALYSIS</Text>
                        <View style={styles.reeCard}>
                            {reeAnalysis.positives.map((msg, i) => (
                                <View key={`pos_${i}`} style={styles.reeFeedbackRow}>
                                    <Check size={16} color={liquidGlass.status.success} />
                                    <Text style={styles.reeFeedbackText}>{msg}</Text>
                                </View>
                            ))}
                            {reeAnalysis.warnings.map((msg, i) => (
                                <View key={`warn_${i}`} style={styles.reeFeedbackRow}>
                                    <AlertCircle size={16} color={liquidGlass.status.warning} />
                                    <Text style={styles.reeFeedbackText}>{msg}</Text>
                                </View>
                            ))}

                            <View style={styles.reeNote}>
                                <Text style={styles.reeNoteText}>
                                    Remember: Aim for weights where the last 2 reps feel challenging (RPE 8-9).
                                    This workout trains specific muscle groups—allow 48-72 hours before targeting them again.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Check size={20} color={liquidGlass.text.inverse} />
                    <Text style={styles.saveButtonText}>Save Workout</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: glassLayout.screenPadding,
        paddingVertical: 16,
        backgroundColor: liquidGlass.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    content: {
        padding: glassLayout.screenPadding,
    },

    // Workout Header
    workoutHeader: {
        marginBottom: 32,
    },
    workoutName: {
        fontSize: 28,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    workoutMeta: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
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
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Exercise List
    emptyExercises: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: liquidGlass.border.subtle,
    },
    emptyText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
        marginBottom: 16,
    },
    addExerciseLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addExerciseLinkText: {
        color: liquidGlass.accent.primary,
        fontWeight: '600',
        fontSize: 15,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    dragHandle: {
        marginRight: 12,
    },
    exerciseInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exerciseNumber: {
        fontSize: 13,
        fontWeight: '600',
        marginRight: 8,
        color: liquidGlass.text.tertiary,
    },
    exerciseDetails: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    exerciseSetsReps: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    exerciseActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: liquidGlass.surface.glassDark,
    },
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.accent.primary,
        backgroundColor: liquidGlass.accent.muted,
        marginTop: 8,
    },
    addMoreText: {
        color: liquidGlass.accent.primary,
        fontWeight: '600',
        fontSize: 15,
    },

    // Summary
    summaryCard: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: liquidGlass.border.subtle,
        marginVertical: 16,
    },
    muscleLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.tertiary,
        marginBottom: 12,
    },
    muscleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    muscleName: {
        fontSize: 15,
        color: liquidGlass.text.primary,
    },
    muscleSets: {
        fontSize: 15,
        color: liquidGlass.accent.primary,
        fontWeight: '600',
    },

    // Ree Analysis
    reeCard: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 24,
        padding: 24,
        borderLeftWidth: 4,
        borderLeftColor: liquidGlass.accent.primary,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
        // Remove individual borders to let the left border stand out, or keep consistent
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
    },
    reeFeedbackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    reeFeedbackText: {
        flex: 1,
        fontSize: 14,
        color: liquidGlass.text.secondary,
        lineHeight: 20,
    },
    reeNote: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
    },
    reeNoteText: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
        lineHeight: 18,
        fontStyle: 'italic',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: liquidGlass.background.secondary,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 16,
        borderRadius: 24,
        ...glassShadows.glow,
    },
    saveButtonText: {
        color: liquidGlass.text.inverse,
        fontSize: 16,
        fontWeight: '700',
    },
});
