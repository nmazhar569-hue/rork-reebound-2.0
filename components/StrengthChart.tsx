import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Line, Text as SvgText } from 'react-native-svg';

import { theme } from '@/constants/theme';
import { glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * StrengthChart Component
 * 
 * Line chart showing strength trends over time with Ree's annotations.
 */

interface DataPoint {
    date: Date;
    value: number;
    annotation?: string;
}

interface StrengthChartProps {
    data: DataPoint[];
    exerciseName: string;
    unit?: string;
    timeRange: '4week' | '12week' | 'all';
    onTimeRangeChange: (range: '4week' | '12week' | 'all') => void;
    reeAnnotation?: string;
}

export function StrengthChart({
    data,
    exerciseName,
    unit = 'lbs',
    timeRange,
    onTimeRangeChange,
    reeAnnotation,
}: StrengthChartProps) {
    const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);

    // Chart dimensions
    const chartWidth = SCREEN_WIDTH - 80;
    const chartHeight = 180;
    const paddingX = 30;
    const paddingY = 20;
    const graphWidth = chartWidth - paddingX * 2;
    const graphHeight = chartHeight - paddingY * 2;

    // Calculate min/max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue;

    // Scale functions
    const scaleX = (index: number) => paddingX + (index / (data.length - 1)) * graphWidth;
    const scaleY = (value: number) => paddingY + graphHeight - ((value - minValue) / valueRange) * graphHeight;

    // Generate path
    const generatePath = () => {
        if (data.length < 2) return '';

        let path = `M ${scaleX(0)} ${scaleY(data[0].value)}`;

        for (let i = 1; i < data.length; i++) {
            const x = scaleX(i);
            const y = scaleY(data[i].value);
            path += ` L ${x} ${y}`;
        }

        return path;
    };

    // Generate area fill path
    const generateAreaPath = () => {
        if (data.length < 2) return '';

        let path = `M ${scaleX(0)} ${scaleY(data[0].value)}`;

        for (let i = 1; i < data.length; i++) {
            path += ` L ${scaleX(i)} ${scaleY(data[i].value)}`;
        }

        // Complete the area
        path += ` L ${scaleX(data.length - 1)} ${chartHeight - paddingY}`;
        path += ` L ${scaleX(0)} ${chartHeight - paddingY}`;
        path += ' Z';

        return path;
    };

    const timeRangeOptions: Array<{ key: '4week' | '12week' | 'all'; label: string }> = [
        { key: '4week', label: '4 Week' },
        { key: '12week', label: '12 Week' },
        { key: 'all', label: 'All Time' },
    ];

    return (
        <View style={styles.container}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.cardInner} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{exerciseName}</Text>

                {/* Time range tabs */}
                <View style={styles.tabs}>
                    {timeRangeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[styles.tab, timeRange === option.key && styles.tabActive]}
                            onPress={() => {
                                haptics.selection();
                                onTimeRangeChange(option.key);
                            }}
                        >
                            <Text style={[styles.tabText, timeRange === option.key && styles.tabTextActive]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <Svg width={chartWidth} height={chartHeight}>
                    <Defs>
                        <SvgGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
                            <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
                        </SvgGradient>
                        <SvgGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={theme.colors.primary} />
                            <Stop offset="100%" stopColor={theme.colors.secondary} />
                        </SvgGradient>
                    </Defs>

                    {/* Grid lines */}
                    {[0, 0.5, 1].map((factor, i) => {
                        const y = paddingY + graphHeight * (1 - factor);
                        const value = minValue + valueRange * factor;
                        return (
                            <React.Fragment key={i}>
                                <Line
                                    x1={paddingX}
                                    y1={y}
                                    x2={chartWidth - paddingX}
                                    y2={y}
                                    stroke="rgba(255,255,255,0.08)"
                                    strokeWidth={1}
                                />
                                <SvgText
                                    x={paddingX - 8}
                                    y={y + 4}
                                    fill={theme.colors.textTertiary}
                                    fontSize={10}
                                    textAnchor="end"
                                >
                                    {Math.round(value)}
                                </SvgText>
                            </React.Fragment>
                        );
                    })}

                    {/* Area fill */}
                    <Path
                        d={generateAreaPath()}
                        fill="url(#areaGradient)"
                    />

                    {/* Line */}
                    <Path
                        d={generatePath()}
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {data.map((point, index) => {
                        const x = scaleX(index);
                        const y = scaleY(point.value);
                        const isSelected = selectedPoint === point;

                        return (
                            <React.Fragment key={index}>
                                <Circle
                                    cx={x}
                                    cy={y}
                                    r={isSelected ? 8 : 5}
                                    fill={theme.colors.primary}
                                    stroke={theme.colors.background}
                                    strokeWidth={2}
                                    onPress={() => {
                                        haptics.light();
                                        setSelectedPoint(isSelected ? null : point);
                                    }}
                                />
                                {point.annotation && (
                                    <Circle
                                        cx={x}
                                        cy={y}
                                        r={12}
                                        fill="transparent"
                                        stroke={theme.colors.secondary}
                                        strokeWidth={2}
                                        strokeDasharray="4 2"
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* X-axis labels */}
                    {data.length > 0 && (
                        <>
                            <SvgText
                                x={paddingX}
                                y={chartHeight - 4}
                                fill={theme.colors.textTertiary}
                                fontSize={10}
                            >
                                Week 1
                            </SvgText>
                            <SvgText
                                x={chartWidth - paddingX}
                                y={chartHeight - 4}
                                fill={theme.colors.textTertiary}
                                fontSize={10}
                                textAnchor="end"
                            >
                                Week {data.length}
                            </SvgText>
                        </>
                    )}
                </Svg>

                {/* Selected point tooltip */}
                {selectedPoint && (
                    <View style={[styles.tooltip, { left: scaleX(data.indexOf(selectedPoint)) - 60 }]}>
                        <Text style={styles.tooltipValue}>{selectedPoint.value} {unit}</Text>
                        {selectedPoint.annotation && (
                            <Text style={styles.tooltipAnnotation}>{selectedPoint.annotation}</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Ree's annotation */}
            {reeAnnotation && (
                <View style={styles.annotation}>
                    <LinearGradient
                        colors={[`${theme.colors.primary}15`, `${theme.colors.secondary}10`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.annotationGradient}
                    >
                        <Text style={styles.annotationLabel}>Ree's insight:</Text>
                        <Text style={styles.annotationText}>{reeAnnotation}</Text>
                    </LinearGradient>
                </View>
            )}
        </View>
    );
}

// Placeholder data
export const placeholderChartData: DataPoint[] = [
    { date: new Date('2026-01-01'), value: 120 },
    { date: new Date('2026-01-08'), value: 130, annotation: '8% jump' },
    { date: new Date('2026-01-15'), value: 135 },
    { date: new Date('2026-01-22'), value: 150 },
];

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        ...glassShadows.medium,
    },
    cardInner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        padding: 20,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    tabs: {
        flexDirection: 'row',
        gap: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    tabActive: {
        backgroundColor: `${theme.colors.primary}20`,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    chartContainer: {
        padding: 20,
        paddingTop: 10,
        position: 'relative',
    },
    tooltip: {
        position: 'absolute',
        top: 20,
        width: 120,
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        zIndex: 10,
    },
    tooltipValue: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    tooltipAnnotation: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginTop: 4,
    },
    annotation: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    annotationGradient: {
        borderRadius: 12,
        padding: 14,
        gap: 4,
    },
    annotationLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    annotationText: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
});

export default StrengthChart;
