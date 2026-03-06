
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react-native';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';

interface WeeklyDashboardProps {
    completedDays: boolean[]; // Array of 7, true = workout done
    currentDayIndex: number; // 0-6 (Mon-Sun)
    recoveryChecklist: { id: string; label: string; completed: boolean }[];
    onToggleRecoveryTask: (id: string) => void;
}

export function WeeklyDashboard({ completedDays, currentDayIndex, recoveryChecklist, onToggleRecoveryTask }: WeeklyDashboardProps) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Calculate completion for summary
    const completedTasks = recoveryChecklist.filter(t => t.completed).length;
    const totalTasks = recoveryChecklist.length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>This Week</Text>
                    <Text style={styles.subtitle}>Mon - Sun</Text>
                </View>
                {/* Micro-summary of recovery for header context */}
                <View style={styles.recoveryBadge}>
                    <Text style={styles.recoveryBadgeText}>Recovery: {completedTasks}/{totalTasks}</Text>
                </View>
            </View>

            {/* Days Row */}
            <View style={styles.daysContainer}>
                {days.map((day, index) => {
                    const isCompleted = completedDays[index];
                    const isToday = index === currentDayIndex;

                    return (
                        <View key={day} style={styles.dayColumn}>
                            <View style={styles.iconContainer}>
                                {isCompleted ? (
                                    <CheckCircle2 size={24} color="#10B981" fill="#D1FAE5" />
                                ) : isToday ? (
                                    <Circle size={24} color="#3B82F6" strokeWidth={2.5} />
                                ) : (
                                    <Circle size={24} color="#E5E7EB" />
                                )}
                            </View>
                            <Text style={[
                                styles.dayText,
                                isToday && styles.dayTextToday
                            ]}>{day}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>💪</Text>
                    <Text style={styles.statText}>Training: <Text style={styles.statActive}>3/4</Text></Text>
                </View>
                {/* Replaced Protein with Sleep */}
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>😴</Text>
                    <Text style={styles.statText}>Sleep: <Text style={styles.statActive}>7.1h</Text></Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                {/* Replaced Sleep (moved up) with Stress or Mobility */}
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>🧘</Text>
                    <Text style={styles.statText}>Stress: <Text style={styles.statActive}>Low</Text></Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statEmoji}>⚡</Text>
                    <Text style={styles.statText}>Energy: <Text style={styles.statActive}>6.8</Text></Text>
                </View>
            </View>

            {/* Daily Recovery Checklist */}
            <View style={styles.checklistContainer}>
                <Text style={styles.checklistTitle}>Daily Recovery</Text>
                <View style={styles.checklistGrid}>
                    {recoveryChecklist.map((task) => (
                        <TouchableOpacity
                            key={task.id}
                            style={[
                                styles.checklistItem,
                                task.completed && styles.checklistItemActive
                            ]}
                            onPress={() => onToggleRecoveryTask(task.id)}
                        >
                            {task.completed ? (
                                <CheckCircle2 size={18} color={liquidGlass.text.inverse} />
                            ) : (
                                <Circle size={18} color={liquidGlass.text.secondary} />
                            )}
                            <Text style={[
                                styles.checklistText,
                                task.completed && styles.checklistTextActive
                            ]}>
                                {task.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(15, 29, 50, 0.65)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: liquidGlass.text.secondary,
    },
    recoveryBadge: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    recoveryBadgeText: {
        color: '#60A5FA',
        fontSize: 12,
        fontWeight: '600',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    dayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        height: 24,
        justifyContent: 'center',
    },
    dayText: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        fontWeight: '500',
    },
    dayTextToday: {
        color: liquidGlass.accent.primary,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '48%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 10,
        borderRadius: 12,
    },
    statEmoji: {
        fontSize: 16,
    },
    statText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        fontWeight: '500',
    },
    statActive: {
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    checklistContainer: {
        marginTop: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    checklistTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    checklistGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        width: '48%', // 2 per row
    },
    checklistItemActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
    },
    checklistText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        fontWeight: '500',
    },
    checklistTextActive: {
        color: liquidGlass.text.inverse,
        fontWeight: '700',
    },
});
