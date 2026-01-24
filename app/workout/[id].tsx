import { useLocalSearchParams, router, Stack } from 'expo-router';
import { X, ChevronRight, Clock, Pencil, Play, Pause, RotateCcw, Flag, Zap } from 'lucide-react-native';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useApp } from '@/contexts/AppContext';

import { ExerciseInputCard } from '@/components/ExerciseInputCard';
import { RestTimerOverlay } from '@/components/RestTimerOverlay';
import { PostWorkoutFeedback } from '@/components/PostWorkoutFeedback';
import { storageService } from '@/services/StorageService';
import { fatigueTracker } from '@/services/FatigueTracker';
import { DailyLog, WorkoutSession, ExerciseLog, SetLog } from '@/types';
import colors, { gradients } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const TEAL = '#00C2B8';
const ORANGE = '#FF7A50';

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
  const { workoutPlan, logWorkout, getWorkoutById, addPoints } = useApp();
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
  const startButtonScale = useRef(new Animated.Value(1)).current;
  const finishButtonGlow = useRef(new Animated.Value(0)).current;

  const workout = useMemo(() => {
    const idStr = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
    if (!idStr) return null;
    return getWorkoutById(idStr) || workoutPlan.find((w) => w.id === idStr) || null;
  }, [workoutPlan, id, getWorkoutById]);

  const startRoutine = useCallback(() => {
    haptics.completionWave();

    Animated.sequence([
      Animated.timing(startButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(startButtonScale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setRoutineStarted(true);
    setTimerRunning(true);
    setTimerValue(0);
  }, [startButtonScale]);

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

  useEffect(() => {
    if (routineStarted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(finishButtonGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(finishButtonGlow, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [routineStarted, finishButtonGlow]);

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

  const handleFinishWorkout = useCallback(async () => {
    haptics.recoveryFinish();
    setTimerRunning(false);
    const session = compileWorkoutSession();
    if (session) {
      console.log('Workout completed! Total volume:', session.totalVolume, 'lbs');
      try {
        await storageService.saveWorkout(session);
        console.log('[WorkoutScreen] Session saved to persistent storage');

        // Track muscle fatigue for connected recovery
        const fatiguedParts = await fatigueTracker.recordWorkoutCompletion(session);
        console.log('[WorkoutScreen] Fatigued parts:', fatiguedParts);
      } catch (error) {
        console.error('[WorkoutScreen] Failed to save session:', error);
      }
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
    await addPoints(50);
    console.log('[WorkoutScreen] Added 50 points for completing workout');
    router.replace('/(tabs)/progress');
  }, [logWorkout, addPoints]);

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

  const finishButtonShadowOpacity = finishButtonGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={['#020617', '#0F172A', '#020617']}
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
            <X size={22} color={colors.textSecondary} />
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
              <Pencil size={20} color={TEAL} />
            </TouchableOpacity>
          ) : <View style={styles.headerButton} />}
        </View>

        <View style={styles.statsBar}>
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.statsContent}>
            {!routineStarted ? (
              <Animated.View style={[styles.startButtonWrapper, { transform: [{ scale: startButtonScale }] }]}>
                <TouchableOpacity style={styles.startButton} onPress={startRoutine} activeOpacity={0.9}>
                  <LinearGradient
                    colors={gradients.startButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                  >
                    <Zap size={20} color="#FFF" fill="#FFF" />
                    <Text style={styles.startButtonText}>Start Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
                <View style={styles.timerSection}>
                  <View style={styles.timerDisplay}>
                    <Clock size={16} color={TEAL} />
                    <Text style={styles.timerText}>{formatTime(timerValue)}</Text>
                  </View>
                  <View style={styles.timerControls}>
                    <TouchableOpacity style={styles.timerBtn} onPress={toggleTimer}>
                      {timerRunning ? (
                        <Pause size={16} color={TEAL} />
                      ) : (
                        <Play size={16} color={TEAL} fill={TEAL} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.timerBtn} onPress={resetTimer}>
                      <RotateCcw size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>
                    {totalCompletedSets}/{totalSets} sets
                  </Text>
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.progressBarTrack}>
                      <LinearGradient
                        colors={progress === 100 ? gradients.completionWave : gradients.active}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${progress}%` }]}
                      />
                    </View>
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
              darkMode={false}
            />
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {routineStarted && (
          <View style={styles.finishContainer}>
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
            <Animated.View
              style={[
                styles.finishButtonShadow,
                {
                  shadowOpacity: finishButtonShadowOpacity,
                }
              ]}
            >
              <TouchableOpacity
                style={styles.finishButton}
                onPress={handleFinishWorkout}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={gradients.finishButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.finishButtonGradient}
                >
                  <Flag size={20} color="#FFF" />
                  <Text style={styles.finishButtonText}>Finish Workout</Text>
                  <ChevronRight size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
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
  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 217, 184, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  startButtonWrapper: {
    flex: 1,
  },
  startButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
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
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#E2E8F0',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    gap: 6,
  },
  timerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 217, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 184, 0.25)',
  },
  progressSection: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  progressBarWrapper: {
    width: 110,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 217, 184, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 4,
  },
  bottomSpacer: {
    height: 110,
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
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
  },
  finishButtonShadow: {
    borderRadius: 22,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  finishButton: {
    borderRadius: 22,
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
    color: '#FFF',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#020617',
  },
  errorText: {
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0, 217, 184, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 184, 0.25)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEAL,
  },
});

