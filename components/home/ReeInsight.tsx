
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, TrendingDown, TrendingUp, Sparkles, Zap } from 'lucide-react-native';

import { liquidGlass } from '@/constants/liquidGlass';
import { ReeInsight as ReeInsightType } from '@/types/intelligence';

interface ReeInsightProps {
    insight: ReeInsightType | null;
    onAction?: (actionId?: string, route?: string) => void;
    onDismiss?: () => void;
}

export function ReeInsight({ insight, onAction, onDismiss }: ReeInsightProps) {
    if (!insight) return null;

    // Icon logic
    const renderIcon = () => {
        switch (insight.type) {
            case 'recovery_warning': return <AlertTriangle size={20} color="#EF4444" />;
            case 'positive_reinforcement': return <Sparkles size={20} color="#10B981" />;
            case 'consistency_alert': return <TrendingUp size={20} color="#3B82F6" />;
            default: return <Zap size={20} color="#3B82F6" />;
        }
    };

    // Color logic
    const getColors = (): readonly [string, string, ...string[]] => {
        switch (insight.type) {
            case 'recovery_warning': return ['rgba(254, 226, 226, 0.9)', 'rgba(254, 202, 202, 0.9)']; // Red tint
            case 'positive_reinforcement': return ['rgba(209, 250, 229, 0.9)', 'rgba(167, 243, 208, 0.9)']; // Green tint
            default: return liquidGlass.gradients.insightCard as readonly [string, string, ...string[]]; // Blue default
        }
    };

    /* const getTextColor = () => {
         switch (insight.type) {
             case 'recovery_warning': return '#991B1B';
             case 'positive_reinforcement': return '#065F46';
             default: return '#1E40AF';
         }
    }; */ // Simplified for now, keeping generic styles or using inline

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getColors()}
                style={styles.card}
            >
                <View style={styles.header}>
                    {renderIcon()}
                    <Text style={styles.headerTitle}>{insight.title}</Text>
                </View>

                <Text style={styles.message}>
                    {insight.message}
                </Text>

                <View style={styles.actions}>
                    {insight.action && (
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => onAction?.(insight.action?.actionId, insight.action?.route)}
                        >
                            <Text style={styles.primaryBtnText}>{insight.action.label}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={onDismiss}
                    >
                        <Text style={styles.secondaryBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 100, // Space for scrolling past
    },
    card: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937', // Gray-800
    },
    message: {
        fontSize: 15,
        color: '#374151', // Gray-700
        lineHeight: 22,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    primaryBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    secondaryBtn: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    secondaryBtnText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 13,
    }
});
