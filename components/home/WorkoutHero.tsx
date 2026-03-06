
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, TrendingUp, Dumbbell, Clock, Layers, ArrowRight } from 'lucide-react-native';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface WorkoutHeroProps {
    focus: string;
    exerciseCount: number;
    setCount: number;
    durationMinutes: number;
    onStart: () => void;
}

export function WorkoutHero({
    focus,
    exerciseCount,
    setCount,
    durationMinutes,
    onStart
}: WorkoutHeroProps) {

    const handleStart = () => {
        haptics.medium();
        onStart();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={liquidGlass.gradients.heroCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <Text style={styles.label}>Today's Focus</Text>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{focus}</Text>
                    <Dumbbell size={24} color="rgba(255,255,255,0.3)" />
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{exerciseCount}</Text>
                        <Text style={styles.statLabel}>Exercises</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{setCount}</Text>
                        <Text style={styles.statLabel}>Sets</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{durationMinutes}m</Text>
                        <Text style={styles.statLabel}>Est. Time</Text>
                    </View>
                </View>

                {/* Progression Insight */}
                <View style={styles.progressionContainer}>
                    <View style={styles.progressionHeader}>
                        <TrendingUp size={16} color="#60A5FA" />
                        <Text style={styles.progressionTitle}>Progression from last week:</Text>
                    </View>
                    <Text style={styles.progressionItem}>• Bench: 185 → 190 lbs (+2.7%)</Text>
                    <Text style={styles.progressionItem}>• Volume: +5%</Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStart}
                    activeOpacity={0.9}
                >
                    <Text style={styles.startText}>View My Workout Plan</Text>
                    <ArrowRight size={18} color="#2563EB" />
                </TouchableOpacity>

            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        ...glassShadows.deep, // Deep shadow for priority
    },
    card: {
        padding: 24,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    label: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    progressionContainer: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    progressionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    progressionTitle: {
        color: '#93C5FD', // Blue-300
        fontWeight: '600',
        fontSize: 14,
    },
    progressionItem: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        marginBottom: 4,
        marginLeft: 24,
    },
    startButton: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 8,
        ...glassShadows.soft,
    },
    startText: {
        color: '#2563EB', // Blue-600
        fontSize: 16,
        fontWeight: '800',
    }
});
