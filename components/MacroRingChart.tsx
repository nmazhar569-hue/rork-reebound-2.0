import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const NEON_LIME = '#CCFF00';
const TEAL = '#00C2B8';
const ORANGE = '#FF7A50';

interface MacroRingProps {
  label: string;
  subtitle: string;
  current: number;
  target: number;
  color: string;
  size?: number;
}

export const MacroRingChart: React.FC<MacroRingProps> = ({
  label,
  subtitle,
  current,
  target,
  color,
  size = 100,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / target, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const percentage = Math.round(progress * 100);

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${label})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.values}>{current}g / {target}g</Text>
    </View>
  );
};

interface FuelGaugeProps {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

export const FuelGaugeDashboard: React.FC<FuelGaugeProps> = ({
  protein,
  carbs,
  fats,
}) => {
  return (
    <View style={styles.dashboard}>
      <View style={styles.dashboardHeader}>
        <Text style={styles.dashboardTitle}>Fuel Quality</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>On Track</Text>
        </View>
      </View>
      <View style={styles.ringsContainer}>
        <MacroRingChart
          label="Protein"
          subtitle="Repair"
          current={protein.current}
          target={protein.target}
          color={NEON_LIME}
          size={95}
        />
        <MacroRingChart
          label="Carbs"
          subtitle="Energy"
          current={carbs.current}
          target={carbs.target}
          color={TEAL}
          size={95}
        />
        <MacroRingChart
          label="Fats"
          subtitle="Hormones"
          current={fats.current}
          target={fats.target}
          color={ORANGE}
          size={95}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  values: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 4,
  },
  dashboard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dashboardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCFF00',
  },
  statusText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
