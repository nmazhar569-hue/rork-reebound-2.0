import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Trash2,
    GripVertical,
    Check,
    AlertTriangle,
} from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { WeeklyCalendar, DayPlan, generateWeekDays } from './WeeklyCalendar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * WorkoutBuilder Component
 * 
 * 4-step workout creation flow:
 * 1. Workout Info (name, schedule)
 * 2. Add Exercises (exercise library)
 * 3. Set Parameters (sets, reps, weight)
 * 4. Review Workout (validation from Ree)
 */

// Types
export interface ExerciseSelection {
    id: string;
    name: string;
    muscleGroups: string[];
    sets: number;
    reps: string;
    weight?: number;
}

export interface WorkoutDraft {
    name: string;
    scheduledDate?: Date;
    targetDuration?: number;
    exercises: ExerciseSelection[];
}

interface WorkoutBuilderProps {
    visible: boolean;
    onClose: () => void;
    onSave: (workout: WorkoutDraft) => void;
    initialDraft?: Partial<WorkoutDraft>;
}

type BuilderStep = 'info' | 'exercises' | 'parameters' | 'review';

// Placeholder exercise library
const EXERCISE_LIBRARY = [
    { id: '1', name: 'Bench Press', muscleGroups: ['Chest', 'Shoulders', 'Triceps'], category: 'push' },
    { id: '2', name: 'Squat', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'], category: 'legs' },
    { id: '3', name: 'Deadlift', muscleGroups: ['Back', 'Hamstrings', 'Glutes'], category: 'pull' },
    { id: '4', name: 'Overhead Press', muscleGroups: ['Shoulders', 'Triceps'], category: 'push' },
    { id: '5', name: 'Barbell Row', muscleGroups: ['Back', 'Biceps'], category: 'pull' },
    { id: '6', name: 'Pull-ups', muscleGroups: ['Back', 'Biceps'], category: 'pull' },
    { id: '7', name: 'Dips', muscleGroups: ['Chest', 'Triceps'], category: 'push' },
    { id: '8', name: 'Lunges', muscleGroups: ['Quads', 'Glutes'], category: 'legs' },
    { id: '9', name: 'Romanian Deadlift', muscleGroups: ['Hamstrings', 'Glutes', 'Back'], category: 'legs' },
    { id: '10', name: 'Lat Pulldown', muscleGroups: ['Back', 'Biceps'], category: 'pull' },
    { id: '11', name: 'Incline Dumbbell Press', muscleGroups: ['Chest', 'Shoulders'], category: 'push' },
    { id: '12', name: 'Leg Press', muscleGroups: ['Quads', 'Glutes'], category: 'legs' },
];

export function WorkoutBuilder({
    visible,
    onClose,
    onSave,
    initialDraft,
}: WorkoutBuilderProps) {
    const [step, setStep] = useState<BuilderStep>('info');
    const [draft, setDraft] = useState<WorkoutDraft>({
        name: initialDraft?.name || '',
        exercises: initialDraft?.exercises || [],
        ...initialDraft,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISE_LIBRARY[0] | null>(null);
    const [weekDays, setWeekDays] = useState<DayPlan[]>(generateWeekDays());

    // Exercise parameters state
    const [tempSets, setTempSets] = useState(3);
    const [tempReps, setTempReps] = useState('8-12');

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            setStep('info');
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    // Filter exercises by search
    const filteredExercises = EXERCISE_LIBRARY.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Calculate total sets per muscle group
    const muscleGroupStats = draft.exercises.reduce((acc, ex) => {
        ex.muscleGroups.forEach(mg => {
            acc[mg] = (acc[mg] || 0) + ex.sets;
        });
        return acc;
    }, {} as Record<string, number>);

    // Ree validation
    const getValidation = () => {
        const warnings: string[] = [];
        const positives: string[] = [];

        // Check for excessive sets
        Object.entries(muscleGroupStats).forEach(([muscle, sets]) => {
            if (sets > 12) {
                warnings.push(`${sets} sets for ${muscle} is more than needed. Consider 8-12 sets max per session.`);
            }
        });

        // Check exercise count
        if (draft.exercises.length === 0) {
            warnings.push('Add at least one exercise to your workout.');
        } else if (draft.exercises.length >= 4) {
            positives.push(`Solid workout with ${draft.exercises.length} exercises.`);
        }

        // Check total sets
        const totalSets = draft.exercises.reduce((sum, ex) => sum + ex.sets, 0);
        if (totalSets >= 8 && totalSets <= 20) {
            positives.push(`${totalSets} total sets—appropriate volume for muscle growth.`);
        }

        return { warnings, positives };
    };

    const handleNextStep = () => {
        haptics.light();
        switch (step) {
            case 'info':
                setStep('exercises');
                break;
            case 'exercises':
                setStep('review');
                break;
            case 'review':
                onSave(draft);
                break;
        }
    };

    const handlePrevStep = () => {
        haptics.light();
        switch (step) {
            case 'exercises':
                setStep('info');
                break;
            case 'parameters':
                setStep('exercises');
                break;
            case 'review':
                setStep('exercises');
                break;
        }
    };

    const handleSelectDay = (day: DayPlan) => {
        setDraft(prev => ({ ...prev, scheduledDate: day.date }));
    };

    const handleAddExercise = (exercise: typeof EXERCISE_LIBRARY[0]) => {
        setSelectedExercise(exercise);
        setTempSets(3);
        setTempReps('8-12');
        setStep('parameters');
    };

    const handleConfirmExercise = () => {
        if (!selectedExercise) return;

        haptics.medium();
        setDraft(prev => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                {
                    id: selectedExercise.id,
                    name: selectedExercise.name,
                    muscleGroups: selectedExercise.muscleGroups,
                    sets: tempSets,
                    reps: tempReps,
                },
            ],
        }));
        setSelectedExercise(null);
        setStep('exercises');
    };

    const handleRemoveExercise = (index: number) => {
        haptics.light();
        setDraft(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
        }));
    };

    const validation = getValidation();

    // Render step content
    const renderStepContent = () => {
        switch (step) {
            case 'info':
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Workout Info</Text>
                        <Text style={styles.stepSubtitle}>Name your workout and pick a day</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Workout Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={draft.name}
                                onChangeText={(text) => setDraft(prev => ({ ...prev, name: text }))}
                                placeholder="e.g., Upper Push Day"
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Schedule</Text>
                            <WeeklyCalendar
                                days={weekDays}
                                selectedDate={draft.scheduledDate}
                                onDayPress={handleSelectDay}
                            />
                        </View>
                    </View>
                );

            case 'exercises':
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Add Exercises</Text>
                        <Text style={styles.stepSubtitle}>
                            {draft.exercises.length} exercise{draft.exercises.length !== 1 ? 's' : ''} selected
                        </Text>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Search size={18} color={theme.colors.textTertiary} />
                            <TextInput
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search exercises..."
                                placeholderTextColor={theme.colors.textTertiary}
                            />
                        </View>

                        {/* Selected exercises */}
                        {draft.exercises.length > 0 && (
                            <View style={styles.selectedList}>
                                {draft.exercises.map((ex, index) => (
                                    <View key={`${ex.id}-${index}`} style={styles.selectedExercise}>
                                        <View style={styles.selectedExerciseContent}>
                                            <GripVertical size={16} color={theme.colors.textTertiary} />
                                            <View style={styles.selectedExerciseInfo}>
                                                <Text style={styles.selectedExerciseName}>{ex.name}</Text>
                                                <Text style={styles.selectedExerciseMeta}>
                                                    {ex.sets} sets × {ex.reps}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                                            <Trash2 size={18} color={theme.colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Exercise library */}
                        <ScrollView style={styles.exerciseList}>
                            {filteredExercises.map((exercise) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={styles.exerciseCard}
                                    onPress={() => handleAddExercise(exercise)}
                                >
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                                        <Text style={styles.exerciseMuscles}>
                                            {exercise.muscleGroups.join(', ')}
                                        </Text>
                                    </View>
                                    <View style={styles.addBtn}>
                                        <Plus size={18} color={theme.colors.primary} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                );

            case 'parameters':
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Set Parameters</Text>
                        <Text style={styles.stepSubtitle}>{selectedExercise?.name}</Text>

                        <View style={styles.parameterCard}>
                            <Text style={styles.parameterLabel}>Sets</Text>
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => {
                                        haptics.selection();
                                        setTempSets(Math.max(1, tempSets - 1));
                                    }}
                                >
                                    <Text style={styles.stepperBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.stepperValue}>{tempSets}</Text>
                                <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => {
                                        haptics.selection();
                                        setTempSets(Math.min(10, tempSets + 1));
                                    }}
                                >
                                    <Text style={styles.stepperBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.parameterCard}>
                            <Text style={styles.parameterLabel}>Rep Range</Text>
                            <View style={styles.repOptions}>
                                {['5-8', '8-12', '12-15', '15-20'].map((range) => (
                                    <TouchableOpacity
                                        key={range}
                                        style={[
                                            styles.repOption,
                                            tempReps === range && styles.repOptionActive,
                                        ]}
                                        onPress={() => {
                                            haptics.selection();
                                            setTempReps(range);
                                        }}
                                    >
                                        <Text style={[
                                            styles.repOptionText,
                                            tempReps === range && styles.repOptionTextActive,
                                        ]}>{range}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.confirmExerciseBtn} onPress={handleConfirmExercise}>
                            <LinearGradient
                                colors={theme.gradients.tealButton}
                                style={styles.confirmExerciseGradient}
                            >
                                <Plus size={18} color={theme.colors.textInverse} />
                                <Text style={styles.confirmExerciseText}>Add Exercise</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                );

            case 'review':
                return (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Review Workout</Text>
                        <Text style={styles.stepSubtitle}>{draft.name || 'Untitled Workout'}</Text>

                        {/* Exercise summary */}
                        <View style={styles.reviewList}>
                            {draft.exercises.map((ex, index) => (
                                <View key={`${ex.id}-${index}`} style={styles.reviewExercise}>
                                    <Text style={styles.reviewExerciseName}>{ex.name}</Text>
                                    <Text style={styles.reviewExerciseMeta}>
                                        {ex.sets} × {ex.reps}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Ree validation */}
                        <View style={styles.validationCard}>
                            <Text style={styles.validationTitle}>Ree's Feedback</Text>

                            {validation.positives.map((positive, i) => (
                                <View key={i} style={styles.validationItem}>
                                    <Check size={16} color={theme.colors.primary} />
                                    <Text style={styles.validationText}>{positive}</Text>
                                </View>
                            ))}

                            {validation.warnings.map((warning, i) => (
                                <View key={i} style={styles.validationItem}>
                                    <AlertTriangle size={16} color={theme.colors.secondary} />
                                    <Text style={[styles.validationText, { color: theme.colors.secondary }]}>
                                        {warning}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
            </View>

            <Animated.View
                style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
            >
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.glassOverlay} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.handle} />
                    <View style={styles.headerContent}>
                        {step !== 'info' && (
                            <TouchableOpacity onPress={handlePrevStep} style={styles.backBtn}>
                                <ChevronLeft size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle}>New Workout</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Step indicators */}
                    <View style={styles.stepIndicators}>
                        {(['info', 'exercises', 'review'] as BuilderStep[]).map((s, i) => (
                            <View
                                key={s}
                                style={[
                                    styles.stepDot,
                                    (step === s ||
                                        (step === 'parameters' && s === 'exercises')) && styles.stepDotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {renderStepContent()}
                </ScrollView>

                {/* Footer */}
                {step !== 'parameters' && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.nextBtn,
                                (step === 'info' && !draft.name) && styles.nextBtnDisabled,
                            ]}
                            onPress={handleNextStep}
                            disabled={step === 'info' && !draft.name}
                        >
                            <LinearGradient
                                colors={theme.gradients.tealButton}
                                style={styles.nextBtnGradient}
                            >
                                <Text style={styles.nextBtnText}>
                                    {step === 'review' ? 'Save Workout' : 'Continue'}
                                </Text>
                                <ChevronRight size={18} color={theme.colors.textInverse} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 22, 40, 0.6)',
    },
    overlayTouch: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: SCREEN_HEIGHT * 0.9,
        backgroundColor: 'rgba(15, 29, 50, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        ...glassShadows.deep,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 0,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        padding: 4,
    },
    stepIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    stepDotActive: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    content: {
        flex: 1,
    },
    stepContent: {
        padding: 20,
        gap: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    stepSubtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        marginTop: -12,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    textInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 14,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.text,
    },
    selectedList: {
        gap: 8,
    },
    selectedExercise: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${theme.colors.primary}15`,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}30`,
        padding: 14,
    },
    selectedExerciseContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectedExerciseInfo: {
        gap: 2,
    },
    selectedExerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    selectedExerciseMeta: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    exerciseList: {
        maxHeight: 300,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    exerciseInfo: {
        flex: 1,
        gap: 2,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    exerciseMuscles: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${theme.colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    parameterCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    parameterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    stepperBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperBtnText: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.colors.text,
    },
    stepperValue: {
        fontSize: 36,
        fontWeight: '700',
        color: theme.colors.primary,
        minWidth: 50,
        textAlign: 'center',
    },
    repOptions: {
        flexDirection: 'row',
        gap: 10,
    },
    repOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
    },
    repOptionActive: {
        backgroundColor: `${theme.colors.primary}20`,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    repOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    repOptionTextActive: {
        color: theme.colors.primary,
    },
    confirmExerciseBtn: {
        marginTop: 20,
        borderRadius: 50,
        overflow: 'hidden',
    },
    confirmExerciseGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 50,
    },
    confirmExerciseText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
    reviewList: {
        gap: 8,
    },
    reviewExercise: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    reviewExerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    reviewExerciseMeta: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    validationCard: {
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        padding: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}30`,
    },
    validationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    validationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    validationText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    nextBtn: {
        borderRadius: 50,
        overflow: 'hidden',
    },
    nextBtnDisabled: {
        opacity: 0.5,
    },
    nextBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 50,
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
});

export default WorkoutBuilder;
