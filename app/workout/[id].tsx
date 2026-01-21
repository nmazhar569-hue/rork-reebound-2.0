import { useLocalSearchParams, router, Stack } from 'expo-router';
import { X, ChevronRight, Clock, Pencil, Play, Pause, RotateCcw, Flag } from 'lucide-react-native';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useApp } from '@/contexts/AppContext';
import { ProgressBar } from '@/components/ui';
import { ExerciseInputCard } from '@/components/ExerciseInputCard';
import { RestTimerOverlay } from '@/components/RestTimerOverlay';
import { PostWorkoutFeedback } from '@/components/PostWorkoutFeedback';
import { DailyLog, WorkoutSession, ExerciseLog, SetLog } from '@/types';
import colors from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface SetInputData {
  weight: string;
  reps: string;
  completed: boolean;
  rpe: string;
}

interface ExerciseInputState {
  [exerciseId: string]: SetInputData[];
}

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams();
  const { workoutPlan, logWorkout, getWorkoutById } = useApp();
  const [isComplete, setIsComplete] = useState(false);
  const [routineStarted, setRoutineStarted] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [exerciseInputs, setExerciseInputs] = useState<ExerciseInputState>({});
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restTimerConfig, setRestTimerConfig] = useState({
    seconds: 90,
    exerciseName: '',
    setNumber: 0,
  });
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const workout = useMemo(() => {
    const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (!idStr) return null;
    return getWorkoutById(idStr) || workoutPlan.find((w) => w.id === idStr) || null;
  }, [workoutPlan, id, getWorkoutById]);

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

  const handleSetComplete = useCallback((exerciseId: string, exerciseName: string, restSeconds: number, setIndex: number, data: SetInputData) => {
    if (data.completed) {
      setRestTimerConfig({
        seconds: restSeconds,
        exerciseName: exerciseName,
        setNumber: setIndex + 1,
      });
      setRestTimerVisible(true);
    }
  }, []);

  const handleExerciseSetsChange = useCallback((exerciseId: string, sets: SetInputData[]) => {
    setExerciseInputs(prev => ({
      ...prev,
      [exerciseId]: sets,
    }));
  }, []);

  const compileWorkoutSession = useCallback((): WorkoutSession | null => {
    if (!workout) return null;

    const exerciseLogs: ExerciseLog[] = workout.exercises.map((exercise) => {
      const inputSets = exerciseInputs[exercise.id] || [];
      const setLogs: SetLog[] = inputSets
        .filter(s => s.completed)
        .map((s, idx) => ({
          setNumber: idx + 1,
          weight: s.weight ? parseFloat(s.weight) : undefined,
          reps: s.reps ? parseInt(s.reps, 10) : undefined,
          completed: s.completed,
          rpe: s.rpe ? parseInt(s.rpe, 10) : undefined,
          timestamp: new Date().toISOString(),
        }));

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: setLogs,
      };
    });

    const totalVolume = exerciseLogs.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exTotal, set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        return exTotal + (weight * reps);
      }, 0);
    }, 0);

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: Math.floor(timerValue / 60),
      totalVolume,
      perceivedStrain: 0,
      exercises: exerciseLogs,
      completedAt: new Date().toISOString(),
    };

    console.log('=== COMPILED WORKOUT SESSION ===');
    console.log(JSON.stringify(session, null, 2));
    console.log('================================');

    return session;
  }, [workout, exerciseInputs, timerValue]);

  const handleFinishWorkout = useCallback(() => {
    haptics.medium();
    setTimerRunning(false);
    const session = compileWorkoutSession();
    if (session) {
      console.log('Workout completed! Total volume:', session.totalVolume, 'lbs');
    }
    setIsComplete(true);
  }, [compileWorkoutSession]);

  const completedExercisesCount = useMemo(() => {
    if (!workout) return 0;
    return workout.exercises.filter(exercise => {
      const sets = exerciseInputs[exercise.id] || [];
      const completedSets = sets.filter(s => s.completed).length;
      return completedSets >= exercise.sets;
    }).length;
  }, [workout, exerciseInputs]);

  const totalCompletedSets = useMemo(() => {
    return Object.values(exerciseInputs).reduce((total, sets) => {
      return total + sets.filter(s => s.completed).length;
    }, 0);
  }, [exerciseInputs]);

  const totalSets = useMemo(() => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, ex) => total + ex.sets, 0);
  }, [workout]);

  const handleFeedbackComplete = useCallback(async (feedbackLog: Omit<DailyLog, 'date'>) => {
    await logWorkout({
      ...feedbackLog,
      date: new Date().toISOString().split('T')[0],
    });
    router.replace('/(tabs)/progress');
  }, [logWorkout]);

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

  const progress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#0A0A0F', '#12121A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert('Leaving early?', 'Your progress will be saved.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => router.back() },
            ])}
          >
            <X size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{workout.title}</Text>
            {workout.sportLabel && (
              <Text style={styles.headerSubtitle}>{workout.sportLabel}</Text>
            )}
          </View>

          {workout.programId ? (
            <TouchableOpacity
              onPress={() => {
                const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
                if (idStr) router.push(`/programs/edit-today?workoutId=${encodeURIComponent(idStr)}`);
              }}
              style={styles.headerButton}
            >
              <Pencil size={20} color={colors.primary} />
            </TouchableOpacity>
          ) : <View style={styles.headerButton} />}
        </View>

        <View style={styles.statsBar}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.statsContent}>
            {!routineStarted ? (
              <TouchableOpacity style={styles.startButton} onPress={startRoutine} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#00D9A3', '#00B885']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startButtonGradient}
                >
                  <Play size={18} color="#000" fill="#000" />
                  <Text style={styles.startButtonText}>Start Session</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.timerSection}>
                  <View style={styles.timerDisplay}>
                    <Clock size={16} color={colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
                  </View>
                  <View style={styles.timerControls}>
                    <TouchableOpacity style={styles.timerBtn} onPress={toggleTimer}>
                      {timerRunning ? (
                        <Pause size={16} color="#FFF" />
                      ) : (
                        <Play size={16} color={colors.primary} fill={colors.primary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timerBtn} onPress={resetTimer}>
                      <RotateCcw size={16} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>
                    {totalCompletedSets}/{totalSets} sets
                  </Text>
                  <View style={styles.progressBarWrapper}>
                    <ProgressBar progress={progress} height={4} />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {workout.exercises.map((exercise, index) => (
            <ExerciseInputCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={index}
              initialSets={exerciseInputs[exercise.id]}
              onSetComplete={(setIndex, data) => 
                handleSetComplete(exercise.id, exercise.name, exercise.rest, setIndex, data)
              }
              onAllSetsChange={(sets) => handleExerciseSetsChange(exercise.id, sets)}
              darkMode={true}
            />
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {routineStarted && (
          <View style={styles.finishContainer}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinishWorkout}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#00D9A3', '#00B885']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.finishButtonGradient}
              >
                <Flag size={20} color="#000" />
                <Text style={styles.finishButtonText}>Finish Workout</Text>
                <ChevronRight size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <RestTimerOverlay
        visible={restTimerVisible}
        initialSeconds={restTimerConfig.seconds}
        exerciseName={restTimerConfig.exerciseName}
        setNumber={restTimerConfig.setNumber}
        onComplete={() => setRestTimerVisible(false)}
        onSkip={() => setRestTimerVisible(false)}
        onDismiss={() => setRestTimerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  statsBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 16,
  },
  startButton: {
    flex: 1,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    gap: 6,
  },
  timerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBarWrapper: {
    width: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  finishContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  finishButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  finishButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
