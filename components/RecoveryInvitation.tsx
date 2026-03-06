
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check, ArrowRight, Shield, Moon, Activity, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import colors from '@/constants/colors';
import { RecoveryRecommendation } from '@/types/recovery';

interface RecoveryInvitationProps {
    visible: boolean;
    recommendation: RecoveryRecommendation | null;
    onClose: () => void;
    onAccept: () => void;
}

export function RecoveryInvitation({ visible, recommendation, onClose, onAccept }: RecoveryInvitationProps) {
    const insets = useSafeAreaInsets();

    if (!recommendation) return null;

    const getIcon = () => {
        switch (recommendation.trigger) {
            case 'SLEEP_DEBT': return Moon;
            case 'CNS_FATIGUE': return Zap;
            case 'SORENESS': return Activity;
            default: return Shield;
        }
    };

    const Icon = getIcon();

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Icon size={32} color={colors.accent} />
                            </View>
                            <Text style={styles.kicker}>REE INTELLIGENCE DETECTED</Text>
                            <Text style={styles.title}>Recovery Plan: {recommendation.reason.split(' ')[0]} Focus</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                <X size={24} color={liquidGlass.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Why This Plan */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>WHY THIS PLAN</Text>
                            <View style={styles.card}>
                                <Text style={styles.reasonText}>{recommendation.reason}</Text>
                                <View style={styles.impactRow}>
                                    <Shield size={16} color={liquidGlass.status.warning} />
                                    <Text style={styles.impactText}>{recommendation.impact}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Expected Results */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>EXPECTED RESULTS ({recommendation.durationDays} Days)</Text>
                            <View style={styles.resultsGrid}>
                                {recommendation.expectedResults.map((result, index) => (
                                    <View key={index} style={styles.resultItem}>
                                        <View style={styles.checkCircle}>
                                            <Check size={12} color={colors.accent} />
                                        </View>
                                        <Text style={styles.resultText}>{result}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Daily Commitment */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DAILY COMMITMENT</Text>
                            <View style={styles.commitmentCard}>
                                <Text style={styles.commitmentText}>• 15-min evening routine</Text>
                                <Text style={styles.commitmentText}>• Consistent sleep/wake times</Text>
                                <Text style={styles.commitmentText}>• Brief morning check-in</Text>
                            </View>
                        </View>

                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={onAccept}>
                            <Text style={styles.primaryBtnText}>Start {recommendation.durationDays}-Day Plan</Text>
                            <ArrowRight size={18} color={colors.background} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                            <Text style={styles.secondaryBtnText}>Dismiss for Now</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: liquidGlass.background.secondary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '85%',
        ...glassShadows.deep,
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: liquidGlass.surface.glassLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
        ...glassShadows.glow,
    },
    kicker: {
        color: colors.accent,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    title: {
        color: liquidGlass.text.primary,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: liquidGlass.text.tertiary,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: liquidGlass.surface.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    reasonText: {
        color: liquidGlass.text.secondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 12,
    },
    impactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 100, 100, 0.1)',
        padding: 8,
        borderRadius: 8,
    },
    impactText: {
        color: liquidGlass.status.warning,
        fontSize: 13,
        fontWeight: '600',
    },
    resultsGrid: {
        gap: 12,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: liquidGlass.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultText: {
        color: liquidGlass.text.primary,
        fontSize: 15,
        fontWeight: '500',
    },
    commitmentCard: {
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    commitmentText: {
        color: liquidGlass.text.secondary,
        fontSize: 14,
    },
    footer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: colors.accent,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        ...glassShadows.glow,
    },
    primaryBtnText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: liquidGlass.text.tertiary,
        fontSize: 15,
        fontWeight: '600',
    },
});
