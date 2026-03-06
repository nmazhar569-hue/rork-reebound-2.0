import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { liquidGlass } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { ExercisePerformance } from '@/services/ProgressService';

interface ExerciseAnalysisProps {
    exercises: ExercisePerformance[];
}

export function ExerciseAnalysis({ exercises }: ExerciseAnalysisProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Exercise Analysis</Text>
            {exercises.map((ex, index) => (
                <View key={index} style={styles.row}>
                    <View style={styles.header}>
                        <Text style={styles.name}>
                            {index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : ''}
                            {ex.name}
                        </Text>
                        <Text style={[styles.gain, ex.isPlateau && { color: colors.error }]}>
                            {ex.isPlateau ? 'STALLED' : `+${ex.gainPercent}%`}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Current</Text>
                            <Text style={styles.statValue}>{ex.currentWeight} lbs</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Volume</Text>
                            <Text style={styles.statValue}>{ex.setsPerWeek} sets</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statLabel}>Efficiency</Text>
                            <Text style={styles.statValue}>{ex.efficiency.toFixed(2)}%</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 12,
    },
    row: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    gain: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.success,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
    },
    statLabel: {
        fontSize: 11,
        color: liquidGlass.text.tertiary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        fontWeight: '600',
    }
});
