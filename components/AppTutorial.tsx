import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MessageCircle, 
  Calendar, 
  Activity, 
  TrendingUp, 
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react-native';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TUTORIAL_STORAGE_KEY = 'app_tutorial_completed';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: 'top' | 'center' | 'bottom';
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Reebound! 👋',
    description: 'Let me show you around. This quick tour will help you get the most out of your fitness journey.',
    icon: <Sparkles size={32} color={liquidGlass.accent.primary} />,
    position: 'center',
  },
  {
    id: 'floating_button',
    title: 'Meet Ree - Your AI Companion',
    description: 'This floating button is Ree, your AI fitness assistant. Tap it to get insights, or drag it anywhere on screen. Double-tap to open the AI chat.',
    icon: <MessageCircle size={32} color={liquidGlass.accent.primary} />,
    position: 'bottom',
  },
  {
    id: 'home_screen',
    title: 'Your Daily Overview',
    description: 'The home screen shows your training status, recovery insights, and what\'s planned for today.',
    icon: <Activity size={32} color={liquidGlass.accent.primary} />,
    position: 'top',
  },
  {
    id: 'plan_screen',
    title: 'Plan Your Workouts',
    description: 'Build custom programs, schedule workouts, and let Ree help you create the perfect training plan.',
    icon: <Calendar size={32} color={liquidGlass.accent.primary} />,
    position: 'center',
  },
  {
    id: 'recovery_screen',
    title: 'Track Your Recovery',
    description: 'Monitor pain levels, track readiness, and get personalized recovery recommendations.',
    icon: <Activity size={32} color={liquidGlass.accent.primary} />,
    position: 'center',
  },
  {
    id: 'progress_screen',
    title: 'See Your Progress',
    description: 'Visualize your journey with charts, stats, and insights. Watch yourself improve over time.',
    icon: <TrendingUp size={32} color={liquidGlass.accent.primary} />,
    position: 'center',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'That\'s it! Remember, Ree is always here to help. Just tap the floating button whenever you need guidance.',
    icon: <Sparkles size={32} color={liquidGlass.accent.primary} />,
    position: 'center',
  },
];

interface AppTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export function AppTutorial({ visible, onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, fadeAnim, slideAnim, pulseAnim]);

  const handleNext = async () => {
    haptics.light();

    if (currentStep < TUTORIAL_STEPS.length - 1) {
      // Animate transition
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -30,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      setCurrentStep(currentStep + 1);
    } else {
      // Complete tutorial
      await completeTutorial();
    }
  };

  const handleSkip = async () => {
    haptics.medium();
    await completeTutorial();
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('Failed to save tutorial completion status:', error);
    }
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        {/* Darkened background */}
        <View style={styles.backdrop} />

        {/* Tutorial card */}
        <Animated.View
          style={[
            styles.tutorialCard,
            step.position === 'top' && styles.tutorialCardTop,
            step.position === 'bottom' && styles.tutorialCardBottom,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <X size={20} color={liquidGlass.text.tertiary} />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={liquidGlass.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              {step.icon}
            </LinearGradient>
          </Animated.View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.stepIndicators}>
              {TUTORIAL_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={liquidGlass.gradients.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === TUTORIAL_STEPS.length - 1
                    ? 'Get Started'
                    : 'Next'}
                </Text>
                <ChevronRight size={18} color={liquidGlass.text.inverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Step counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {TUTORIAL_STEPS.length}
          </Text>
        </Animated.View>

        {/* Spotlight effect for floating button on step 2 */}
        {currentStep === 1 && (
          <View style={styles.spotlight}>
            <View style={styles.spotlightCircle} />
          </View>
        )}
      </View>
    </Modal>
  );
}

// Helper function to check if tutorial is completed
export async function isTutorialCompleted(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
    return completed === 'true';
  } catch (error) {
    console.warn('Failed to check tutorial status:', error);
    return false;
  }
}

// Helper function to reset tutorial
export async function resetTutorial(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset tutorial:', error);
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  tutorialCard: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.glow,
  },
  tutorialCardTop: {
    position: 'absolute',
    top: 100,
  },
  tutorialCardBottom: {
    position: 'absolute',
    bottom: 150,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: liquidGlass.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  progressBar: {
    height: 3,
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 1.5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 1.5,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassShadows.soft,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: liquidGlass.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: liquidGlass.surface.glass,
  },
  stepDotActive: {
    backgroundColor: liquidGlass.accent.primary,
    width: 24,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: liquidGlass.text.inverse,
    letterSpacing: 0.3,
  },
  stepCounter: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  spotlight: {
    position: 'absolute',
    bottom: 120,
    right: 20,
  },
  spotlightCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: liquidGlass.accent.primary,
    backgroundColor: 'transparent',
  },
});
