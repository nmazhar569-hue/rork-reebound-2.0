import { router } from 'expo-router';
import { Sparkles, Check, ChevronRight, ChevronLeft, ShieldAlert, User, Target, Dumbbell, Utensils, Clock, Heart, Moon, Activity } from 'lucide-react-native';
import React, { useState, useRef, useCallback } from 'react';
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
import { useApp } from '@/contexts/AppContext';
import { VoidBackground } from '@/components/VoidBackground';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { ReeOnboardingHeader } from '@/components/onboarding/ReeOnboardingHeader';
import { haptics } from '@/utils/haptics';
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
  const { completeOnboarding } = useApp();
  const [phase, setPhase] = useState<'welcome' | 'questionnaire' | 'ree_intro' | 'disclaimer'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({
    primaryGoals: [],
    dietaryConstraints: [],
    frictionPoints: [],
    motivationDrivers: [],
  });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [reeMessage, setReeMessage] = useState("Let's start with the basics. How should I address you?");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  const animateTransition = useCallback((direction: 'next' | 'prev', callback: () => void) => {
    const toValue = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toValue * 0.2,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH * 0.2 : -SCREEN_WIDTH * 0.2);
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

  const updateReeMessage = useCallback((nextIndex: number, currentAnswers: any) => {
    const nextQ = QUESTIONS[nextIndex];
    let msg = "";

    // Dynamic logic based on previous answers or current step
    switch (nextQ.id) {
      case 'age':
        msg = `Nice to meet you, ${currentAnswers.preferredName || 'there'}. How old are you?`;
        break;
      case 'biologicalSex':
        msg = "Got it. This helps me estimate your recovery needs.";
        break;
      case 'primaryGoals':
        msg = "Now, what's driving you? Pick what matters most.";
        break;
      case 'desiredOutcomeFocus':
        const goals = currentAnswers.primaryGoals || [];
        if (goals.includes('build_muscle')) msg = "Muscle building—solid goal. We'll focus on strength and hypertrophy.";
        else if (goals.includes('lose_fat')) msg = "Fat loss—we'll balance nutrition and training for this.";
        else msg = "Solid goals. Now, what does success look like to you?";
        break;
      case 'fitnessLevel':
        msg = "Knowing your history helps me pace your first week.";
        break;
      case 'trainingFrequencyCurrent':
        const level = currentAnswers.fitnessLevel;
        if (level === 'beginner') msg = "Everyone starts somewhere. We'll build a strong foundation.";
        else if (level === 'advanced') msg = "Advanced lifter. We'll focus on periodization.";
        else msg = "Consistency is key. How often are you training now?";
        break;
      case 'limitationsNotes':
        msg = "Safety first. Any injuries or limits I should know about?";
        break;
      case 'nutritionStructureLevel':
        msg = "Nutrition fuels performance. How are you eating currently?";
        break;
      case 'dietaryConstraints':
        msg = "I can adapt meal suggestions to any preference.";
        break;
      case 'timeCommitment':
        msg = "Let's make this fit your schedule, not the other way around.";
        break;
      case 'frictionPoints':
        msg = "Knowing your obstacles helps me help you overcome them.";
        break;
      case 'motivationDrivers':
        msg = "What keeps you going when things get tough?";
        break;
      case 'reePersonalityPreference':
        msg = "I'm your companion. How do you want me to show up?";
        break;
      case 'baselineSleep':
        msg = "Recovery is half the battle. How do you usually sleep?";
        break;
      case 'baselineHrv':
        msg = "HRV gives us a window into your nervous system. Skip if unsure.";
        break;
      case 'confirmation':
        msg = "Almost there. Does this look right?";
        break;
      default:
        msg = nextQ.subtitle || "Tell me a bit more.";
    }
    setReeMessage(msg);
  }, []);

  const handleNext = useCallback(() => {
    haptics.light();

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      animateTransition('next', () => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(prev => Math.min(prev + 1, QUESTIONS.length - 1));
        animateProgress((currentQuestionIndex + 2) / TOTAL_QUESTIONS);
        updateReeMessage(nextIndex, answers);
      });
    } else {
      setPhase('ree_intro');
    }
  }, [currentQuestionIndex, animateTransition, animateProgress, answers, updateReeMessage]);

  const handleBack = useCallback(() => {
    haptics.light();

    if (currentQuestionIndex > 0) {
      animateTransition('prev', () => {
        setCurrentQuestionIndex(prev => prev - 1);
        animateProgress(currentQuestionIndex / TOTAL_QUESTIONS);
      });
    } else {
      setPhase('welcome');
    }
  }, [currentQuestionIndex, animateTransition, animateProgress]);

  const handleSkip = useCallback(() => {
    haptics.light();
    handleNext();
  }, [handleNext]);

  const handleSingleSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    haptics.light();
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));

    setTimeout(() => {
      handleNext();
    }, 300);
  }, [currentQuestion, handleNext]);

  const handleMultiSelect = useCallback((value: string) => {
    if (!currentQuestion) return;
    haptics.light();

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

  const handleComplete = async () => {
    haptics.success();

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
    haptics.light();

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
      >
        <Text style={styles.skipOnboardingText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.welcomeContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: liquidGlass.accent.primary }]}>
            <Dumbbell size={40} color={liquidGlass.text.inverse} />
          </View>
        </View>

        <Text style={styles.welcomeTitle}>Welcome</Text>
        <Text style={styles.welcomeSubtitle}>
          Personalized training + recovery, built around you.
        </Text>

        <View style={styles.welcomeFeatures}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Target size={20} color={liquidGlass.accent.primary} />
            </View>
            <Text style={styles.featureText}>Understand your goals</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Dumbbell size={20} color={liquidGlass.accent.primary} />
            </View>
            <Text style={styles.featureText}>Personalized approach</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Heart size={20} color={liquidGlass.accent.primary} />
            </View>
            <Text style={styles.featureText}>Adaptive to your life</Text>
          </View>
        </View>

        <Text style={styles.welcomeNote}>
          Let's set up your profile to optimize your results.{'\n'}Takes about 3 minutes.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryActionBtn}
        onPress={() => {
          haptics.medium();
          setPhase('questionnaire');
          animateProgress(1 / TOTAL_QUESTIONS);
        }}
      >
        <Text style={styles.primaryActionText}>Get Started</Text>
        <ChevronRight size={20} color={liquidGlass.text.inverse} />
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
          <Text style={styles.sectionLabel}>{currentQuestion.section.toUpperCase()}</Text>
        </View>

        {/* Ree Header Added Here */}
        <ReeOnboardingHeader message={reeMessage} />

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
                  <Check size={14} color="#000" strokeWidth={3} />
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
                  {selected && <Check size={14} color="#000" strokeWidth={3} />}
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
      >
        <ChevronLeft size={20} color={liquidGlass.text.secondary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.navRight}>
        {currentQuestion.skippable && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
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
        <View style={styles.reeAvatarLarge}>
          <Sparkles size={44} color={liquidGlass.text.inverse} />
        </View>

        <Text style={styles.reeIntroTitle}>All systems clear.</Text>
        <Text style={styles.reeIntroSubtitle}>
          I've calibrated your profile.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>PROFILE SUMMARY</Text>

          <View style={styles.summaryList}>
            {answers.preferredName && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>
                  Calibrated for <Text style={styles.summaryHighlight}>{answers.preferredName as string}</Text>
                </Text>
              </View>
            )}

            {(answers.primaryGoals as string[])?.length > 0 && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>
                  Focusing on <Text style={styles.summaryHighlight}>{(answers.primaryGoals as string[]).map(g => g.replace(/_/g, ' ')).slice(0, 2).join(' & ')}</Text>
                </Text>
              </View>
            )}

            {answers.fitnessLevel && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>
                  Status: <Text style={styles.summaryHighlight}>{(answers.fitnessLevel as string).replace(/_/g, ' ')}</Text>
                </Text>
              </View>
            )}

            {answers.reePersonalityPreference && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryDot} />
                <Text style={styles.summaryText}>
                  Voice: <Text style={styles.summaryHighlight}>{
                    answers.reePersonalityPreference === 'coach' ? 'Direct & Structured' :
                      answers.reePersonalityPreference === 'supportive' ? 'Encouraging' :
                        answers.reePersonalityPreference === 'minimal' ? 'Minimal' : 'Data-Focused'
                  }</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.reeIntroNote}>
          You can refine these levels at any time in your command center.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryActionBtn}
        onPress={() => {
          haptics.medium();
          setPhase('disclaimer');
        }}
      >
        <Text style={styles.primaryActionText}>Final Step</Text>
        <ChevronRight size={20} color={liquidGlass.text.inverse} />
      </TouchableOpacity>
    </View>
  );

  const renderDisclaimer = () => (
    <View style={styles.disclaimerContainer}>
      <View style={styles.disclaimerContent}>
        <View style={styles.disclaimerIconWrapper}>
          <ShieldAlert size={40} color={liquidGlass.status.warning} />
        </View>

        <Text style={styles.disclaimerTitle}>Safety Protocol</Text>

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
            haptics.light();
            setDisclaimerAccepted(!disclaimerAccepted);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, disclaimerAccepted && styles.checkboxChecked]}>
            {disclaimerAccepted && <Check size={16} color="#000" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>I understand and accept the above</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryActionBtn, !disclaimerAccepted && styles.disabledButton]}
        onPress={handleComplete}
        disabled={!disclaimerAccepted}
      >
        <Text style={styles.primaryActionText}>COMMAND START</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <VoidBackground>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {phase === 'welcome' && renderWelcome()}

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
    </VoidBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    padding: 24,
    paddingTop: glassLayout.screenPaddingTop,
    justifyContent: 'space-between',
  },
  skipOnboardingButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: liquidGlass.surface.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  skipOnboardingText: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    fontWeight: '600' as const,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...glassShadows.glow,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: liquidGlass.text.primary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  welcomeFeatures: {
    width: '100%',
    gap: 12,
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.soft,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: liquidGlass.accent.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 17,
    color: liquidGlass.text.primary,
    fontWeight: '600' as const,
  },
  welcomeNote: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryActionBtn: {
    backgroundColor: liquidGlass.accent.primary,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: liquidGlass.text.inverse,
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: liquidGlass.text.tertiary,
    opacity: 0.5,
  },
  questionnaireContainer: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: glassLayout.screenPaddingTop,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 5,
    backgroundColor: liquidGlass.border.glassLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: liquidGlass.accent.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: liquidGlass.text.tertiary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: liquidGlass.accent.primary,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 10,
    lineHeight: 36,
    letterSpacing: -0.8,
  },
  questionSubtitle: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 40,
    gap: 12,
  },
  textInput: {
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
    fontSize: 18,
    color: liquidGlass.text.primary,
  },
  numberInput: {
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    fontSize: 32,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    width: 140,
    alignSelf: 'center',
  },
  textareaInput: {
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
    fontSize: 17,
    color: liquidGlass.text.primary,
    minHeight: 140,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.surface.card,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    ...glassShadows.soft,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderColor: liquidGlass.accent.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: liquidGlass.accent.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: liquidGlass.text.secondary,
  },
  optionRadio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: liquidGlass.border.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  optionRadioSelected: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  optionCheckbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: liquidGlass.border.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
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
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    borderTopWidth: 1,
    borderTopColor: liquidGlass.border.glassLight,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.secondary,
    marginLeft: 6,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 15,
    color: liquidGlass.text.tertiary,
    fontWeight: '600' as const,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: liquidGlass.accent.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: liquidGlass.text.tertiary,
    opacity: 0.3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: liquidGlass.text.inverse,
  },
  reeIntroContainer: {
    flex: 1,
    padding: 24,
    paddingTop: glassLayout.screenPaddingTop,
    justifyContent: 'space-between',
  },
  reeIntroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reeAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    ...glassShadows.glow,
  },
  reeIntroTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  reeIntroSubtitle: {
    fontSize: 18,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    marginBottom: 32,
    ...glassShadows.soft,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: liquidGlass.accent.primary,
    marginBottom: 20,
    letterSpacing: 2,
  },
  summaryList: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: liquidGlass.accent.primary,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    lineHeight: 24,
    flex: 1,
  },
  summaryHighlight: {
    color: liquidGlass.text.primary,
    fontWeight: '700' as const,
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
    paddingTop: glassLayout.screenPaddingTop,
    justifyContent: 'space-between',
  },
  disclaimerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  disclaimerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: liquidGlass.status.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  disclaimerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: liquidGlass.text.primary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -1,
  },
  disclaimerBox: {
    backgroundColor: liquidGlass.surface.card,
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.soft,
  },
  disclaimerText: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: liquidGlass.border.glassMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: liquidGlass.accent.primary,
    backgroundColor: liquidGlass.accent.primary,
  },
  checkboxLabel: {
    fontSize: 17,
    color: liquidGlass.text.primary,
    fontWeight: '600' as const,
  },
});
