import { router, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Clock,
    Dumbbell,
    Play,
    ChevronDown,
    ChevronUp,
    Repeat,
    Check,
    Calendar
} from 'lucide-react-native';
import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { educationService } from '@/services/EducationService';
import { Exercise } from '@/types';

const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ============ EXERCISE DETAIL CARD ============
interface ExerciseDetailCardProps {
    exercise: Exercise;
    index: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    onSwap?: () => void;
}

const ExerciseDetailCard = ({ exercise, index, difficulty, onSwap }: ExerciseDetailCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const insight = useMemo(() =>
        educationService.getExerciseInsight(exercise.id, exercise.name),
        [exercise]
    );

    return (
        <View style={styles.exerciseCard}>
            <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.8}
            >
                <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseStats}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{exercise.sets}</Text>
                            <Text style={styles.statLabel}>sets</Text>
                        </View>
                        <Text style={styles.statDivider}>×</Text>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{exercise.reps}</Text>
                            <Text style={styles.statLabel}>reps</Text>
                        </View>
                        <View style={styles.restBadge}>
                            <Clock size={12} color={liquidGlass.text.tertiary} />
                            <Text style={styles.restText}>{exercise.rest}s</Text>
                        </View>
                    </View>
                </View>

                {expanded ? (
                    <ChevronUp size={20} color={liquidGlass.text.tertiary} />
                ) : (
                    <ChevronDown size={20} color={liquidGlass.text.tertiary} />
                )}
            </TouchableOpacity>

            {expanded && (
                <View style={styles.exerciseExpanded}>
                    {/* What it trains */}
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedLabel}>TARGETS</Text>
                        <View style={styles.tagRow}>
                            {insight.trains.map((muscle, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{muscle}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Why this exercise */}
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedLabel}>WHY THIS EXERCISE</Text>
                        <Text style={styles.expandedText}>{insight.why}</Text>
                    </View>

                    {/* Your relevance */}
                    <View style={styles.expandedSection}>
                        <Text style={styles.expandedLabel}>YOUR BENEFIT</Text>
                        <Text style={styles.expandedText}>{insight.relevance}</Text>
                    </View>

                    {/* Form tips for beginners */}
                    {difficulty === 'beginner' && (
                        <View style={styles.formTip}>
                            <Text style={styles.formTipLabel}>💡 Form Tip</Text>
                            <Text style={styles.formTipText}>
                                Focus on controlled movement and full range of motion before adding weight.
                            </Text>
                        </View>
                    )}

                    {/* Swap option */}
                    {onSwap && (
                        <TouchableOpacity style={styles.swapBtn} onPress={onSwap}>
                            <Repeat size={16} color={liquidGlass.accent.primary} />
                            <Text style={styles.swapBtnText}>Swap Exercise</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

// ============ MAIN SCREEN ============
export default function DayDetailScreen() {
    const { day } = useLocalSearchParams<{ day: string }>();
    const { programs, activeProgramId, dailyLogs } = useApp();

    const dayIndex = parseInt(day || '0', 10);

    const activeProgram = useMemo(() =>
        programs.find(p => p.id === activeProgramId) || null,
        [programs, activeProgramId]
    );

    const session = useMemo(() => {
        if (!activeProgram) return null;
        return activeProgram.sessions.find(s => s.dayOfWeek === dayIndex) || null;
    }, [activeProgram, dayIndex]);

    const estimatedDuration = useMemo(() => {
        if (!session) return 0;
        return session.exercises.length * 8;
    }, [session]);

    const totalSets = useMemo(() => {
        if (!session) return 0;
        return session.exercises.reduce((acc, ex) => acc + ex.sets, 0);
    }, [session]);

    const handleStartWorkout = useCallback(() => {
        haptics.medium();
        if (activeProgram) {
            router.push(`/workout/${activeProgram.id}?day=${dayIndex}`);
        }
    }, [activeProgram, dayIndex]);

    const handleSwapExercise = useCallback((exerciseIndex: number) => {
        haptics.light();
        Alert.alert(
            'Swap Exercise',
            'Choose an alternative exercise that targets similar muscles.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Browse Alternatives', onPress: () => {
                        // Would navigate to picker filtered by muscle group
                        Alert.alert('Coming Soon', 'Exercise swap feature is coming in the next update.');
                    }
                },
            ]
        );
    }, []);

    const handleReschedule = useCallback(() => {
        haptics.light();
        Alert.alert(
            'Reschedule Workout',
            'Move this workout to another day this week.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pick Day', onPress: () => {
                        Alert.alert('Coming Soon', 'Reschedule feature is coming in the next update.');
                    }
                },
            ]
        );
    }, []);

    // Empty state - no active program or no session
    if (!activeProgram || !session) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={24} color={liquidGlass.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{WEEKDAYS_FULL[dayIndex]}</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>😴</Text>
                    <Text style={styles.emptyTitle}>
                        {!activeProgram ? 'No Active Plan' : 'Rest Day'}
                    </Text>
                    <Text style={styles.emptyText}>
                        {!activeProgram
                            ? 'Create a workout plan to schedule training days.'
                            : 'Recovery is essential for progress. Take it easy today.'
                        }
                    </Text>
                    {!activeProgram && (
                        <TouchableOpacity
                            style={styles.emptyCta}
                            onPress={() => router.push('/myworkoutplan/builder')}
                        >
                            <Text style={styles.emptyCtaText}>Create Plan</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={liquidGlass.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{WEEKDAYS_FULL[dayIndex]}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Session Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sessionName}>
                        {session.sessionTypeKey || 'Workout'}
                    </Text>

                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                            <Dumbbell size={18} color={liquidGlass.accent.primary} />
                            <Text style={styles.summaryStatValue}>{session.exercises.length}</Text>
                            <Text style={styles.summaryStatLabel}>exercises</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryStat}>
                            <Clock size={18} color={liquidGlass.accent.primary} />
                            <Text style={styles.summaryStatValue}>{estimatedDuration}</Text>
                            <Text style={styles.summaryStatLabel}>minutes</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatValue}>{totalSets}</Text>
                            <Text style={styles.summaryStatLabel}>total sets</Text>
                        </View>
                    </View>
                </View>

                {/* Ree Tip */}
                <View style={styles.reeTip}>
                    <View style={styles.reeAvatar}>
                        <Text style={styles.reeAvatarText}>R</Text>
                    </View>
                    <View style={styles.reeTipContent}>
                        <Text style={styles.reeTipText}>
                            Tap any exercise to learn more about why it's in your plan and see alternatives.
                        </Text>
                    </View>
                </View>

                {/* Exercise List */}
                <View style={styles.exerciseList}>
                    <Text style={styles.sectionTitle}>Exercises</Text>
                    {session.exercises.map((exercise, idx) => (
                        <ExerciseDetailCard
                            key={`${exercise.id}-${idx}`}
                            exercise={exercise}
                            index={idx + 1}
                            onSwap={() => handleSwapExercise(idx)}
                        />
                    ))}
                </View>

                {/* Reschedule Option */}
                <TouchableOpacity style={styles.rescheduleBtn} onPress={handleReschedule}>
                    <Calendar size={18} color={liquidGlass.text.secondary} />
                    <Text style={styles.rescheduleBtnText}>Reschedule This Workout</Text>
                </TouchableOpacity>

                <View style={styles.footerSpacer} />
            </ScrollView>

            {/* Start Workout Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.startBtn} onPress={handleStartWorkout}>
                    <Play size={20} color={liquidGlass.text.inverse} />
                    <Text style={styles.startBtnText}>Start Workout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ============ STYLES ============
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: liquidGlass.background.primary,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: liquidGlass.border.subtle,
    },
    backBtn: {
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

    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        alignItems: 'center',
        ...glassShadows.soft,
    },
    sessionName: {
        fontSize: 24,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryStat: {
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 4,
    },
    summaryStatValue: {
        fontSize: 22,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    summaryStatLabel: {
        fontSize: 12,
        color: liquidGlass.text.secondary,
    },
    summaryDivider: {
        width: 1,
        height: 36,
        backgroundColor: liquidGlass.border.subtle,
    },

    // Ree Tip
    reeTip: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: liquidGlass.accent.muted,
        borderRadius: 16,
        padding: 14,
        marginBottom: 24,
    },
    reeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeAvatarText: {
        fontSize: 16,
    },
    reeTipContent: {
        flex: 1,
    },
    reeTipText: {
        fontSize: 14,
        color: liquidGlass.text.primary,
        lineHeight: 20,
    },

    // Exercise List
    exerciseList: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 12,
    },

    // Exercise Card
    exerciseCard: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        overflow: 'hidden',
        marginBottom: 10,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    exerciseIndex: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: liquidGlass.accent.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exerciseIndexText: {
        fontSize: 14,
        fontWeight: '700',
        color: liquidGlass.accent.primary,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 6,
    },
    exerciseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 3,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.accent.primary,
    },
    statLabel: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    statDivider: {
        fontSize: 14,
        color: liquidGlass.text.tertiary,
        marginHorizontal: 2,
    },
    restBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginLeft: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 6,
    },
    restText: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
    },

    // Expanded Content
    exerciseExpanded: {
        padding: 16,
        paddingTop: 0,
        gap: 16,
    },
    expandedSection: {
        gap: 6,
    },
    expandedLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: liquidGlass.text.tertiary,
        letterSpacing: 0.5,
    },
    expandedText: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
        lineHeight: 20,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        color: liquidGlass.text.primary,
        fontWeight: '500',
    },
    formTip: {
        backgroundColor: liquidGlass.status.warningMuted,
        borderRadius: 12,
        padding: 12,
    },
    formTipLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    formTipText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        lineHeight: 18,
    },
    swapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: liquidGlass.accent.primary,
        borderRadius: 12,
        marginTop: 8,
    },
    swapBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
    },

    // Reschedule
    rescheduleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glass,
    },
    rescheduleBtnText: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyCta: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 50,
    },
    emptyCtaText: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.inverse,
    },

    // Bottom Bar
    bottomBar: {
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: liquidGlass.border.subtle,
        backgroundColor: liquidGlass.background.primary,
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: liquidGlass.accent.primary,
        paddingVertical: 16,
        borderRadius: 50,
        ...glassShadows.soft,
    },
    startBtnText: {
        fontSize: 17,
        fontWeight: '600',
        color: liquidGlass.text.inverse,
    },

    footerSpacer: {
        height: 20,
    },
});
