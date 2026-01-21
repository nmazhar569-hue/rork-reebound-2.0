import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusColor } from '@/services/AnalysisService';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';

interface StatusGlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hero' | 'thin';
  statusColor?: StatusColor | 'NEUTRAL';
  style?: ViewStyle;
}

const getGlowColors = (status: StatusColor | 'NEUTRAL'): readonly [string, string] => {
  switch (status) {
    case 'GREEN':
      return ['rgba(34, 197, 94, 0.12)', 'rgba(34, 197, 94, 0.25)'] as const;
    case 'YELLOW':
      return ['rgba(234, 179, 8, 0.12)', 'rgba(234, 179, 8, 0.25)'] as const;
    case 'RED':
      return ['rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.30)'] as const;
    default:
      return ['rgba(0, 217, 184, 0.08)', 'rgba(0, 217, 184, 0.15)'] as const;
  }
};

const getBorderColor = (status: StatusColor | 'NEUTRAL'): string => {
  switch (status) {
    case 'GREEN':
      return 'rgba(34, 197, 94, 0.4)';
    case 'YELLOW':
      return 'rgba(234, 179, 8, 0.4)';
    case 'RED':
      return 'rgba(239, 68, 68, 0.45)';
    default:
      return liquidGlass.border.glass;
  }
};

const getStatusShadow = (status: StatusColor | 'NEUTRAL') => {
  const colors: Record<StatusColor | 'NEUTRAL', string> = {
    GREEN: '#22C55E',
    YELLOW: '#EAB308',
    RED: '#EF4444',
    NEUTRAL: liquidGlass.accent.primary,
  };
  
  return {
    shadowColor: colors[status],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: status === 'NEUTRAL' ? 0.2 : 0.35,
    shadowRadius: 16,
    elevation: 8,
  };
};

export function StatusGlassCard({
  children,
  variant = 'default',
  statusColor = 'NEUTRAL',
  style,
}: StatusGlassCardProps) {
  const blurIntensity = variant === 'thin' ? 20 : variant === 'hero' ? 40 : 30;
  const glowColors = getGlowColors(statusColor);
  const borderColor = getBorderColor(statusColor);
  const statusShadow = getStatusShadow(statusColor);

  return (
    <View style={[styles.container, statusShadow, style]}>
      <BlurView
        intensity={blurIntensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={glowColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.borderOverlay,
          {
            borderColor: borderColor,
            borderTopColor: 'rgba(255, 255, 255, 0.25)',
            borderLeftColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
      />

      <View style={[styles.content, variant === 'thin' && styles.contentThin]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: liquidGlass.surface.card,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  content: {
    padding: 20,
    zIndex: 2,
  },
  contentThin: {
    padding: 14,
  },
});

export default StatusGlassCard;
