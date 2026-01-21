import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const SLIDER_WIDTH = Dimensions.get('window').width - 80;

interface PainSliderProps {
  initialValue?: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export function PainSlider({ initialValue = 3, onValueChange, disabled = false }: PainSliderProps) {
  const [value, setValue] = useState(initialValue);
  const lastValue = useRef(initialValue);
  const pan = useRef(new Animated.Value((initialValue / 10) * SLIDER_WIDTH)).current;

  const getColorFromValue = useCallback((val: number): readonly [string, string] => {
    if (val <= 3) return ['#4ADE80', '#22C55E'] as const;
    if (val <= 6) return ['#FACC15', '#EAB308'] as const;
    return ['#F87171', '#EF4444'] as const;
  }, []);

  const getStatusText = useCallback((val: number): string => {
    if (val === 0) return 'No Pain';
    if (val <= 2) return 'Minimal';
    if (val <= 4) return 'Mild';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'Significant';
    return 'Severe';
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gesture) => {
        let newX = gesture.moveX - 40;
        if (newX < 0) newX = 0;
        if (newX > SLIDER_WIDTH) newX = SLIDER_WIDTH;
        
        pan.setValue(newX);
        
        const newValue = Math.round((newX / SLIDER_WIDTH) * 10);
        if (newValue !== lastValue.current) {
          lastValue.current = newValue;
          setValue(newValue);
          Haptics.selectionAsync();
        }
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onValueChange(lastValue.current);
      },
    })
  ).current;

  const colors = getColorFromValue(value);
  const fillWidth = pan.interpolate({
    inputRange: [0, SLIDER_WIDTH],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Pain Level</Text>
        <View style={[styles.valueBadge, { backgroundColor: colors[1] + '30' }]}>
          <Text style={[styles.valueText, { color: colors[1] }]}>{value}/10</Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fillContainer, { width: fillWidth }]}>
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fill}
            />
          </Animated.View>
        </View>
        
        <Animated.View 
          style={[
            styles.knob, 
            { transform: [{ translateX: pan }] },
            disabled && styles.knobDisabled
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.knobInner, { backgroundColor: colors[1], borderColor: colors[0] }]}>
            <Text style={styles.knobText}>{value}</Text>
          </View>
        </Animated.View>
      </View>
      
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.statusValue, { color: colors[1] }]}>{getStatusText(value)}</Text>
      </View>
      
      <View style={styles.labelsRow}>
        <Text style={styles.endLabel}>None</Text>
        <Text style={styles.endLabel}>Severe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  valueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  sliderContainer: {
    height: 50,
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillContainer: {
    height: '100%',
  },
  fill: {
    flex: 1,
    borderRadius: 4,
  },
  knob: {
    position: 'absolute',
    left: -18,
    top: 7,
  },
  knobDisabled: {
    opacity: 0.7,
  },
  knobInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  knobText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  endLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
});
