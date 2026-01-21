import { router, useRouter, useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Utensils, Activity, Play } from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '@/contexts/AppContext';
import { useRee } from '@/contexts/ReeContext';
import { LoadingState, Card } from '@/components/ui';
import { WelcomeBackCard } from '@/components/WelcomeBackCard';
import { SpatialGlassCard } from '@/components/SpatialGlassCard';
import spatialGlass from '@/constants/spatialGlass';
import colors, { borderRadius, shadows, layout, gradients } from '@/constants/colors';
import { haptics } from '@/utils/haptics';
import { recoveryRoutines } from '@/constants/workoutTemplates';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RecentActivity {
  id: string;
  type: 'workout' | 'meal' | 'recovery';
  title: string;
  subtitle: string;
  icon: typeof Activity;
}

export default function HomeScreen() {
  const { userProfile, getTodayWorkout, getTodayReadiness, logReadiness, isLoading, getReturnStatus, recordActivity, dailyLogs, getTodayLog } = useApp();
  const { updateScreenContext, refreshHomeInsight } = useRee();
  const todayWorkout = getTodayWorkout();
  const todayReadiness = getTodayReadiness();
  const returnStatus = getReturnStatus();
  const routerInstance = useRouter();
  const todayLog = getTodayLog();

  const [painRating, setPainRating] = useState(3);
  const [readinessStep, setReadinessStep] = useState<'pain' | 'confidence'>('pain');
  const [showWelcomeBack, setShowWelcomeBack] = useState(returnStatus.isReturning);
  const [hasNotifications] = useState(true);

  useFocusEffect(
    useCallback(() => {
      updateScreenContext('home');
    }, [updateScreenContext])
  );

  useEffect(() => {
    if (!isLoading && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [isLoading, userProfile]);

  useEffect(() => {
    if (!isLoading && userProfile?.onboardingCompleted && !returnStatus.isReturning) {
      recordActivity();
    }
  }, [isLoading, userProfile?.onboardingCompleted, returnStatus.isReturning, recordActivity]);

  const handleReadinessSubmit = (confidence: 'low' | 'medium' | 'high') => {
    logReadiness({
      date: new Date().toISOString().split('T')[0],
      painLevel: painRating,
      confidence,
    });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    setTimeout(() => {
      refreshHomeInsight();
    }, 300);
  };

  const handlePainChange = (newPain: number) => {
    haptics.selection();
    setPainRating(newPain);
  };

  const recentActivities: RecentActivity[] = useMemo(() => {
    const activities: RecentActivity[] = [];
    
    const recentWorkoutLog = dailyLogs.find(log => log.workoutCompleted);
    if (recentWorkoutLog) {
      activities.push({
        id: 'workout-recent',
        type: 'workout',
        title: 'Morning Run',
        subtitle: 'Writing · 3:10 km',
        icon: Activity,
      });
    }

    if (todayLog?.nutritionLog?.foodEntries.length) {
      activities.push({
        id: 'meal-recent',
        type: 'meal',
        title: 'Meal Log',
        subtitle: `Comments · Logged`,
        icon: Utensils,
      });
    } else {
      activities.push({
        id: 'meal-placeholder',
        type: 'meal',
        title: 'Meal Log',
        subtitle: 'Track your meals',
        icon: Utensils,
      });
    }

    return activities;
  }, [dailyLogs, todayLog]);

  const suggestedRecoveryExercises = useMemo(() => {
    const painLevel = todayReadiness?.painLevel ?? 3;
    
    if (painLevel > 6) {
      return recoveryRoutines.filter(r => r.type === 'mobility').slice(0, 3);
    } else if (painLevel > 3) {
      return recoveryRoutines.filter(r => r.type === 'cooldown' || r.type === 'mobility').slice(0, 3);
    }
    return recoveryRoutines.slice(0, 3);
  }, [todayReadiness]);

  const getTodayFocusMessage = (): string => {
    const painLevel = todayReadiness?.painLevel ?? 0;
    const confidence = todayReadiness?.confidence ?? 'medium';
    
    if (painLevel > 6) {
      return 'Take it easy today. Focus on rest and recovery.';
    } else if (painLevel > 3) {
      return 'Light movement could help. Listen to your body.';
    } else if (confidence === 'high') {
      return 'You\'re feeling strong. Make it count.';
    }
    return 'Take the score and hours, sleep.';
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <LinearGradient
      colors={spatialGlass.backgrounds.light.vibrant}
      style={styles.container}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <Text style={styles.title}>Home Screen</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => haptics.light()}>
          <Bell size={22} color={colors.text} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      {showWelcomeBack && returnStatus.isReturning && (
        <WelcomeBackCard 
          returnStatus={returnStatus} 
          onDismiss={() => setShowWelcomeBack(false)} 
        />
      )}

      {!todayReadiness && !showWelcomeBack && (
        <SpatialGlassCard style={styles.readinessCard} layer="control">
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>Daily Check-In</Text>
            <TouchableOpacity onPress={() => handleReadinessSubmit('medium')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {readinessStep === 'pain' ? (
            <View>
              <Text style={styles.readinessQuestion}>How is your knee pain today?</Text>
              <View style={styles.painSelector}>
                <TouchableOpacity style={styles.painBtn} onPress={() => handlePainChange(Math.max(1, painRating - 1))}>
                  <Text style={styles.painBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.painDisplay}>
                  <Text style={styles.painValue}>{painRating}</Text>
                  <Text style={styles.painLabel}>{painRating <= 3 ? 'Mild' : painRating <= 6 ? 'Moderate' : 'Severe'}</Text>
                </View>
                <TouchableOpacity style={[styles.painBtn, styles.painBtnActive]} onPress={() => handlePainChange(Math.min(10, painRating + 1))}>
                  <Text style={[styles.painBtnText, styles.painBtnTextActive]}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setReadinessStep('confidence');
                }}
              >
                <Text style={styles.continueBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.readinessQuestion}>How confident do you feel about training?</Text>
              <View style={styles.confidenceOptions}>
                {[
                  { key: 'low', emoji: '😟', label: 'Low' },
                  { key: 'medium', emoji: '😐', label: 'Medium' },
                  { key: 'high', emoji: '😊', label: 'High' },
                ].map((opt) => (
                  <TouchableOpacity key={opt.key} style={styles.confidenceOption} onPress={() => handleReadinessSubmit(opt.key as 'low' | 'medium' | 'high')}>
                    <Text style={styles.confidenceEmoji}>{opt.emoji}</Text>
                    <Text style={styles.confidenceLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </SpatialGlassCard>
      )}

      <View style={styles.focusCardContainer}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.focusCard}
        >
          <View style={styles.focusCardInner}>
            <View style={styles.focusScoreBadge}>
              <Text style={styles.focusScoreText}>+09</Text>
            </View>
            <View style={styles.focusGraph}>
              <View style={styles.graphLine} />
              <View style={styles.graphDot} />
            </View>
          </View>
          <View style={styles.focusContent}>
            <Text style={styles.focusTitle}>Today&apos;s Focus</Text>
            <Text style={styles.focusSubtitle}>{getTodayFocusMessage()}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent activities</Text>
        <SpatialGlassCard style={styles.activitiesCard} layer="control">
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <TouchableOpacity 
                key={activity.id} 
                style={[
                  styles.activityItem,
                  index < recentActivities.length - 1 && styles.activityItemBorder
                ]}
                onPress={() => {
                  haptics.light();
                  if (activity.type === 'meal') {
                    routerInstance.push('/(tabs)/nutrition');
                  } else if (activity.type === 'workout') {
                    routerInstance.push('/(tabs)/progress');
                  }
                }}
              >
                <View style={styles.activityIconWrap}>
                  <Icon size={18} color={colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </SpatialGlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Recovery Exercises</Text>
        <View style={styles.recoveryList}>
          {suggestedRecoveryExercises.map((routine) => (
            <SpatialGlassCard 
              key={routine.id}
              layer="control"
              interactive
              onPress={() => {
                haptics.light();
                routerInstance.push('/(tabs)/recovery');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
                <View style={styles.recoveryIconWrap}>
                  <Activity size={18} color={colors.primary} />
                </View>
                <View style={styles.recoveryContent}>
                  <Text style={styles.recoveryTitle}>{routine.title}</Text>
                  <Text style={styles.recoveryMeta}>{routine.steps.length} steps · {routine.duration} min</Text>
                </View>
                <TouchableOpacity 
                  style={styles.recoveryPlayBtn}
                  onPress={() => {
                    haptics.medium();
                    routerInstance.push('/(tabs)/recovery');
                  }}
                >
                  <Play size={14} color={colors.surface} fill={colors.surface} />
                </TouchableOpacity>
              </View>
            </SpatialGlassCard>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.wellnessHeader}>
          <Text style={styles.sectionTitle}>Wellness Tips</Text>
        </View>
        <SpatialGlassCard style={styles.wellnessCard} layer="control">
          <Text style={styles.wellnessText}>
            Hooting the air that are always your effortgirlanies will rise you and should leap into yoga properties.
          </Text>
        </SpatialGlassCard>
      </View>

      {todayWorkout && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
          <SpatialGlassCard style={styles.workoutCard} layer="control">
            <Text style={styles.workoutTitle}>{todayWorkout.title}</Text>
            <Text style={styles.workoutMeta}>{todayWorkout.exercises.length} exercises</Text>
            <TouchableOpacity 
              style={styles.startWorkoutBtn}
              onPress={() => routerInstance.push(`/workout/${todayWorkout.id}`)}
            >
              <Play size={16} color={colors.surface} fill={colors.surface} />
              <Text style={styles.startWorkoutText}>Start Workout</Text>
            </TouchableOpacity>
          </SpatialGlassCard>
        </View>
      )}

      <View style={styles.quickActions}>
        <SpatialGlassCard 
          style={styles.quickActionCard} 
          onPress={() => routerInstance.push('/programs' as any)} 
          interactive
          layer="control"
        >
          <Text style={styles.quickActionTitle}>Build My Program</Text>
          <Text style={styles.quickActionDescription}>Shape your training, your way</Text>
        </SpatialGlassCard>
      </View>

      <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  scrollContent: { 
    padding: layout.screenPadding, 
    paddingTop: layout.screenPaddingTop,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 28,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800' as const, 
    color: colors.text, 
    letterSpacing: -0.8,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.medium,
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  readinessCard: { 
    marginBottom: 20,
    ...shadows.medium,
  },
  readinessHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 18,
  },
  readinessTitle: { 
    fontSize: 18, 
    fontWeight: '700' as const, 
    color: colors.text,
  },
  skipText: { 
    fontSize: 15, 
    color: colors.textTertiary, 
    fontWeight: '600' as const,
  },
  readinessQuestion: { 
    fontSize: 16, 
    color: colors.text, 
    marginBottom: 24, 
    textAlign: 'center', 
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  painSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 28, 
    marginBottom: 26,
  },
  painBtn: { 
    width: 54, 
    height: 54, 
    borderRadius: 27, 
    backgroundColor: colors.surfaceDim, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...shadows.soft,
  },
  painBtnActive: { 
    backgroundColor: colors.primaryMuted,
    ...shadows.glowSoft(colors.primary),
  },
  painBtnText: { 
    fontSize: 26, 
    color: colors.textSecondary, 
    lineHeight: 30,
    fontWeight: '600' as const,
  },
  painBtnTextActive: { 
    color: colors.primary,
    fontWeight: '700' as const,
  },
  painDisplay: { 
    alignItems: 'center', 
    width: 90,
  },
  painValue: { 
    fontSize: 44, 
    fontWeight: '800' as const, 
    color: colors.primary,
    letterSpacing: -1,
  },
  painLabel: { 
    fontSize: 13, 
    color: colors.textSecondary, 
    marginTop: 6, 
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  continueBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    borderRadius: borderRadius.full, 
    alignItems: 'center',
    ...shadows.glowSoft(colors.primary),
  },
  continueBtnText: { 
    color: colors.surface, 
    fontWeight: '700' as const, 
    fontSize: 16,
    letterSpacing: 0.2,
  },
  confidenceOptions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12,
  },
  confidenceOption: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: borderRadius.xl, 
    backgroundColor: colors.surfaceDim,
    ...shadows.soft,
  },
  confidenceEmoji: { 
    fontSize: 34, 
    marginBottom: 10,
  },
  confidenceLabel: { 
    fontSize: 15, 
    fontWeight: '600' as const, 
    color: colors.text,
    letterSpacing: 0.2,
  },
  focusCardContainer: {
    marginBottom: 28,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.lifted,
  },
  focusCard: {
    padding: 24,
    minHeight: 180,
  },
  focusCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  focusScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  focusScoreText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.surface,
    letterSpacing: 0.3,
  },
  focusGraph: {
    flex: 1,
    height: 70,
    marginLeft: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  graphLine: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1.5,
  },
  graphDot: {
    position: 'absolute',
    right: '30%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  focusContent: {
    marginTop: 'auto',
  },
  focusTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.surface,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  focusSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
    lineHeight: 21,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  activitiesCard: {
    padding: 0,
    overflow: 'hidden',
    ...shadows.medium,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  recoveryList: {
    gap: 12,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.xl,
    gap: 14,
    ...shadows.medium,
  },
  recoveryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryContent: {
    flex: 1,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  recoveryMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  recoveryPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glowSoft(colors.primary),
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wellnessCard: {
    backgroundColor: colors.infoMuted,
    borderWidth: 0,
    ...shadows.soft,
  },
  wellnessText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  workoutCard: {
    padding: 20,
    ...shadows.medium,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  workoutMeta: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500' as const,
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
    ...shadows.glowSoft(colors.primary),
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
    letterSpacing: 0.2,
  },
  quickActions: { 
    gap: 12,
  },
  quickActionCard: { 
    backgroundColor: colors.surface, 
    padding: 20, 
    borderRadius: borderRadius.xl, 
    ...shadows.medium,
  },
  quickActionTitle: { 
    fontSize: 17, 
    fontWeight: '700' as const, 
    color: colors.text, 
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  quickActionDescription: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  bottomSpacer: { 
    height: layout.tabBarHeight,
  },
});
