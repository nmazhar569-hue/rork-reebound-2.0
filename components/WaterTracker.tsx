import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Droplets, Plus, Minus, Settings } from 'lucide-react-native';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

interface WaterTrackerProps {
    currentIntake: number; // in ml
    targetIntake: number; // in ml
    onUpdate: (newIntake: number) => void;
    onSetTarget?: (newTarget: number) => void;
}

const { width } = Dimensions.get('window');

export const WaterTracker: React.FC<WaterTrackerProps> = ({
    currentIntake,
    targetIntake,
    onUpdate,
}) => {
    const percentage = Math.min(Math.round((currentIntake / targetIntake) * 100), 100);

    const handleAddWater = (amount: number) => {
        haptics.medium();
        onUpdate(currentIntake + amount);
    };

    const handleRemoveWater = (amount: number) => {
        if (currentIntake <= 0) return;
        haptics.light();
        onUpdate(Math.max(0, currentIntake - amount));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <View style={styles.iconContainer}>
                        <Droplets size={20} color={liquidGlass.accent.primary} />
                    </View>
                    <View>
                        <Text style={styles.title}>Hydration</Text>
                        <Text style={styles.subtitle}>Daily Intake Goal</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.targetBadge}>
                    <Text style={styles.targetText}>{targetIntake}ml</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                    <Text style={styles.currentValue}>{currentIntake} <Text style={styles.unit}>ml</Text></Text>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>

                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${percentage}%` }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAddWater(250)}
                >
                    <Plus size={18} color={liquidGlass.accent.primary} />
                    <Text style={styles.actionText}>250ml</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAddWater(500)}
                >
                    <Plus size={18} color={liquidGlass.accent.primary} />
                    <Text style={styles.actionText}>500ml</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButtonSecondary}
                    onPress={() => handleRemoveWater(250)}
                >
                    <Minus size={18} color={liquidGlass.text.tertiary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.soft,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${liquidGlass.accent.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: `${liquidGlass.accent.primary}30`,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    subtitle: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
    },
    targetBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    targetText: {
        fontSize: 13,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
    },
    progressSection: {
        marginBottom: 20,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    currentValue: {
        fontSize: 28,
        fontWeight: '800',
        color: liquidGlass.text.primary,
    },
    unit: {
        fontSize: 16,
        fontWeight: '400',
        color: liquidGlass.text.tertiary,
    },
    percentageText: {
        fontSize: 16,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: liquidGlass.accent.primary,
        borderRadius: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: `${liquidGlass.accent.primary}15`,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${liquidGlass.accent.primary}30`,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlass.accent.primary,
    },
    actionButtonSecondary: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});
