import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Dumbbell,
    TrendingUp,
} from 'lucide-react-native';

import colors, { spacing, borderRadius, shadows, typography } from '@/constants/colors';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function WorkoutHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { history } = useWorkoutStore();

    // Group workouts by date
    const groupedHistory = useMemo(() => {
        const groups: { title: string; data: typeof history }[] = [];
        const now = new Date();

        history.forEach((workout) => {
            const workoutDate = new Date(workout.date);
            const diffDays = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

            let groupTitle: string;
            if (diffDays === 0) {
                groupTitle = 'Today';
            } else if (diffDays === 1) {
                groupTitle = 'Yesterday';
            } else if (diffDays < 7) {
                groupTitle = 'This Week';
            } else if (diffDays < 30) {
                groupTitle = 'This Month';
            } else {
                groupTitle = 'Earlier';
            }

            const existingGroup = groups.find((g) => g.title === groupTitle);
            if (existingGroup) {
                existingGroup.data.push(workout);
            } else {
                groups.push({ title: groupTitle, data: [workout] });
            }
        });

        return groups;
    }, [history]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workout History</Text>
                <View style={styles.backButton} />
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Dumbbell size={48} color={colors.textTertiary} />
                    <Text style={styles.emptyTitle}>No Workouts Yet</Text>
                    <Text style={styles.emptyText}>
                        Complete your first workout to see it here
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Summary Stats */}
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionLabel}>ALL TIME</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{history.length}</Text>
                                <Text style={styles.statLabel}>Workouts</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {Math.round(history.reduce((sum, w) => sum + w.durationSeconds, 0) / 60)}
                                </Text>
                                <Text style={styles.statLabel}>Minutes</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {(history.reduce((sum, w) => sum + w.totalVolumeLbs, 0) / 1000).toFixed(0)}k
                                </Text>
                                <Text style={styles.statLabel}>Volume (lbs)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Grouped History */}
                    {groupedHistory.map((group) => (
                        <View key={group.title} style={styles.historySection}>
                            <Text style={styles.sectionLabel}>{group.title.toUpperCase()}</Text>
                            {group.data.map((workout) => (
                                <TouchableOpacity
                                    key={workout.id}
                                    style={styles.workoutCard}
                                    onPress={() => {
                                        // Could navigate to workout detail
                                    }}
                                >
                                    <View style={styles.workoutInfo}>
                                        <Text style={styles.workoutName}>{workout.name}</Text>
                                        <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
                                    </View>
                                    <View style={styles.workoutStats}>
                                        <View style={styles.miniStat}>
                                            <Clock size={14} color={colors.textTertiary} />
                                            <Text style={styles.miniStatText}>
                                                {formatDuration(workout.durationSeconds)}
                                            </Text>
                                        </View>
                                        <View style={styles.miniStat}>
                                            <TrendingUp size={14} color={colors.textTertiary} />
                                            <Text style={styles.miniStatText}>
                                                {workout.totalVolumeLbs.toLocaleString()} lbs
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={20} color={colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                    <View style={{ height: insets.bottom + spacing.xxl }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...typography.sectionTitle,
    },
    content: {
        padding: spacing.lg,
    },

    // Empty State
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
    },
    emptyTitle: {
        ...typography.title,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Summary
    summarySection: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        ...typography.label,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.soft,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
    },
    statLabel: {
        ...typography.caption,
        marginTop: spacing.xs,
    },

    // History
    historySection: {
        marginBottom: spacing.xl,
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        ...shadows.soft,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        ...typography.sectionTitle,
        marginBottom: 2,
    },
    workoutDate: {
        ...typography.caption,
    },
    workoutStats: {
        flexDirection: 'row',
        gap: spacing.md,
        marginRight: spacing.md,
    },
    miniStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    miniStatText: {
        ...typography.caption,
    },
});
