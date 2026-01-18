import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors, { borderRadius, shadows } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useHealth } from '@/contexts/HealthContext';
import { DailyReadiness, DailyLog } from '@/types';
import { MicroExplanation } from '@/components/MicroExplanation';
import { getRelevantExplanations, MicroExplanation as MicroExpType } from '@/constants/microExplanations';

interface BodyState {
  summary: string;
  primaryAction: {
    label: string;
    route?: string;
  };
  alternativeAction?: {
    label: string;
    route?: string;
  };
  scoreLabel: string;
  scoreColor: string;
  explanation?: MicroExpType;
}

function getRecentTrainingLoad(dailyLogs: DailyLog[]): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentLogs = dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= sevenDaysAgo && log.workoutCompleted;
  });
  
  return recentLogs.length;
}

function computeBodyState(
  readiness: DailyReadiness,
  readinessFactors: { overallScore: number; sleepScore: number; recoveryScore: number },
  recentWorkouts: number,
  hasInjury: boolean
): BodyState {
  const { overallScore, sleepScore } = readinessFactors;
  const painLevel = readiness.painLevel;
  const confidence = readiness.confidence;
  
  const highPain = painLevel > 6;
  const moderatePain = painLevel > 3 && painLevel <= 6;
  const lowConfidence = confidence === 'low';
  const highConfidence = confidence === 'high';
  const poorSleep = sleepScore < 60;
  const highTrainingLoad = recentWorkouts >= 5;
  const lowTrainingLoad = recentWorkouts <= 1;

  let summary: string;
  let primaryAction: { label: string; route?: string };
  let alternativeAction: { label: string; route?: string } | undefined;
  let scoreLabel: string;
  let scoreColor: string;

  if (overallScore >= 80 && !highPain && highConfidence) {
    summary = "Your body feels strong and ready today.";
    primaryAction = { label: "Start your workout", route: undefined };
    alternativeAction = { label: "Add extra mobility", route: "/recovery" };
    scoreLabel = "Ready";
    scoreColor = colors.success;
  } else if (overallScore >= 80 && !highPain) {
    summary = "You're in a good place for training today.";
    primaryAction = { label: "Train as planned", route: undefined };
    alternativeAction = { label: "Warm up first", route: "/recovery" };
    scoreLabel = "Good";
    scoreColor = colors.success;
  } else if (highPain) {
    summary = "Your body is asking for extra care today.";
    primaryAction = { label: "Try gentle recovery", route: "/recovery" };
    alternativeAction = { label: "Rest completely", route: undefined };
    scoreLabel = "Rest";
    scoreColor = colors.accent;
  } else if (moderatePain && hasInjury) {
    summary = "Some discomfort today — listen to your body.";
    primaryAction = { label: "Modified workout", route: undefined };
    alternativeAction = { label: "Recovery session", route: "/recovery" };
    scoreLabel = "Careful";
    scoreColor = colors.warning;
  } else if (poorSleep && lowConfidence) {
    summary = "A lighter day might serve you well.";
    primaryAction = { label: "Easy movement", route: "/recovery" };
    alternativeAction = { label: "Train light", route: undefined };
    scoreLabel = "Ease In";
    scoreColor = colors.warning;
  } else if (poorSleep) {
    summary = "Sleep was short — energy may dip later.";
    primaryAction = { label: "Train with awareness", route: undefined };
    alternativeAction = { label: "Shorter session", route: undefined };
    scoreLabel = "Moderate";
    scoreColor = colors.warning;
  } else if (highTrainingLoad && moderatePain) {
    summary = "You've trained hard this week — recovery pays off.";
    primaryAction = { label: "Active recovery", route: "/recovery" };
    alternativeAction = { label: "Light training", route: undefined };
    scoreLabel = "Recover";
    scoreColor = colors.primary;
  } else if (lowTrainingLoad && !highPain && !lowConfidence) {
    summary = "You've had good rest — time to move.";
    primaryAction = { label: "Full workout", route: undefined };
    alternativeAction = { label: "Ease back in", route: undefined };
    scoreLabel = "Energized";
    scoreColor = colors.success;
  } else if (lowConfidence) {
    summary = "Start small — momentum builds confidence.";
    primaryAction = { label: "Begin with warmup", route: "/recovery" };
    alternativeAction = { label: "Just show up", route: undefined };
    scoreLabel = "Build Up";
    scoreColor = colors.primary;
  } else if (overallScore >= 60) {
    summary = "A balanced day ahead — trust your pace.";
    primaryAction = { label: "Train as planned", route: undefined };
    alternativeAction = { label: "Adjust if needed", route: undefined };
    scoreLabel = "Balanced";
    scoreColor = colors.primary;
  } else {
    summary = "Today is a good day to be kind to yourself.";
    primaryAction = { label: "Gentle movement", route: "/recovery" };
    alternativeAction = { label: "Rest if needed", route: undefined };
    scoreLabel = "Gentle";
    scoreColor = colors.accent;
  }

  let explanation: MicroExpType | undefined;
  const explanations = getRelevantExplanations('readiness', {
    sleepScore,
    recentWorkouts,
  });
  if (explanations.length > 0) {
    explanation = explanations[0];
  }

  return { summary, primaryAction, alternativeAction, scoreLabel, scoreColor, explanation };
}

export function BodyStateCard() {
  const router = useRouter();
  const { getTodayReadiness, userProfile, dailyLogs, getTodayWorkout } = useApp();
  const { calculateReadinessFactors } = useHealth();
  
  const todayReadiness = getTodayReadiness();
  const todayWorkout = getTodayWorkout();
  
  const bodyState = useMemo(() => {
    if (!todayReadiness) return null;
    
    const readinessFactors = calculateReadinessFactors(
      todayReadiness.painLevel,
      todayReadiness.confidence
    );
    
    const recentWorkouts = getRecentTrainingLoad(dailyLogs);
    const hasInjury = userProfile?.injuryType !== 'general_pain';
    
    return computeBodyState(todayReadiness, readinessFactors, recentWorkouts, hasInjury);
  }, [todayReadiness, calculateReadinessFactors, dailyLogs, userProfile]);
  
  if (!bodyState || !todayReadiness) return null;
  
  const handlePrimaryAction = () => {
    if (bodyState.primaryAction.route) {
      router.push(bodyState.primaryAction.route as any);
    } else if (todayWorkout) {
      router.push(`/workout/${todayWorkout.id}`);
    }
  };
  
  const handleAlternativeAction = () => {
    if (bodyState.alternativeAction?.route) {
      router.push(bodyState.alternativeAction.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(46, 196, 198, 0.08)', 'rgba(240, 124, 90, 0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.label}>Body State</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: bodyState.scoreColor + '18' }]}>
          <Text style={[styles.scoreText, { color: bodyState.scoreColor }]}>
            {bodyState.scoreLabel}
          </Text>
        </View>
      </View>
      
      <Text style={styles.summary}>{bodyState.summary}</Text>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.primaryAction} 
          onPress={handlePrimaryAction}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionText}>{bodyState.primaryAction.label}</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
        
        {bodyState.alternativeAction && (
          <TouchableOpacity 
            style={styles.alternativeAction}
            onPress={handleAlternativeAction}
            activeOpacity={0.7}
          >
            <Text style={styles.alternativeActionText}>
              or {bodyState.alternativeAction.label.toLowerCase()}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {bodyState.explanation && (
        <MicroExplanation
          explanation={bodyState.explanation}
          style={styles.explanationCard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 20,
    marginBottom: 18,
    overflow: 'hidden',
    ...shadows.soft,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  summary: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: 25,
    marginBottom: 16,
  },
  actions: {
    gap: 10,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryMuted,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: borderRadius.full,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  alternativeAction: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  alternativeActionText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  explanationCard: {
    marginTop: 16,
  },
});
