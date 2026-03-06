
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Battery } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface RecoverySnapshotProps {
    sleepHours: number;
    avgSleepHours: number;
    initialEnergy?: number;
    onSave?: (energy: number) => void;
}

export function RecoverySnapshot({
    sleepHours,
    avgSleepHours,
    initialEnergy = 7,
    onSave
}: RecoverySnapshotProps) {
    const [energy, setEnergy] = useState(initialEnergy);
    const [isReady, setIsReady] = useState(false);

    // Status text based on slider
    const getStatus = (val: number) => {
        if (val >= 8) return { text: 'Primed', color: '#047857' }; // Green
        if (val >= 6) return { text: 'Ready', color: '#B45309' }; // Amber
        if (val >= 4) return { text: 'Okay', color: '#B45309' };
        return { text: 'Fatigued', color: '#B91C1C' }; // Red
    };

    const status = getStatus(energy);

    const handleSave = () => {
        haptics.success();
        setIsReady(true);
        onSave?.(energy);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={liquidGlass.gradients.recoveryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.question}>How are you feeling?</Text>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: status.color }]}>✓ {status.text}</Text>
                    </View>
                </View>

                {/* Slider Section */}
                <View style={styles.sliderContainer}>
                    <View style={styles.iconsRow}>
                        <Moon size={20} color="#BFDBFE" />
                        <LinearGradient
                            colors={['#BFDBFE', '#BFDBFE']}
                            style={{ flex: 1, height: 2, marginHorizontal: 10, borderRadius: 1, opacity: 0.2 }}
                        />
                        <Battery size={24} color="#BFDBFE" />
                    </View>

                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={1}
                        maximumValue={10}
                        step={1}
                        value={energy}
                        onValueChange={(val) => {
                            setEnergy(val);
                            haptics.selection();
                        }}
                        minimumTrackTintColor="#3B82F6"
                        maximumTrackTintColor="rgba(59, 130, 246, 0.2)"
                        thumbTintColor="#60A5FA"
                    />

                    <Text style={styles.scoreText}>{energy}/10 ({energy >= 7 ? 'Above average' : 'Average'})</Text>
                </View>

                {/* Stats Footer */}
                <View style={styles.footer}>
                    <Text style={styles.statsText}>Yesterday: {sleepHours} hrs sleep  |  Your avg: {avgSleepHours} hrs</Text>
                </View>

                {/* Action Buttons */}
                {!isReady && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => setIsReady(true)} style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        ...glassShadows.medium,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: '#1E1B4B', // Fallback
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    question: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF', // White for dark bg
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    sliderContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: -5,
        paddingHorizontal: 10,
    },
    scoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#93C5FD', // Blue-300
        marginTop: 4,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 12,
        marginBottom: 12,
    },
    statsText: {
        fontSize: 13,
        color: '#BFDBFE', // Blue-200
        opacity: 0.8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        alignItems: 'center',
    },
    skipBtn: {
        padding: 8,
    },
    skipText: {
        color: '#93C5FD',
        fontSize: 14,
        opacity: 0.7,
    },
    saveBtn: {
        backgroundColor: '#2563EB', // Blue-600
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
        shadowColor: '#2563EB',
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    saveText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    }
});
