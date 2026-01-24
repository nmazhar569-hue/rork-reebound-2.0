import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    X,
    TrendingUp,
    Moon,
    Dumbbell,
} from 'lucide-react-native';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

/**
 * ReeAnalysisOutput Component
 * 
 * Displays Ree's analysis in 4 sections:
 * 1. Current State - Where user is right now
 * 2. What's Working - Positive reinforcement
 * 3. What's Limiting Progress - Non-judgmental obstacles
 * 4. Today's Recommendation - Specific, actionable guidance
 */

export interface AnalysisData {
    currentState: {
        summary: string;
        metrics?: {
            sessionsThisWeek?: number;
            hrvChange?: number;
            energyLevel?: string;
            stressLevel?: string;
        };
    };
    whatsWorking: string[];
    limitations: string[];
    recommendation: {
        action: string;
        details: string;
        priority: 'high' | 'medium' | 'low';
    };
}

interface ReeAnalysisOutputProps {
    analysis: AnalysisData;
    onClose: () => void;
    onActionPress?: () => void;
}

export function ReeAnalysisOutput({
    analysis,
    onClose,
    onActionPress,
}: ReeAnalysisOutputProps) {
    return (
        <View style={styles.container}>
            {/* Glass background */}
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassOverlay} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.headerIcon}
                    >
                        <Text style={styles.reeText}>R</Text>
                    </LinearGradient>
                    <Text style={styles.title}>Ree's Analysis</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                {/* Section 1: Current State */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                            <BarChart3 size={18} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.sectionTitle}>CURRENT STATE</Text>
                    </View>
                    <Text style={styles.sectionText}>{analysis.currentState.summary}</Text>

                    {analysis.currentState.metrics && (
                        <View style={styles.metricsRow}>
                            {analysis.currentState.metrics.sessionsThisWeek !== undefined && (
                                <View style={styles.metric}>
                                    <Dumbbell size={14} color={theme.colors.textSecondary} />
                                    <Text style={styles.metricValue}>{analysis.currentState.metrics.sessionsThisWeek}</Text>
                                    <Text style={styles.metricLabel}>sessions</Text>
                                </View>
                            )}
                            {analysis.currentState.metrics.hrvChange !== undefined && (
                                <View style={styles.metric}>
                                    <TrendingUp size={14} color={analysis.currentState.metrics.hrvChange >= 0 ? theme.colors.primary : theme.colors.secondary} />
                                    <Text style={styles.metricValue}>{analysis.currentState.metrics.hrvChange > 0 ? '+' : ''}{analysis.currentState.metrics.hrvChange}%</Text>
                                    <Text style={styles.metricLabel}>HRV</Text>
                                </View>
                            )}
                            {analysis.currentState.metrics.energyLevel && (
                                <View style={styles.metric}>
                                    <Moon size={14} color={theme.colors.textSecondary} />
                                    <Text style={styles.metricValue}>{analysis.currentState.metrics.energyLevel}</Text>
                                    <Text style={styles.metricLabel}>energy</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Section 2: What's Working */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                            <CheckCircle2 size={18} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.sectionTitle}>WHAT'S WORKING</Text>
                    </View>
                    {analysis.whatsWorking.map((item, index) => (
                        <View key={index} style={styles.bulletItem}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.bulletText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Section 3: What's Limiting Progress */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.secondary}20` }]}>
                            <AlertTriangle size={18} color={theme.colors.secondary} />
                        </View>
                        <Text style={styles.sectionTitle}>WHAT'S LIMITING PROGRESS</Text>
                    </View>
                    {analysis.limitations.map((item, index) => (
                        <View key={index} style={styles.bulletItem}>
                            <View style={[styles.bulletDot, { backgroundColor: theme.colors.secondary }]} />
                            <Text style={styles.bulletText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Section 4: Today's Recommendation */}
                <View style={[styles.section, styles.recommendationSection]}>
                    <LinearGradient
                        colors={[`${theme.colors.primary}15`, `${theme.colors.secondary}10`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.recommendationGradient}
                    >
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.primary}30` }]}>
                                <Lightbulb size={18} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>TODAY'S RECOMMENDATION</Text>
                        </View>
                        <Text style={styles.recommendationAction}>{analysis.recommendation.action}</Text>
                        <Text style={styles.recommendationDetails}>{analysis.recommendation.details}</Text>

                        {onActionPress && (
                            <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => {
                                    haptics.medium();
                                    onActionPress();
                                }}
                            >
                                <LinearGradient
                                    colors={theme.gradients.tealButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.actionBtnGradient}
                                >
                                    <Text style={styles.actionBtnText}>Let's Do It</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                </View>
            </ScrollView>

            {/* Close button at bottom */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.closeFooterBtn}
                    onPress={() => {
                        haptics.light();
                        onClose();
                    }}
                >
                    <Text style={styles.closeFooterText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Placeholder analysis for demo
export const placeholderAnalysis: AnalysisData = {
    currentState: {
        summary: "You've trained hard this week (4 sessions, high intensity). Your HRV has dropped 12% from baseline, and you mentioned low energy and moderate stress. Your body is adapting, but needs recovery support.",
        metrics: {
            sessionsThisWeek: 4,
            hrvChange: -12,
            energyLevel: 'Low',
        },
    },
    whatsWorking: [
        "Your consistency is excellent—95% of planned workouts this month.",
        "Your squat strength is up 8% over 4 weeks.",
        "Progressive overload is working. Keep this momentum.",
    ],
    limitations: [
        "Sleep has been inconsistent (6.2 hrs avg vs 7.5 hr baseline). This reduces muscle protein synthesis and increases cortisol.",
        "High stress this week is impacting recovery capacity.",
    ],
    recommendation: {
        action: "Swap for 30-min low-intensity mobility",
        details: "Skip today's high-intensity session. Prioritize active recovery to restore HRV. Aim for 8 hours sleep tonight.",
        priority: 'high',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(15, 29, 50, 0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reeText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },
    closeBtn: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.textTertiary,
        letterSpacing: 1,
    },
    sectionText: {
        fontSize: 15,
        color: theme.colors.text,
        lineHeight: 23,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    metric: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metricValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
    },
    metricLabel: {
        fontSize: 13,
        color: theme.colors.textTertiary,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingLeft: 4,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.primary,
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.text,
        lineHeight: 23,
    },
    recommendationSection: {
        padding: 0,
    },
    recommendationGradient: {
        padding: 20,
        borderRadius: 20,
        gap: 12,
    },
    recommendationAction: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        lineHeight: 26,
    },
    recommendationDetails: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        lineHeight: 23,
    },
    actionBtn: {
        marginTop: 8,
        borderRadius: 50,
        overflow: 'hidden',
    },
    actionBtnGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 50,
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textInverse,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
    },
    closeFooterBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeFooterText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
});

export default ReeAnalysisOutput;
