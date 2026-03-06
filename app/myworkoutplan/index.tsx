import { router, Stack } from 'expo-router';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Flame,
    Calendar,
    Dumbbell,
    Play,
    Check,
    MoreHorizontal,
    MoreVertical,
    Home,
    BarChart2,
    Info,
    Bell,
    Star
} from 'lucide-react-native';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Dimensions,
    Animated,
    Image,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { VoidBackground } from '@/components/VoidBackground';
import { useApp } from '@/contexts/AppContext';
import { liquidGlass, glassShadows, glassLayout, glassStyles } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { Program, ProgramSession, WorkoutSession } from '@/types';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useRee } from '@/contexts/ReeContext';

// Components
import { DynamicStatusPanel, PanelContext } from '@/components/DynamicStatusPanel';
import { RecoveryInbox } from '@/components/RecoveryInbox';

// Services
import { analysisService, RecoveryAnalysis } from '@/services/AnalysisService';
import { calendarService, DailyAvailability } from '@/services/CalendarService';
import { storageService } from '@/services/StorageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Get week dates for a given offset
const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + mondayOffset + (weekOffset * 7));

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });
};

const formatDate = (date: Date) => date.getDate();
const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};


// ============ EXERCISE CARD COMPONENT ============
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { Exercise } from '@/types/workout';
import { ExerciseOptionsModal } from './components/ExerciseOptionsModal';
import { ExerciseHistoryModal } from './components/ExerciseHistoryModal';
import { TargetEditModal } from './components/TargetEditModal';

interface ExerciseCardProps {
    exercise: any; // WorkoutExercise type
    onPressOptions: () => void;
    onPressSets: () => void;
    onPressReps: () => void;
}

const ExerciseCard = ({ exercise, onPressOptions, onPressSets, onPressReps }: ExerciseCardProps) => {
    // Look up the full exercise details
    const { customExercises } = useWorkoutStore();
    const fullExercise: Exercise = customExercises.find(e => e.id === exercise.exerciseId) || EXERCISE_DATABASE[exercise.exerciseId];

    // Safety check if exercise is not found
    if (!fullExercise) return null;

    const muscles = fullExercise.muscles.primary.join(', ');
    const category = fullExercise.categories[0]?.replace('_', ' ') || 'General';

    return (
        <View style={styles.exerciseCard}>
            <View style={styles.exerciseIconContainer}>
                <Dumbbell size={24} color={liquidGlass.accent.primary} />
            </View>
            <View style={styles.exerciseContent}>
                <View style={styles.exerciseHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.exerciseName} numberOfLines={1}>{fullExercise.name}</Text>
                        <Text style={styles.exerciseMuscle} numberOfLines={1}>
                            {category.toUpperCase()} • {muscles}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.statsButton} onPress={onPressOptions}>
                        <MoreHorizontal size={20} color={liquidGlass.text.tertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.exerciseMetaRow}>
                    <TouchableOpacity style={styles.metaBadge} onPress={onPressSets}>
                        <Text style={styles.metaText}>{exercise.targetSets} Sets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.metaBadge} onPress={onPressReps}>
                        <Text style={styles.metaText}>{exercise.targetReps} Reps</Text>
                    </TouchableOpacity>
                    <View style={[styles.metaBadge, styles.staticBadge]}>
                        <Text style={styles.metaText}>{fullExercise.difficulty}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ============ MAIN SCREEN ============
export default function MyWorkoutPlanScreen() {
    const { userPoints } = useApp();
    const {
        routines,
        deleteRoutine,
        startWorkout,
        planName,
        setPlanName,
        removeExercise,
        moveExercise,
        getExerciseHistory,
        updateExerciseTargets,
        customExercises
    } = useWorkoutStore();


    // -- State --
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [tempPlanName, setTempPlanName] = useState(planName);
    const [inboxVisible, setInboxVisible] = useState(false);


    // Analysis
    const [recoveryStatus, setRecoveryStatus] = useState<RecoveryAnalysis | null>(null);
    const [calendarAvailability, setCalendarAvailability] = useState<DailyAvailability | null>(null);
    const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
    const [weeklyVolumeAvg, setWeeklyVolumeAvg] = useState<number>(0);

    // Modals State
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null); // The instance ID (we_...)
    const [selectedDbId, setSelectedDbId] = useState<string | null>(null); // The DB ID (bench_press)
    const [selectedExerciseName, setSelectedExerciseName] = useState('');

    const [optionsVisible, setOptionsVisible] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [currentHistory, setCurrentHistory] = useState<any[]>([]);

    const [editTargetVisible, setEditTargetVisible] = useState(false);
    const [editTargetType, setEditTargetType] = useState<'sets' | 'reps'>('sets');
    const [editInitialValue, setEditInitialValue] = useState('');

    // Week State
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
        const today = new Date().getDay();
        return today === 0 ? 6 : today - 1; // Convert Sunday=0 to Mon=0
    });

    // ------------------------------------------
    // Effects & Analysis Logic (Unchanged)
    useEffect(() => {
        if (isRenameModalVisible) setTempPlanName(planName);
    }, [isRenameModalVisible, planName]);

    const handleRenameSave = useCallback(() => {
        if (tempPlanName.trim()) {
            setPlanName(tempPlanName.trim());
            haptics.success();
            setIsRenameModalVisible(false);
        }
    }, [tempPlanName, setPlanName]);

    const mockBiometrics = useMemo(() => ({
        sleepHours: 7.8, hrv: 55, stressRating: 4, sorenessRating: 3
    }), []);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const last = await storageService.getLastWorkout();
                const avgVolume = await storageService.getWeeklyVolumeAverage();
                setLastWorkout(last);
                setWeeklyVolumeAvg(avgVolume);
                await calendarService.requestPermissions();
                const availability = await calendarService.getAvailability();
                setCalendarAvailability(availability);
            } catch (error) { console.error(error); }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        const freeMinutes = calendarAvailability?.totalFreeMinutes;
        const result = analysisService.analyzeDailyState({
            date: new Date(),
            sleepHours: mockBiometrics.sleepHours,
            sleepQuality: 'fair',
            hrv: mockBiometrics.hrv,
            restingHeartRate: 62,
            sorenessRating: mockBiometrics.sorenessRating,
            stressRating: mockBiometrics.stressRating,
        }, lastWorkout ?? undefined, weeklyVolumeAvg, freeMinutes);
        setRecoveryStatus(result);
    }, [mockBiometrics, calendarAvailability, lastWorkout, weeklyVolumeAvg]);

    const panelContext = useMemo((): PanelContext => {
        const hour = new Date().getHours();
        const selectedRoutine = routines.find(r => r.scheduledDay === selectedDayIndex);
        if (mockBiometrics.stressRating >= 7) return 'low_energy';
        if (!selectedRoutine) return 'rest_day';
        if (hour >= 5 && hour < 12) return 'morning_ready';
        if (hour >= 18 || hour < 5) return 'evening_pending';
        return 'morning_ready';
    }, [routines, selectedDayIndex, mockBiometrics.stressRating]);

    const selectedRoutine = useMemo(() => {
        return routines.find(r => r.scheduledDay === selectedDayIndex) || null;
    }, [routines, selectedDayIndex]);

    // ------------------------------------------
    // Handlers
    const handleDayPress = (index: number) => {
        haptics.selection();
        setSelectedDayIndex(index);
    };

    const handleCreatePlan = useCallback(() => {
        haptics.medium();
        router.push(`/myworkoutplan/library?day=${selectedDayIndex}`);
    }, [selectedDayIndex]);

    const handleStartWorkout = useCallback(() => {
        if (!selectedRoutine) return;
        haptics.success();
        startWorkout(selectedRoutine.id);
        router.push('/myworkoutplan/active-workout');
    }, [selectedRoutine, startWorkout]);

    const handleDeleteRoutine = useCallback(() => {
        if (!selectedRoutine) return;
        Alert.alert("Delete Routine", "Remove this routine?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteRoutine(selectedRoutine.id) }
        ]);
    }, [selectedRoutine, deleteRoutine]);

    // -- Exercise Interaction Handlers --

    const openOptions = (ex: any) => {
        const dbEx = customExercises.find(e => e.id === ex.exerciseId) || EXERCISE_DATABASE[ex.exerciseId];
        setSelectedExerciseId(ex.id);
        setSelectedDbId(ex.exerciseId);
        setSelectedExerciseName(dbEx?.name || 'Exercise');
        setOptionsVisible(true);
    };

    const handleViewHistory = () => {
        if (!selectedDbId) return;
        const history = getExerciseHistory(selectedDbId);
        setCurrentHistory(history);
        setHistoryVisible(true);
    };

    const handleMoveExercise = () => {
        // Implementation: Show day picker or simple alert for now
        // For simplicity in this turn, we'll just move it to the NEXT day
        const nextDay = (selectedDayIndex + 1) % 7;
        Alert.alert(
            "Move to tomorrow?",
            `Move ${selectedExerciseName} to ${WEEKDAY_FULL[nextDay]}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Move",
                    onPress: () => {
                        if (selectedRoutine && selectedExerciseId) {
                            moveExercise(selectedRoutine.id, nextDay, selectedExerciseId);
                            haptics.success();
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteExercise = () => {
        if (selectedRoutine && selectedExerciseId) {
            removeExercise(selectedRoutine.id, selectedExerciseId);
            haptics.medium();
        }
    };

    const openEditTarget = (ex: any, type: 'sets' | 'reps') => {
        setSelectedExerciseId(ex.id);
        setEditTargetType(type);
        setEditInitialValue(type === 'sets' ? ex.targetSets.toString() : ex.targetReps);
        setEditTargetVisible(true);
    };

    const handleSaveTarget = (val: string) => {
        if (!selectedRoutine || !selectedExerciseId) return;

        const updates: any = {};
        if (editTargetType === 'sets') {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) updates.targetSets = num;
        } else {
            updates.targetReps = val;
        }

        updateExerciseTargets(selectedRoutine.id, selectedExerciseId, updates);
    };

    return (
        <VoidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* ========== HEADER ========== */}
                <View style={styles.premiumHeader}>
                    <View style={styles.logoRow}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
                            <ChevronLeft size={24} color={liquidGlass.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerTitleContainer} onPress={() => setIsRenameModalVisible(true)}>
                            <Text style={styles.greetingText}>Training Flow</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={styles.logoTitle}>{planName || 'Workout Plan'}</Text>
                                <ChevronDown size={14} color={liquidGlass.text.primary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.pointsBadge}>
                            <Star size={14} color={liquidGlass.accent.primary} fill={liquidGlass.accent.primary} />
                            <Text style={styles.pointsText}>{userPoints}</Text>
                        </View>
                    </View>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* ========== PANEL ========== */}
                    <View style={styles.panelContainer}>
                        <DynamicStatusPanel
                            context={panelContext}
                            readinessScore={recoveryStatus?.score ?? 78}
                            sleepHours={mockBiometrics.sleepHours}
                            workoutName={selectedRoutine?.name || "Recovery Day"}
                            recoveryHours="48-72"
                            hrvTrend="up"
                        />
                    </View>



                    {/* ========== SCROLLER ========== */}
                    <View style={styles.dayScrollerContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScrollerContent}>
                            {WEEKDAY_LABELS.map((dayLabel, index) => {
                                const routine = routines.find(r => r.scheduledDay === index);
                                const isSelected = selectedDayIndex === index;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.dayScrollItem, isSelected && styles.dayScrollItemActive]}
                                        onPress={() => handleDayPress(index)}
                                    >
                                        <Text style={[styles.dayScrollLabel, isSelected && styles.dayScrollLabelActive]}>{dayLabel}</Text>
                                        <View style={[styles.dayDot, routine && styles.dayDotActive, isSelected && styles.dayDotSelected]} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* ========== DETAIL ========== */}
                    <View style={styles.dayDetail}>
                        <View style={styles.dayHeaderRow}>
                            <Text style={styles.dayDetailTitle}>{WEEKDAY_FULL[selectedDayIndex]}</Text>
                            {selectedRoutine && (
                                <TouchableOpacity onPress={handleDeleteRoutine}>
                                    <MoreHorizontal size={20} color={liquidGlass.text.tertiary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {!selectedRoutine ? (
                            <View style={styles.emptyState}>
                                <Dumbbell size={48} color={liquidGlass.text.tertiary} strokeWidth={1} />
                                <Text style={styles.emptyStateTitle}>Rest & Recover</Text>
                                <Text style={styles.emptyStateText}>No workout scheduled. Focus on active recovery.</Text>
                                <TouchableOpacity style={styles.emptyStateCta} onPress={handleCreatePlan}>
                                    <Plus size={18} color={liquidGlass.text.inverse} strokeWidth={3} />
                                    <Text style={styles.emptyStateCtaText}>Add Exercise</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.exerciseList}>
                                <View style={styles.workoutHeader}>
                                    <Text style={styles.workoutDayTitle}>{selectedRoutine.name}</Text>
                                    <View style={styles.workoutTimeBadge}>
                                        <Text style={styles.workoutTimeText}>{selectedRoutine.exercises.length} Exercises</Text>
                                    </View>
                                </View>

                                {selectedRoutine.exercises.map((ex, idx) => (
                                    <ExerciseCard
                                        key={ex.id}
                                        exercise={ex}
                                        onPressOptions={() => openOptions(ex)}
                                        onPressSets={() => openEditTarget(ex, 'sets')}
                                        onPressReps={() => openEditTarget(ex, 'reps')}
                                    />
                                ))}

                                <TouchableOpacity style={styles.addExerciseCard} onPress={handleCreatePlan}>
                                    <Plus size={20} color={liquidGlass.text.tertiary} />
                                    <Text style={styles.addExerciseCardText}>Add More Exercises</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.startWorkoutBtn} onPress={handleStartWorkout}>
                                    <Play size={20} color={liquidGlass.text.inverse} />
                                    <Text style={styles.startWorkoutBtnText}>Start Session</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <View style={styles.footerSpacer} />
                </ScrollView>

                {/* --- MODALS --- */}
                <RecoveryInbox visible={inboxVisible} onClose={() => setInboxVisible(false)} />

                <ExerciseOptionsModal
                    visible={optionsVisible}
                    onClose={() => setOptionsVisible(false)}
                    exerciseName={selectedExerciseName}
                    onDelete={handleDeleteExercise}
                    onMove={handleMoveExercise}
                    onHistory={handleViewHistory}
                />

                <ExerciseHistoryModal
                    visible={historyVisible}
                    onClose={() => setHistoryVisible(false)}
                    exerciseName={selectedExerciseName}
                    history={currentHistory}
                />

                <TargetEditModal
                    visible={editTargetVisible}
                    onClose={() => setEditTargetVisible(false)}
                    onSave={handleSaveTarget}
                    title={`Update Target ${editTargetType === 'sets' ? 'Sets' : 'Reps'}`}
                    initialValue={editInitialValue}
                    isNumeric={editTargetType === 'sets'}
                />

                {/* Rename Modal */}
                <Modal visible={isRenameModalVisible} transparent animationType="fade" onRequestClose={() => setIsRenameModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                        <View style={styles.renameModal}>
                            <Text style={styles.modalTitle}>Rename Flow</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={tempPlanName}
                                onChangeText={setTempPlanName}
                                autoFocus
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalCancel} onPress={() => setIsRenameModalVisible(false)}>
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSave} onPress={handleRenameSave}>
                                    <Text style={styles.modalSaveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </SafeAreaView>
        </VoidBackground>
    );
}

const styles = StyleSheet.create({
    // ... Copy over existing styles ...
    // Added specific styles for interactive badges
    staticBadge: {
        opacity: 0.7,
    },
    container: { flex: 1 },
    premiumHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: glassLayout.screenPadding, paddingVertical: 12, marginBottom: 8,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: liquidGlass.border.glass,
    },
    headerTitleContainer: { justifyContent: 'center' },
    greetingText: { fontSize: 12, color: liquidGlass.text.tertiary, marginBottom: 2 },
    logoTitle: { fontSize: 18, fontWeight: '700', color: liquidGlass.text.primary, letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pointsBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${liquidGlass.accent.primary}20`,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: `${liquidGlass.accent.primary}40`,
    },
    pointsText: { fontSize: 15, fontWeight: '700', color: liquidGlass.accent.primary },
    notificationBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center',
    },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: glassLayout.screenPadding, paddingBottom: 40 },
    panelContainer: { marginBottom: 24 },
    reeButtonContainer: { alignItems: 'center', marginBottom: 24 },
    dayScrollerContainer: { marginBottom: 24 },
    dayScrollerContent: { gap: 12, paddingVertical: 4 },
    dayScrollItem: {
        width: 50, height: 70, alignItems: 'center', justifyContent: 'center',
        borderRadius: 20, backgroundColor: liquidGlass.surface.glass, borderWidth: 1, borderColor: liquidGlass.border.glass,
    },
    dayScrollItemActive: {
        backgroundColor: liquidGlass.accent.primary, borderColor: liquidGlass.accent.primary, ...glassShadows.glowTeal,
    },
    dayScrollLabel: { fontSize: 12, fontWeight: '700', color: liquidGlass.text.tertiary, marginBottom: 8 },
    dayScrollLabelActive: { color: liquidGlass.text.inverse },
    dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
    dayDotActive: { backgroundColor: liquidGlass.accent.primary },
    dayDotSelected: { backgroundColor: liquidGlass.text.inverse },
    dayDetail: { gap: 16 },
    dayHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dayDetailTitle: { fontSize: 22, fontWeight: '800', color: liquidGlass.text.primary, letterSpacing: -0.5 },
    emptyState: {
        ...glassStyles.card, padding: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: liquidGlass.surface.glass,
    },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', color: liquidGlass.text.primary, marginTop: 16, marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: liquidGlass.text.tertiary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    emptyStateCta: {
        flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: liquidGlass.accent.primary,
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, ...glassShadows.glowTeal,
    },
    emptyStateCtaText: { color: liquidGlass.text.inverse, fontWeight: '800', fontSize: 15 },
    exerciseList: { gap: 16 },
    workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    workoutDayTitle: { fontSize: 18, fontWeight: '700', color: liquidGlass.accent.primary },
    workoutTimeBadge: { backgroundColor: liquidGlass.surface.glassLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    workoutTimeText: { fontSize: 12, fontWeight: '700', color: liquidGlass.text.secondary },
    exerciseCard: { ...glassStyles.card, flexDirection: 'row', padding: 12, backgroundColor: liquidGlass.surface.glass },
    exerciseIconContainer: {
        width: 60, height: 60, borderRadius: 12, overflow: 'hidden', backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center', justifyContent: 'center',
    },
    exerciseContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
    exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    statsButton: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    exerciseName: { fontSize: 16, fontWeight: '700', color: liquidGlass.text.primary },
    exerciseMuscle: { fontSize: 12, color: liquidGlass.text.tertiary },
    exerciseMetaRow: { flexDirection: 'row', gap: 8 },
    metaBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    metaText: { fontSize: 10, fontWeight: '600', color: liquidGlass.text.secondary },
    addExerciseCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 20,
        borderWidth: 1, borderColor: liquidGlass.border.glass, borderStyle: 'dashed',
    },
    addExerciseCardText: { color: liquidGlass.text.tertiary, fontWeight: '600' },
    startWorkoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: liquidGlass.accent.primary,
        height: 60, borderRadius: 30, marginTop: 12, ...glassShadows.glowTeal,
    },
    startWorkoutBtnText: { color: liquidGlass.text.inverse, fontSize: 18, fontWeight: '800' },
    footerSpacer: { height: 40 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    renameModal: {
        backgroundColor: liquidGlass.background.secondary, borderRadius: 28, padding: 24, borderWidth: 1,
        borderColor: liquidGlass.border.glass, ...glassShadows.deep,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: liquidGlass.text.primary, marginBottom: 20, textAlign: 'center' },
    modalInput: {
        backgroundColor: liquidGlass.surface.glassDark, borderRadius: 16, padding: 16, color: liquidGlass.text.primary,
        fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: liquidGlass.border.glass,
    },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalCancel: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: liquidGlass.surface.glass },
    modalCancelText: { fontSize: 16, fontWeight: '600', color: liquidGlass.text.primary },
    modalSave: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: liquidGlass.accent.primary },
    modalSaveText: { fontSize: 16, fontWeight: '600', color: liquidGlass.text.inverse },
});
