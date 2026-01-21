import { router } from 'expo-router';
import { Sparkles, Check, ChevronRight, ChevronLeft, ShieldAlert, User, Target, Dumbbell, Utensils, Clock, Heart, Moon, Activity, Smartphone } from 'lucide-react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHealth } from '@/contexts/HealthContext';
import { liquidGlass, glassShadows } from '@/constants/liquidGlass';
import * as Haptics from 'expo-haptics';
import { 
  QuestionnaireProfile,
  PrimaryGoal,
  DesiredOutcomeFocus,
  FitnessLevel,
  TrainingFrequencyCurrent,
  NutritionStructureLevel,
  DietaryConstraint,
  TimeCommitment,
  FrictionPoint,
  MotivationDriver,
  ReePersonalityPreference,
  BiologicalSex,
  UserProfile,
  HealthPlatform,
} from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_QUESTIONS = 17;

interface QuestionConfig {
  id: string;
  section: string;
  sectionIcon: React.ReactNode;
  question: string;
  subtitle?: string;
  type: 'text' | 'number' | 'single' | 'multi' | 'textarea';
  options?: { value: string; label: string; description?: string }[];
  maxSelections?: number;
  placeholder?: string;
  skippable?: boolean;
  skipText?: string;
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 'preferredName',
    section: 'Identity',
    sectionIcon: <User size={18} color={liquidGlass.accent.primary} />,
    question: 'How would you like us to refer to you?',
    subtitle: 'This helps us personalize your experience.',
    type: 'text',
    placeholder: 'Your name or nickname',
  },
  {
    id: 'age',
    section: 'Identity',
    sectionIcon: <User size={18} color={liquidGlass.accent.primary} />,
    question: 'How old are you?',
    subtitle: 'This helps us tailor recommendations to your life stage.',
    type: 'number',
    placeholder: 'Age',
  },
  {
    id: 'biologicalSex',
    section: 'Identity',
    sectionIcon: <User size={18} color={liquidGlass.accent.primary} />,
    question: 'Biological sex (for health calculations)?',
    subtitle: 'Used only for metabolic and recovery estimates.',
    type: 'single',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'primaryGoals',
    section: 'Goals',
    sectionIcon: <Target size={18} color={liquidGlass.accent.primary} />,
    question: 'What are you here to work on right now?',
    subtitle: 'Select up to 3 that feel most important.',
    type: 'multi',
    maxSelections: 3,
    options: [
      { value: 'build_muscle', label: 'Build muscle', description: 'Increase strength and size' },
      { value: 'lose_fat', label: 'Lose fat', description: 'Improve body composition' },
      { value: 'improve_performance', label: 'Improve athletic performance', description: 'Get faster, stronger, more powerful' },
      { value: 'improve_energy', label: 'Improve energy & focus', description: 'Feel more alert and productive' },
      { value: 'improve_sleep', label: 'Improve sleep', description: 'Rest better and recover faster' },
      { value: 'general_health', label: 'General health', description: 'Feel better overall' },
      { value: 'rehab_recovery', label: 'Rehab / recovery', description: 'Heal and return to activity' },
      { value: 'other', label: 'Other', description: 'Something else entirely' },
    ],
  },
  {
    id: 'desiredOutcomeFocus',
    section: 'Goals',
    sectionIcon: <Target size={18} color={liquidGlass.accent.primary} />,
    question: 'If everything went perfectly, what would change first?',
    subtitle: 'What matters most to you right now?',
    type: 'single',
    options: [
      { value: 'appearance', label: 'How I look', description: 'Physical changes I can see' },
      { value: 'daily_feeling', label: 'How I feel day to day', description: 'Energy, mood, vitality' },
      { value: 'strength_performance', label: 'My strength / performance', description: 'What my body can do' },
      { value: 'discipline_consistency', label: 'My discipline & consistency', description: 'Building lasting habits' },
      { value: 'health_markers', label: 'My health markers', description: 'Blood pressure, cholesterol, etc.' },
    ],
  },
  {
    id: 'fitnessLevel',
    section: 'Current State',
    sectionIcon: <Dumbbell size={18} color={liquidGlass.accent.primary} />,
    question: 'How would you describe your current fitness level?',
    type: 'single',
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
      { value: 'intermediate', label: 'Intermediate', description: 'Some experience, know the basics' },
      { value: 'advanced', label: 'Advanced', description: 'Years of consistent training' },
      { value: 'returning', label: 'Returning after a break', description: 'Getting back into it' },
    ],
  },
  {
    id: 'trainingFrequencyCurrent',
    section: 'Current State',
    sectionIcon: <Dumbbell size={18} color={liquidGlass.accent.primary} />,
    question: 'How often do you currently train?',
    type: 'single',
    options: [
      { value: '0-1', label: '0–1 days/week', description: 'Rarely or never' },
      { value: '2-3', label: '2–3 days/week', description: 'A few times' },
      { value: '4-5', label: '4–5 days/week', description: 'Most days' },
      { value: '6+', label: '6+ days/week', description: 'Almost every day' },
    ],
  },
  {
    id: 'limitationsNotes',
    section: 'Current State',
    sectionIcon: <Dumbbell size={18} color={liquidGlass.accent.primary} />,
    question: 'Any injuries, limitations, or conditions we should respect?',
    subtitle: 'This helps us avoid suggesting movements that might not work for you.',
    type: 'textarea',
    placeholder: 'Describe any limitations, or leave blank if none',
    skippable: true,
    skipText: 'No limitations',
  },
  {
    id: 'nutritionStructureLevel',
    section: 'Nutrition',
    sectionIcon: <Utensils size={18} color={liquidGlass.accent.primary} />,
    question: 'How would you describe your current nutrition habits?',
    type: 'single',
    options: [
      { value: 'very_structured', label: 'Very structured', description: 'I track and plan meals' },
      { value: 'somewhat_mindful', label: 'Somewhat mindful', description: 'I pay attention but do not track' },
      { value: 'inconsistent', label: 'Inconsistent', description: 'It varies a lot' },
      { value: 'not_thinking', label: 'I do not think about it much', description: 'I eat what I feel like' },
    ],
  },
  {
    id: 'dietaryConstraints',
    section: 'Nutrition',
    sectionIcon: <Utensils size={18} color={liquidGlass.accent.primary} />,
    question: 'Any dietary preferences or restrictions?',
    subtitle: 'Select all that apply.',
    type: 'multi',
    options: [
      { value: 'none', label: 'None' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'halal', label: 'Halal' },
      { value: 'kosher', label: 'Kosher' },
      { value: 'lactose_free', label: 'Lactose-free' },
      { value: 'gluten_free', label: 'Gluten-free' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'timeCommitment',
    section: 'Lifestyle',
    sectionIcon: <Clock size={18} color={liquidGlass.accent.primary} />,
    question: 'How much time can you realistically commit most weeks?',
    subtitle: 'Be honest — we will work with what you have.',
    type: 'single',
    options: [
      { value: '<2hrs', label: 'Less than 2 hours', description: 'Very limited time' },
      { value: '2-4hrs', label: '2–4 hours', description: 'A couple sessions' },
      { value: '4-6hrs', label: '4–6 hours', description: 'Regular commitment' },
      { value: '6+hrs', label: '6+ hours', description: 'Lots of availability' },
    ],
  },
  {
    id: 'frictionPoints',
    section: 'Lifestyle',
    sectionIcon: <Clock size={18} color={liquidGlass.accent.primary} />,
    question: 'What usually gets in your way?',
    subtitle: 'Understanding your obstacles helps us support you better.',
    type: 'multi',
    options: [
      { value: 'lack_of_time', label: 'Lack of time' },
      { value: 'low_energy', label: 'Low energy' },
      { value: 'motivation', label: 'Motivation' },
      { value: 'inconsistency', label: 'Inconsistency' },
      { value: 'overthinking', label: 'Overthinking' },
      { value: 'stress', label: 'Stress' },
      { value: 'injuries', label: 'Injuries' },
    ],
  },
  {
    id: 'motivationDrivers',
    section: 'Style',
    sectionIcon: <Heart size={18} color={liquidGlass.accent.primary} />,
    question: 'What helps you stay consistent?',
    subtitle: 'Select what resonates with you.',
    type: 'multi',
    options: [
      { value: 'clear_plans', label: 'Clear plans', description: 'Knowing exactly what to do' },
      { value: 'accountability', label: 'Accountability', description: 'Someone checking in' },
      { value: 'data_metrics', label: 'Data & metrics', description: 'Seeing progress in numbers' },
      { value: 'encouragement', label: 'Encouragement', description: 'Positive reinforcement' },
      { value: 'flexibility', label: 'Flexibility', description: 'Adapting to how I feel' },
      { value: 'challenges', label: 'Challenges', description: 'Goals to work toward' },
    ],
  },
  {
    id: 'reePersonalityPreference',
    section: 'Style',
    sectionIcon: <Heart size={18} color={liquidGlass.accent.primary} />,
    question: 'How do you want Ree to show up for you?',
    subtitle: 'Ree is your companion in this app.',
    type: 'single',
    options: [
      { value: 'coach', label: 'Coach-like', description: 'Direct & structured' },
      { value: 'supportive', label: 'Supportive & encouraging', description: 'Warm & motivating' },
      { value: 'minimal', label: 'Minimal & quiet', description: 'Only when needed' },
      { value: 'data_focused', label: 'Data-focused', description: 'Facts & figures' },
    ],
  },
  {
    id: 'baselineSleep',
    section: 'Recovery Baselines',
    sectionIcon: <Moon size={18} color={liquidGlass.accent.primary} />,
    question: 'How much sleep do you usually get?',
    subtitle: 'This helps us detect when you\'re under-recovered.',
    type: 'single',
    options: [
      { value: '5', label: '5 hours or less', description: 'Chronically short' },
      { value: '6', label: 'About 6 hours', description: 'Below average' },
      { value: '7', label: 'About 7 hours', description: 'Average' },
      { value: '7.5', label: '7-8 hours', description: 'Optimal range' },
      { value: '8', label: '8+ hours', description: 'Well rested' },
    ],
  },
  {
    id: 'baselineHrv',
    section: 'Recovery Baselines',
    sectionIcon: <Activity size={18} color={liquidGlass.accent.primary} />,
    question: 'Do you know your typical HRV?',
    subtitle: 'If you use a smartwatch, this helps us gauge CNS fatigue. Skip if unsure.',
    type: 'single',
    skippable: true,
    skipText: 'I don\'t track HRV',
    options: [
      { value: '30', label: 'Below 30 ms', description: 'Lower range' },
      { value: '40', label: '30-50 ms', description: 'Average' },
      { value: '50', label: '50-70 ms', description: 'Good' },
      { value: '70', label: '70+ ms', description: 'Excellent' },
    ],
  },
  {
    id: 'confirmation',
    section: 'Confirmation',
    sectionIcon: <Check size={18} color={liquidGlass.accent.primary} />,
    question: 'Does this feel accurate for where you are right now?',
    subtitle: 'You can always refine this later in your profile.',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes, let\'s go', description: 'Ready to start' },
      { value: 'mostly', label: 'Mostly', description: 'Good enough for now' },
    ],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const { signInWithApple, signInWithGoogle, appleAuthAvailable, isAuthenticated, user } = useAuth();
  const { connectPlatform, isConnected: isHealthConnected } = useHealth();
  
  const [phase, setPhase] = useState<'welcome' | 'auth' | 'health_connect' | 'questionnaire' | 'ree_intro' | 'disclaimer'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({
    primaryGoals: [],
    dietaryConstraints: [],
    frictionPoints: [],
    motivationDrivers: [],
  });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isConnectingHealth, setIsConnectingHealth] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const animateTransition = useCallback((direction: 'next' | 'prev', callback: () => void) => {
    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toValue * 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH * 0.3 : -SCREEN_WIDTH * 0.3);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const animateProgress = useCallback((toValue: number) => {
    Animated.spring(progressAnim, {
      toValue,
      tension: 40,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      animateTransition('next', () => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, QUESTIONS.length - 1));
        animateProgress((currentQuestionIndex + 2) / TOTAL_QUESTIONS);
      });
    } else {
      setPhase('ree_intro');
    }
  }, [currentQuestionIndex, animateTransition, animateProgress]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentQuestionIndex > 0) {
      animateTransition('prev', () => {
        setCurrentQuestionIndex(prev => prev - 1);
        animateProgress(currentQuestionIndex / TOTAL_QUESTIONS);
      });
    } else {
      setPhase('health_connect');
    }
  }, [currentQuestionIndex, animateTransition, animateProgress]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleNext();
  }, [handleNext]);

  const handleSingleSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    
    setTimeout(() => {
      handleNext();
    }, 300);
  }, [currentQuestion, handleNext]);

  const handleMultiSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setAnswers(prev => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      const maxSelections = currentQuestion.maxSelections;
      
      if (value === 'none') {
        return { ...prev, [currentQuestion.id]: ['none'] };
      }
      
      const withoutNone = current.filter(v => v !== 'none');
      
      if (withoutNone.includes(value)) {
        return { ...prev, [currentQuestion.id]: withoutNone.filter(v => v !== value) };
      } else {
        if (maxSelections && withoutNone.length >= maxSelections) {
          return prev;
        }
        return { ...prev, [currentQuestion.id]: [...withoutNone, value] };
      }
    });
  }, [currentQuestion]);

  const handleTextChange = useCallback((value: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion]);

  const handleNumberChange = useCallback((value: string) => {
    if (!currentQuestion) return;
    const num = parseInt(value, 10);
    if (!isNaN(num) || value === '') {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: value === '' ? '' : num }));
    }
  }, [currentQuestion]);

  const canProceed = useCallback(() => {
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.skippable) return true;
    if (currentQuestion.type === 'multi') {
      return Array.isArray(answer) && answer.length > 0;
    }
    if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea') {
      return typeof answer === 'string' && answer.trim().length > 0;
    }
    if (currentQuestion.type === 'number') {
      return typeof answer === 'number' && answer > 0;
    }
    return !!answer;
  }, [answers, currentQuestion]);

  const handleAppleSignIn = async () => {
    setIsSigningIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signInWithApple();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConnectHealth = async (platform: HealthPlatform) => {
    setIsConnectingHealth(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await connectPlatform(platform);
    } finally {
      setIsConnectingHealth(false);
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const questionnaireProfile: QuestionnaireProfile = {
      preferredName: answers.preferredName as string | undefined,
      age: typeof answers.age === 'number' ? answers.age : undefined,
      biologicalSex: answers.biologicalSex as BiologicalSex | undefined,
      primaryGoals: (answers.primaryGoals as PrimaryGoal[]) || [],
      desiredOutcomeFocus: answers.desiredOutcomeFocus as DesiredOutcomeFocus | undefined,
      fitnessLevel: answers.fitnessLevel as FitnessLevel | undefined,
      trainingFrequencyCurrent: answers.trainingFrequencyCurrent as TrainingFrequencyCurrent | undefined,
      limitationsNotes: answers.limitationsNotes as string | undefined,
      nutritionStructureLevel: answers.nutritionStructureLevel as NutritionStructureLevel | undefined,
      dietaryConstraints: (answers.dietaryConstraints as DietaryConstraint[]) || [],
      timeCommitment: answers.timeCommitment as TimeCommitment | undefined,
      frictionPoints: (answers.frictionPoints as FrictionPoint[]) || [],
      motivationDrivers: (answers.motivationDrivers as MotivationDriver[]) || [],
      reePersonalityPreference: answers.reePersonalityPreference as ReePersonalityPreference | undefined,
      completedAt: new Date().toISOString(),
    };

    const hasInjury = !!answers.limitationsNotes && (answers.limitationsNotes as string).toLowerCase().includes('knee');
    
    const baselineSleep = answers.baselineSleep ? parseFloat(answers.baselineSleep as string) : 7.5;
    const baselineHrv = answers.baselineHrv ? parseInt(answers.baselineHrv as string, 10) : 50;

    const profile: UserProfile = {
      injuryType: hasInjury ? 'general_pain' : 'general_pain',
      painTolerance: 'medium',
      trainingStyle: 'general',
      sportType: 'gym',
      weeklyFrequency: getWeeklyFrequency(answers.trainingFrequencyCurrent as TrainingFrequencyCurrent),
      onboardingCompleted: true,
      baselineSleep,
      baselineHrv,
      goal: 'GENERAL',
      questionnaireProfile,
      aiPreferences: {
        explanationDepth: answers.reePersonalityPreference === 'data_focused' ? 'applied_science' : 'simple',
      },
    };

    await completeOnboarding(profile);
    router.replace('/(tabs)');
  };

  const getWeeklyFrequency = (freq?: TrainingFrequencyCurrent): number => {
    switch (freq) {
      case '0-1': return 2;
      case '2-3': return 3;
      case '4-5': return 4;
      case '6+': return 5;
      default: return 3;
    }
  };

  const handleSkipOnboarding = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const defaultProfile: UserProfile = {
      injuryType: 'general_pain',
      painTolerance: 'medium',
      trainingStyle: 'general',
      sportType: 'gym',
      weeklyFrequency: 3,
      onboardingCompleted: true,
      baselineSleep: 7.5,
      baselineHrv: 50,
      goal: 'GENERAL',
      questionnaireProfile: {
        completedAt: new Date().toISOString(),
        primaryGoals: [],
        dietaryConstraints: [],
        frictionPoints: [],
        motivationDrivers: [],
      },
      aiPreferences: {
        explanationDepth: 'simple',
      },
    };

    await completeOnboarding(defaultProfile);
    router.replace('/(tabs)');
  };

  const renderWelcome = () => (
    <View style={styles.welcomeContainer}>
      <TouchableOpacity 
        style={styles.skipOnboardingButton}
        onPress={handleSkipOnboarding}
        activeOpacity={0.7}
      >
        <Text style={styles.skipOnboardingText}>Skip</Text>
      </TouchableOpacity>
      
      <View style={styles.welcomeContent}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={liquidGlass.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <View style={styles.logoInner}>
              <Sparkles size={36} color={liquidGlass.accent.primary} />
            </View>
          </LinearGradient>
          <View style={styles.logoGlow} />
        </Animated.View>
        
        <Text style={styles.welcomeTitle}>Welcome to Reebound</Text>
        <Text style={styles.welcomeSubtitle}>
          Movement + recovery, built around you.
        </Text>
        
        <View style={styles.welcomeFeatures}>
          {[
            { icon: Target, text: 'Understand your goals' },
            { icon: Dumbbell, text: 'Personalized approach' },
            { icon: Heart, text: 'Adaptive to your life' },
          ].map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <item.icon size={20} color={liquidGlass.accent.primary} />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.welcomeNote}>
          A few quick questions to get started.{'\n'}Takes about 3 minutes.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setPhase('auth');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={liquidGlass.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Let&apos;s Begin</Text>
          <ChevronRight size={20} color={liquidGlass.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderAuthScreen = () => (
    <View style={styles.authContainer}>
      <TouchableOpacity 
        style={styles.skipOnboardingButton}
        onPress={() => setPhase('health_connect')}
        activeOpacity={0.7}
      >
        <Text style={styles.skipOnboardingText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.authContent}>
        <View style={styles.authIconContainer}>
          <LinearGradient
            colors={liquidGlass.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.authIconCircle}
          >
            <User size={32} color={liquidGlass.text.inverse} />
          </LinearGradient>
        </View>

        <Text style={styles.authTitle}>Connect Your Account</Text>
        <Text style={styles.authSubtitle}>
          Sign in to sync your progress across devices and never lose your data.
        </Text>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && appleAuthAvailable && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleSignIn}
              disabled={isSigningIn}
              activeOpacity={0.8}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.appleIconContainer}>
                  <Text style={styles.appleIcon}></Text>
                </View>
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            <View style={styles.socialButtonContent}>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isAuthenticated && user && (
          <View style={styles.authSuccess}>
            <Check size={20} color={liquidGlass.status.success} />
            <Text style={styles.authSuccessText}>
              Signed in as {user.displayName || user.email || 'User'}
            </Text>
          </View>
        )}

        <Text style={styles.authNote}>
          Your data stays private. We never share your information.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setPhase('health_connect');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={liquidGlass.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight size={20} color={liquidGlass.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHealthConnectScreen = () => (
    <View style={styles.authContainer}>
      <TouchableOpacity 
        style={styles.skipOnboardingButton}
        onPress={() => {
          setPhase('questionnaire');
          animateProgress(1 / TOTAL_QUESTIONS);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.skipOnboardingText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.authContent}>
        <View style={styles.authIconContainer}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8A65']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.authIconCircle}
          >
            <Activity size={32} color={liquidGlass.text.primary} />
          </LinearGradient>
        </View>

        <Text style={styles.authTitle}>Connect Health Data</Text>
        <Text style={styles.authSubtitle}>
          Link your fitness tracker to get personalized recovery insights and smarter training recommendations.
        </Text>

        <View style={styles.authButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.healthButton}
              onPress={() => handleConnectHealth('apple_health')}
              disabled={isConnectingHealth}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF2D55', '#FF375F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.healthButtonGradient}
              >
                <Heart size={24} color="#FFF" />
                <Text style={styles.healthButtonText}>Connect Apple Health</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {Platform.OS === 'android' && (
            <TouchableOpacity
              style={styles.healthButton}
              onPress={() => handleConnectHealth('google_fit')}
              disabled={isConnectingHealth}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4285F4', '#34A853']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.healthButtonGradient}
              >
                <Activity size={24} color="#FFF" />
                <Text style={styles.healthButtonText}>Connect Google Fit</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {Platform.OS === 'web' && (
            <View style={styles.webHealthNote}>
              <Smartphone size={24} color={liquidGlass.text.tertiary} />
              <Text style={styles.webHealthNoteText}>
                Health data sync is available on mobile devices. You can connect later in Settings.
              </Text>
            </View>
          )}
        </View>

        {isHealthConnected && (
          <View style={styles.authSuccess}>
            <Check size={20} color={liquidGlass.status.success} />
            <Text style={styles.authSuccessText}>Health data connected!</Text>
          </View>
        )}

        <View style={styles.healthBenefits}>
          <Text style={styles.healthBenefitsTitle}>What we&apos;ll use:</Text>
          <View style={styles.healthBenefitItem}>
            <View style={styles.healthBenefitDot} />
            <Text style={styles.healthBenefitText}>Steps & activity to gauge daily load</Text>
          </View>
          <View style={styles.healthBenefitItem}>
            <View style={styles.healthBenefitDot} />
            <Text style={styles.healthBenefitText}>Sleep duration for recovery analysis</Text>
          </View>
          <View style={styles.healthBenefitItem}>
            <View style={styles.healthBenefitDot} />
            <Text style={styles.healthBenefitText}>Heart rate data for readiness scores</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setPhase('questionnaire');
          animateProgress(1 / TOTAL_QUESTIONS);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={liquidGlass.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight size={20} color={liquidGlass.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View 
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</Text>
    </View>
  );

  const renderQuestion = () => {
    const answer = answers[currentQuestion.id];
    
    return (
      <Animated.View 
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.sectionBadge}>
          {currentQuestion.sectionIcon}
          <Text style={styles.sectionLabel}>{currentQuestion.section}</Text>
        </View>
        
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.subtitle && (
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
        )}

        <ScrollView 
          style={styles.optionsScroll} 
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
        >
          {currentQuestion.type === 'text' && (
            <TextInput
              style={styles.textInput}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={liquidGlass.text.tertiary}
              value={(answer as string) || ''}
              onChangeText={handleTextChange}
              autoFocus
            />
          )}

          {currentQuestion.type === 'number' && (
            <TextInput
              style={styles.numberInput}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={liquidGlass.text.tertiary}
              value={answer !== undefined ? String(answer) : ''}
              onChangeText={handleNumberChange}
              keyboardType="number-pad"
              autoFocus
            />
          )}

          {currentQuestion.type === 'textarea' && (
            <TextInput
              style={styles.textareaInput}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={liquidGlass.text.tertiary}
              value={(answer as string) || ''}
              onChangeText={handleTextChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}

          {currentQuestion.type === 'single' && currentQuestion.options?.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                answer === option.value && styles.optionCardSelected,
              ]}
              onPress={() => handleSingleSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  answer === option.value && styles.optionLabelSelected,
                ]}>
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={[
                    styles.optionDescription,
                    answer === option.value && styles.optionDescriptionSelected,
                  ]}>
                    {option.description}
                  </Text>
                )}
              </View>
              <View style={[
                styles.optionRadio,
                answer === option.value && styles.optionRadioSelected,
              ]}>
                {answer === option.value && (
                  <Check size={14} color={liquidGlass.text.inverse} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {currentQuestion.type === 'multi' && currentQuestion.options?.map((option) => {
            const selected = Array.isArray(answer) && answer.includes(option.value);
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  selected && styles.optionCardSelected,
                ]}
                onPress={() => handleMultiSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionLabel,
                    selected && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text style={[
                      styles.optionDescription,
                      selected && styles.optionDescriptionSelected,
                    ]}>
                      {option.description}
                    </Text>
                  )}
                </View>
                <View style={[
                  styles.optionCheckbox,
                  selected && styles.optionCheckboxSelected,
                ]}>
                  {selected && <Check size={14} color={liquidGlass.text.inverse} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderQuestionNavigation = () => (
    <View style={styles.navigationContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ChevronLeft size={20} color={liquidGlass.text.secondary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.navRight}>
        {currentQuestion.skippable && (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>{currentQuestion.skipText || 'Skip'}</Text>
          </TouchableOpacity>
        )}

        {(currentQuestion.type === 'text' || currentQuestion.type === 'number' || currentQuestion.type === 'textarea' || currentQuestion.type === 'multi') && (
          <TouchableOpacity 
            style={[
              styles.nextButton,
              !canProceed() && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finish' : 'Continue'}
            </Text>
            <ChevronRight size={18} color={liquidGlass.text.inverse} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderReeIntro = () => (
    <View style={styles.reeIntroContainer}>
      <View style={styles.reeIntroContent}>
        <Animated.View style={[styles.reeAvatarLarge, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={liquidGlass.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reeAvatarGradient}
          >
            <Sparkles size={40} color={liquidGlass.text.inverse} />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.reeIntroTitle}>Thanks — I have got a clear picture now.</Text>
        <Text style={styles.reeIntroSubtitle}>
          Let&apos;s build this around you.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>What I learned:</Text>
          
          {answers.preferredName && (
            <Text style={styles.summaryItem}>
              • I will call you {answers.preferredName as string}
            </Text>
          )}
          
          {(answers.primaryGoals as string[])?.length > 0 && (
            <Text style={styles.summaryItem}>
              • Your focus: {(answers.primaryGoals as string[]).map(g => 
                g.replace(/_/g, ' ')
              ).slice(0, 2).join(', ')}
            </Text>
          )}
          
          {answers.fitnessLevel && (
            <Text style={styles.summaryItem}>
              • Level: {(answers.fitnessLevel as string).replace(/_/g, ' ')}
            </Text>
          )}
          
          {answers.timeCommitment && (
            <Text style={styles.summaryItem}>
              • Time: {answers.timeCommitment as string} per week
            </Text>
          )}

          {answers.reePersonalityPreference && (
            <Text style={styles.summaryItem}>
              • I will be {answers.reePersonalityPreference === 'coach' ? 'direct & structured' : 
                answers.reePersonalityPreference === 'supportive' ? 'warm & encouraging' :
                answers.reePersonalityPreference === 'minimal' ? 'quiet & available' : 'data-focused'}
            </Text>
          )}

          {isHealthConnected && (
            <Text style={styles.summaryItem}>
              • Health data synced for smarter insights
            </Text>
          )}
        </View>

        <Text style={styles.reeIntroNote}>
          Everything adapts as you go.{'\n'}This is just the starting point.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => setPhase('disclaimer')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={liquidGlass.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight size={20} color={liquidGlass.text.inverse} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderDisclaimer = () => (
    <View style={styles.disclaimerContainer}>
      <View style={styles.disclaimerContent}>
        <View style={styles.disclaimerIconWrapper}>
          <ShieldAlert size={36} color={liquidGlass.accent.primary} />
        </View>
        
        <Text style={styles.disclaimerTitle}>One Last Thing</Text>
        
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Reebound provides general fitness guidance and is not a substitute for medical advice, diagnosis, or treatment.
          </Text>
          <Text style={styles.disclaimerText}>
            Always consult your healthcare provider before starting any exercise program. If you experience sharp pain, stop immediately and seek professional help.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDisclaimerAccepted(!disclaimerAccepted);
          }}
        >
          <View style={[styles.checkbox, disclaimerAccepted && styles.checkboxChecked]}>
            {disclaimerAccepted && <Check size={16} color={liquidGlass.text.inverse} />}
          </View>
          <Text style={styles.checkboxLabel}>I understand and accept</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, !disclaimerAccepted && styles.disabledButton]}
        onPress={handleComplete}
        disabled={!disclaimerAccepted}
      >
        <LinearGradient
          colors={disclaimerAccepted ? liquidGlass.gradients.button : ['#555', '#444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>BEGIN MY JOURNEY</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={liquidGlass.background.gradient}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {phase === 'welcome' && renderWelcome()}
        {phase === 'auth' && renderAuthScreen()}
        {phase === 'health_connect' && renderHealthConnectScreen()}
        
        {phase === 'questionnaire' && (
          <View style={styles.questionnaireContainer}>
            {renderProgressBar()}
            {renderQuestion()}
            {renderQuestionNavigation()}
          </View>
        )}
        
        {phase === 'ree_intro' && renderReeIntro()}
        {phase === 'disclaimer' && renderDisclaimer()}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: liquidGlass.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  skipOnboardingButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipOnboardingText: {
    fontSize: 15,
    color: liquidGlass.text.tertiary,
    fontWeight: '500' as const,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: liquidGlass.border.glass,
  },
  logoInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: liquidGlass.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: liquidGlass.accent.glow,
    top: -20,
    left: -20,
    zIndex: -1,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  welcomeFeatures: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: liquidGlass.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: liquidGlass.text.primary,
    fontWeight: '500' as const,
  },
  welcomeNote: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    ...glassShadows.glow,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: liquidGlass.text.inverse,
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  
  authContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  authContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authIconContainer: {
    marginBottom: 24,
  },
  authIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  authButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: '#000',
    borderRadius: 14,
    overflow: 'hidden',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  appleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    fontSize: 20,
    color: '#FFF',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#333',
  },
  authSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: liquidGlass.status.successMuted,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  authSuccessText: {
    fontSize: 14,
    color: liquidGlass.status.success,
    fontWeight: '500' as const,
  },
  authNote: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
  },

  healthButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  healthButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  healthButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  webHealthNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: liquidGlass.surface.glass,
    padding: 16,
    borderRadius: 12,
  },
  webHealthNoteText: {
    flex: 1,
    fontSize: 14,
    color: liquidGlass.text.secondary,
    lineHeight: 20,
  },
  healthBenefits: {
    width: '100%',
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  healthBenefitsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: liquidGlass.text.secondary,
    marginBottom: 12,
  },
  healthBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  healthBenefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: liquidGlass.accent.primary,
  },
  healthBenefitText: {
    fontSize: 14,
    color: liquidGlass.text.primary,
  },

  questionnaireContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: liquidGlass.accent.muted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: liquidGlass.accent.primary,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 8,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  questionSubtitle: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 20,
    gap: 12,
  },
  textInput: {
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 17,
    color: liquidGlass.text.primary,
  },
  numberInput: {
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    width: 120,
    alignSelf: 'center',
  },
  textareaInput: {
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: liquidGlass.text.primary,
    minHeight: 120,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  optionCardSelected: {
    backgroundColor: liquidGlass.accent.muted,
    borderColor: liquidGlass.accent.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: liquidGlass.accent.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: liquidGlass.text.secondary,
  },
  optionDescriptionSelected: {
    color: liquidGlass.accent.secondary,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: liquidGlass.border.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  optionRadioSelected: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  optionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: liquidGlass.border.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  optionCheckboxSelected: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: liquidGlass.background.primary,
    borderTopWidth: 1,
    borderTopColor: liquidGlass.border.subtle,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    marginLeft: 4,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 15,
    color: liquidGlass.text.tertiary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.accent.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 4,
  },
  nextButtonDisabled: {
    backgroundColor: liquidGlass.surface.glass,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: liquidGlass.text.inverse,
  },
  reeIntroContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  reeIntroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reeAvatarLarge: {
    marginBottom: 24,
  },
  reeAvatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassShadows.glowStrong,
  },
  reeIntroTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  reeIntroSubtitle: {
    fontSize: 17,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: liquidGlass.accent.primary,
    marginBottom: 16,
  },
  summaryItem: {
    fontSize: 15,
    color: liquidGlass.text.primary,
    lineHeight: 24,
    marginBottom: 4,
  },
  reeIntroNote: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  disclaimerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  disclaimerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  disclaimerIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: liquidGlass.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  disclaimerBox: {
    backgroundColor: liquidGlass.surface.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  disclaimerText: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: liquidGlass.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: liquidGlass.accent.primary,
    backgroundColor: liquidGlass.accent.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: liquidGlass.text.primary,
    fontWeight: '500' as const,
  },
});
