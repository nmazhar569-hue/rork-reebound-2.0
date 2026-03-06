import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { liquidGlass } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { ReeRecommendation } from '@/services/ProgressService';

interface ReeRecommendationsProps {
    recs: ReeRecommendation[];
}

export function ReeRecommendations({ recs }: ReeRecommendationsProps) {
    if (recs.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🤖</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Ree's Assessment</Text>
                {recs.map((rec) => (
                    <View key={rec.id} style={styles.recItem}>
                        <Text style={styles.recText}>
                            <Text style={styles.bold}>{rec.muscle.toUpperCase()}: </Text>
                            {rec.issue}
                        </Text>
                        <Text style={styles.recText}>
                            <Text style={styles.highlight}>Recommendation: </Text>
                            {rec.solution}
                        </Text>
                        <Text style={styles.outcome}>Expected: {rec.expectedOutcome}</Text>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>View Fix</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.accent + '15', // Light blue tint
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.accent + '40',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 12,
    },
    recItem: {
        marginBottom: 16,
    },
    recText: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
        marginBottom: 4,
        lineHeight: 18,
    },
    bold: {
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    highlight: {
        color: colors.accent,
        fontWeight: '700',
    },
    outcome: {
        fontSize: 12,
        color: colors.success,
        marginTop: 4,
        fontWeight: '600',
    },
    actionBtn: {
        marginTop: 8,
        backgroundColor: colors.accent,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    actionBtnText: {
        color: colors.background,
        fontSize: 11,
        fontWeight: '700',
    }
});
