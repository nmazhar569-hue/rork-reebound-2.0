import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Sparkles, X, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { Exercise } from '@/types';
import * as Haptics from 'expo-haptics';

interface WorkoutContext {
  exercise: Exercise;
  setIndex?: number;
  totalSets?: number;
  completedSetsCount?: number;
  isFirstExercise?: boolean;
  isLastExercise?: boolean;
}

interface ReeWorkoutHintProps {
  context: WorkoutContext;
  painReported?: number;
  fatigueReported?: boolean;
  onDismiss?: () => void;
}

type HintType = 'caution' | 'modification' | 'alternative' | 'encouragement' | 'range_tip';

interface Hint {
  type: HintType;
  message: string;
  expandedMessage?: string;
  priority: number;
}

const getContextualHints = (context: WorkoutContext, painReported?: number): Hint[] => {
  const hints: Hint[] = [];
  const { exercise, completedSetsCount = 0, totalSets = 0 } = context;

  if (exercise.kneeSafeLevel === 'caution') {
    hints.push({
      type: 'caution',
      message: "This movement has higher joint demand. Shortening the range is an option if needed.",
      expandedMessage: "If anything feels sharp, adjusting depth or switching to an alternative are both valid choices.",
      priority: 1,
    });
  }

  if (exercise.kneeSafeLevel === 'modified' && exercise.substitution) {
    hints.push({
      type: 'modification',
      message: `A modified version is available: ${exercise.substitution}`,
      expandedMessage: "This targets similar muscles with less joint stress. Either version works — it depends on how today feels.",
      priority: 2,
    });
  }

  if (exercise.alternatives && exercise.alternatives.length > 0) {
    const regression = exercise.alternatives.find(a => a.type === 'regression');
    if (regression) {
      hints.push({
        type: 'alternative',
        message: "A lower-load alternative is available.",
        expandedMessage: `${regression.reason}`,
        priority: 3,
      });
    }
  }

  if (painReported && painReported > 5) {
    hints.push({
      type: 'range_tip',
      message: "Pain is higher. Partial range or lighter load are options.",
      expandedMessage: "This is information your body is sharing. Adjusting based on it is part of training wisely.",
      priority: 0,
    });
  }

  if (completedSetsCount > 0 && completedSetsCount === totalSets - 1) {
    hints.push({
      type: 'encouragement',
      message: "Final set. Form matters more than numbers.",
      priority: 4,
    });
  }

  return hints.sort((a, b) => a.priority - b.priority);
};

export function ReeWorkoutHint({ context, painReported, fatigueReported, onDismiss }: ReeWorkoutHintProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const hints = getContextualHints(context, painReported);
  const currentHint = hints[currentHintIndex];

  const shouldShow = hints.length > 0 && !isDismissed;

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [shouldShow, fadeAnim, slideAnim]);

  useEffect(() => {
    setIsDismissed(false);
    setIsExpanded(false);
    setCurrentHintIndex(0);
  }, [context.exercise.id]);

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

  const handleAskRee = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const query = `I'm doing ${context.exercise.name} right now. ${currentHint?.message || 'Can you help me with this exercise?'}`;
    router.push(`/ai-chat?initialQuery=${encodeURIComponent(query)}`);
  }, [context.exercise.name, currentHint, router]);

  const handleNextHint = useCallback(() => {
    if (hints.length > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentHintIndex(prev => (prev + 1) % hints.length);
      setIsExpanded(false);
    }
  }, [hints.length]);

  if (!shouldShow || !currentHint) {
    return null;
  }

  const hintColors = {
    caution: colors.warning,
    modification: colors.info,
    alternative: colors.primary,
    encouragement: colors.success,
    range_tip: colors.accent,
  };

  const accentColor = hintColors[currentHint.type];

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
            {hints.length > 1 && (
              <TouchableOpacity onPress={handleNextHint} style={styles.hintCounter}>
                <Text style={styles.hintCounterText}>{currentHintIndex + 1}/{hints.length}</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleToggleExpand} activeOpacity={0.8}>
          <Text style={styles.message}>{currentHint.message}</Text>
          
          {currentHint.expandedMessage && (
            <View style={styles.expandRow}>
              {isExpanded ? (
                <ChevronUp size={14} color={colors.textTertiary} />
              ) : (
                <ChevronDown size={14} color={colors.textTertiary} />
              )}
              <Text style={styles.expandText}>{isExpanded ? 'Less' : 'More'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isExpanded && currentHint.expandedMessage && (
          <Text style={styles.expandedMessage}>{currentHint.expandedMessage}</Text>
        )}

        <TouchableOpacity onPress={handleAskRee} style={styles.askButton}>
          <MessageCircle size={14} color={colors.primary} />
          <Text style={styles.askButtonText}>Ask Ree</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
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
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  hintCounter: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hintCounterText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600' as const,
  },
  dismissButton: {
    padding: 4,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
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
    marginTop: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary + '10',
    borderRadius: 14,
  },
  askButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
