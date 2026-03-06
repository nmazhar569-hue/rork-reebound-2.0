import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    WorkoutRoutine,
    WorkoutExercise,
    CompletedWorkout,
    WorkoutSet,
    Exercise
} from '@/types/workout';

// Equipment and onboarding types
export type EquipmentType =
    | 'bodyweight'
    | 'dumbbells'
    | 'barbells'
    | 'bands'
    | 'pullup_bar'
    | 'bench'
    | 'full_gym';

export type TrainingGoal =
    | 'strength'
    | 'hypertrophy'
    | 'endurance'
    | 'general';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutPreferences {
    equipment: EquipmentType[];
    trainingFrequency: number; // days per week
    experienceLevel: ExperienceLevel;
    primaryGoal: TrainingGoal;
    onboardingComplete: boolean;
}

// Active session state (not persisted)
export interface ActiveSession {
    routineId: string;
    routineName: string;
    startTime: number; // timestamp
    currentExerciseIndex: number;
    exercises: WorkoutExercise[];
    isRestTimerActive: boolean;
    restTimeRemaining: number;
    isPaused: boolean;
}

interface WorkoutStore {
    // User preferences
    preferences: WorkoutPreferences;

    // Plan Meta
    planName: string;
    setPlanName: (name: string) => void;

    // Workout routines (the user's weekly plan)
    routines: WorkoutRoutine[];

    // Completed workout history
    history: CompletedWorkout[];

    // Custom Exercises
    customExercises: Exercise[];
    addCustomExercise: (exercise: Exercise) => void;
    deleteCustomExercise: (exerciseId: string) => void;

    // Active workout session (transient, not persisted)
    activeSession: ActiveSession | null;

    // Preferences actions
    updatePreferences: (updates: Partial<WorkoutPreferences>) => void;
    completeOnboarding: (prefs: Omit<WorkoutPreferences, 'onboardingComplete'>) => void;

    // Routine CRUD
    addRoutine: (routine: WorkoutRoutine) => void;
    updateRoutine: (id: string, updates: Partial<WorkoutRoutine>) => void;
    deleteRoutine: (id: string) => void;
    getRoutineById: (id: string) => WorkoutRoutine | undefined;
    getRoutineForDay: (day: number) => WorkoutRoutine | undefined;

    // Exercise Management
    removeExercise: (routineId: string, exerciseId: string) => void;
    moveExercise: (sourceRoutineId: string, targetDay: number, exerciseId: string) => void;
    updateExerciseTargets: (routineId: string, exerciseId: string, targets: { targetSets?: number; targetReps?: string }) => void;

    // Active session actions
    startWorkout: (routineId: string) => void;
    logSet: (exerciseIndex: number, set: WorkoutSet) => void;
    nextExercise: () => void;
    previousExercise: () => void;
    skipExercise: () => void;
    endWorkout: (feedback?: { rpe: number; notes: string; issues?: string[] }) => CompletedWorkout | null;
    cancelWorkout: () => void;

    // Rest timer
    startRestTimer: (seconds: number) => void;
    tickRestTimer: () => void;
    skipRestTimer: () => void;

    // History
    getExerciseHistory: (exerciseId: string, limit?: number) => { date: string; sets: WorkoutSet[] }[];
    getLastWorkoutForRoutine: (routineId: string) => CompletedWorkout | undefined;
}

const DEFAULT_PREFERENCES: WorkoutPreferences = {
    equipment: [],
    trainingFrequency: 3,
    experienceLevel: 'beginner',
    primaryGoal: 'general',
    onboardingComplete: false,
};

export const useWorkoutStore = create<WorkoutStore>()(
    persist(
        (set, get) => ({
            preferences: DEFAULT_PREFERENCES,
            planName: 'My Workout Plan',
            routines: [],
            history: [],
            customExercises: [],
            activeSession: null,

            // === CUSTOM EXERCISES ===
            addCustomExercise: (exercise) => {
                set((state) => ({
                    customExercises: [...state.customExercises, exercise]
                }));
            },

            deleteCustomExercise: (exerciseId) => {
                set((state) => ({
                    customExercises: state.customExercises.filter(e => e.id !== exerciseId)
                }));
            },

            // === PREFERENCES ===
            updatePreferences: (updates) => {
                set((state) => ({
                    preferences: { ...state.preferences, ...updates },
                }));
            },

            completeOnboarding: (prefs) => {
                set({
                    preferences: { ...prefs, onboardingComplete: true },
                });
            },

            setPlanName: (name) => {
                set({ planName: name });
            },

            // === ROUTINES ===
            addRoutine: (routine) => {
                set((state) => ({
                    routines: [...state.routines, routine],
                }));
            },

            updateRoutine: (id, updates) => {
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === id ? { ...r, ...updates } : r
                    ),
                }));
            },

            deleteRoutine: (id) => {
                set((state) => ({
                    routines: state.routines.filter((r) => r.id !== id),
                }));
            },

            removeExercise: (routineId, exerciseId) => {
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId
                            ? { ...r, exercises: r.exercises.filter((ex) => ex.id !== exerciseId) }
                            : r
                    ),
                }));
            },

            moveExercise: (sourceRoutineId, targetDay, exerciseId) => {
                const state = get();
                const sourceRoutine = state.routines.find((r) => r.id === sourceRoutineId);
                const exerciseToMove = sourceRoutine?.exercises.find((ex) => ex.id === exerciseId);

                if (!sourceRoutine || !exerciseToMove) return;

                // Remove from source
                get().removeExercise(sourceRoutineId, exerciseId);

                // Add to target
                const targetRoutine = state.routines.find((r) => r.scheduledDay === targetDay);

                if (targetRoutine) {
                    get().updateRoutine(targetRoutine.id, {
                        exercises: [...targetRoutine.exercises, exerciseToMove],
                    });
                } else {
                    // Create new routine for that day
                    get().addRoutine({
                        id: `routine_${Date.now()}_${targetDay}`,
                        name: 'New Workout',
                        scheduledDay: targetDay,
                        exercises: [exerciseToMove],
                        estimatedDurationMinutes: 30,
                    });
                }
            },

            updateExerciseTargets: (routineId, exerciseId, targets) => {
                set((state) => ({
                    routines: state.routines.map((r) =>
                        r.id === routineId
                            ? {
                                ...r,
                                exercises: r.exercises.map((ex) =>
                                    ex.id === exerciseId ? { ...ex, ...targets } : ex
                                ),
                            }
                            : r
                    ),
                }));
            },

            getRoutineById: (id) => {
                return get().routines.find((r) => r.id === id);
            },

            getRoutineForDay: (day) => {
                return get().routines.find((r) => r.scheduledDay === day);
            },

            // === ACTIVE SESSION ===
            startWorkout: (routineId) => {
                const routine = get().routines.find((r) => r.id === routineId);
                if (!routine) return;

                // Deep clone exercises with fresh set arrays
                const exercises: WorkoutExercise[] = routine.exercises.map((ex) => ({
                    ...ex,
                    sets: [], // Start fresh for logging
                }));

                set({
                    activeSession: {
                        routineId,
                        routineName: routine.name,
                        startTime: Date.now(),
                        currentExerciseIndex: 0,
                        exercises,
                        isRestTimerActive: false,
                        restTimeRemaining: 0,
                        isPaused: false,
                    },
                });
            },

            logSet: (exerciseIndex, setData) => {
                set((state) => {
                    if (!state.activeSession) return state;

                    const exercises = [...state.activeSession.exercises];
                    const exercise = { ...exercises[exerciseIndex] };
                    exercise.sets = [...exercise.sets, setData];
                    exercises[exerciseIndex] = exercise;

                    return {
                        activeSession: {
                            ...state.activeSession,
                            exercises,
                        },
                    };
                });
            },

            nextExercise: () => {
                set((state) => {
                    if (!state.activeSession) return state;
                    const nextIndex = Math.min(
                        state.activeSession.currentExerciseIndex + 1,
                        state.activeSession.exercises.length - 1
                    );
                    return {
                        activeSession: {
                            ...state.activeSession,
                            currentExerciseIndex: nextIndex,
                            isRestTimerActive: false,
                            restTimeRemaining: 0,
                        },
                    };
                });
            },

            previousExercise: () => {
                set((state) => {
                    if (!state.activeSession) return state;
                    const prevIndex = Math.max(
                        state.activeSession.currentExerciseIndex - 1,
                        0
                    );
                    return {
                        activeSession: {
                            ...state.activeSession,
                            currentExerciseIndex: prevIndex,
                        },
                    };
                });
            },

            skipExercise: () => {
                set((state) => {
                    if (!state.activeSession) return state;

                    const exercises = [...state.activeSession.exercises];
                    const currentIndex = state.activeSession.currentExerciseIndex;
                    exercises[currentIndex] = {
                        ...exercises[currentIndex],
                        isSkipped: true,
                    };

                    const nextIndex = Math.min(
                        currentIndex + 1,
                        exercises.length - 1
                    );

                    return {
                        activeSession: {
                            ...state.activeSession,
                            exercises,
                            currentExerciseIndex: nextIndex,
                        },
                    };
                });
            },

            endWorkout: (feedback) => {
                const session = get().activeSession;
                if (!session) return null;

                const durationSeconds = Math.floor((Date.now() - session.startTime) / 1000);

                // Calculate total volume
                let totalVolume = 0;
                let totalRpe = 0;
                let rpeCount = 0;

                session.exercises.forEach((ex) => {
                    ex.sets.forEach((s) => {
                        totalVolume += s.reps * s.weight;
                        if (s.rpe > 0) {
                            totalRpe += s.rpe;
                            rpeCount++;
                        }
                    });
                });

                const completedWorkout: CompletedWorkout = {
                    id: `workout_${Date.now()}`,
                    routineId: session.routineId,
                    name: session.routineName,
                    date: new Date().toISOString(),
                    durationSeconds,
                    totalVolumeLbs: totalVolume,
                    averageRpe: rpeCount > 0 ? totalRpe / rpeCount : 0,
                    exercises: session.exercises.map((ex) => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                    })),
                    feedback,
                };

                set((state) => ({
                    history: [completedWorkout, ...state.history],
                    activeSession: null,
                }));

                return completedWorkout;
            },

            cancelWorkout: () => {
                set({ activeSession: null });
            },

            // === REST TIMER ===
            startRestTimer: (seconds) => {
                set((state) => {
                    if (!state.activeSession) return state;
                    return {
                        activeSession: {
                            ...state.activeSession,
                            isRestTimerActive: true,
                            restTimeRemaining: seconds,
                        },
                    };
                });
            },

            tickRestTimer: () => {
                set((state) => {
                    if (!state.activeSession || !state.activeSession.isRestTimerActive) return state;

                    const newTime = state.activeSession.restTimeRemaining - 1;

                    return {
                        activeSession: {
                            ...state.activeSession,
                            restTimeRemaining: Math.max(0, newTime),
                            isRestTimerActive: newTime > 0,
                        },
                    };
                });
            },

            skipRestTimer: () => {
                set((state) => {
                    if (!state.activeSession) return state;
                    return {
                        activeSession: {
                            ...state.activeSession,
                            isRestTimerActive: false,
                            restTimeRemaining: 0,
                        },
                    };
                });
            },

            // === HISTORY ===
            getExerciseHistory: (exerciseId, limit = 8) => {
                const history = get().history;
                const results: { date: string; sets: WorkoutSet[] }[] = [];

                for (const workout of history) {
                    const exerciseData = workout.exercises.find(
                        (ex) => ex.exerciseId === exerciseId
                    );
                    if (exerciseData) {
                        results.push({
                            date: workout.date,
                            sets: exerciseData.sets,
                        });
                        if (results.length >= limit) break;
                    }
                }

                return results;
            },

            getLastWorkoutForRoutine: (routineId) => {
                return get().history.find((w) => w.routineId === routineId);
            },
        }),
        {
            name: 'reebound-workout-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                preferences: state.preferences,
                planName: state.planName,
                routines: state.routines,
                history: state.history,
                customExercises: state.customExercises,
                // activeSession is intentionally excluded - not persisted
            }),
        }
    )
);
