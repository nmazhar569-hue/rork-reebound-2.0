import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Check, Circle } from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * WeeklyCalendar Component
 * 
 * 7-day horizontal scrolling calendar showing:
 * - Day name
 * - Workout name (abbreviated)
 * - Completion status: ✓ (done), □ (planned), blank (rest)
 * - Color-coded readiness indicator
 */

export interface DayPlan {
    date: Date;
    workoutId?: string;
    workoutName?: string;
    abbreviation?: string; // "Leg", "Psh", "Pul"
    status: 'completed' | 'planned' | 'rest' | 'skipped';
    readiness?: 'green' | 'yellow' | 'red';
}

interface WeeklyCalendarProps {
    days: DayPlan[];
    selectedDate?: Date;
    onDayPress: (day: DayPlan) => void;
    onDayLongPress?: (day: DayPlan) => void;
}

export function WeeklyCalendar({
    days,
    selectedDate,
    onDayPress,
    onDayLongPress,
}: WeeklyCalendarProps) {
    const today = useMemo(() => new Date(), []);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    const getReadinessColor = (readiness?: 'green' | 'yellow' | 'red') => {
        switch (readiness) {
            case 'green': return theme.colors.primary;
            case 'yellow': return theme.colors.secondary;
            case 'red': return theme.colors.danger;
            default: return 'transparent';
        }
    };

    const handleDayPress = (day: DayPlan) => {
        haptics.light();
        onDayPress(day);
    };

    const handleDayLongPress = (day: DayPlan) => {
        haptics.medium();
        onDayLongPress?.(day);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {days.map((day, index) => {
                    const dayOfWeek = day.date.getDay();
                    const dayName = dayNames[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
                    const selected = isSelected(day.date);
                    const todayDay = isToday(day.date);

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayCard,
                                selected && styles.dayCardSelected,
                                todayDay && styles.dayCardToday,
                            ]}
                            onPress={() => handleDayPress(day)}
                            onLongPress={() => handleDayLongPress(day)}
                            activeOpacity={0.8}
                        >
                            <BlurView
                                intensity={40}
                                tint="dark"
                                style={StyleSheet.absoluteFill}
                            />

                            {/* Day name */}
                            <Text style={[
                                styles.dayName,
                                todayDay && styles.dayNameToday,
                            ]}>
                                {dayName}
                            </Text>

                            {/* Date number */}
                            <Text style={[
                                styles.dateNumber,
                                todayDay && styles.dateNumberToday,
                            ]}>
                                {day.date.getDate()}
                            </Text>

                            {/* Status icon */}
                            <View style={styles.statusContainer}>
                                {day.status === 'completed' && (
                                    <View style={styles.completedIcon}>
                                        <Check size={14} color={theme.colors.textInverse} strokeWidth={3} />
                                    </View>
                                )}
                                {day.status === 'planned' && (
                                    <View style={styles.plannedIcon}>
                                        <Circle size={14} color={theme.colors.primary} strokeWidth={2} />
                                    </View>
                                )}
                                {day.status === 'rest' && (
                                    <Text style={styles.restText}>Rest</Text>
                                )}
                            </View>

                            {/* Workout abbreviation */}
                            {day.abbreviation && (
                                <Text style={styles.workoutAbbr}>{day.abbreviation}</Text>
                            )}

                            {/* Readiness indicator */}
                            {day.readiness && (
                                <View
                                    style={[
                                        styles.readinessIndicator,
                                        { backgroundColor: getReadinessColor(day.readiness) }
                                    ]}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

// Helper to generate week days
export function generateWeekDays(startDate: Date = new Date()): DayPlan[] {
    const days: DayPlan[] = [];
    const startOfWeek = new Date(startDate);

    // Adjust to Monday
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        days.push({
            date,
            status: 'rest',
        });
    }

    return days;
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    dayCard: {
        width: 70,
        height: 100,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        overflow: 'hidden',
        ...glassShadows.soft,
    },
    dayCardSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    dayCardToday: {
        backgroundColor: `${theme.colors.primary}20`,
        borderColor: theme.colors.primary,
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dayNameToday: {
        color: theme.colors.primary,
    },
    dateNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    dateNumberToday: {
        color: theme.colors.primary,
    },
    statusContainer: {
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completedIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plannedIcon: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restText: {
        fontSize: 10,
        color: theme.colors.textTertiary,
        fontWeight: '500',
    },
    workoutAbbr: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    readinessIndicator: {
        position: 'absolute',
        bottom: 6,
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});

export default WeeklyCalendar;
