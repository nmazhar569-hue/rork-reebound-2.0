import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Search,
    Dumbbell,
    Plus,
    X,
    Calendar,
} from 'lucide-react-native';
import { haptics } from '@/utils/haptics';

/**
 * Simplified Program Builder - 3-Step Wizard
 * 
 * Step 1: Identity (Name, Days/Week)
 * Step 2: The Split (Day Focus Selection)
 * Step 3: Add Exercises (Search + Body Part chips)
 */

const TEAL = '#00D9B8';
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FOCUS_OPTIONS = [
    { id: 'push', label: 'Push', description: 'Chest, Shoulders, Triceps', color: '#2dd4bf' },
    { id: 'pull', label: 'Pull', description: 'Back, Biceps, Rear Delts', color: '#818cf8' },
    { id: 'legs', label: 'Legs', description: 'Quads, Glutes, Hamstrings', color: '#fb923c' },
    { id: 'upper', label: 'Upper', description: 'Full Upper Body', color: '#f472b6' },
    { id: 'lower', label: 'Lower', description: 'Full Lower Body', color: '#a78bfa' },
    { id: 'full', label: 'Full Body', description: 'All Major Groups', color: '#22d3ee' },
    { id: 'cardio', label: 'Cardio', description: 'Conditioning', color: '#f87171' },
    { id: 'rest', label: 'Rest', description: 'Active Recovery', color: '#64748b' },
];

const BODY_PARTS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

const EXERCISE_DATABASE = [
    // Chest
    { id: '1', name: 'Bench Press', bodyPart: 'Chest', defaultSets: 4, defaultReps: '8-10' },
    { id: '2', name: 'Incline Dumbbell Press', bodyPart: 'Chest', defaultSets: 3, defaultReps: '10-12' },
    { id: '3', name: 'Cable Fly', bodyPart: 'Chest', defaultSets: 3, defaultReps: '12-15' },
    { id: '4', name: 'Push-Ups', bodyPart: 'Chest', defaultSets: 3, defaultReps: '15-20' },
    // Back
    { id: '5', name: 'Pull-Ups', bodyPart: 'Back', defaultSets: 4, defaultReps: '6-10' },
    { id: '6', name: 'Barbell Row', bodyPart: 'Back', defaultSets: 4, defaultReps: '8-10' },
    { id: '7', name: 'Lat Pulldown', bodyPart: 'Back', defaultSets: 3, defaultReps: '10-12' },
    { id: '8', name: 'Seated Cable Row', bodyPart: 'Back', defaultSets: 3, defaultReps: '10-12' },
    // Shoulders
    { id: '9', name: 'Overhead Press', bodyPart: 'Shoulders', defaultSets: 4, defaultReps: '8-10' },
    { id: '10', name: 'Lateral Raises', bodyPart: 'Shoulders', defaultSets: 3, defaultReps: '12-15' },
    { id: '11', name: 'Face Pulls', bodyPart: 'Shoulders', defaultSets: 3, defaultReps: '15-20' },
    // Arms
    { id: '12', name: 'Barbell Curl', bodyPart: 'Arms', defaultSets: 3, defaultReps: '10-12' },
    { id: '13', name: 'Tricep Dips', bodyPart: 'Arms', defaultSets: 3, defaultReps: '10-12' },
    { id: '14', name: 'Hammer Curls', bodyPart: 'Arms', defaultSets: 3, defaultReps: '10-12' },
    { id: '15', name: 'Tricep Pushdown', bodyPart: 'Arms', defaultSets: 3, defaultReps: '12-15' },
    // Legs
    { id: '16', name: 'Squats', bodyPart: 'Legs', defaultSets: 4, defaultReps: '6-8' },
    { id: '17', name: 'Romanian Deadlift', bodyPart: 'Legs', defaultSets: 4, defaultReps: '8-10' },
    { id: '18', name: 'Leg Press', bodyPart: 'Legs', defaultSets: 3, defaultReps: '10-12' },
    { id: '19', name: 'Leg Curl', bodyPart: 'Legs', defaultSets: 3, defaultReps: '12-15' },
    { id: '20', name: 'Calf Raises', bodyPart: 'Legs', defaultSets: 4, defaultReps: '15-20' },
    // Core
    { id: '21', name: 'Plank', bodyPart: 'Core', defaultSets: 3, defaultReps: '30-60s' },
    { id: '22', name: 'Russian Twists', bodyPart: 'Core', defaultSets: 3, defaultReps: '20' },
    { id: '23', name: 'Hanging Leg Raise', bodyPart: 'Core', defaultSets: 3, defaultReps: '10-15' },
];

interface ExerciseSelection {
    id: string;
    name: string;
    sets: number;
    reps: string;
}

interface DaySplit {
    day: string;
    focus: string | null;
}

interface ProgramData {
    name: string;
    daysPerWeek: number;
    splits: DaySplit[];
    exercises: ExerciseSelection[];
}

export default function SimpleProgramBuilder() {
    const [step, setStep] = useState(1);
    const [programData, setProgramData] = useState<ProgramData>({
        name: '',
        daysPerWeek: 3,
        splits: DAYS_OF_WEEK.map(day => ({ day, focus: null })),
        exercises: [],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Step 1: Identity
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Let's Build Your Program</Text>
            <Text style={styles.stepSubtitle}>Give it a name and choose your training days</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Program Name</Text>
                <TextInput
                    style={styles.textInput}
                    value={programData.name}
                    onChangeText={(text) => setProgramData(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., Push Pull Legs, 5x5 Strength"
                    placeholderTextColor="#64748b"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Days Per Week</Text>
                <View style={styles.daysSelector}>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.dayButton,
                                programData.daysPerWeek === num && styles.dayButtonActive,
                            ]}
                            onPress={() => {
                                haptics.soft();
                                setProgramData(prev => ({ ...prev, daysPerWeek: num }));
                            }}
                        >
                            <Text style={[
                                styles.dayButtonText,
                                programData.daysPerWeek === num && styles.dayButtonTextActive,
                            ]}>
                                {num}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    // Step 2: The Split
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Design Your Split</Text>
            <Text style={styles.stepSubtitle}>Tap a day to assign a focus</Text>

            <View style={styles.weekGrid}>
                {DAYS_OF_WEEK.map((day, index) => {
                    const split = programData.splits.find(s => s.day === day);
                    const focus = FOCUS_OPTIONS.find(f => f.id === split?.focus);

                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayCard,
                                split?.focus && { borderColor: focus?.color },
                            ]}
                            onPress={() => {
                                haptics.soft();
                                setSelectedDay(day);
                            }}
                        >
                            <Text style={styles.dayCardLabel}>{day}</Text>
                            {focus ? (
                                <View style={[styles.focusBadge, { backgroundColor: focus.color + '20' }]}>
                                    <Text style={[styles.focusLabel, { color: focus.color }]}>
                                        {focus.label}
                                    </Text>
                                </View>
                            ) : (
                                <Plus size={20} color="#64748b" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Focus Selection Modal */}
            {selectedDay && (
                <View style={styles.focusModal}>
                    <View style={styles.focusModalHeader}>
                        <Text style={styles.focusModalTitle}>{selectedDay}</Text>
                        <TouchableOpacity onPress={() => setSelectedDay(null)}>
                            <X size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.focusOptions}>
                            {FOCUS_OPTIONS.map((focus) => (
                                <TouchableOpacity
                                    key={focus.id}
                                    style={[styles.focusOption, { borderColor: focus.color }]}
                                    onPress={() => {
                                        haptics.medium();
                                        setProgramData(prev => ({
                                            ...prev,
                                            splits: prev.splits.map(s =>
                                                s.day === selectedDay ? { ...s, focus: focus.id } : s
                                            ),
                                        }));
                                        setSelectedDay(null);
                                    }}
                                >
                                    <Text style={[styles.focusOptionLabel, { color: focus.color }]}>
                                        {focus.label}
                                    </Text>
                                    <Text style={styles.focusOptionDesc}>{focus.description}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );

    // Step 3: Add Exercises
    const filteredExercises = useMemo(() => {
        return EXERCISE_DATABASE.filter((ex) => {
            const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBodyPart = !selectedBodyPart || ex.bodyPart === selectedBodyPart;
            return matchesSearch && matchesBodyPart;
        });
    }, [searchQuery, selectedBodyPart]);

    const addExercise = useCallback((exercise: typeof EXERCISE_DATABASE[0]) => {
        haptics.light();
        setProgramData(prev => ({
            ...prev,
            exercises: [...prev.exercises, {
                id: exercise.id,
                name: exercise.name,
                sets: exercise.defaultSets,
                reps: exercise.defaultReps,
            }],
        }));
    }, []);

    const removeExercise = useCallback((id: string) => {
        haptics.soft();
        setProgramData(prev => ({
            ...prev,
            exercises: prev.exercises.filter(e => e.id !== id),
        }));
    }, []);

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Add Exercises</Text>
            <Text style={styles.stepSubtitle}>
                {programData.exercises.length} exercises selected
            </Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search size={20} color="#64748b" />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search exercises..."
                    placeholderTextColor="#64748b"
                />
            </View>

            {/* Body Part Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsContainer}
            >
                <TouchableOpacity
                    style={[styles.chip, !selectedBodyPart && styles.chipActive]}
                    onPress={() => setSelectedBodyPart(null)}
                >
                    <Text style={[styles.chipText, !selectedBodyPart && styles.chipTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                {BODY_PARTS.map((part) => (
                    <TouchableOpacity
                        key={part}
                        style={[styles.chip, selectedBodyPart === part && styles.chipActive]}
                        onPress={() => setSelectedBodyPart(part)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedBodyPart === part && styles.chipTextActive
                        ]}>
                            {part}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Exercise List */}
            <ScrollView style={styles.exerciseList}>
                {filteredExercises.map((exercise) => {
                    const isAdded = programData.exercises.some(e => e.id === exercise.id);
                    return (
                        <TouchableOpacity
                            key={exercise.id}
                            style={[styles.exerciseItem, isAdded && styles.exerciseItemAdded]}
                            onPress={() => isAdded ? removeExercise(exercise.id) : addExercise(exercise)}
                        >
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseMeta}>
                                    {exercise.defaultSets} sets × {exercise.defaultReps}
                                </Text>
                            </View>
                            {isAdded ? (
                                <Check size={24} color={TEAL} />
                            ) : (
                                <Plus size={24} color="#64748b" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const handleNext = () => {
        haptics.light();
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        haptics.soft();
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const handleSave = async () => {
        haptics.completionWave();
        console.log('Saving program:', programData);
        // TODO: Save to storage/context
        router.replace('/(tabs)/plan');
    };

    const canProceed = useMemo(() => {
        switch (step) {
            case 1:
                return programData.name.trim().length > 0;
            case 2:
                return programData.splits.some(s => s.focus !== null);
            case 3:
                return programData.exercises.length > 0;
            default:
                return true;
        }
    }, [step, programData]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#020617', '#0F172A', '#020617']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <ChevronLeft size={24} color="#E2E8F0" />
                    </TouchableOpacity>

                    {/* Progress Dots */}
                    <View style={styles.progressDots}>
                        {[1, 2, 3].map((s) => (
                            <View
                                key={s}
                                style={[
                                    styles.dot,
                                    step >= s && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.backButton} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
                        onPress={handleNext}
                        disabled={!canProceed}
                    >
                        <LinearGradient
                            colors={canProceed ? [TEAL, '#00A896'] : ['#334155', '#1E293B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGradient}
                        >
                            <Text style={styles.nextButtonText}>
                                {step === 3 ? 'Save Program' : 'Continue'}
                            </Text>
                            {step < 3 && <ChevronRight size={20} color="#FFF" />}
                            {step === 3 && <Check size={20} color="#FFF" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dotActive: {
        backgroundColor: TEAL,
        width: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E2E8F0',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textInput: {
        height: 56,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 17,
        color: '#E2E8F0',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    daysSelector: {
        flexDirection: 'row',
        gap: 10,
    },
    dayButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dayButtonActive: {
        backgroundColor: TEAL + '20',
        borderColor: TEAL,
    },
    dayButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94A3B8',
    },
    dayButtonTextActive: {
        color: TEAL,
    },
    weekGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dayCard: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    dayCardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    focusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    focusLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    focusModal: {
        position: 'absolute',
        bottom: 0,
        left: -20,
        right: -20,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    focusModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    focusModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    focusOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    focusOption: {
        width: 100,
        padding: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    focusOptionLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    focusOptionDesc: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchInput: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: '#E2E8F0',
    },
    chipsContainer: {
        marginBottom: 16,
        maxHeight: 44,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    chipActive: {
        backgroundColor: TEAL + '20',
        borderColor: TEAL,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    chipTextActive: {
        color: TEAL,
    },
    exerciseList: {
        flex: 1,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    exerciseItemAdded: {
        borderColor: TEAL,
        backgroundColor: TEAL + '10',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E2E8F0',
        marginBottom: 4,
    },
    exerciseMeta: {
        fontSize: 13,
        color: '#64748b',
    },
    footer: {
        padding: 20,
        paddingBottom: 10,
    },
    nextButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: TEAL,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    nextButtonDisabled: {
        shadowOpacity: 0,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
