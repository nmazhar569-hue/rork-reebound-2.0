import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Check,
    Clock,
    Plus,
    Minus,
    SkipForward,
    Activity,
    Info
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { liquidGlass, glassStyles, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { EXERCISE_DATABASE } from '@/services/ExerciseDatabase';
import { useWorkoutStore } from '@/stores/workoutStore';
import { WorkoutSet } from '@/types/workout';

export default function ActiveWorkoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        activeSession,
        logSet,
        nextExercise,
        previousExercise,
        skipExercise,
        startRestTimer,
        tickRestTimer,
        skipRestTimer,
        endWorkout,
        cancelWorkout,
        getExerciseHistory,
    } = useWorkoutStore();

    // Local state for current set input
    const [reps, setReps] = useState(10);
    const [weight, setWeight] = useState('');
    const [rpe, setRpe] = useState(7);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeSession && !activeSession.isPaused) {
                setElapsedSeconds(Math.floor((Date.now() - activeSession.startTime) / 1000));
            }

            // Tick rest timer
            if (activeSession?.isRestTimerActive) {
                tickRestTimer();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSession, tickRestTimer]);

    // Navigate away if no active session
    useEffect(() => {
        if (!activeSession) {
            router.replace('/myworkoutplan');
        }
    }, [activeSession, router]);

    const currentExercise = activeSession?.exercises[activeSession.currentExerciseIndex];
    const dbExercise = currentExercise ? EXERCISE_DATABASE[currentExercise.exerciseId] : null;
    const completedSets = currentExercise?.sets || [];
    const targetSets = currentExercise?.targetSets || 3;
    const isExerciseComplete = completedSets.length >= targetSets;
    const isLastExercise = activeSession ? activeSession.currentExerciseIndex === activeSession.exercises.length - 1 : false;

    // Get last time's performance for this exercise
    const exerciseHistory = currentExercise ? getExerciseHistory(currentExercise.exerciseId, 1) : [];
    const lastTimeData = exerciseHistory[0];

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Calculate progress
    const progress = useMemo(() => {
        let completed = 0;
        let total = 0;

        activeSession?.exercises.forEach((ex) => {
            total += ex.targetSets;
            completed += ex.sets.length;
        });

        return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
    }, [activeSession?.exercises]);

    const handleLogSet = () => {
        if (!activeSession) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const setData: WorkoutSet = {
            id: `set_${Date.now()}`,
            type: 'working',
            reps,
            weight: parseFloat(weight) || 0,
            rpe,
            completed: true,
        };

        logSet(activeSession.currentExerciseIndex, setData);

        // Start rest timer (default 90 seconds)
        const restTime = 90; // Could be dynamic based on exercise type
        startRestTimer(restTime);

        // Reset inputs for next set
        setReps(reps); // Keep same reps
    };

    const handleNextExercise = () => {
        if (!activeSession) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (isLastExercise && isExerciseComplete) {
            // End workout
            const completed = endWorkout();
            if (completed) {
                router.replace('/myworkoutplan/workout-summary');
            }
        } else {
            nextExercise();
            skipRestTimer();
            // Reset inputs
            setReps(10);
            setWeight('');
            setRpe(7);
        }
    };

    const handleSkipExercise = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
            'Skip Exercise?',
            `Skip ${dbExercise?.name || 'this exercise'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Skip',
                    style: 'destructive',
                    onPress: () => {
                        skipExercise();
                        skipRestTimer();
                    }
                },
            ]
        );
    };

    const handleEndWorkout = () => {
        if (!activeSession) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'End Workout Early?',
            'Your progress will be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End Workout',
                    onPress: () => {
                        const completed = endWorkout();
                        if (completed) {
                            router.replace('/myworkoutplan/workout-summary');
                        }
                    }
                },
            ]
        );
    };

    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancel Workout?',
            'This will discard all progress.',
            [
                { text: 'Keep Going', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        cancelWorkout();
                        router.replace('/myworkoutplan');
                    }
                },
            ]
        );
    };

    const adjustReps = (delta: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setReps(Math.max(1, reps + delta));
    };

    // Generate Ree feedback based on performance
    const reeFeedback = useMemo(() => {
        if (completedSets.length === 0) return null;

        const lastSet = completedSets[completedSets.length - 1];

        // Compare to previous set
        if (completedSets.length > 1) {
            const prevSet = completedSets[completedSets.length - 2];
            const repDiff = lastSet.reps - prevSet.reps;

            if (repDiff <= -3) {
                return {
                    type: 'warning',
                    message: `Your reps dropped by ${Math.abs(repDiff)}. Consider more rest or reducing weight slightly.`,
                };
            }
        }

        // Low RPE feedback
        if (lastSet.rpe <= 6) {
            return {
                type: 'info',
                message: "RPE feels light? Consider adding 5-10 lbs next set if form is solid.",
            };
        }

        // High RPE feedback
        if (lastSet.rpe >= 9) {
            return {
                type: 'success',
                message: "High intensity! Great push. Ensure you take full rest before the next set.",
            };
        }

        // Compare to last workout
        if (lastTimeData && lastTimeData.sets.length > completedSets.length - 1) {
            const historicalSet = lastTimeData.sets[completedSets.length - 1];
            if (lastSet.reps > historicalSet.reps || lastSet.weight > historicalSet.weight) {
                return {
                    type: 'success',
                    message: "🎯 You're outperforming your last session! Progressive overload achieved.",
                };
            }
        }

        return null;
    }, [completedSets, lastTimeData]);

    if (!activeSession) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancelWorkout} style={styles.closeButton}>
                    <ChevronLeft size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.workoutName}>{activeSession.routineName}</Text>
                    <View style={styles.timerBadge}>
                        <Clock size={14} color={liquidGlass.accent.primary} />
                        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleEndWorkout} style={styles.endButton}>
                    <Text style={styles.endButtonText}>End</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    Exercise {activeSession.currentExerciseIndex + 1} of {activeSession.exercises.length}
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Exercise */}
                <View style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseName}>{dbExercise?.name || currentExercise?.exerciseId}</Text>
                        <TouchableOpacity style={styles.infoButton}>
                            <Info size={20} color={liquidGlass.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.targetBadge}>
                        <Activity size={16} color={liquidGlass.accent.secondary} />
                        <Text style={styles.targetText}>
                            Goal: {targetSets} sets × {currentExercise?.targetReps} reps
                        </Text>
                    </View>

                    {lastTimeData && (
                        <View style={styles.historyContainer}>
                            <Text style={styles.historyLabel}>Last time:</Text>
                            <Text style={styles.historyText}>
                                {lastTimeData.sets.map((s) => s.reps).join(', ')} reps @ {lastTimeData.sets[0]?.weight || 'BW'} lbs
                            </Text>
                        </View>
                    )}
                </View>

                {/* Completed Sets */}
                {completedSets.length > 0 && (
                    <View style={styles.completedSets}>
                        {completedSets.map((set, index) => (
                            <View key={set.id} style={styles.completedSetRow}>
                                <View style={styles.setNumber}>
                                    <Text style={styles.setNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.setDetails}>
                                    {set.reps} reps · {set.weight || 'BW'} lbs · RPE {set.rpe}
                                </Text>
                                <View style={styles.checkIcon}>
                                    <Check size={14} color={liquidGlass.text.inverse} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Rest Timer */}
                {activeSession.isRestTimerActive && (
                    <View style={styles.restTimerCard}>
                        <Text style={styles.restTimerLabel}>RESTING</Text>
                        <Text style={styles.restTimerValue}>
                            {formatTime(activeSession.restTimeRemaining)}
                        </Text>
                        <TouchableOpacity
                            style={styles.skipRestButton}
                            onPress={() => {
                                Haptics.selectionAsync();
                                skipRestTimer();
                            }}
                        >
                            <Text style={styles.skipRestText}>Ready Now</Text>
                            <ChevronRight size={16} color={liquidGlass.text.inverse} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Ree Feedback */}
                {reeFeedback && !activeSession.isRestTimerActive && (
                    <View style={[
                        styles.reeCard,
                        reeFeedback.type === 'warning' && styles.reeCardWarning,
                        reeFeedback.type === 'success' && styles.reeCardSuccess,
                    ]}>
                        <View style={[
                            styles.reeIcon,
                            reeFeedback.type === 'warning' && { backgroundColor: liquidGlass.status.warning },
                            reeFeedback.type === 'success' && { backgroundColor: liquidGlass.status.success },
                        ]}>
                            <Text style={{ fontSize: 12 }}>R</Text>
                        </View>
                        <Text style={styles.reeText}>{reeFeedback.message}</Text>
                    </View>
                )}

                {/* Set Input */}
                {!isExerciseComplete && !activeSession.isRestTimerActive && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputTitle}>Set {completedSets.length + 1}</Text>

                        <View style={styles.inputGrid}>
                            {/* Reps */}
                            <View style={styles.inputBlock}>
                                <Text style={styles.inputLabel}>Reps</Text>
                                <View style={styles.counter}>
                                    <TouchableOpacity style={styles.counterBtn} onPress={() => adjustReps(-1)}>
                                        <Minus size={20} color={liquidGlass.text.primary} />
                                    </TouchableOpacity>
                                    <Text style={styles.counterVal}>{reps}</Text>
                                    <TouchableOpacity style={styles.counterBtn} onPress={() => adjustReps(1)}>
                                        <Plus size={20} color={liquidGlass.text.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Weight */}
                            <View style={styles.inputBlock}>
                                <Text style={styles.inputLabel}>Lbs</Text>
                                <TextInput
                                    style={styles.weightInput}
                                    placeholder="BW"
                                    placeholderTextColor={liquidGlass.text.tertiary}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="decimal-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* RPE */}
                        <View style={styles.rpeSection}>
                            <Text style={styles.inputLabel}>RPE (Intensity)</Text>
                            <View style={styles.rpeRow}>
                                {[5, 6, 7, 8, 9, 10].map((val) => (
                                    <TouchableOpacity
                                        key={val}
                                        style={[
                                            styles.rpeBtn,
                                            rpe === val && styles.rpeBtnActive,
                                            // Color coding
                                            val >= 9 ? { borderColor: liquidGlass.status.danger } :
                                                val >= 7 ? { borderColor: liquidGlass.status.warning } :
                                                    { borderColor: liquidGlass.status.success }
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setRpe(val);
                                        }}
                                    >
                                        <Text style={[
                                            styles.rpeBtnText,
                                            rpe === val && styles.rpeBtnTextActive
                                        ]}>{val}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.logButton} onPress={handleLogSet}>
                            <Text style={styles.logButtonText}>Log Set</Text>
                            <Check size={20} color={liquidGlass.text.inverse} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Exercise Complete */}
                {isExerciseComplete && !activeSession.isRestTimerActive && (
                    <View style={styles.completeCard}>
                        <View style={styles.completeIcon}>
                            <Check size={32} color={liquidGlass.text.inverse} />
                        </View>
                        <Text style={styles.completeTitle}>{dbExercise?.name} Finished</Text>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextExercise}>
                            <Text style={styles.nextButtonText}>
                                {isLastExercise ? 'Finish Workout' : 'Next Exercise'}
                            </Text>
                            <ChevronRight size={20} color={liquidGlass.text.inverse} />
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.skipLink} onPress={handleSkipExercise}>
                    <Text style={styles.skipLinkText}>Skip this exercise</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.secondary, // Premium dark
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    headerCenter: {
        alignItems: 'center',
    },
    workoutName: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: liquidGlass.surface.glassLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    timerText: {
        fontFamily: 'monospace',
        fontSize: 14,
        color: liquidGlass.accent.primary,
        fontWeight: '600',
    },
    endButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    endButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 14,
    },
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        textAlign: 'right',
    },
    content: {
        paddingHorizontal: 20,
    },

    // Exercise Card
    exerciseCard: {
        marginBottom: 24,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    exerciseName: {
        flex: 1,
        fontSize: 28,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        letterSpacing: -0.5,
        lineHeight: 34,
    },
    infoButton: {
        padding: 8,
    },
    targetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: liquidGlass.surface.glass,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 16,
    },
    targetText: {
        color: liquidGlass.text.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    historyContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    historyLabel: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
    },
    historyText: {
        fontSize: 13,
        color: liquidGlass.accent.primary,
        fontWeight: '600',
    },

    // Completed Sets
    completedSets: {
        marginBottom: 24,
        gap: 8,
    },
    completedSetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: liquidGlass.surface.glassLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: liquidGlass.border.subtle,
    },
    setNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    setNumberText: {
        fontSize: 12,
        color: liquidGlass.text.secondary,
        fontWeight: '700',
    },
    setDetails: {
        flex: 1,
        fontSize: 15,
        color: liquidGlass.text.secondary,
        fontVariant: ['tabular-nums'],
    },
    checkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: liquidGlass.status.success,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Input Card
    inputContainer: {
        ...glassStyles.card, // Reuse shared card style
        padding: 24,
        backgroundColor: liquidGlass.surface.glass,
        ...glassShadows.medium,
    },
    inputTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 20,
    },
    inputGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    inputBlock: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    counterBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
    },
    counterVal: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    weightInput: {
        height: 54,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        textAlign: 'center',
    },
    rpeSection: {
        marginBottom: 24,
    },
    rpeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    rpeBtn: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glassDark,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    rpeBtnActive: {
        backgroundColor: liquidGlass.text.primary,
        borderColor: liquidGlass.text.primary,
    },
    rpeBtnText: {
        color: liquidGlass.text.secondary,
        fontWeight: '600',
        fontSize: 16,
    },
    rpeBtnTextActive: {
        color: liquidGlass.text.inverse,
    },
    logButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        height: 56,
        borderRadius: 28,
        ...glassShadows.glow,
    },
    logButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: liquidGlass.text.inverse,
    },

    // Rest Timer
    restTimerCard: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 32,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.accent.primary,
    },
    restTimerLabel: {
        color: liquidGlass.accent.primary,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
    },
    restTimerValue: {
        fontSize: 64,
        fontWeight: '800',
        color: liquidGlass.text.primary,
        fontVariant: ['tabular-nums'],
        marginBottom: 24,
        textShadowColor: liquidGlass.accent.glow,
        textShadowRadius: 20,
    },
    skipRestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
        ...glassShadows.glow,
    },
    skipRestText: {
        color: liquidGlass.text.inverse,
        fontWeight: '700',
    },

    // Ree Card
    reeCard: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    reeCardWarning: {
        borderColor: liquidGlass.status.warning,
        backgroundColor: 'rgba(251, 146, 60, 0.05)',
    },
    reeCardSuccess: {
        borderColor: liquidGlass.status.success,
        backgroundColor: 'rgba(45, 212, 191, 0.05)',
    },
    reeIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: liquidGlass.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeText: {
        flex: 1,
        fontSize: 14,
        color: liquidGlass.text.secondary,
        lineHeight: 20,
    },

    // Complete State
    completeCard: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    completeIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: liquidGlass.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        ...glassShadows.glowStrong,
    },
    completeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 32,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        ...glassShadows.glow,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: liquidGlass.text.inverse,
    },

    skipLink: {
        alignSelf: 'center',
        padding: 16,
    },
    skipLinkText: {
        color: liquidGlass.text.tertiary,
        fontSize: 14,
    },
});

