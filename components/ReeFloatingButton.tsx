import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Pressable,
  PanResponder,
  Dimensions,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lightbulb, HelpCircle, BarChart3, Dumbbell, Heart, TrendingUp, Apple, Home } from 'lucide-react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { useRee } from '@/contexts/ReeContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { CheckInModal } from './CheckInModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 64; // Slightly larger for "Orb" feel
const PULSE_SCALE = 1.1;

export function ReeFloatingButton() {
  const router = useRouter();
  const { currentInsight, hasUnseenInsight } = useRee();
  const { setCurrentMode } = useAppMode();

  const [showCheckIn, setShowCheckIn] = useState(false);

  // Animation Values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(SCREEN_WIDTH - BUTTON_SIZE - 20)).current;
  const positionY = useRef(new Animated.Value(SCREEN_HEIGHT - 120)).current;

  const isDragging = useRef(false);
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const DRAG_THRESHOLD = 5;

  // Breathing Pulse Animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: PULSE_SCALE,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [pulseAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > DRAG_THRESHOLD || Math.abs(gestureState.dy) > DRAG_THRESHOLD;
      },

      onPanResponderGrant: (evt) => {
        dragStartPosition.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
        isDragging.current = false;

        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderMove: (evt, gestureState) => {
        const deltaX = Math.abs(evt.nativeEvent.pageX - dragStartPosition.current.x);
        const deltaY = Math.abs(evt.nativeEvent.pageY - dragStartPosition.current.y);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          isDragging.current = true;

          const newX = Math.max(10, Math.min(SCREEN_WIDTH - BUTTON_SIZE - 10, gestureState.moveX - BUTTON_SIZE / 2));
          const newY = Math.max(50, Math.min(SCREEN_HEIGHT - BUTTON_SIZE - 90, gestureState.moveY - BUTTON_SIZE / 2));

          positionX.setValue(newX);
          positionY.setValue(newY);
        }
      },

      onPanResponderRelease: () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        if (!isDragging.current) {
          haptics.medium();
          setShowCheckIn(true);
        }

        if (isDragging.current) {
          const currentX = (positionX as any)._value;
          const currentY = (positionY as any)._value;

          // Snap logic
          const snapToLeft = currentX < SCREEN_WIDTH / 2;
          const targetX = snapToLeft ? 20 : SCREEN_WIDTH - BUTTON_SIZE - 20;

          Animated.spring(positionX, {
            toValue: targetX,
            useNativeDriver: false,
          }).start();

          Animated.spring(positionY, {
            toValue: currentY, // Keep Y position
            useNativeDriver: false,
          }).start();
        }

        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      },
    })
  ).current;

  const handleCheckInSubmit = (data: { energy: number; soreness: number; stress: number }) => {
    console.log("Check In Data:", data);
    // TODO: Process data and show Executive Summary
    haptics.success();
  };

  return (
    <>
      <CheckInModal
        visible={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSubmit={handleCheckInSubmit}
      />

      <Animated.View
        style={[
          styles.floatingButton,
          {
            left: positionX,
            top: positionY,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) }
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={liquidGlass.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {/* Inner Glow Ring */}
          <View style={styles.innerRing}>
            {/* "Lung" Pulse Effect */}
            <View style={styles.core} />
          </View>
        </LinearGradient>

        {/* Outer Glow Layer */}
        <View style={styles.glow} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    zIndex: 100,
    ...glassShadows.glowStrong, // Strong glow for the Orb
  },
  buttonGradient: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  innerRing: {
    width: BUTTON_SIZE - 6,
    height: BUTTON_SIZE - 6,
    borderRadius: (BUTTON_SIZE - 6) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  core: {
    width: BUTTON_SIZE / 3,
    height: BUTTON_SIZE / 3,
    borderRadius: BUTTON_SIZE / 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  glow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: BUTTON_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: -1,
  },
});
