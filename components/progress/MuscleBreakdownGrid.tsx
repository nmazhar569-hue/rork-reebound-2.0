import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { MuscleMetric } from '@/services/ProgressService';

interface MuscleBreakdownGridProps {
    metrics: MuscleMetric[];
}

export function MuscleBreakdownGrid({ metrics }: MuscleBreakdownGridProps) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'EXCELLENT': return colors.success;
            case 'GOOD': return colors.accent;
            case 'WARNING': return '#f59e0b'; // amber
            case 'PLATEAU': return colors.error;
            default: return colors.text;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Muscle Breakdown</Text>
            <View style={styles.grid}>
                {metrics.map((muscle) => (
                    <TouchableOpacity key={muscle.muscleId} style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.muscleName}>{muscle.muscleName}</Text>
                            <Text style={[styles.growth, { color: getStatusColor(muscle.status) }]}>
                                +{muscle.strengthGrowth}%
                            </Text>
                        </View>

                        {/* Progress Bar Mock */}
                        <View style={styles.barBg}>
                            <View style={[
                                styles.barFill,
                                {
                                    width: `${Math.min(100, muscle.strengthGrowth * 5)}%`,
                                    backgroundColor: getStatusColor(muscle.status)
                                }
                            ]} />
                        </View>

                        <Text style={styles.detail}>Best: {muscle.bestExercise}</Text>
                        <Text style={styles.detail}>Vol: {muscle.volumeSets} sets/wk</Text>

                        <View style={[styles.badge, { backgroundColor: getStatusColor(muscle.status) + '20' }]}>
                            <Text style={[styles.badgeText, { color: getStatusColor(muscle.status) }]}>
                                {muscle.status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        marginBottom: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    muscleName: {
        fontSize: 14,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    growth: {
        fontSize: 14,
        fontWeight: '700',
    },
    barBg: {
        height: 6,
        backgroundColor: liquidGlass.surface.glassDark,
        borderRadius: 3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    detail: {
        fontSize: 11,
        color: liquidGlass.text.secondary,
        marginBottom: 4,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    }
});
