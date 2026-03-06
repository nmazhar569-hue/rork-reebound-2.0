import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { ProgressSummary } from '@/services/ProgressService';

interface SummaryCardsProps {
    data: ProgressSummary;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Strength Gains</Text>
                <Text style={styles.cardValue}>+{data.strengthGains}%</Text>
                <Text style={styles.cardLabel}>Avg across stats</Text>
                <Text style={styles.trendUp}>↑ Excellent</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Muscle Growth</Text>
                <Text style={styles.cardValue}>+{data.muscleGrowthLbs} lbs</Text>
                <Text style={styles.cardLabel}>Est. this month</Text>
                <Text style={styles.trendUp}>↑ On Track</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Body Comp</Text>
                <Text style={styles.cardValue}>+{data.bodyCompChange} lbs</Text>
                <Text style={styles.cardLabel}>Lean Mass (Net)</Text>
                <Text style={styles.trendUp}>↑ Efficiency High</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 11,
        color: liquidGlass.text.tertiary,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    cardValue: {
        fontSize: 22,
        color: colors.accent,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 11,
        color: liquidGlass.text.secondary,
        marginBottom: 4,
        textAlign: 'center',
    },
    trendUp: {
        fontSize: 11,
        color: colors.success,
        fontWeight: '600',
    }
});
