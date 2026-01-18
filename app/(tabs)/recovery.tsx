import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Play, CheckCircle, Flame, Trophy, ChevronLeft, ChevronRight, Footprints, Moon, Heart, TrendingUp, Pause, RotateCcw } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';

import { recoveryRoutines } from '@/constants/workoutTemplates';
import { useApp } from '@/contexts/AppContext';
import { useHealth } from '@/contexts/HealthContext';
import { useRee } from '@/contexts/ReeContext';
import { Card, PageHeader, ProgressBar, PrimaryButton, SectionTitle } from '@/components/ui';

import colors, { borderRadius, shadows, layout } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const TYPE_BADGE_CONFIG = {
  warmup: { bg: colors.warning + '15', color: colors.warning, label: 'Warm-Up' },
  cooldown: { bg: colors.primary + '15', color: colors.primary, label: 'Cool-Down' },
  mobility: { bg: colors.accent + '15', color: colors.accent, label: 'Mobility' },
} as const;

export default function RecoveryScreen() {
  const { getTodayWorkout, getTodayLog, logWorkout, dailyLogs, getTodayReadiness } = useApp();
  const { isConnected: healthConnected, getTodaySteps, getWeeklyStepsAverage, calculateReadinessFactors } = useHealth();
  const { updateScreenContext, markConceptTaught } = useRee();
  const [activeRoutine, setActiveRoutine] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const todayLog = getTodayLog();
  const activeRoutineData = recoveryRoutines.find((r) => r.id === activeRoutine);

  // Initialize timer when step changes
  React.useEffect(() => {
    if (activeRoutine && activeRoutineData?.steps[currentStep]) {
      setTimeLeft(activeRoutineData.steps[currentStep].duration);
      setIsTimerRunning(false);
    }
  }, [activeRoutine, currentStep, activeRoutineData]);

  // Timer logic
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            haptics.success();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    haptics.soft();
    if (timeLeft === 0 && activeRoutineData) {
      // Reset timer if it reached 0
      setTimeLeft(activeRoutineData.steps[currentStep].duration);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning((prev) => !prev);
    }
  }, [timeLeft, activeRoutineData, currentStep]);

  const resetTimer = useCallback(() => {
    haptics.soft();
    if (activeRoutineData) {
      setTimeLeft(activeRoutineData.steps[currentStep].duration);
      setIsTimerRunning(false);
    }
  }, [activeRoutineData, currentStep]);

  useFocusEffect(
    useCallback(() => {
      updateScreenContext('recovery');
      markConceptTaught('recovery_importance');
    }, [updateScreenContext, markConceptTaught])
  );

  const todayReadiness = getTodayReadiness();
  const readinessFactors = useMemo(() => {
    return calculateReadinessFactors(todayReadiness?.painLevel, todayReadiness?.confidence);
  }, [calculateReadinessFactors, todayReadiness]);

  const todaySteps = useMemo(() => getTodaySteps(), [getTodaySteps]);
  const weeklyAvgSteps = useMemo(() => getWeeklyStepsAverage(), [getWeeklyStepsAverage]);

  const recommendedRoutine = useMemo(() => {
    const todayWorkout = getTodayWorkout();
    const log = getTodayLog();

    if (readinessFactors.overallScore < 50) {
      return { routine: recoveryRoutines.find((r) => r.type === 'mobility'), reason: 'Recovery Focus' };
    }
    if (log?.workoutCompleted) return { routine: recoveryRoutines.find((r) => r.type === 'cooldown'), reason: 'Post-Workout Cool-Down' };
    if (todayWorkout) return { routine: recoveryRoutines.find((r) => r.type === 'warmup'), reason: 'Pre-Workout Warm-Up' };
    return { routine: recoveryRoutines.find((r) => r.type === 'mobility'), reason: 'Rest Day Flow' };
  }, [getTodayWorkout, getTodayLog, readinessFactors.overallScore]);

  const recoveryStreak = useMemo(() => {
    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const recoveryLogs = sortedLogs.filter((l) => l.recoveryCompleted);

    if (recoveryLogs.length === 0) return 0;
    const lastDate = recoveryLogs[0].date;
    if (lastDate !== today && lastDate !== yesterday) return 0;

    let streak = 0;
    let currentDate = new Date(lastDate);
    for (const log of recoveryLogs) {
      if (new Date(log.date).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }
    return streak;
  }, [dailyLogs]);

    const handlePrevStep = useCallback(() => {
      if (currentStep > 0) {
        haptics.soft();
        setCurrentStep((prev) => prev - 1);
      }
    }, [currentStep]);

    const handleNextStep = useCallback(async () => {
    if (!activeRoutineData) return;
    haptics.soft();

    const currentStepData = activeRoutineData.steps[currentStep];
    // Mark current step as completed if not already
    if (!completedSteps.includes(currentStepData.id)) {
        setCompletedSteps((prev) => [...prev, currentStepData.id]);
    }

    if (currentStep < activeRoutineData.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      haptics.success();
      await logWorkout({
        date: new Date().toISOString().split('T')[0],
        workoutCompleted: false,
        recoveryCompleted: true,
        painLevel: todayLog?.painLevel || 0,
        confidenceLevel: todayLog?.confidenceLevel || 0,
        notes: `Completed ${activeRoutineData.title}`,
      });
      setActiveRoutine(null);
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [activeRoutineData, currentStep, todayLog, logWorkout, completedSteps]);

  const handleBack = useCallback(() => {
    setActiveRoutine(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  }, []);

  if (activeRoutine && activeRoutineData) {
    const currentStepData = activeRoutineData.steps[currentStep];
    const progress = ((currentStep + 1) / activeRoutineData.steps.length) * 100;

    return (
      <View style={styles.container}>
        <View style={styles.routineHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.routineTitle}>{activeRoutineData.title}</Text>
          <Text style={styles.progressText}>Step {currentStep + 1} of {activeRoutineData.steps.length}</Text>
          <ProgressBar progress={progress} />
        </View>

        <ScrollView contentContainerStyle={styles.stepContent}>
          <Card style={styles.stepCard}>
            <Text style={styles.stepInstruction}>{currentStepData.instruction}</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Duration</Text>
              <Text style={styles.timerValue}>{timeLeft}s</Text>
            </View>
            
            <View style={styles.controlsContainer}>
                <View style={styles.timerRow}>
                   <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
                      {isTimerRunning ? <Pause size={24} color={colors.surface} /> : <Play size={24} color={colors.surface} fill={colors.surface} />}
                      <Text style={styles.timerButtonText}>{isTimerRunning ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start Routine'}</Text>
                   </TouchableOpacity>
                   
                   <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                      <RotateCcw size={20} color={colors.textSecondary} />
                   </TouchableOpacity>
                </View>

                <View style={styles.navigationRow}>
                    <TouchableOpacity 
                        style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]} 
                        onPress={handlePrevStep}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft size={24} color={currentStep === 0 ? colors.textTertiary : colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.nextStepButton} 
                        onPress={handleNextStep}
                    >
                        <Text style={styles.nextStepButtonText}>{currentStep < activeRoutineData.steps.length - 1 ? 'Next Step' : 'Complete'}</Text>
                        <ChevronRight size={20} color={colors.surface} />
                    </TouchableOpacity>
                </View>
            </View>
          </Card>

          <View style={styles.stepsOverview}>
            {activeRoutineData.steps.map((step, index) => (
              <View key={step.id} style={[
                styles.stepIndicator,
                completedSteps.includes(step.id) && styles.stepIndicatorCompleted,
                index === currentStep && styles.stepIndicatorActive,
              ]}>
                {completedSteps.includes(step.id) ? (
                  <CheckCircle size={18} color={colors.success} />
                ) : (
                  <Text style={[styles.stepIndicatorText, index === currentStep && styles.stepIndicatorTextActive]}>{index + 1}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <PageHeader title="Recovery" subtitle="Movement that supports your body" />

      {recoveryStreak > 0 && (
        <View style={styles.streakContainer}>
          <Trophy size={16} color={colors.accent} />
          <Text style={styles.streakText}>{recoveryStreak} days of care</Text>
        </View>
      )}

      {healthConnected && (
        <View style={styles.healthInsightsCard}>
          <View style={styles.healthInsightsHeader}>
            <Heart size={16} color={colors.primary} />
            <Text style={styles.healthInsightsTitle}>Today&apos;s Readiness</Text>
            <View style={[styles.readinessScoreBadge, { backgroundColor: readinessFactors.overallScore >= 70 ? colors.success + '15' : readinessFactors.overallScore >= 50 ? colors.warning + '15' : colors.danger + '15' }]}>
              <Text style={[styles.readinessScoreText, { color: readinessFactors.overallScore >= 70 ? colors.success : readinessFactors.overallScore >= 50 ? colors.warning : colors.danger }]}>
                {readinessFactors.overallScore}%
              </Text>
            </View>
          </View>
          
          <View style={styles.healthMetricsRow}>
            <View style={styles.healthMetric}>
              <Footprints size={16} color={colors.textSecondary} />
              <Text style={styles.healthMetricValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.healthMetricLabel}>steps</Text>
            </View>
            <View style={styles.healthMetricDivider} />
            <View style={styles.healthMetric}>
              <TrendingUp size={16} color={colors.textSecondary} />
              <Text style={styles.healthMetricValue}>{weeklyAvgSteps.toLocaleString()}</Text>
              <Text style={styles.healthMetricLabel}>avg/day</Text>
            </View>
            <View style={styles.healthMetricDivider} />
            <View style={styles.healthMetric}>
              <Moon size={16} color={colors.textSecondary} />
              <Text style={styles.healthMetricValue}>{readinessFactors.sleepScore}%</Text>
              <Text style={styles.healthMetricLabel}>sleep</Text>
            </View>
          </View>
          
          {readinessFactors.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              {readinessFactors.insights.slice(0, 2).map((insight, index) => (
                <Text key={index} style={styles.insightText}>{insight}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {recommendedRoutine.routine && (
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Flame size={18} color={colors.primary} fill={colors.primary} />
            <SectionTitle title="Recommended Today" style={{ marginBottom: 0 }} />
          </View>

          <Card elevated style={styles.recommendedCard}>
            <View style={styles.routineCardHeader}>
              <View style={styles.typeBadgeRecommended}>
                <Text style={styles.typeBadgeTextRecommended}>{recommendedRoutine.reason}</Text>
              </View>
              <Text style={styles.duration}>{recommendedRoutine.routine.duration} min</Text>
            </View>
            <Text style={styles.routineCardTitle}>{recommendedRoutine.routine.title}</Text>
            <Text style={styles.stepsCount}>{recommendedRoutine.routine.steps.length} steps</Text>
            <PrimaryButton icon={Play} iconPosition="left" label="Start Now" onPress={() => setActiveRoutine(recommendedRoutine.routine!.id)} />
          </Card>
        </View>
      )}

      <SectionTitle title="All Routines" />
      <View style={styles.routinesList}>
        {recoveryRoutines.map((routine) => {
          const config = TYPE_BADGE_CONFIG[routine.type];
          return (
            <Card key={routine.id} style={styles.routineCard}>
              <View style={styles.routineCardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={styles.duration}>{routine.duration} min</Text>
              </View>
              <Text style={styles.routineCardTitle}>{routine.title}</Text>
              <Text style={styles.stepsCount}>{routine.steps.length} steps</Text>
              <TouchableOpacity style={styles.startRoutineButton} onPress={() => setActiveRoutine(routine.id)}>
                <Play size={18} color={colors.primary} />
                <Text style={styles.startRoutineButtonText}>Start</Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: layout.screenPadding, paddingTop: layout.screenPaddingTop, paddingBottom: 40 },
  streakContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.accentMuted, paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.full, marginBottom: 24, alignSelf: 'flex-start' },
  streakText: { fontSize: 14, color: colors.accent, fontWeight: '600' as const },
  healthInsightsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xxl, padding: 20, marginBottom: 22, ...shadows.soft },
  healthInsightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  healthInsightsTitle: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: colors.text },
  readinessScoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: borderRadius.full },
  readinessScoreText: { fontSize: 13, fontWeight: '700' as const },
  healthMetricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 14 },
  healthMetric: { alignItems: 'center', gap: 4 },
  healthMetricValue: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  healthMetricLabel: { fontSize: 12, color: colors.textTertiary },
  healthMetricDivider: { width: 1, height: 28, backgroundColor: colors.borderLight },
  insightsContainer: { backgroundColor: colors.surfaceDim, borderRadius: borderRadius.lg, padding: 12, gap: 6 },
  insightText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  recommendedSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  recommendedCard: { padding: layout.cardPadding },
  routinesList: { gap: 12, marginTop: 6 },
  routineCard: { padding: 20 },
  routineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full },
  typeBadgeRecommended: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: colors.primaryMuted },
  typeBadgeTextRecommended: { fontSize: 12, fontWeight: '600' as const, color: colors.primary },
  typeBadgeText: { fontSize: 12, fontWeight: '600' as const },
  duration: { fontSize: 13, fontWeight: '600' as const, color: colors.textTertiary },
  routineCardTitle: { fontSize: 17, fontWeight: '600' as const, color: colors.text, marginBottom: 5 },
  stepsCount: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  startRoutineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: borderRadius.full, backgroundColor: colors.primaryMuted },
  startRoutineButtonText: { fontSize: 15, fontWeight: '600' as const, color: colors.primary },
  routineHeader: { backgroundColor: colors.surface, padding: 22, paddingTop: 60, borderBottomLeftRadius: borderRadius.xxxl, borderBottomRightRadius: borderRadius.xxxl, ...shadows.medium, zIndex: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 4 },
  backButtonText: { fontSize: 15, color: colors.primary, fontWeight: '600' as const },
  routineTitle: { fontSize: 22, fontWeight: '700' as const, color: colors.text, marginBottom: 4, letterSpacing: -0.4 },
  progressText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' as const, marginBottom: 14 },
  stepContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  stepCard: { padding: 28, marginBottom: 28, alignItems: 'center' },
  stepInstruction: { fontSize: 20, color: colors.text, lineHeight: 30, marginBottom: 24, textAlign: 'center', fontWeight: '600' as const },
  timerContainer: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 36, backgroundColor: colors.primaryMuted, borderRadius: borderRadius.xxl, marginBottom: 20, width: '100%' },
  timerLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' as const },
  timerValue: { fontSize: 44, fontWeight: '700' as const, color: colors.primary, fontVariant: ['tabular-nums'] },
  controlsContainer: { width: '100%', gap: 16 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, backgroundColor: colors.primary, borderRadius: borderRadius.full, ...shadows.soft },
  timerButtonText: { fontSize: 17, fontWeight: '600' as const, color: colors.surface },
  resetButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  navigationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  navButtonDisabled: { opacity: 0.5, borderColor: colors.borderLight },
  nextStepButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, backgroundColor: colors.primary, borderRadius: borderRadius.full, ...shadows.soft },
  nextStepButtonText: { fontSize: 17, fontWeight: '600' as const, color: colors.surface },
  stepsOverview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  stepIndicator: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surfaceDim, justifyContent: 'center', alignItems: 'center' },
  stepIndicatorCompleted: { backgroundColor: colors.successMuted },
  stepIndicatorActive: { backgroundColor: colors.primary, transform: [{ scale: 1.08 }] },
  stepIndicatorText: { fontSize: 14, fontWeight: '600' as const, color: colors.textSecondary },
  stepIndicatorTextActive: { color: colors.surface },
  footer: { padding: 22, backgroundColor: colors.background },
  bottomSpacer: { height: layout.tabBarHeight },
});
