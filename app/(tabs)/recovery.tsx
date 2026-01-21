import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Play, CheckCircle, Flame, Trophy, ChevronLeft, ChevronRight, Footprints, Moon, Heart, TrendingUp, Pause, RotateCcw } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { recoveryRoutines } from '@/constants/workoutTemplates';
import { useApp } from '@/contexts/AppContext';
import { useHealth } from '@/contexts/HealthContext';
import { useRee } from '@/contexts/ReeContext';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

const TYPE_BADGE_CONFIG = {
  warmup: { bg: liquidGlass.status.warningMuted, color: liquidGlass.status.warning, label: 'Warm-Up' },
  cooldown: { bg: liquidGlass.accent.muted, color: liquidGlass.accent.primary, label: 'Cool-Down' },
  mobility: { bg: 'rgba(255, 107, 157, 0.15)', color: '#FF6B9D', label: 'Mobility' },
} as const;

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

function GlassProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
    </View>
  );
}

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

  React.useEffect(() => {
    if (activeRoutine && activeRoutineData?.steps[currentStep]) {
      setTimeLeft(activeRoutineData.steps[currentStep].duration);
      setIsTimerRunning(false);
    }
  }, [activeRoutine, currentStep, activeRoutineData]);

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
            <ChevronLeft size={20} color={liquidGlass.accent.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.routineTitle}>{activeRoutineData.title}</Text>
          <Text style={styles.progressText}>Step {currentStep + 1} of {activeRoutineData.steps.length}</Text>
          <GlassProgressBar progress={progress} />
        </View>

        <ScrollView contentContainerStyle={styles.stepContent}>
          <GlassCard style={styles.stepCard}>
            <Text style={styles.stepInstruction}>{currentStepData.instruction}</Text>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Duration</Text>
              <Text style={styles.timerValue}>{timeLeft}s</Text>
            </View>
            
            <View style={styles.controlsContainer}>
              <View style={styles.timerRow}>
                <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
                  <LinearGradient colors={liquidGlass.gradients.button} style={styles.timerButtonGradient}>
                    {isTimerRunning ? <Pause size={24} color={liquidGlass.text.inverse} /> : <Play size={24} color={liquidGlass.text.inverse} fill={liquidGlass.text.inverse} />}
                    <Text style={styles.timerButtonText}>{isTimerRunning ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Start'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                  <RotateCcw size={20} color={liquidGlass.text.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.navigationRow}>
                <TouchableOpacity 
                  style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]} 
                  onPress={handlePrevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft size={24} color={currentStep === 0 ? liquidGlass.text.tertiary : liquidGlass.text.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextStepButton} onPress={handleNextStep}>
                  <LinearGradient colors={liquidGlass.gradients.button} style={styles.nextStepGradient}>
                    <Text style={styles.nextStepButtonText}>{currentStep < activeRoutineData.steps.length - 1 ? 'Next Step' : 'Complete'}</Text>
                    <ChevronRight size={20} color={liquidGlass.text.inverse} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>

          <View style={styles.stepsOverview}>
            {activeRoutineData.steps.map((step, index) => (
              <View key={step.id} style={[
                styles.stepIndicator,
                completedSteps.includes(step.id) && styles.stepIndicatorCompleted,
                index === currentStep && styles.stepIndicatorActive,
              ]}>
                {completedSteps.includes(step.id) ? (
                  <CheckCircle size={18} color={liquidGlass.status.success} />
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
      <View style={styles.header}>
        <Text style={styles.title}>Recovery</Text>
        <Text style={styles.subtitle}>Movement that supports your body</Text>
      </View>

      {recoveryStreak > 0 && (
        <View style={styles.streakContainer}>
          <Trophy size={16} color={liquidGlass.status.warning} />
          <Text style={styles.streakText}>{recoveryStreak} days of care</Text>
        </View>
      )}

      {healthConnected && (
        <GlassCard style={styles.healthInsightsCard}>
          <View style={styles.healthInsightsHeader}>
            <Heart size={16} color={liquidGlass.accent.primary} />
            <Text style={styles.healthInsightsTitle}>Today&apos;s Readiness</Text>
            <View style={[styles.readinessScoreBadge, { 
              backgroundColor: readinessFactors.overallScore >= 70 ? liquidGlass.status.successMuted : 
                readinessFactors.overallScore >= 50 ? liquidGlass.status.warningMuted : liquidGlass.status.dangerMuted 
            }]}>
              <Text style={[styles.readinessScoreText, { 
                color: readinessFactors.overallScore >= 70 ? liquidGlass.status.success : 
                  readinessFactors.overallScore >= 50 ? liquidGlass.status.warning : liquidGlass.status.danger 
              }]}>
                {readinessFactors.overallScore}%
              </Text>
            </View>
          </View>
          
          <View style={styles.healthMetricsRow}>
            <View style={styles.healthMetric}>
              <Footprints size={16} color={liquidGlass.text.secondary} />
              <Text style={styles.healthMetricValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.healthMetricLabel}>steps</Text>
            </View>
            <View style={styles.healthMetricDivider} />
            <View style={styles.healthMetric}>
              <TrendingUp size={16} color={liquidGlass.text.secondary} />
              <Text style={styles.healthMetricValue}>{weeklyAvgSteps.toLocaleString()}</Text>
              <Text style={styles.healthMetricLabel}>avg/day</Text>
            </View>
            <View style={styles.healthMetricDivider} />
            <View style={styles.healthMetric}>
              <Moon size={16} color={liquidGlass.text.secondary} />
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
        </GlassCard>
      )}

      {recommendedRoutine.routine && (
        <View style={styles.recommendedSection}>
          <View style={styles.sectionHeader}>
            <Flame size={18} color={liquidGlass.accent.primary} fill={liquidGlass.accent.primary} />
            <Text style={styles.sectionTitle}>Recommended Today</Text>
          </View>

          <GlassCard style={styles.recommendedCard}>
            <View style={styles.routineCardHeader}>
              <View style={styles.typeBadgeRecommended}>
                <Text style={styles.typeBadgeTextRecommended}>{recommendedRoutine.reason}</Text>
              </View>
              <Text style={styles.duration}>{recommendedRoutine.routine.duration} min</Text>
            </View>
            <Text style={styles.routineCardTitle}>{recommendedRoutine.routine.title}</Text>
            <Text style={styles.stepsCount}>{recommendedRoutine.routine.steps.length} steps</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveRoutine(recommendedRoutine.routine!.id)}>
              <LinearGradient colors={liquidGlass.gradients.button} style={styles.primaryButtonGradient}>
                <Play size={18} color={liquidGlass.text.inverse} fill={liquidGlass.text.inverse} />
                <Text style={styles.primaryButtonText}>Start Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </View>
      )}

      <Text style={styles.allRoutinesTitle}>All Routines</Text>
      <View style={styles.routinesList}>
        {recoveryRoutines.map((routine) => {
          const config = TYPE_BADGE_CONFIG[routine.type];
          return (
            <GlassCard key={routine.id} style={styles.routineCard}>
              <View style={styles.routineCardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={styles.duration}>{routine.duration} min</Text>
              </View>
              <Text style={styles.routineCardTitle}>{routine.title}</Text>
              <Text style={styles.stepsCount}>{routine.steps.length} steps</Text>
              <TouchableOpacity style={styles.startRoutineButton} onPress={() => setActiveRoutine(routine.id)}>
                <Play size={18} color={liquidGlass.accent.primary} />
                <Text style={styles.startRoutineButtonText}>Start</Text>
              </TouchableOpacity>
            </GlassCard>
          );
        })}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: liquidGlass.background.primary },
  scrollContent: { padding: glassLayout.screenPadding, paddingTop: glassLayout.screenPaddingTop, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700' as const, color: liquidGlass.text.primary, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 15, color: liquidGlass.text.secondary },
  glassCard: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    padding: 20,
    ...glassShadows.soft,
  },
  streakContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: liquidGlass.status.warningMuted, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, marginBottom: 24, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255, 184, 77, 0.3)' },
  streakText: { fontSize: 14, color: liquidGlass.status.warning, fontWeight: '600' as const },
  healthInsightsCard: { marginBottom: 22 },
  healthInsightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  healthInsightsTitle: { flex: 1, fontSize: 15, fontWeight: '600' as const, color: liquidGlass.text.primary },
  readinessScoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50 },
  readinessScoreText: { fontSize: 13, fontWeight: '700' as const },
  healthMetricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 14 },
  healthMetric: { alignItems: 'center', gap: 4 },
  healthMetricValue: { fontSize: 18, fontWeight: '700' as const, color: liquidGlass.text.primary },
  healthMetricLabel: { fontSize: 12, color: liquidGlass.text.tertiary },
  healthMetricDivider: { width: 1, height: 28, backgroundColor: liquidGlass.border.glassLight },
  insightsContainer: { backgroundColor: liquidGlass.surface.glassDark, borderRadius: 14, padding: 12, gap: 6 },
  insightText: { fontSize: 13, color: liquidGlass.text.secondary, lineHeight: 19 },
  recommendedSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: liquidGlass.text.primary },
  recommendedCard: {},
  routinesList: { gap: 12, marginTop: 6 },
  routineCard: {},
  routineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 },
  typeBadgeRecommended: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, backgroundColor: liquidGlass.accent.muted },
  typeBadgeTextRecommended: { fontSize: 12, fontWeight: '600' as const, color: liquidGlass.accent.primary },
  typeBadgeText: { fontSize: 12, fontWeight: '600' as const },
  duration: { fontSize: 13, fontWeight: '600' as const, color: liquidGlass.text.tertiary },
  routineCardTitle: { fontSize: 17, fontWeight: '600' as const, color: liquidGlass.text.primary, marginBottom: 5 },
  stepsCount: { fontSize: 14, color: liquidGlass.text.secondary, marginBottom: 16 },
  primaryButton: { borderRadius: 50, overflow: 'hidden' },
  primaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 50 },
  primaryButtonText: { fontSize: 15, fontWeight: '600' as const, color: liquidGlass.text.inverse },
  startRoutineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 50, backgroundColor: liquidGlass.accent.muted, borderWidth: 1, borderColor: liquidGlass.border.glass },
  startRoutineButtonText: { fontSize: 15, fontWeight: '600' as const, color: liquidGlass.accent.primary },
  allRoutinesTitle: { fontSize: 18, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 14 },
  routineHeader: { backgroundColor: liquidGlass.surface.card, padding: 22, paddingTop: 60, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderWidth: 1, borderColor: liquidGlass.border.glass, ...glassShadows.medium, zIndex: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 4 },
  backButtonText: { fontSize: 15, color: liquidGlass.accent.primary, fontWeight: '600' as const },
  routineTitle: { fontSize: 22, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 4, letterSpacing: -0.4 },
  progressText: { fontSize: 14, color: liquidGlass.text.secondary, fontWeight: '500' as const, marginBottom: 14 },
  progressBarContainer: { height: 6, backgroundColor: liquidGlass.surface.glassDark, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: liquidGlass.accent.primary, borderRadius: 3 },
  stepContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  stepCard: { marginBottom: 28, alignItems: 'center' },
  stepInstruction: { fontSize: 20, color: liquidGlass.text.primary, lineHeight: 30, marginBottom: 24, textAlign: 'center', fontWeight: '600' as const },
  timerContainer: { alignItems: 'center', paddingVertical: 22, paddingHorizontal: 36, backgroundColor: liquidGlass.accent.muted, borderRadius: 24, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: liquidGlass.border.glass },
  timerLabel: { fontSize: 11, color: liquidGlass.text.tertiary, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 1, fontWeight: '600' as const },
  timerValue: { fontSize: 44, fontWeight: '700' as const, color: liquidGlass.accent.primary, fontVariant: ['tabular-nums'] },
  controlsContainer: { width: '100%', gap: 16 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timerButton: { flex: 1, borderRadius: 50, overflow: 'hidden' },
  timerButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 50 },
  timerButtonText: { fontSize: 17, fontWeight: '600' as const, color: liquidGlass.text.inverse },
  resetButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: liquidGlass.surface.glassDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: liquidGlass.border.glassLight },
  navigationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: liquidGlass.surface.glassDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: liquidGlass.border.glassLight },
  navButtonDisabled: { opacity: 0.5 },
  nextStepButton: { flex: 1, borderRadius: 50, overflow: 'hidden' },
  nextStepGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 50 },
  nextStepButtonText: { fontSize: 17, fontWeight: '600' as const, color: liquidGlass.text.inverse },
  stepsOverview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  stepIndicator: { width: 38, height: 38, borderRadius: 19, backgroundColor: liquidGlass.surface.glassDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: liquidGlass.border.glassLight },
  stepIndicatorCompleted: { backgroundColor: liquidGlass.status.successMuted, borderColor: liquidGlass.status.success },
  stepIndicatorActive: { backgroundColor: liquidGlass.accent.primary, borderColor: liquidGlass.accent.primary, transform: [{ scale: 1.08 }] },
  stepIndicatorText: { fontSize: 14, fontWeight: '600' as const, color: liquidGlass.text.secondary },
  stepIndicatorTextActive: { color: liquidGlass.text.inverse },
  bottomSpacer: { height: glassLayout.tabBarHeight },
});
