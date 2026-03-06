import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Plus,
    ChevronRight,
    ChevronLeft,
    Check,
    Trash2,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { useWorkoutStore } from '@/stores/workoutStore';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';
import { Exercise, ProgramSession, WeekdayKey } from '@/types';
import { educationService } from '@/services/EducationService';

type BuilderStep = 'setup' | 'exercises' | 'review';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ============ STEP INDICATOR ============
const StepIndicator = ({ currentStep }: { currentStep: BuilderStep }) => {
    const steps = [
        { key: 'setup', label: 'Setup' },
        { key: 'exercises', label: 'Exercises' },
        { key: 'review', label: 'Review' },
    ];
    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <View style={styles.stepIndicator}>
            {steps.map((step, index) => (
                <View key={step.key} style={styles.stepItem}>
                    <View style={[
                        styles.stepDot,
                        index <= currentIndex && styles.stepDotActive,
                        index < currentIndex && styles.stepDotComplete,
                    ]}>
                        {index < currentIndex ? (
                            <Check size={12} color={liquidGlass.text.inverse} />
                        ) : (
                            <Text style={[
                                styles.stepDotText,
                                index <= currentIndex && styles.stepDotTextActive,
                            ]}>
                                {index + 1}
                            </Text>
                        )}
                    </View>
                    <Text style={[
                        styles.stepLabel,
                        index <= currentIndex && styles.stepLabelActive,
                    ]}>
                        {step.label}
                    </Text>
                    {index < steps.length - 1 && (
                        <View style={[
                            styles.stepLine,
                            index < currentIndex && styles.stepLineActive,
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );
};

// ============ SETUP STEP ============
interface SetupStepProps {
    name: string;
    setName: (n: string) => void;
    selectedDays: number[];
    toggleDay: (d: number) => void;
    difficulty: DifficultyLevel;
    setDifficulty: (d: DifficultyLevel) => void;
    onNext: () => void;
}

const SetupStep = ({
    name, setName, selectedDays, toggleDay, difficulty, setDifficulty, onNext
}: SetupStepProps) => {
    const canProceed = name.trim().length > 0 && selectedDays.length > 0;

    return (
        <ScrollView style={styles.stepContainer} contentContainerStyle={styles.stepContent}>
            <Text style={styles.heroTitle}>Create Your Plan</Text>
            <Text style={styles.heroSubtitle}>
                Give your workout plan a name and choose your training days.
            </Text>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Plan Name</Text>
                <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Strength Builder"
                    placeholderTextColor={liquidGlass.text.tertiary}
                    maxLength={40}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Training Days</Text>
                <Text style={styles.sectionHint}>
                    Tap to select which days you'll train.
                </Text>
                <View style={styles.daysGrid}>
                    {WEEKDAYS.map((day, index) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDays.includes(index) && styles.dayButtonActive,
                            ]}
                            onPress={() => { haptics.selection(); toggleDay(index); }}
                        >
                            <Text style={[
                                styles.dayButtonText,
                                selectedDays.includes(index) && styles.dayButtonTextActive,
                            ]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.daysCount}>
                    {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Difficulty Level</Text>
                <View style={styles.difficultyRow}>
                    {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map(level => (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.difficultyButton,
                                difficulty === level && styles.difficultyButtonActive,
                            ]}
                            onPress={() => { haptics.selection(); setDifficulty(level); }}
                        >
                            <Text style={[
                                styles.difficultyText,
                                difficulty === level && styles.difficultyTextActive,
                            ]}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.tipCard}>
                <Sparkles size={18} color={liquidGlass.accent.primary} />
                <Text style={styles.tipText}>
                    3-5 training days per week is ideal for most goals. Rest days are crucial for muscle recovery and growth.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
                onPress={canProceed ? onNext : undefined}
                disabled={!canProceed}
            >
                <Text style={styles.primaryBtnText}>Continue</Text>
                <ChevronRight size={20} color={liquidGlass.text.inverse} />
            </TouchableOpacity>
        </ScrollView>
    );
};

// ============ EXERCISE STEP ============
interface ExerciseStepProps {
    selectedDays: number[];
    sessions: Map<number, { name: string; exercises: Exercise[] }>;
    addExercise: (dayIndex: number, ex: Exercise) => void;
    removeExercise: (dayIndex: number, exIndex: number) => void;
    updateSessionName: (dayIndex: number, name: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const ExerciseStep = ({
    selectedDays, sessions, addExercise, removeExercise, updateSessionName, onNext, onBack
}: ExerciseStepProps) => {
    const [activeDayIndex, setActiveDayIndex] = useState(selectedDays[0] || 0);
    const [pickerOpen, setPickerOpen] = useState(false);

    const activeSession = sessions.get(activeDayIndex) || { name: '', exercises: [] };

    const totalExercises = useMemo(() => {
        let count = 0;
        sessions.forEach(s => count += s.exercises.length);
        return count;
    }, [sessions]);

    return (
        <View style={styles.stepContainer}>
            {/* Day Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dayTabs}
                contentContainerStyle={styles.dayTabsContent}
            >
                {selectedDays.map(dayIndex => {
                    const session = sessions.get(dayIndex);
                    const count = session?.exercises.length || 0;
                    const isActive = activeDayIndex === dayIndex;

                    return (
                        <TouchableOpacity
                            key={dayIndex}
                            style={[styles.dayTab, isActive && styles.dayTabActive]}
                            onPress={() => { haptics.selection(); setActiveDayIndex(dayIndex); }}
                        >
                            <Text style={[styles.dayTabLabel, isActive && styles.dayTabLabelActive]}>
                                {WEEKDAYS[dayIndex]}
                            </Text>
                            <View style={[styles.dayTabBadge, isActive && styles.dayTabBadgeActive]}>
                                <Text style={[styles.dayTabBadgeText, isActive && styles.dayTabBadgeTextActive]}>
                                    {count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.exerciseContent}>
                {/* Session Name */}
                <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDayLabel}>{WEEKDAYS_FULL[activeDayIndex]}</Text>
                    <TextInput
                        style={styles.sessionNameInput}
                        value={activeSession.name}
                        onChangeText={text => updateSessionName(activeDayIndex, text)}
                        placeholder="Session focus (e.g. Push Day)"
                        placeholderTextColor={liquidGlass.text.tertiary}
                    />
                </View>

                {/* Exercise List */}
                <View style={styles.exercisesList}>
                    {activeSession.exercises.map((ex, idx) => (
                        <ExerciseCard
                            key={`${ex.id}-${idx}`}
                            exercise={ex}
                            index={idx + 1}
                            onRemove={() => removeExercise(activeDayIndex, idx)}
                        />
                    ))}

                    <TouchableOpacity
                        style={styles.addExerciseBtn}
                        onPress={() => setPickerOpen(true)}
                    >
                        <Plus size={20} color={liquidGlass.accent.primary} />
                        <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.buildFooter}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <ChevronLeft size={20} color={liquidGlass.text.primary} />
                    <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.footerInfoText}>{totalExercises} exercises total</Text>

                <TouchableOpacity
                    style={[styles.nextBtn, totalExercises === 0 && styles.nextBtnDisabled]}
                    onPress={totalExercises > 0 ? onNext : undefined}
                    disabled={totalExercises === 0}
                >
                    <Text style={styles.nextBtnText}>Review</Text>
                    <ChevronRight size={18} color={liquidGlass.text.inverse} />
                </TouchableOpacity>
            </View>

            <ExercisePicker
                visible={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={ex => {
                    addExercise(activeDayIndex, ex);
                    setPickerOpen(false);
                }}
            />
        </View>
    );
};

// ============ EXERCISE CARD ============
const ExerciseCard = ({
    exercise,
    index,
    onRemove
}: {
    exercise: Exercise;
    index: number;
    onRemove: () => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const insight = useMemo(() =>
        educationService.getExerciseInsight(exercise.id, exercise.name),
        [exercise]
    );

    return (
        <View style={styles.exerciseCard}>
            <View style={styles.exerciseCardHeader}>
                <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>
                        {exercise.sets} sets × {exercise.reps} reps
                    </Text>
                </View>
                <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
                    <Trash2 size={16} color={liquidGlass.text.tertiary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.insightToggle}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={styles.insightToggleText}>Why this exercise?</Text>
                {expanded ? (
                    <ChevronUp size={14} color={liquidGlass.accent.primary} />
                ) : (
                    <ChevronDown size={14} color={liquidGlass.text.tertiary} />
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={styles.exerciseInsight}>
                    <View style={styles.insightRow}>
                        <Text style={styles.insightRowLabel}>Trains</Text>
                        <View style={styles.tagRow}>
                            {insight.trains.slice(0, 3).map((t, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.insightRow}>
                        <Text style={styles.insightRowLabel}>Why</Text>
                        <Text style={styles.insightRowValue}>{insight.why}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

// ============ EXERCISE PICKER ============
const ExercisePicker = ({
    visible,
    onClose,
    onSelect
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (ex: Exercise) => void;
}) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        MASTER_EXERCISE_DATABASE.forEach(ex => {
            if (ex.movementPattern) cats.add(ex.movementPattern);
        });
        return Array.from(cats).slice(0, 6);
    }, []);

    const filtered = useMemo(() => {
        return MASTER_EXERCISE_DATABASE.filter(ex => {
            const matchesSearch = !search ||
                ex.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory ||
                ex.movementPattern === selectedCategory;
            return matchesSearch && matchesCategory;
        }).slice(0, 30);
    }, [search, selectedCategory]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Add Exercise</Text>
                    <TouchableOpacity onPress={onClose} style={styles.pickerCloseBtn}>
                        <X size={24} color={liquidGlass.text.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={18} color={liquidGlass.text.tertiary} />
                    <TextInput
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search exercises..."
                        placeholderTextColor={liquidGlass.text.tertiary}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <X size={18} color={liquidGlass.text.tertiary} />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContent}
                >
                    <TouchableOpacity
                        style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                            <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                                {cat.replace(/_/g, ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView style={styles.pickerList}>
                    {filtered.map(ex => (
                        <TouchableOpacity
                            key={ex.id}
                            style={styles.pickerItem}
                            onPress={() => {
                                haptics.light();
                                onSelect(ex);
                            }}
                        >
                            <View style={styles.pickerItemContent}>
                                <Text style={styles.pickerItemName}>{ex.name}</Text>
                                <Text style={styles.pickerItemMeta}>
                                    {ex.sets}×{ex.reps} · {ex.movementPattern?.replace(/_/g, ' ')}
                                </Text>
                            </View>
                            <Plus size={20} color={liquidGlass.accent.primary} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

// ============ REVIEW STEP ============
interface ReviewStepProps {
    name: string;
    selectedDays: number[];
    sessions: Map<number, { name: string; exercises: Exercise[] }>;
    difficulty: DifficultyLevel;
    onSave: () => void;
    onBack: () => void;
}

const ReviewStep = ({ name, selectedDays, sessions, difficulty, onSave, onBack }: ReviewStepProps) => {
    const totalExercises = useMemo(() => {
        let count = 0;
        sessions.forEach(s => count += s.exercises.length);
        return count;
    }, [sessions]);

    const estimatedDuration = useMemo(() => totalExercises * 8, [totalExercises]);

    return (
        <ScrollView style={styles.stepContainer} contentContainerStyle={styles.reviewContent}>
            <Text style={styles.heroTitle}>Review Your Plan</Text>
            <Text style={styles.heroSubtitle}>
                Here's what your week looks like.
            </Text>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryName}>{name}</Text>
                <View style={styles.summaryStats}>
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryStatValue}>{selectedDays.length}</Text>
                        <Text style={styles.summaryStatLabel}>Days</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryStatValue}>{totalExercises}</Text>
                        <Text style={styles.summaryStatLabel}>Exercises</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryStat}>
                        <Text style={styles.summaryStatValue}>{estimatedDuration}</Text>
                        <Text style={styles.summaryStatLabel}>Min/Week</Text>
                    </View>
                </View>
                <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyBadgeText}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.weekPreview}>
                {selectedDays.map(dayIndex => {
                    const session = sessions.get(dayIndex);
                    return (
                        <View key={dayIndex} style={styles.weekPreviewDay}>
                            <View style={styles.weekPreviewDayHeader}>
                                <Text style={styles.weekPreviewDayName}>{WEEKDAYS_FULL[dayIndex]}</Text>
                                <Text style={styles.weekPreviewDayCount}>
                                    {session?.exercises.length || 0} exercises
                                </Text>
                            </View>
                            {session?.name && (
                                <Text style={styles.weekPreviewSessionName}>{session.name}</Text>
                            )}
                        </View>
                    );
                })}
            </View>

            <View style={styles.reeAnalysis}>
                <View style={styles.reeAvatar}>
                    <Text style={styles.reeAvatarText}>R</Text>
                </View>
                <View style={styles.reeContent}>
                    <Text style={styles.reeTitle}>Ree's Analysis</Text>
                    <Text style={styles.reeText}>
                        {selectedDays.length >= 3 && selectedDays.length <= 5
                            ? "Good training frequency for consistent progress."
                            : selectedDays.length < 3
                                ? "Consider adding more training days for faster results."
                                : "High volume - make sure to prioritize recovery."
                        }
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                <Check size={20} color={liquidGlass.text.inverse} />
                <Text style={styles.saveBtnText}>Save Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backLinkBtn} onPress={onBack}>
                <Text style={styles.backLinkBtnText}>Go Back and Edit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ============ MAIN BUILDER SCREEN ============
export default function BuilderScreen() {
    const { upsertProgram, programs } = useApp();
    const { addRoutine } = useWorkoutStore();
    const { programId, step: initialStep } = useLocalSearchParams<{ programId?: string, step?: BuilderStep }>();

    const [step, setStep] = useState<BuilderStep>(initialStep || 'setup');
    const [name, setName] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Tue, Thu, Sat
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
    const [sessions, setSessions] = useState<Map<number, { name: string; exercises: Exercise[] }>>(new Map());

    // Load existing program if editing
    useEffect(() => {
        if (programId) {
            const existing = programs.find(p => p.id === programId);
            if (existing) {
                setName(existing.name);
                const days = existing.sessions.map(s => s.dayOfWeek);
                setSelectedDays(days);

                const sessionsMap = new Map<number, { name: string; exercises: Exercise[] }>();
                existing.sessions.forEach(s => {
                    sessionsMap.set(s.dayOfWeek, {
                        name: s.sessionTypeKey || '',
                        exercises: s.exercises,
                    });
                });
                setSessions(sessionsMap);
            }
        }
    }, [programId, programs]);

    const toggleDay = useCallback((day: number) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            }
            return [...prev, day].sort((a, b) => a - b);
        });
    }, []);

    const addExercise = useCallback((dayIndex: number, ex: Exercise) => {
        setSessions(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(dayIndex) || { name: '', exercises: [] };
            newMap.set(dayIndex, {
                ...current,
                exercises: [...current.exercises, ex],
            });
            return newMap;
        });
    }, []);

    const removeExercise = useCallback((dayIndex: number, exIdx: number) => {
        haptics.light();
        setSessions(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(dayIndex);
            if (current) {
                newMap.set(dayIndex, {
                    ...current,
                    exercises: current.exercises.filter((_, i) => i !== exIdx),
                });
            }
            return newMap;
        });
    }, []);

    const updateSessionName = useCallback((dayIndex: number, sessionName: string) => {
        setSessions(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(dayIndex) || { name: '', exercises: [] };
            newMap.set(dayIndex, { ...current, name: sessionName });
            return newMap;
        });
    }, []);

    const handleSave = useCallback(async () => {
        haptics.success();

        const id = programId || `plan-${Date.now()}`;

        const programSessions: ProgramSession[] = [];
        const weekSchedule: { dayOfWeek: WeekdayKey; sessionTypeKey: string | null }[] = [];


        selectedDays.forEach(dayIndex => {
            const session = sessions.get(dayIndex);

            // Save to WorkoutStore (Persistence)
            if (session && session.exercises.length > 0) {
                const routineId = `routine_${Date.now()}_${dayIndex}`;

                const workoutExercises = session.exercises.map((ex, idx) => ({
                    id: `we_${Date.now()}_${dayIndex}_${idx}`,
                    exerciseId: ex.id,
                    targetSets: 3,
                    targetReps: '10',
                    sets: []
                }));

                addRoutine({
                    id: routineId,
                    name: session.name || WEEKDAYS_FULL[dayIndex] + ' Workout',
                    scheduledDay: dayIndex,
                    exercises: workoutExercises,
                    estimatedDurationMinutes: session.exercises.length * 5 + 10,
                });
            }

            // Prepare for AppContext (Legacy)
            if (session) {
                programSessions.push({
                    dayOfWeek: dayIndex as WeekdayKey,
                    name: session.name || `${WEEKDAYS_FULL[dayIndex]} Workout`,
                    exercises: session.exercises.map(ex => ex.id),
                });
                // ... rest of logic for weekSchedule
                weekSchedule.push({
                    dayOfWeek: dayIndex as WeekdayKey,
                    sessionTypeKey: 'strength', // defaulting
                });
            }
            if (session && session.exercises.length > 0) {
                programSessions.push({
                    dayOfWeek: dayIndex as WeekdayKey,
                    sessionTypeKey: session.name || `Day ${dayIndex + 1}`,
                    exercises: session.exercises,
                });
                weekSchedule.push({
                    dayOfWeek: dayIndex as WeekdayKey,
                    sessionTypeKey: session.name || 'workout',
                });
            }
        });

        // Add rest days
        for (let i = 0; i < 7; i++) {
            if (!selectedDays.includes(i)) {
                weekSchedule.push({
                    dayOfWeek: i as WeekdayKey,
                    sessionTypeKey: null,
                });
            }
        }



        // Also save to AppContext for "Programs" tab (Legacy/Alt view)
        await upsertProgram({
            id,
            name,
            sportType: 'gym',
            weekSchedule: weekSchedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
            sessions: programSessions,
            createdByUser: true,
            createdAt: new Date().toISOString(),
        });

        router.back();
    }, [programId, name, selectedDays, sessions, upsertProgram]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
                    <ArrowLeft size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {programId ? 'Edit Plan' : 'New Plan'}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <StepIndicator currentStep={step} />

            <KeyboardAvoidingView
                style={styles.contentContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {step === 'setup' && (
                    <SetupStep
                        name={name}
                        setName={setName}
                        selectedDays={selectedDays}
                        toggleDay={toggleDay}
                        difficulty={difficulty}
                        setDifficulty={setDifficulty}
                        onNext={() => setStep('exercises')}
                    />
                )}

                {step === 'exercises' && (
                    <ExerciseStep
                        selectedDays={selectedDays}
                        sessions={sessions}
                        addExercise={addExercise}
                        removeExercise={removeExercise}
                        updateSessionName={updateSessionName}
                        onNext={() => setStep('review')}
                        onBack={() => setStep('setup')}
                    />
                )}

                {step === 'review' && (
                    <ReviewStep
                        name={name}
                        selectedDays={selectedDays}
                        sessions={sessions}
                        difficulty={difficulty}
                        onSave={handleSave}
                        onBack={() => setStep('exercises')}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerBackBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    headerSpacer: {
        width: 40,
    },

    // Step Indicator
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 16,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    stepDotActive: {
        backgroundColor: liquidGlass.accent.muted,
        borderWidth: 2,
        borderColor: liquidGlass.accent.primary,
    },
    stepDotComplete: {
        backgroundColor: liquidGlass.accent.primary,
        borderWidth: 0,
    },
    stepDotText: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.tertiary,
    },
    stepDotTextActive: {
        color: liquidGlass.accent.primary,
    },
    stepLabel: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
        marginRight: 12,
    },
    stepLabelActive: {
        color: liquidGlass.text.primary,
        fontWeight: '500',
    },
    stepLine: {
        width: 24,
        height: 2,
        backgroundColor: liquidGlass.surface.glassDark,
        marginRight: 12,
    },
    stepLineActive: {
        backgroundColor: liquidGlass.accent.primary,
    },

    // Step Container
    stepContainer: {
        flex: 1,
    },
    stepContent: {
        padding: 20,
        paddingBottom: 40,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        color: liquidGlass.text.secondary,
        lineHeight: 22,
        marginBottom: 24,
    },

    // Input Card
    inputCard: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.tertiary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        paddingVertical: 8,
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 6,
    },
    sectionHint: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
        marginBottom: 16,
    },

    // Days Grid
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    dayButtonActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    dayButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    dayButtonTextActive: {
        color: liquidGlass.text.inverse,
    },
    daysCount: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
        marginTop: 12,
    },

    // Difficulty
    difficultyRow: {
        flexDirection: 'row',
        gap: 8,
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    difficultyButtonActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    difficultyTextActive: {
        color: liquidGlass.text.inverse,
    },

    // Tip Card
    tipCard: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: liquidGlass.accent.muted,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: liquidGlass.text.primary,
        lineHeight: 20,
    },

    // Buttons
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 50,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    primaryBtnDisabled: {
        opacity: 0.5,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.inverse,
    },

    // Day Tabs
    dayTabs: {
        maxHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    dayTabsContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    dayTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 50,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    dayTabActive: {
        backgroundColor: liquidGlass.accent.muted,
        borderColor: liquidGlass.accent.primary,
    },
    dayTabLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
    },
    dayTabLabelActive: {
        color: liquidGlass.accent.primary,
    },
    dayTabBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayTabBadgeActive: {
        backgroundColor: liquidGlass.accent.primary,
    },
    dayTabBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
    },
    dayTabBadgeTextActive: {
        color: liquidGlass.text.inverse,
    },

    exerciseContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sessionHeader: {
        marginBottom: 20,
    },
    sessionDayLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sessionNameInput: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },

    exercisesList: {
        gap: 12,
    },
    exerciseCard: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        overflow: 'hidden',
    },
    exerciseCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    exerciseIndex: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: liquidGlass.accent.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIndexText: {
        fontSize: 13,
        fontWeight: '700',
        color: liquidGlass.accent.primary,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 2,
    },
    exerciseMeta: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    removeBtn: {
        padding: 8,
    },

    insightToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    insightToggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
    },
    exerciseInsight: {
        padding: 14,
        backgroundColor: liquidGlass.surface.glassDark,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
        gap: 10,
    },
    insightRow: {
        flexDirection: 'row',
        gap: 10,
    },
    insightRowLabel: {
        width: 50,
        fontSize: 11,
        fontWeight: '700',
        color: liquidGlass.text.tertiary,
        textTransform: 'uppercase',
    },
    insightRowValue: {
        flex: 1,
        fontSize: 13,
        color: liquidGlass.text.secondary,
        lineHeight: 18,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    tagText: {
        fontSize: 11,
        color: liquidGlass.text.secondary,
    },

    addExerciseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 18,
        borderWidth: 2,
        borderColor: liquidGlass.accent.muted,
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: liquidGlass.accent.muted + '20',
    },
    addExerciseBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
    },

    buildFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: liquidGlass.background.primary,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    backBtnText: {
        fontSize: 15,
        color: liquidGlass.text.primary,
    },
    footerInfoText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 50,
    },
    nextBtnDisabled: {
        opacity: 0.5,
    },
    nextBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.inverse,
    },

    // Picker
    pickerContainer: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary,
    },
    pickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    pickerCloseBtn: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: liquidGlass.text.primary,
    },
    categoryScroll: {
        maxHeight: 44,
        marginBottom: 12,
    },
    categoryContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 50,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    categoryChipActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: liquidGlass.text.secondary,
        textTransform: 'capitalize',
    },
    categoryChipTextActive: {
        color: liquidGlass.text.inverse,
    },
    pickerList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    pickerItemContent: {
        flex: 1,
    },
    pickerItemName: {
        fontSize: 15,
        fontWeight: '500',
        color: liquidGlass.text.primary,
        marginBottom: 2,
    },
    pickerItemMeta: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },

    // Review
    reviewContent: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        backgroundColor: liquidGlass.accent.muted,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    summaryName: {
        fontSize: 22,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 20,
    },
    summaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryStat: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    summaryStatValue: {
        fontSize: 28,
        fontWeight: '700',
        color: liquidGlass.accent.primary,
    },
    summaryStatLabel: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: liquidGlass.border.subtle,
    },
    difficultyBadge: {
        marginTop: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 50,
    },
    difficultyBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },

    weekPreview: {
        marginBottom: 24,
        gap: 8,
    },
    weekPreviewDay: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    weekPreviewDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    weekPreviewDayName: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
    },
    weekPreviewDayCount: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    weekPreviewSessionName: {
        fontSize: 13,
        color: liquidGlass.accent.primary,
        marginTop: 4,
    },

    reeAnalysis: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    reeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: liquidGlass.accent.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeAvatarText: {
        fontSize: 20,
    },
    reeContent: {
        flex: 1,
    },
    reeTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    reeText: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
        lineHeight: 20,
    },

    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 50,
        paddingVertical: 16,
        marginBottom: 12,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.inverse,
    },
    backLinkBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    backLinkBtnText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
    },
});
