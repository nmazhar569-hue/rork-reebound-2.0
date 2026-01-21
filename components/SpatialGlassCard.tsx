/**
 * Spatial Glass Card Component
 * 
 * A VisionOS-style glass card with:
 * - Physical depth and luminance
 * - Specular edges (3D ridge)
 * - Interactive physics (lift on press)
 * - Color-aware shadows
 */

import React, { useRef } from 'react';
import { View, StyleSheet, Animated, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import spatialGlass, { createGlassCard, createHoverState } from '@/constants/spatialGlass';
import { AppMode } from '@/constants/modeColors';
import { useAppMode } from '@/contexts/AppModeContext';

interface SpatialGlassCardProps {
  children: React.ReactNode;
  layer?: 'canvas' | 'control' | 'elevated';
  interactive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  mode?: AppMode;
}

export function SpatialGlassCard({
  children,
  layer = 'control',
  interactive = false,
  onPress,
  style,
  mode,
}: SpatialGlassCardProps) {
  const { currentMode } = useAppMode();
  const theme = 'light'; // TODO: Get from ThemeContext
  const cardMode = mode || currentMode;
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const brightnessAnim = useRef(new Animated.Value(0)).current;
  
  const baseStyle = createGlassCard(layer, theme, cardMode);
  
  const handlePressIn = () => {
    if (!interactive) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: spatialGlass.physics.hover.scale,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(brightnessAnim, {
        toValue: 1,
        duration: spatialGlass.physics.timing.duration,
        useNativeDriver: false,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    if (!interactive) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.timing(brightnessAnim, {
        toValue: 0,
        duration: spatialGlass.physics.timing.duration,
        useNativeDriver: false,
      }),
    ]).start();
  };
  
  // Interpolate brightness boost
  const backgroundColor = brightnessAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(50, 50, 50, 0.4)',
      theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(70, 70, 70, 0.5)',
    ],
  });
  
  const content = (
    <Animated.View
      style={[
        styles.container,
        baseStyle,
        style,
        {
          borderTopColor: spatialGlass.edges[theme].top,
          borderLeftColor: spatialGlass.edges[theme].left,
          borderBottomColor: spatialGlass.edges[theme].bottom,
          borderRightColor: spatialGlass.edges[theme].right,
          borderWidth: 1,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* BlurView for backdrop blur effect */}
      <BlurView
        intensity={spatialGlass.blur[layer]}
        tint={theme === 'light' ? 'light' : 'dark'}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Luminance Layer */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: interactive ? backgroundColor : baseStyle.backgroundColor,
          },
        ]}
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
  
  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {content}
      </Pressable>
    );
  }
  
  return content;
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
