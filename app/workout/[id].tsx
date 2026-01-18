import { useLocalSearchParams, router, Stack } from 'expo-router';
import { X, ChevronRight, AlertCircle, Clock, Check, Info, Pencil, ChevronLeft, HelpCircle, ChevronDown, ChevronUp, Shield, Play, Pause, RotateCcw } from 'lucide-react-native';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal, Animated } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { MicroExplanation } from '@/components/MicroExplanation';
import { ReeWorkoutHint } from '@/components/ReeWorkoutHint';
import { PostWorkoutFeedback } from '@/components/PostWorkoutFeedback';
import { DailyLog } from '@/types';
import colors from '@/constants/colors';
import { getRelevantExplanations } from '@/constants/microExplanations';
import { haptics } from '@/utils/haptics';

const KNEE_SAFE_CONFIG = {
  safe: { color: colors.success, label: 'Knee-Safe' },
  modified: { color: colors.warning, label: 'Modified' },
  caution: { color: colors.danger, label: 'Use Caution' },
} as const;

const REST_EXPLANATIONS: Record<number, string> = {
  30: '30 seconds keeps your heart rate elevated for conditioning-focused work.',
  45: '45 seconds balances muscle pump with partial recovery for hypertrophy.',
  60: '60 seconds allows moderate ATP regeneration (~75%) while maintaining workout density.',
  90: '90 seconds allows good ATP recovery (~80-85%) for moderate-to-heavy strength work.',
  120: '120 seconds allows ATP (muscle energy) to regenerate ~85-95%, helping maintain strength across sets.',
  180: '180 seconds allows near-complete ATP recovery for maximal strength efforts.',
};

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View 
          style={[styles.sheetContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{title}</Text>
            {children}
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose}>
              <Text style={styles.sheetCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams();
  const { workoutPlan, logWorkout, getWorkoutById } = useApp();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [hintDismissedForExercise, setHintDismissedForExercise] = useState<Record<string, boolean>>({});
  const [restSheetVisible, setRestSheetVisible] = useState(false);
  const [exerciseInfoVisible, setExerciseInfoVisible] = useState(false);
  const [jointComfortExpanded, setJointComfortExpanded] = useState(false);
  const [routineStarted, setRoutineStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workout = useMemo(() => {
    const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (!idStr) return null;
    return getWorkoutById(idStr) || workoutPlan.find((w) => w.id === idStr) || null;
  }, [workoutPlan, id, getWorkoutById]);

  const currentExercise = workout?.exercises[currentExerciseIndex];

  const workoutExplanations = useMemo(() => {
    if (!currentExercise) return [];
    return getRelevantExplanations('workout', {
      exerciseKneeSafeLevel: currentExercise.kneeSafeLevel,
      hasSubstitution: !!currentExercise.substitution,
    });
  }, [currentExercise]);

  const toggleSet = useCallback((exerciseId: string, setIndex: number) => {
    haptics.soft();
    setCompletedSets((prev) => {
      const currentSets = prev[exerciseId] || [];
      const newSets = currentSets.includes(setIndex) ? currentSets.filter((s) => s !== setIndex) : [...currentSets, setIndex];
      return { ...prev, [exerciseId]: newSets };
    });
  }, []);

  const handleFeedbackComplete = useCallback(async (feedbackLog: Omit<DailyLog, 'date'>) => {
    await logWorkout({
      ...feedbackLog,
      date: new Date().toISOString().split('T')[0],
    });
    router.replace('/(tabs)/progress');
  }, [logWorkout]);

  const completedExercisesCount = useMemo(() => {
    return Object.keys(completedSets).filter(exerciseId => {
      const exercise = workout?.exercises.find(e => e.id === exerciseId);
      if (!exercise) return false;
      return (completedSets[exerciseId]?.length || 0) >= exercise.sets;
    }).length;
  }, [completedSets, workout?.exercises]);

  const handleRestInfoTap = useCallback(() => {
    haptics.light();
    setRestSheetVisible(true);
  }, []);

  const handleExerciseInfoTap = useCallback(() => {
    haptics.light();
    setExerciseInfoVisible(true);
  }, []);

  const toggleJointComfort = useCallback(() => {
    haptics.selection();
    setJointComfortExpanded(prev => !prev);
  }, []);

  const startRoutine = useCallback(() => {
    haptics.medium();
    setRoutineStarted(true);
    setTimerRunning(true);
    setTimerValue(0);
  }, []);

  const toggleTimer = useCallback(() => {
    haptics.soft();
    setTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    haptics.soft();
    setTimerValue(0);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerValue(prev => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><X size={24} color={colors.text} /></TouchableOpacity>
        </View>
        <View style={{ padding: 24 }}><Text style={styles.headerTitle}>Workout not found</Text></View>
      </SafeAreaView>
    );
  }

  const currentExerciseData = workout.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === workout.exercises.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;
  const kneeSafeConfig = KNEE_SAFE_CONFIG[currentExerciseData.kneeSafeLevel];

  const restExplanation = REST_EXPLANATIONS[currentExerciseData.rest] || 
    `${currentExerciseData.rest} seconds rest between sets.`;

  const jointComfortMessage = currentExerciseData.kneeSafeLevel === 'safe'
    ? 'This movement keeps your knees stable while building upper-body strength.'
    : currentExerciseData.kneeSafeLevel === 'modified'
    ? 'This exercise has been adapted to reduce joint stress while maintaining effectiveness.'
    : 'This exercise involves higher joint load. Consider starting lighter or using alternatives if needed.';

  if (isComplete && workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <PostWorkoutFeedback
          workoutTitle={workout.title}
          workoutId={workout.id}
          exercisesCompleted={completedExercisesCount}
          totalExercises={workout.exercises.length}
          onComplete={handleFeedbackComplete}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => Alert.alert('Leaving early?', 'No judgment — you can always come back.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => router.back() },
          ])}
        >
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{workout.title}</Text>
          {!!workout.sportLabel && <Text style={styles.headerSubtitle} numberOfLines={1} testID="workoutSportContext">{workout.sportLabel}</Text>}
        </View>

        {workout.programId ? (
          <TouchableOpacity
            onPress={() => {
              const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
              if (idStr) router.push(`/programs/edit-today?workoutId=${encodeURIComponent(idStr)}`);
            }}
            style={styles.editTodayBtn}
            testID="workoutEditToday"
          >
            <Pencil size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : <View style={{ width: 44 }} />}
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={((currentExerciseIndex + 1) / workout.exercises.length) * 100} height={8} />
        <Text style={styles.progressText}>Exercise {currentExerciseIndex + 1} of {workout.exercises.length}</Text>
      </View>

      <View style={styles.actionBar}>
        {!routineStarted ? (
          <TouchableOpacity style={styles.startRoutineButton} onPress={startRoutine} activeOpacity={0.8}>
            <Play size={20} color={colors.surface} fill={colors.surface} />
            <Text style={styles.startRoutineText}>Start Routine</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerContainer}>
            <View style={styles.timerDisplay}>
              <Clock size={18} color={colors.primary} />
              <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
            </View>
            <View style={styles.timerControls}>
              <TouchableOpacity style={styles.timerControlBtn} onPress={toggleTimer}>
                {timerRunning ? (
                  <Pause size={18} color={colors.text} />
                ) : (
                  <Play size={18} color={colors.primary} fill={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerControlBtn} onPress={resetTimer}>
                <RotateCcw size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {currentExerciseIndex > 0 && (
          <TouchableOpacity 
            style={styles.prevButtonSmall} 
            onPress={() => setCurrentExerciseIndex((prev) => prev - 1)}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => isLastExercise ? setIsComplete(true) : setCurrentExerciseIndex((prev) => prev + 1)}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>{isLastExercise ? 'Finish' : 'Next'}</Text>
          <ChevronRight size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.exerciseName} testID="workoutExerciseName">{currentExerciseData.name}</Text>
              <TouchableOpacity 
                onPress={handleExerciseInfoTap} 
                style={styles.infoButton} 
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Info size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.badgeRow}>
              <Badge label={kneeSafeConfig.label} color={kneeSafeConfig.color} />
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Sets</Text>
              <Text style={styles.metaValue}>{currentExerciseData.sets}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Reps</Text>
              <Text style={styles.metaValue}>{currentExerciseData.reps}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <TouchableOpacity 
                style={styles.restMetaContainer}
                onPress={handleRestInfoTap}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <View style={styles.restLabelRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={styles.metaLabel}>Rest</Text>
                  <HelpCircle size={12} color={colors.textTertiary} />
                </View>
                <Text style={styles.metaValue}>{currentExerciseData.rest}s</Text>
              </TouchableOpacity>
            </View>
          </View>

          {currentExerciseData.notes && (
            <View style={styles.noteBox}>
              <AlertCircle size={20} color={colors.primary} />
              <Text style={styles.noteText}>{currentExerciseData.notes}</Text>
            </View>
          )}

          {currentExerciseData.kneeSafeLevel === 'safe' && (
            <TouchableOpacity 
              style={styles.jointComfortCard}
              onPress={toggleJointComfort}
              activeOpacity={0.7}
            >
              <View style={styles.jointComfortHeader}>
                <View style={styles.jointComfortLeft}>
                  <Shield size={18} color={colors.success} />
                  <Text style={styles.jointComfortTitle}>Selected for joint comfort</Text>
                </View>
                {jointComfortExpanded ? (
                  <ChevronUp size={18} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={colors.textSecondary} />
                )}
              </View>
              {jointComfortExpanded && (
                <View style={styles.jointComfortContent}>
                  <View style={styles.jointComfortReeRow}>
                    <View style={styles.reeAvatar}>
                      <Text style={styles.reeAvatarText}>R</Text>
                    </View>
                    <Text style={styles.jointComfortMessage}>{jointComfortMessage}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )}

          {workoutExplanations.length > 0 && (
            <MicroExplanation
              explanation={workoutExplanations[0]}
              style={styles.workoutExplanation}
            />
          )}

          {!hintDismissedForExercise[currentExerciseData.id] && (
            <ReeWorkoutHint
              context={{
                exercise: currentExerciseData,
                totalSets: currentExerciseData.sets,
                completedSetsCount: completedSets[currentExerciseData.id]?.length || 0,
                isFirstExercise: isFirstExercise,
                isLastExercise: isLastExercise,
              }}
              onDismiss={() => setHintDismissedForExercise(prev => ({ ...prev, [currentExerciseData.id]: true }))}
            />
          )}

          <View style={styles.setsContainer}>
            <View style={styles.setProgressLine} />
            {Array.from({ length: currentExerciseData.sets }).map((_, idx) => {
              const isCompleted = completedSets[currentExerciseData.id]?.includes(idx);
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.setRow, isCompleted && styles.setRowCompleted]} 
                  onPress={() => toggleSet(currentExerciseData.id, idx)}
                  activeOpacity={0.7}
                >
                  <View style={styles.setInfo}>
                    <Text style={[styles.setLabel, isCompleted && styles.setLabelCompleted]}>Set {idx + 1}</Text>
                    <Text style={[styles.setTarget, isCompleted && styles.setTargetCompleted]}>{currentExerciseData.reps} reps</Text>
                  </View>
                  <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                    {isCompleted && <Check size={20} color={colors.surface} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {!isFirstExercise && (
          <TouchableOpacity style={styles.prevButton} onPress={() => setCurrentExerciseIndex((prev) => prev - 1)}>
            <ChevronLeft size={20} color={colors.textSecondary} />
            <Text style={styles.prevButtonText}>Previous Exercise</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomSheet
        visible={restSheetVisible}
        onClose={() => setRestSheetVisible(false)}
        title="Rest Period"
      >
        <View style={styles.sheetContent}>
          <View style={styles.sheetRestBadge}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.sheetRestValue}>{currentExerciseData.rest}s</Text>
          </View>
          <Text style={styles.sheetDescription}>{restExplanation}</Text>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={exerciseInfoVisible}
        onClose={() => setExerciseInfoVisible(false)}
        title={currentExerciseData.name}
      >
        <View style={styles.sheetContent}>
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Movement Pattern</Text>
            <Text style={styles.infoSectionText}>
              {currentExerciseData.movementPattern?.replace(/_/g, ' ') || 'Compound movement targeting multiple muscle groups.'}
            </Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.infoSectionTitle}>Primary Muscles</Text>
            <Text style={styles.infoSectionText}>Multiple muscle groups engaged.</Text>
          </View>
          {currentExerciseData.rationale && (
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>Why This Exercise</Text>
              <Text style={styles.infoSectionText}>{currentExerciseData.rationale}</Text>
            </View>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.text, textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2, fontWeight: '600' as const },
  iconButton: { padding: 10, borderRadius: 20, backgroundColor: colors.surface },
  editTodayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + '10', alignItems: 'center', justifyContent: 'center' },
  progressContainer: { paddingHorizontal: 24, marginTop: 8, marginBottom: 8 },
  progressText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8, fontWeight: '500' as const },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  startRoutineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  startRoutineText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  timerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevButtonSmall: {
    width: 44,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  content: { padding: 24, flexGrow: 1 },
  exerciseCard: { borderRadius: 32, marginBottom: 24 },
  exerciseHeader: { marginBottom: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  exerciseName: { fontSize: 28, fontWeight: '700' as const, color: colors.text, flex: 1, lineHeight: 34 },
  infoButton: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', gap: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, backgroundColor: colors.background, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 24 },
  metaItem: { alignItems: 'center', flex: 1 },
  metaDivider: { width: 1, height: 24, backgroundColor: colors.borderLight },
  metaLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4, fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  restMetaContainer: { alignItems: 'center', minWidth: 44, minHeight: 44, justifyContent: 'center' },
  restLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  noteBox: { flexDirection: 'row', backgroundColor: colors.primary + '10', padding: 16, borderRadius: 20, gap: 12, marginBottom: 24, alignItems: 'center' },
  noteText: { flex: 1, fontSize: 15, color: colors.primaryDark, lineHeight: 22 },
  jointComfortCard: { 
    backgroundColor: colors.success + '08', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.success + '20',
  },
  jointComfortHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  jointComfortLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  jointComfortTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.success },
  jointComfortContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.success + '15' },
  jointComfortReeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reeAvatar: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  reeAvatarText: { fontSize: 12, fontWeight: '700' as const, color: colors.surface },
  jointComfortMessage: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  setsContainer: { gap: 12, position: 'relative' },
  setProgressLine: {
    position: 'absolute',
    left: 36,
    top: 24,
    bottom: 24,
    width: 2,
    backgroundColor: colors.primary + '20',
    borderRadius: 1,
    zIndex: 0,
  },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 24, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight, zIndex: 1, minHeight: 72 },
  setRowCompleted: { backgroundColor: colors.success + '10', borderColor: colors.success + '30' },
  setInfo: { gap: 4 },
  setLabel: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  setLabelCompleted: { color: colors.success },
  setTarget: { fontSize: 14, color: colors.textSecondary },
  setTargetCompleted: { color: colors.success },
  checkbox: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  checkboxChecked: { borderColor: colors.success, backgroundColor: colors.success },
  prevButton: { padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, minHeight: 48 },
  prevButtonText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' as const },
  workoutExplanation: { marginBottom: 20 },

  sheetOverlay: { 
    flex: 1, 
    backgroundColor: colors.overlay, 
    justifyContent: 'flex-end' 
  },
  sheetContainer: { 
    backgroundColor: colors.surface, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: colors.border, 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  sheetTitle: { 
    fontSize: 20, 
    fontWeight: '700' as const, 
    color: colors.text, 
    marginBottom: 16 
  },
  sheetContent: { gap: 16 },
  sheetRestBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    backgroundColor: colors.primary + '10', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  sheetRestValue: { fontSize: 18, fontWeight: '700' as const, color: colors.primary },
  sheetDescription: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  sheetCloseBtn: { 
    marginTop: 24, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: colors.background, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sheetCloseBtnText: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  infoSection: { marginBottom: 8 },
  infoSectionTitle: { fontSize: 13, fontWeight: '600' as const, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  infoSectionText: { fontSize: 15, color: colors.text, lineHeight: 22 },
});
