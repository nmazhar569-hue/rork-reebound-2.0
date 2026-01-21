import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Plus, Minus, SkipForward, Volume2, VolumeX } from 'lucide-react-native';
import { gradients } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.68;

const ORANGE = '#FF7A50';

interface RestTimerOverlayProps {
  visible: boolean;
  initialSeconds: number;
  exerciseName?: string;
  setNumber?: number;
  onComplete: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}

export function RestTimerOverlay({
  visible,
  initialSeconds,
  exerciseName,
  setNumber,
  onComplete,
  onSkip,
  onDismiss,
}: RestTimerOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ringPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      progressAnim.setValue(0);
      glowAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialSeconds, progressAnim, scaleAnim, opacityAnim, glowAnim]);

  useEffect(() => {
    if (!visible || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          haptics.recoveryFinish();
          onComplete();
          return 0;
        }

        haptics.restTimerTick(prev - 1);
        return prev - 1;
      });
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: initialSeconds * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, [visible, isPaused, onComplete, progressAnim, initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 10 && secondsLeft > 0) {
      const intensity = Math.max(0, (10 - secondsLeft) / 10);
      
      Animated.timing(glowAnim, {
        toValue: intensity,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulseAnim, {
            toValue: 1 + (0.03 * (10 - secondsLeft)),
            duration: 400 - (secondsLeft * 30),
            useNativeDriver: true,
          }),
          Animated.timing(ringPulseAnim, {
            toValue: 1,
            duration: 400 - (secondsLeft * 30),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (secondsLeft <= 5 && secondsLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [secondsLeft, pulseAnim, glowAnim, ringPulseAnim]);

  const handleAddTime = useCallback(() => {
    haptics.soft();
    setSecondsLeft((prev) => prev + 15);
  }, []);

  const handleSubtractTime = useCallback(() => {
    haptics.soft();
    setSecondsLeft((prev) => Math.max(0, prev - 15));
  }, []);

  const handleSkip = useCallback(() => {
    haptics.medium();
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSkip();
    });
  }, [onSkip, scaleAnim, opacityAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = secondsLeft / initialSeconds;
  

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9],
  });

  const bgGradientOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.2],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          { opacity: opacityAnim },
        ]}
      >
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
        
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            styles.gradientBg,
            { opacity: bgGradientOpacity }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 122, 80, 0.3)', 'rgba(255, 155, 122, 0.1)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </Animated.View>

        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <X size={24} color="rgba(0, 0, 0, 0.5)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soundButton}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 size={22} color="rgba(0, 0, 0, 0.5)" />
          ) : (
            <VolumeX size={22} color="rgba(0, 0, 0, 0.5)" />
          )}
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
            },
          ]}
        >
          {exerciseName && (
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseLabel}>REST AFTER</Text>
              <Text style={styles.exerciseName} numberOfLines={1}>
                {exerciseName}
              </Text>
              {setNumber && (
                <View style={styles.setCompleteBadge}>
                  <Text style={styles.setInfo}>Set {setNumber} Complete ✓</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.timerContainer}>
            <Animated.View 
              style={[
                styles.circleContainer,
                { transform: [{ scale: ringPulseAnim }] }
              ]}
            >
              <Animated.View 
                style={[
                  styles.glowRing,
                  { opacity: glowOpacity }
                ]}
              />
              
              <LinearGradient
                colors={['rgba(255, 122, 80, 0.12)', 'rgba(255, 155, 122, 0.06)']}
                style={styles.circleBackground}
              />

              <View style={styles.progressRingContainer}>
                <View style={styles.trackCircle} />
                <View 
                  style={[
                    styles.progressArc,
                    {
                      borderColor: ORANGE,
                      transform: [{ rotate: '-90deg' }],
                    }
                  ]}
                >
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${(1 - progress) * 100}%`,
                        backgroundColor: ORANGE,
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>
                  {formatTime(secondsLeft)}
                </Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.timeButton} onPress={handleSubtractTime}>
              <Minus size={24} color={ORANGE} />
              <Text style={styles.timeButtonLabel}>15s</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.9}>
              <LinearGradient
                colors={gradients.active}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.skipButtonGradient}
              >
                <SkipForward size={20} color="#FFFFFF" />
                <Text style={styles.skipButtonText}>Next Set</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeButton} onPress={handleAddTime}>
              <Plus size={24} color={ORANGE} />
              <Text style={styles.timeButtonLabel}>15s</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.tipText}>
          Rest optimizes muscle recovery between sets
        </Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 249, 251, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  gradientBg: {
    pointerEvents: 'none',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  soundButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 36,
  },
  exerciseLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1F36',
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH - 80,
  },
  setCompleteBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 194, 184, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 184, 0.2)',
  },
  setInfo: {
    fontSize: 14,
    color: '#00C2B8',
    fontWeight: '600' as const,
  },
  timerContainer: {
    marginBottom: 44,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 30,
    height: CIRCLE_SIZE + 30,
    borderRadius: (CIRCLE_SIZE + 30) / 2,
    backgroundColor: 'transparent',
    borderWidth: 20,
    borderColor: 'rgba(255, 122, 80, 0.15)',
  },
  circleBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE_SIZE / 2,
  },
  progressRingContainer: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE - 28,
    height: CIRCLE_SIZE - 28,
    borderRadius: (CIRCLE_SIZE - 28) / 2,
    borderWidth: 10,
    borderColor: 'rgba(255, 122, 80, 0.15)',
  },
  progressArc: {
    position: 'absolute',
    width: CIRCLE_SIZE - 28,
    height: CIRCLE_SIZE - 28,
    borderRadius: (CIRCLE_SIZE - 28) / 2,
    borderWidth: 10,
    borderColor: ORANGE,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 68,
    fontWeight: '200' as const,
    fontVariant: ['tabular-nums'],
    color: ORANGE,
  },
  timerLabel: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.45)',
    marginTop: -6,
    fontWeight: '500' as const,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  timeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 122, 80, 0.25)',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  timeButtonLabel: {
    fontSize: 11,
    color: ORANGE,
    marginTop: 2,
    fontWeight: '700' as const,
  },
  skipButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#00C2B8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  skipButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tipText: {
    position: 'absolute',
    bottom: 55,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
