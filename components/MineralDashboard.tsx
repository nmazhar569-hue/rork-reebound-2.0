
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Info, X, Zap, Droplets, Heart, Brain, Bone, Activity, Shield } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { FoodEntry } from '@/types';
import { haptics } from '@/utils/haptics';

interface MineralDashboardProps {
    entries: FoodEntry[];
}

const MINERALS_CONFIG = [
    {
        key: 'magnesium',
        name: 'Magnesium',
        icon: Brain,
        color: '#A78BFA', // Purple
        functions: ['Relaxation', 'Sleep', 'ATP'],
        dailyTarget: 400, // mg
        description: 'Supports muscle relaxation and sleep quality — key for recovery.'
    },
    {
        key: 'zinc',
        name: 'Zinc',
        icon: Shield,
        color: '#34D399', // Emerald
        functions: ['Testosterone', 'Immunity'],
        dailyTarget: 11, // mg
        description: 'Critical for protein synthesis, hormonal signaling, and tissue repair.'
    },
    {
        key: 'calcium',
        name: 'Calcium',
        icon: Bone,
        color: '#FCD34D', // Amber
        functions: ['Contraction', 'Bone Density'],
        dailyTarget: 1000, // mg
        description: 'Supports muscle contraction and skeletal durability. Balance with Magnesium.'
    },
    {
        key: 'potassium',
        name: 'Potassium',
        icon: Activity,
        color: '#60A5FA', // Blue
        functions: ['Muscle Firing', 'Hydration'],
        dailyTarget: 3400, // mg
        description: 'Essential for muscle firing and fluid balance. Prevents cramping.'
    },
    {
        key: 'sodium',
        name: 'Sodium',
        icon: Droplets,
        color: '#F87171', // Red
        functions: ['Hydration', 'Blood Volume'],
        dailyTarget: 2300, // mg
        description: 'Supports hydration and performance, especially during intense or long sessions.'
    },
    {
        key: 'iron',
        name: 'Iron',
        icon: Heart,
        color: '#F472B6', // Pink
        functions: ['Oxygen', 'Endurance'],
        dailyTarget: 8, // mg (men), 18 (women) - using generic 14
        description: 'Crucial for oxygen delivery and fatigue resistance.'
    },
    {
        key: 'phosphorus',
        name: 'Phosphorus',
        icon: Zap,
        color: '#FB923C', // Orange
        functions: ['Energy', 'Bone Structure'],
        dailyTarget: 700, // mg
        description: ' vital for ATP energy production and bone structure.'
    },
    {
        key: 'selenium',
        name: 'Selenium',
        icon: Shield,
        color: '#2DD4BF', // Teal
        functions: ['Antioxidant', 'Metabolism'],
        dailyTarget: 55, // mcg
        description: 'Reduces oxidative stress and supports immune recovery.'
    }
];

export const MineralDashboard = ({ entries }: MineralDashboardProps) => {
    const [selectedMineral, setSelectedMineral] = useState<any | null>(null);

    const totals = useMemo(() => {
        const t: any = {};
        entries.forEach(entry => {
            if (entry.minerals) {
                Object.entries(entry.minerals).forEach(([key, val]) => {
                    t[key] = (t[key] || 0) + (val as number);
                });
            }
        });
        return t;
    }, [entries]);

    const handleOpenInfo = (mineral: any) => {
        haptics.selection();
        setSelectedMineral(mineral);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Core Minerals</Text>
                <Text style={styles.subtitle}>Recovery Matrix</Text>
            </View>

            <View style={styles.grid}>
                {MINERALS_CONFIG.map((mineral) => {
                    const current = totals[mineral.key] || 0;
                    const progress = Math.min(current / mineral.dailyTarget, 1);
                    const isMet = progress >= 0.8;
                    const Icon = mineral.icon;

                    return (
                        <TouchableOpacity
                            key={mineral.key}
                            style={styles.card}
                            onPress={() => handleOpenInfo(mineral)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${mineral.color}20` }]}>
                                    <Icon size={16} color={mineral.color} />
                                </View>
                                <TouchableOpacity
                                    style={styles.infoBtn}
                                    onPress={() => handleOpenInfo(mineral)}
                                >
                                    <View style={styles.dots} />
                                    <View style={styles.dots} />
                                    <View style={styles.dots} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.mineralName}>{mineral.name}</Text>

                            <View style={styles.valueRow}>
                                <Text style={styles.currentValue}>{Math.round(current)}</Text>
                                <Text style={styles.targetValue}>/{mineral.dailyTarget}{mineral.key === 'selenium' ? 'mcg' : 'mg'}</Text>
                            </View>

                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progress * 100}%`, backgroundColor: mineral.color }
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Ree Explanation Modal */}
            <Modal
                visible={!!selectedMineral}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedMineral(null)}
            >
                <BlurView intensity={20} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedMineral && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: `${selectedMineral.color}20` }]}>
                                        <selectedMineral.icon size={24} color={selectedMineral.color} />
                                    </View>
                                    <View style={styles.modalTitleContainer}>
                                        <Text style={styles.modalTitle}>{selectedMineral.name}</Text>
                                        <View style={styles.tagsRow}>
                                            {selectedMineral.functions.map((f: string) => (
                                                <View key={f} style={styles.tag}>
                                                    <Text style={styles.tagText}>{f}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.closeBtn}
                                        onPress={() => setSelectedMineral(null)}
                                    >
                                        <X size={20} color={liquidGlass.text.secondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.reeBox}>
                                    <Text style={styles.reeLabel}>Ree Analysis</Text>
                                    <Text style={styles.reeText}>
                                        {selectedMineral.description}
                                    </Text>
                                </View>

                                <View style={styles.statusBox}>
                                    <Text style={styles.statusLabel}>Current Status</Text>
                                    <View style={styles.statusRow}>
                                        <Text style={[styles.statusValue, { color: selectedMineral.color }]}>
                                            {Math.round(totals[selectedMineral.key] || 0)}
                                            <Text style={styles.statusUnit}>{selectedMineral.key === 'selenium' ? 'mcg' : 'mg'}</Text>
                                        </Text>
                                        <Text style={styles.statusTarget}>
                                            Target: {selectedMineral.dailyTarget}
                                        </Text>
                                    </View>
                                    {(totals[selectedMineral.key] || 0) < selectedMineral.dailyTarget * 0.5 ? (
                                        <Text style={styles.deficiencyWarn}>Low intake detected. Consider sourcing more.</Text>
                                    ) : (
                                        <Text style={styles.adequacyText}>Intake is supported.</Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 8
    },
    header: {
        marginBottom: 16,
        paddingHorizontal: 4
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 2
    },
    subtitle: {
        fontSize: 12,
        color: liquidGlass.text.tertiary
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    card: {
        width: '48%', // roughly half
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        borderRadius: 16,
        padding: 12,
        marginBottom: 4
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoBtn: {
        padding: 8,
        flexDirection: 'row',
        gap: 2
    },
    dots: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: liquidGlass.text.tertiary
    },
    mineralName: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlass.text.primary,
        marginBottom: 4
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8
    },
    currentValue: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary
    },
    targetValue: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        marginLeft: 2
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        borderRadius: 2
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.deep
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20
    },
    modalIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    modalTitleContainer: {
        flex: 1
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: liquidGlass.text.primary,
        marginBottom: 8
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: liquidGlass.surface.glassLight
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
        color: liquidGlass.text.secondary
    },
    closeBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16
    },
    reeBox: {
        backgroundColor: 'rgba(50, 50, 50, 0.3)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: liquidGlass.accent.primary
    },
    reeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: liquidGlass.accent.primary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    reeText: {
        fontSize: 15,
        color: liquidGlass.text.secondary,
        lineHeight: 22
    },
    statusBox: {
        backgroundColor: liquidGlass.surface.glass,
        padding: 16,
        borderRadius: 16
    },
    statusLabel: {
        fontSize: 13,
        color: liquidGlass.text.tertiary,
        marginBottom: 8
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    statusValue: {
        fontSize: 24,
        fontWeight: '800'
    },
    statusUnit: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 2
    },
    statusTarget: {
        fontSize: 14,
        color: liquidGlass.text.secondary
    },
    deficiencyWarn: {
        fontSize: 13,
        color: liquidGlass.status.warning,
        fontWeight: '500'
    },
    adequacyText: {
        fontSize: 13,
        color: liquidGlass.status.success,
        fontWeight: '500'
    }
});
