
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, Calendar } from 'lucide-react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { WorkoutSet } from '@/types/workout';

interface HistoryEntry {
    date: string;
    sets: WorkoutSet[];
}

interface ExerciseHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    exerciseName: string;
    history: HistoryEntry[];
}

export const ExerciseHistoryModal = ({
    visible,
    onClose,
    exerciseName,
    history
}: ExerciseHistoryModalProps) => {

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getBestSet = (sets: WorkoutSet[]) => {
        if (!sets.length) return 'No data';
        // Simple "Best" based on max weight
        const maxWeight = Math.max(...sets.map(s => s.weight));
        return `${maxWeight} lbs`;
    };

    const getTotalVolume = (sets: WorkoutSet[]) => {
        return sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <TrendingUp size={20} color={liquidGlass.accent.primary} />
                            <Text style={styles.title}>History Analysis</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={22} color={liquidGlass.text.tertiary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>{exerciseName}</Text>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        {history.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No history recorded yet.</Text>
                            </View>
                        ) : (
                            history.map((entry, index) => (
                                <View key={index} style={styles.historyRow}>
                                    <View style={styles.dateBadge}>
                                        <Calendar size={12} color={liquidGlass.text.tertiary} />
                                        <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
                                    </View>

                                    <View style={styles.statsContainer}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statLabel}>Best Lift</Text>
                                            <Text style={styles.statValue}>{getBestSet(entry.sets)}</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statLabel}>Volume</Text>
                                            <Text style={styles.statValue}>{getTotalVolume(entry.sets).toLocaleString()} lbs</Text>
                                        </View>
                                    </View>

                                    <View style={styles.setsList}>
                                        {entry.sets.map((set, sIdx) => (
                                            <Text key={sIdx} style={styles.setDetail}>
                                                Set {sIdx + 1}: <Text style={styles.setHighlight}>{set.weight}lbs</Text> x {set.reps}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            ))
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    card: {
        backgroundColor: liquidGlass.background.secondary,
        borderRadius: 24,
        padding: 24,
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.deep,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    closeBtn: {
        padding: 4,
    },
    subtitle: {
        fontSize: 16,
        color: liquidGlass.accent.primary,
        marginBottom: 20,
        fontWeight: '600',
    },
    scroll: {
        flexGrow: 0,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: liquidGlass.text.tertiary,
    },
    historyRow: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: liquidGlass.surface.glassDark,
        padding: 8,
        borderRadius: 8,
    },
    statLabel: {
        fontSize: 10,
        color: liquidGlass.text.tertiary,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 14,
        color: liquidGlass.text.primary,
        fontWeight: '700',
        marginTop: 2,
    },
    setsList: {
        gap: 4,
    },
    setDetail: {
        fontSize: 13,
        color: liquidGlass.text.secondary,
    },
    setHighlight: {
        color: liquidGlass.text.primary,
        fontWeight: '700',
    }
});
