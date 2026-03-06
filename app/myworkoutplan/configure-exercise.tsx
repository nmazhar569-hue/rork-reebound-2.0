import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Minus, Plus, ChevronDown } from 'lucide-react-native';

import { liquidGlass, glassShadows, glassLayout, spacing } from '@/constants/liquidGlass';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';

const REP_RANGES = [
    { label: '1-5 (Strength)', value: '1-5' },
    { label: '6-8 (Strength + Size)', value: '6-8' },
    { label: '8-12 (Muscle growth)', value: '8-12' },
    { label: '12-15 (Endurance + Size)', value: '12-15' },
    { label: '15+ (Endurance)', value: '15+' },
];

export default function ConfigureExerciseModal() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        exerciseId: string;
        existingExercises: string;
        workoutName: string;
        workoutDay: string;
        workoutDuration: string;
    }>();
    const insets = useSafeAreaInsets();
    const { preferences } = useWorkoutStore();

    const exercise = EXERCISE_DATABASE[params.exerciseId];

    // Get recommended reps based on goal
    const getRecommendedReps = () => {
        const goalMap: Record<string, string> = {
            strength: '1-5',
            hypertrophy: '8-12',
            endurance: '15+',
            general: '8-12',
        };
        return goalMap[preferences.primaryGoal] || '8-12';
    };

    const [sets, setSets] = useState(3);
    const [targetReps, setTargetReps] = useState(getRecommendedReps());
    const [startingWeight, setStartingWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [showRepPicker, setShowRepPicker] = useState(false);

    const handleAdd = () => {
        const existingExercises = params.existingExercises
            ? JSON.parse(params.existingExercises)
            : [];

        const newExercise = {
            exerciseId: params.exerciseId,
            targetSets: sets,
            targetReps: targetReps,
            notes: notes || undefined,
            startingWeight: startingWeight ? parseFloat(startingWeight) : undefined,
        };

        const updatedExercises = [...existingExercises, newExercise];

        // Go back to select-exercises with updated list
        router.replace({
            pathname: '/myworkoutplan/select-exercises',
            params: {
                name: params.workoutName,
                day: params.workoutDay,
                duration: params.workoutDuration,
                selectedExercises: JSON.stringify(updatedExercises),
            },
        });
    };

    const handleCancel = () => {
        router.back();
    };

    if (!exercise) {
        return (
            <View style={styles.container}>
                <Text>Exercise not found</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                    <X size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set Parameters</Text>
                <View style={styles.closeButton} />
            </View>

            <View style={styles.content}>
                {/* Exercise Name */}
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseCategory}>
                    {exercise.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ')} • {exercise.movement_type.charAt(0).toUpperCase() + exercise.movement_type.slice(1)}
                </Text>

                {/* Sets */}
                <View style={styles.paramSection}>
                    <Text style={styles.paramLabel}>How many sets?</Text>
                    <View style={styles.setCounter}>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => setSets(Math.max(1, sets - 1))}
                        >
                            <Minus size={20} color={liquidGlass.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{sets}</Text>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => setSets(Math.min(10, sets + 1))}
                        >
                            <Plus size={20} color={liquidGlass.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Target Reps */}
                <View style={styles.paramSection}>
                    <Text style={styles.paramLabel}>Target reps per set</Text>
                    <TouchableOpacity
                        style={styles.repSelector}
                        onPress={() => setShowRepPicker(!showRepPicker)}
                    >
                        <Text style={styles.repSelectorText}>
                            {REP_RANGES.find((r) => r.value === targetReps)?.label || targetReps}
                        </Text>
                        <ChevronDown size={20} color={liquidGlass.text.tertiary} />
                    </TouchableOpacity>

                    {showRepPicker && (
                        <View style={styles.repPicker}>
                            {REP_RANGES.map((range) => (
                                <TouchableOpacity
                                    key={range.value}
                                    style={[
                                        styles.repOption,
                                        targetReps === range.value && styles.repOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setTargetReps(range.value);
                                        setShowRepPicker(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.repOptionText,
                                        targetReps === range.value && styles.repOptionTextSelected,
                                    ]}>
                                        {range.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Starting Weight */}
                <View style={styles.paramSection}>
                    <Text style={styles.paramLabel}>Starting weight (optional)</Text>
                    <View style={styles.weightRow}>
                        <TextInput
                            style={styles.weightInput}
                            placeholder="135"
                            placeholderTextColor={liquidGlass.text.tertiary}
                            value={startingWeight}
                            onChangeText={setStartingWeight}
                            keyboardType="number-pad"
                        />
                        <Text style={styles.weightUnit}>lbs</Text>
                    </View>
                    <Text style={styles.hint}>
                        You can add or change this during your workout
                    </Text>
                </View>

                {/* Notes */}
                <View style={styles.paramSection}>
                    <Text style={styles.paramLabel}>Notes (optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="e.g., Focus on slow descent"
                        placeholderTextColor={liquidGlass.text.tertiary}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Ree Recommendation */}
                {preferences.primaryGoal !== 'general' && exercise.guidance_by_goal[preferences.primaryGoal as keyof typeof exercise.guidance_by_goal] && (
                    <View style={styles.reeCard}>
                        <Text style={styles.reeTitle}>💡 For your goal ({preferences.primaryGoal})</Text>
                        <Text style={styles.reeText}>
                            Ree suggests: {exercise.guidance_by_goal[preferences.primaryGoal as keyof typeof exercise.guidance_by_goal]?.sets} sets × {exercise.guidance_by_goal[preferences.primaryGoal as keyof typeof exercise.guidance_by_goal]?.reps} reps
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer Buttons */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>Add to Workout</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    closeButton: {
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
        flex: 1,
        padding: glassLayout.screenPadding,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    exerciseCategory: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
        marginBottom: 32,
    },

    // Param Sections
    paramSection: {
        marginBottom: 32,
    },
    paramLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 16,
    },

    // Sets Counter
    setCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    counterButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    counterValue: {
        fontSize: 32,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        minWidth: 50,
        textAlign: 'center',
    },

    // Rep Selector
    repSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: liquidGlass.surface.glass,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    repSelectorText: {
        fontSize: 16,
        color: liquidGlass.text.primary,
        fontWeight: '500',
    },
    repPicker: {
        marginTop: 8,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.subtle,
        overflow: 'hidden',
    },
    repOption: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    repOptionSelected: {
        backgroundColor: liquidGlass.accent.muted,
    },
    repOptionText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
    },
    repOptionTextSelected: {
        color: liquidGlass.accent.primary,
        fontWeight: '600',
    },

    // Weight
    weightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    weightInput: {
        width: 100,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
        textAlign: 'center',
    },
    weightUnit: {
        fontSize: 16,
        color: liquidGlass.text.secondary,
    },
    hint: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        marginTop: 8,
    },

    // Notes
    notesInput: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: liquidGlass.text.primary,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
        minHeight: 80,
        textAlignVertical: 'top',
    },

    // Ree Card
    reeCard: {
        backgroundColor: liquidGlass.accent.muted,
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: liquidGlass.accent.primary,
    },
    reeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    reeText: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
        lineHeight: 20,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: liquidGlass.background.secondary,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 50,
        alignItems: 'center',
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.subtle,
    },
    cancelButtonText: {
        color: liquidGlass.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 50,
        alignItems: 'center',
        backgroundColor: liquidGlass.accent.primary,
        ...glassShadows.glow,
    },
    addButtonText: {
        color: liquidGlass.text.inverse,
        fontSize: 16,
        fontWeight: '600',
    },
});
