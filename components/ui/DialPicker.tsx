import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import colors, { borderRadius, shadows } from '@/constants/colors';

interface DialPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DIAL_WIDTH = SCREEN_WIDTH - 80;
const TICK_SPACING = 30;

export const DialPicker: React.FC<DialPickerProps> = ({
  min,
  max,
  value,
  onChange,
  label,
  unit,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const internalValue = useRef(value);

  // Convert value to x-position
  const valueToOffset = useCallback((v: number) => {
    return -(v - min) * TICK_SPACING;
  }, [min]);

  const offsetToValue = useCallback((offset: number) => {
    return Math.round(-offset / TICK_SPACING) + min;
  }, [min]);

  useEffect(() => {
    pan.setValue(valueToOffset(value));
    internalValue.current = value;
  }, [value, valueToOffset, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(pan.hasOwnProperty('_value') ? (pan as any)._value : valueToOffset(internalValue.current));
        pan.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState.dx;
        const currentOffset = (pan as any)._offset + dx;
        
        let newValue = offsetToValue(currentOffset);
        
        // Clamp
        if (newValue < min) newValue = min;
        if (newValue > max) newValue = max;

        // Visual feedback (allow some overscroll but clamp value)
        pan.setValue(dx);

        if (newValue !== internalValue.current) {
          internalValue.current = newValue;
          Haptics.selectionAsync();
          onChange(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        // Snap to nearest tick
        const currentOffset = (pan as any)._value;
        const newValue = offsetToValue(currentOffset);
        const clampedValue = Math.max(min, Math.min(max, newValue));
        
        const snapOffset = valueToOffset(clampedValue);
        
        Animated.spring(pan, {
          toValue: snapOffset,
          useNativeDriver: true,
          friction: 7,
          tension: 40,
        }).start();
        
        if (internalValue.current !== clampedValue) {
          internalValue.current = clampedValue;
          onChange(clampedValue);
        }
      },
    })
  ).current;

  // Generate ticks
  const ticks = [];
  for (let i = min; i <= max; i++) {
    ticks.push(i);
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>

      <View style={styles.dialContainer} {...panResponder.panHandlers}>
        <View style={styles.centerLine} />
        <View style={styles.maskLeft} />
        <View style={styles.maskRight} />
        
        <Animated.View
          style={[
            styles.ticksTrack,
            {
              transform: [{ translateX: pan }],
            },
          ]}
        >
          {ticks.map((tickValue) => {
            const isSelected = tickValue === value;
            return (
              <View key={tickValue} style={[styles.tickContainer, { width: TICK_SPACING }]}>
                <View 
                  style={[
                    styles.tick, 
                    isSelected && styles.tickActive,
                    (tickValue % 1 === 0) ? styles.tickMajor : styles.tickMinor
                  ]} 
                />
                {/* Optional: Show numbers below ticks */}
                {/* <Text style={[styles.tickLabel, isSelected && styles.tickLabelActive]}>{tickValue}</Text> */}
              </View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    gap: 4,
  },
  valueText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 52,
  },
  unitText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dialContainer: {
    height: 60,
    width: DIAL_WIDTH,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.soft,
  },
  ticksTrack: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    // Center the first tick
    paddingLeft: DIAL_WIDTH / 2 - TICK_SPACING / 2,
    paddingRight: DIAL_WIDTH / 2 - TICK_SPACING / 2,
  },
  tickContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tick: {
    width: 2,
    borderRadius: 1,
    backgroundColor: colors.textTertiary,
  },
  tickMajor: {
    height: 24,
  },
  tickMinor: {
    height: 12, // Not currently used as we loop integers
  },
  tickActive: {
    backgroundColor: colors.primary,
    width: 3,
    height: 32,
  },
  centerLine: {
    position: 'absolute',
    left: DIAL_WIDTH / 2 - 1.5,
    top: 10,
    bottom: 10,
    width: 3,
    backgroundColor: colors.primary,
    zIndex: 10,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  maskLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 5,
    backgroundColor: colors.surface,
    opacity: 0.8, // Should be gradient really, but solid opacity for now or transparent
  },
  maskRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 5,
    backgroundColor: colors.surface,
    opacity: 0.8,
  },
});
