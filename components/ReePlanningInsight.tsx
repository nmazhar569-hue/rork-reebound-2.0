import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Sparkles, X, ChevronDown, ChevronUp, MessageCircle, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Workout, IntentProfile } from '@/types';
import * as Haptics from 'expo-haptics';

interface PlanningInsight {
  id: string;
  type: 'session_suggestion' | 'recovery_link' | 'intent_alignment' | 'readiness_note';
  title: string;
  message: string;
  expandedMessage?: string;
  reason: string;
  relatedSessionType?: string;
  priority: number;
}

interface ReePlanningInsightProps {
  todayWorkout?: Workout | null;
  onDismiss?: () => void;
}

const getIntentAlignmentMessage = (intent: IntentProfile | undefined): string | null => {
  if (!intent) return null;
  
  const intentMessages: Record<string, string> = {
    recover_from_injury: "recovery and rebuilding tissue tolerance",
    return_to_training: "gradually re-establishing training capacity",
    maintain_without_pain: "keeping you active while respecting your body's signals",
    understand_body: "learning how your body responds to different movements",
    train_with_confidence: "building trust in your movement again",
    general_fitness: "sustainable progress at your own pace",
  };
  
  return intentMessages[intent.primaryIntent] || null;
};

const generatePlanningInsights = (
  userProfile: ReturnType<typeof useApp>['userProfile'],
  todayWorkout: Workout | null | undefined,
  todayReadiness: ReturnType<typeof useApp>['getTodayReadiness'],
  returnStatus: ReturnType<typeof useApp>['getReturnStatus'],
  recommendedIntensity: { intensity: string; reason: string }
): PlanningInsight[] => {
  const insights: PlanningInsight[] = [];
  const readiness = todayReadiness();
  const { isReturning, daysAway } = returnStatus();
  
  if (!userProfile) return insights;

  const intentMessage = getIntentAlignmentMessage(userProfile.intentProfile);
  
  if (isReturning && daysAway >= 3) {
    insights.push({
      id: 'return-gentle',
      type: 'readiness_note',
      title: 'Welcome back',
      message: daysAway <= 7 
        ? `It's been a few days. A gentler start is one option — your body will find its rhythm again.`
        : `Good to see you. Starting with lower volume or recovery work can help your body re-engage at its own pace.`,
      expandedMessage: "Time away isn't lost. Your body adapts to where you are now. There's no catching up to do — just continuing from here.",
      reason: `gradual re-entry supports tissue readaptation`,
      priority: 0,
    });
  }

  if (readiness && readiness.painLevel >= 4) {
    insights.push({
      id: 'pain-aware-option',
      type: 'recovery_link',
      title: 'Listening to today',
      message: `Pain is higher today. Recovery work or lighter intensity are options that let you stay active while respecting what your body is communicating.`,
      expandedMessage: "Pain is information, not failure. Adjusting based on how you feel today is part of the process, not a detour from it.",
      reason: `working with your body's signals supports lasting progress`,
      priority: 1,
    });
  }

  if (recommendedIntensity.intensity === 'light' || recommendedIntensity.intensity === 'moderate') {
    insights.push({
      id: 'intensity-suggestion',
      type: 'session_suggestion',
      title: 'Today\'s pace',
      message: `A ${recommendedIntensity.intensity} session could work well with how you're feeling today.`,
      expandedMessage: recommendedIntensity.reason,
      reason: `matching intensity to readiness supports sustainable progress`,
      priority: 2,
    });
  }

  if (todayWorkout && userProfile.intentProfile && intentMessage) {
    const focusLabel = todayWorkout.focus === 'recovery' ? 'recovery work' : 
                       todayWorkout.focus === 'lower_body' ? 'lower body focus' : 'upper body focus';
    
    insights.push({
      id: 'intent-alignment',
      type: 'intent_alignment',
      title: 'Connected to your goals',
      message: `Today's ${focusLabel} supports ${intentMessage}.`,
      expandedMessage: userProfile.intentProfile.clarifiedStatement 
        ? `You mentioned: "${userProfile.intentProfile.clarifiedStatement}". This connects to that.`
        : undefined,
      reason: `each session contributes to the larger direction`,
      priority: 3,
    });
  }

  if (todayWorkout?.focus === 'lower_body' && userProfile.injuryType) {
    const injuryContext: Record<string, string> = {
      acl: "predictable, controlled movements without sudden direction changes",
      meniscus: "exercises with comfortable knee flexion ranges",
      patella: "movements that distribute load across the leg, not just the knee",
      general_pain: "options that can be easily modified based on how you feel",
      post_surgery: "progressive loading within your recovery timeline",
    };
    
    const context = injuryContext[userProfile.injuryType];
    if (context) {
      insights.push({
        id: 'injury-context',
        type: 'session_suggestion',
        title: 'Knee-considered',
        message: `Today's session includes ${context}.`,
        expandedMessage: "Alternatives are available if anything doesn't feel right. You're in control of what works for your body.",
        reason: `exercises selected with your knee in mind`,
        priority: 4,
      });
    }
  }

  if (!todayWorkout && userProfile.recoveryFirstMode) {
    insights.push({
      id: 'recovery-first',
      type: 'recovery_link',
      title: 'Rest day',
      message: "No training today. Mobility work or gentle movement are options if you want them — or simply resting is valuable too.",
      expandedMessage: "Rest days contribute to progress just like training days. Your body is doing important work even when you're not.",
      reason: `recovery is where adaptation happens`,
      priority: 5,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
};

export function ReePlanningInsight({ todayWorkout, onDismiss }: ReePlanningInsightProps) {
  const router = useRouter();
  const { 
    userProfile, 
    getTodayReadiness, 
    getReturnStatus, 
    getRecommendedSessionIntensity 
  } = useApp();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const recommendedIntensity = useMemo(() => {
    return getRecommendedSessionIntensity('normal');
  }, [getRecommendedSessionIntensity]);

  const insights = useMemo(() => {
    return generatePlanningInsights(
      userProfile,
      todayWorkout,
      getTodayReadiness,
      getReturnStatus,
      recommendedIntensity
    );
  }, [userProfile, todayWorkout, getTodayReadiness, getReturnStatus, recommendedIntensity]);

  const currentInsight = insights[currentInsightIndex];
  const shouldShow = insights.length > 0 && !isDismissed;

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [shouldShow, fadeAnim, slideAnim]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDismissed(true);
      onDismiss?.();
    });
  }, [fadeAnim, slideAnim, onDismiss]);

  const handleToggleExpand = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(prev => !prev);
  }, []);

  const handleNextInsight = useCallback(() => {
    if (insights.length > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentInsightIndex(prev => (prev + 1) % insights.length);
      setIsExpanded(false);
    }
  }, [insights.length]);

  const handleAskRee = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const query = currentInsight 
      ? `I'm planning my workout. ${currentInsight.message} Can you help me understand my options?`
      : "Can you help me understand my workout options for today?";
    router.push(`/ai-chat?initialQuery=${encodeURIComponent(query)}`);
  }, [currentInsight, router]);

  if (!shouldShow || !currentInsight) {
    return null;
  }

  const typeColors = {
    session_suggestion: colors.primary,
    recovery_link: colors.accent,
    intent_alignment: colors.success,
    readiness_note: colors.warning,
  };

  const accentColor = typeColors[currentInsight.type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.card, { borderLeftColor: accentColor }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
              <Sparkles size={14} color={accentColor} />
            </View>
            <Text style={styles.reeLabel}>Ree</Text>
            {insights.length > 1 && (
              <TouchableOpacity onPress={handleNextInsight} style={styles.insightCounter}>
                <Text style={styles.insightCounterText}>{currentInsightIndex + 1}/{insights.length}</Text>
                <ArrowRight size={10} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            onPress={handleDismiss} 
            style={styles.dismissButton} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{currentInsight.title}</Text>

        <TouchableOpacity onPress={handleToggleExpand} activeOpacity={0.8}>
          <Text style={styles.message}>{currentInsight.message}</Text>
          
          <Text style={styles.reason}>{currentInsight.reason}</Text>
          
          {currentInsight.expandedMessage && (
            <View style={styles.expandRow}>
              {isExpanded ? (
                <ChevronUp size={14} color={colors.textTertiary} />
              ) : (
                <ChevronDown size={14} color={colors.textTertiary} />
              )}
              <Text style={styles.expandText}>{isExpanded ? 'Less' : 'More context'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isExpanded && currentInsight.expandedMessage && (
          <Text style={styles.expandedMessage}>{currentInsight.expandedMessage}</Text>
        )}

        <TouchableOpacity onPress={handleAskRee} style={styles.askButton}>
          <MessageCircle size={14} color={colors.primary} />
          <Text style={styles.askButtonText}>Explore options with Ree</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reeLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightCounterText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600' as const,
  },
  dismissButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  reason: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    marginTop: 8,
    lineHeight: 19,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  expandText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  expandedMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 14,
  },
  askButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
