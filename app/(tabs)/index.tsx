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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        <Card style={styles.readinessCard}>
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
        </Card>
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
        <Card style={styles.activitiesCard}>
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
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested Recovery Exercises</Text>
        <View style={styles.recoveryList}>
          {suggestedRecoveryExercises.map((routine) => (
            <TouchableOpacity 
              key={routine.id}
              style={styles.recoveryItem}
              onPress={() => {
                haptics.light();
                routerInstance.push('/(tabs)/recovery');
              }}
            >
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
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.wellnessHeader}>
          <Text style={styles.sectionTitle}>Wellness Tips</Text>
        </View>
        <Card style={styles.wellnessCard}>
          <Text style={styles.wellnessText}>
            Hooting the air that are always your effortgirlanies will rise you and should leap into yoga properties.
          </Text>
        </Card>
      </View>

      {todayWorkout && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
          <Card style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>{todayWorkout.title}</Text>
            <Text style={styles.workoutMeta}>{todayWorkout.exercises.length} exercises</Text>
            <TouchableOpacity 
              style={styles.startWorkoutBtn}
              onPress={() => routerInstance.push(`/workout/${todayWorkout.id}`)}
            >
              <Play size={16} color={colors.surface} fill={colors.surface} />
              <Text style={styles.startWorkoutText}>Start Workout</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionCard} 
          onPress={() => routerInstance.push('/programs' as any)} 
          testID="homeBuildProgram"
        >
          <Text style={styles.quickActionTitle}>Build My Program</Text>
          <Text style={styles.quickActionDescription}>Shape your training, your way</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  scrollContent: { 
    padding: layout.screenPadding, 
    paddingTop: layout.screenPaddingTop,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700' as const, 
    color: colors.text, 
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.soft,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  readinessCard: { 
    marginBottom: 18,
  },
  readinessHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 18,
  },
  readinessTitle: { 
    fontSize: 17, 
    fontWeight: '600' as const, 
    color: colors.text,
  },
  skipText: { 
    fontSize: 14, 
    color: colors.textTertiary, 
    fontWeight: '500' as const,
  },
  readinessQuestion: { 
    fontSize: 16, 
    color: colors.text, 
    marginBottom: 20, 
    textAlign: 'center', 
    lineHeight: 23,
  },
  painSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 24, 
    marginBottom: 22,
  },
  painBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: colors.surfaceDim, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  painBtnActive: { 
    backgroundColor: colors.primaryMuted,
  },
  painBtnText: { 
    fontSize: 24, 
    color: colors.textSecondary, 
    lineHeight: 28,
  },
  painBtnTextActive: { 
    color: colors.primary,
  },
  painDisplay: { 
    alignItems: 'center', 
    width: 80,
  },
  painValue: { 
    fontSize: 38, 
    fontWeight: '700' as const, 
    color: colors.primary,
  },
  painLabel: { 
    fontSize: 12, 
    color: colors.textTertiary, 
    marginTop: 4, 
    fontWeight: '500' as const,
  },
  continueBtn: { 
    backgroundColor: colors.primary, 
    paddingVertical: 14, 
    borderRadius: borderRadius.full, 
    alignItems: 'center',
  },
  continueBtnText: { 
    color: colors.surface, 
    fontWeight: '600' as const, 
    fontSize: 16,
  },
  confidenceOptions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 10,
  },
  confidenceOption: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: borderRadius.xl, 
    backgroundColor: colors.surfaceDim,
  },
  confidenceEmoji: { 
    fontSize: 30, 
    marginBottom: 8,
  },
  confidenceLabel: { 
    fontSize: 14, 
    fontWeight: '500' as const, 
    color: colors.text,
  },
  focusCardContainer: {
    marginBottom: 24,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  focusCard: {
    padding: 20,
    minHeight: 160,
  },
  focusCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  focusScoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
  },
  focusScoreText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  focusGraph: {
    flex: 1,
    height: 60,
    marginLeft: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  graphLine: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  graphDot: {
    position: 'absolute',
    right: '30%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  focusContent: {
    marginTop: 'auto',
  },
  focusTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.surface,
    marginBottom: 4,
  },
  focusSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 14,
  },
  activitiesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recoveryList: {
    gap: 10,
  },
  recoveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.xl,
    gap: 12,
    ...shadows.soft,
  },
  recoveryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryContent: {
    flex: 1,
  },
  recoveryTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  recoveryMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  recoveryPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  wellnessCard: {
    backgroundColor: colors.info + '15',
    borderWidth: 0,
  },
  wellnessText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  workoutCard: {
    padding: 18,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
  },
  startWorkoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  quickActions: { 
    gap: 10,
  },
  quickActionCard: { 
    backgroundColor: colors.surface, 
    padding: 18, 
    borderRadius: borderRadius.xl, 
    ...shadows.soft,
  },
  quickActionTitle: { 
    fontSize: 16, 
    fontWeight: '600' as const, 
    color: colors.text, 
    marginBottom: 3,
  },
  quickActionDescription: { 
    fontSize: 13, 
    color: colors.textTertiary, 
    lineHeight: 18,
  },
  bottomSpacer: { 
    height: layout.tabBarHeight,
  },
});
