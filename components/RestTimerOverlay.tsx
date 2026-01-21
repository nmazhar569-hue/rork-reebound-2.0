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
import colors from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.65;

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
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      progressAnim.setValue(1);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialSeconds, progressAnim, scaleAnim, opacityAnim]);

  useEffect(() => {
    if (!visible || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          haptics.medium();
          onComplete();
          return 0;
        }

        if (prev <= 4 && prev > 1) {
          haptics.light();
        }

        return prev - 1;
      });
    }, 1000);

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: secondsLeft * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(interval);
  }, [visible, isPaused, onComplete, progressAnim, secondsLeft]);

  useEffect(() => {
    if (secondsLeft <= 5 && secondsLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [secondsLeft, pulseAnim]);

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
  const circumference = 2 * Math.PI * (CIRCLE_SIZE / 2 - 12);
  const strokeDashoffset = circumference * (1 - progress);

  const timerColor = secondsLeft <= 5 ? '#FF6B4A' : '#00D9A3';

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <X size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soundButton}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 size={22} color="rgba(255,255,255,0.6)" />
          ) : (
            <VolumeX size={22} color="rgba(255,255,255,0.6)" />
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
                <Text style={styles.setInfo}>Set {setNumber} Complete</Text>
              )}
            </View>
          )}

          <View style={styles.timerContainer}>
            <View style={styles.circleContainer}>
              <LinearGradient
                colors={['rgba(0,217,163,0.1)', 'rgba(255,107,74,0.05)']}
                style={styles.circleBackground}
              />

              <svg
                width={CIRCLE_SIZE}
                height={CIRCLE_SIZE}
                style={styles.progressRing}
              >
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_SIZE / 2 - 12}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={8}
                  fill="transparent"
                />
                <circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_SIZE / 2 - 12}
                  stroke={timerColor}
                  strokeWidth={8}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
                />
              </svg>

              <View style={styles.timerTextContainer}>
                <Text style={[styles.timerText, { color: timerColor }]}>
                  {formatTime(secondsLeft)}
                </Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            </View>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.timeButton} onPress={handleSubtractTime}>
              <Minus size={24} color="#FFFFFF" />
              <Text style={styles.timeButtonLabel}>15s</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <SkipForward size={22} color="#000000" />
              <Text style={styles.skipButtonText}>Skip Rest</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeButton} onPress={handleAddTime}>
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.timeButtonLabel}>15s</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.tipText}>
          Proper rest optimizes muscle recovery between sets
        </Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH - 80,
  },
  setInfo: {
    fontSize: 15,
    color: colors.success,
    marginTop: 6,
    fontWeight: '600' as const,
  },
  timerContainer: {
    marginBottom: 40,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CIRCLE_SIZE / 2,
  },
  progressRing: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '200' as const,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  timeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timeButtonLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '600' as const,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000000',
  },
  tipText: {
    position: 'absolute',
    bottom: 50,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
