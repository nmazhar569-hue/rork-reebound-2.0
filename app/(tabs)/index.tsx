import { router, useRouter, useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Utensils, Activity, Play, Sparkles } from 'lucide-react-native';
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
import { BlurView } from 'expo-blur';

import { useApp } from '@/contexts/AppContext';
import { useRee } from '@/contexts/ReeContext';
import { haptics } from '@/utils/haptics';
import { recoveryRoutines } from '@/constants/workoutTemplates';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';

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

function GlassCard({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
  const content = (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
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
    setTimeout(() => refreshHomeInsight(), 300);
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
        subtitle: 'Comments · Logged',
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
    if (painLevel > 6) return 'Take it easy today. Focus on rest and recovery.';
    if (painLevel > 3) return 'Light movement could help. Listen to your body.';
    if (confidence === 'high') return 'You\'re feeling strong. Make it count.';
    return 'Take the score and hours, sleep.';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.logoTitle}>Reebound</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => haptics.light()}>
            <Bell size={20} color={liquidGlass.text.primary} />
            {hasNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>Home Screen</Text>

        {!todayReadiness && !showWelcomeBack && (
          <GlassCard style={styles.readinessCard}>
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
                  <LinearGradient colors={liquidGlass.gradients.button} style={styles.continueBtnGradient}>
                    <Text style={styles.continueBtnText}>Next</Text>
                  </LinearGradient>
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
          </GlassCard>
        )}

        <GlassCard style={styles.focusCard}>
          <View style={styles.focusCardInner}>
            <View style={styles.focusScoreBadge}>
              <Text style={styles.focusScoreText}>+09</Text>
            </View>
            <View style={styles.focusGraph}>
              <View style={styles.graphLine} />
              <View style={styles.graphDots}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.graphDot, i === 3 && styles.graphDotActive]} />
                ))}
              </View>
            </View>
          </View>
          <View style={styles.focusContent}>
            <Text style={styles.focusTitle}>Today&apos;s Focus</Text>
            <Text style={styles.focusSubtitle}>{getTodayFocusMessage()}</Text>
          </View>
        </GlassCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent activities</Text>
          <GlassCard style={styles.activitiesCard}>
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <TouchableOpacity 
                  key={activity.id} 
                  style={[styles.activityItem, index < recentActivities.length - 1 && styles.activityItemBorder]}
                  onPress={() => {
                    haptics.light();
                    if (activity.type === 'meal') routerInstance.push('/(tabs)/nutrition');
                    else if (activity.type === 'workout') routerInstance.push('/(tabs)/progress');
                  }}
                >
                  <View style={styles.activityIconWrap}>
                    <Icon size={18} color={liquidGlass.accent.primary} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <ChevronRight size={18} color={liquidGlass.text.tertiary} />
                </TouchableOpacity>
              );
            })}
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Tips</Text>
          <GlassCard style={styles.wellnessCard}>
            <View style={styles.wellnessContent}>
              <Text style={styles.wellnessText}>
                Hooting the age that are always your effortginees will rise you and should
              </Text>
              <View style={styles.wellnessAvatar}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>R</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </View>

        {todayWorkout && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Workout</Text>
            <GlassCard style={styles.workoutCard}>
              <Text style={styles.workoutTitle}>{todayWorkout.title}</Text>
              <Text style={styles.workoutMeta}>{todayWorkout.exercises.length} exercises</Text>
              <TouchableOpacity 
                style={styles.startWorkoutBtn}
                onPress={() => routerInstance.push(`/workout/${todayWorkout.id}`)}
              >
                <LinearGradient colors={liquidGlass.gradients.button} style={styles.startWorkoutGradient}>
                  <Play size={16} color={liquidGlass.text.inverse} fill={liquidGlass.text.inverse} />
                  <Text style={styles.startWorkoutText}>Start Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        <View style={styles.quickActions}>
          <GlassCard 
            style={styles.quickActionCard} 
            onPress={() => routerInstance.push('/programs' as any)}
          >
            <Sparkles size={20} color={liquidGlass.accent.primary} />
            <Text style={styles.quickActionTitle}>Build My Program</Text>
            <Text style={styles.quickActionDescription}>Shape your training, your way</Text>
          </GlassCard>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: liquidGlass.background.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: liquidGlass.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: liquidGlass.text.secondary,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    padding: glassLayout.screenPadding, 
    paddingTop: glassLayout.screenPaddingTop,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: liquidGlass.text.inverse,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: liquidGlass.accent.primary,
  },
  glassCard: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    padding: 20,
    ...glassShadows.soft,
  },
  readinessCard: { 
    marginBottom: 20,
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
    color: liquidGlass.text.primary,
  },
  skipText: { 
    fontSize: 15, 
    color: liquidGlass.text.tertiary, 
    fontWeight: '600' as const,
  },
  readinessQuestion: { 
    fontSize: 16, 
    color: liquidGlass.text.secondary, 
    marginBottom: 24, 
    textAlign: 'center', 
    lineHeight: 24,
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
    backgroundColor: liquidGlass.surface.glassDark, 
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  painBtnActive: { 
    backgroundColor: liquidGlass.accent.muted,
    borderColor: liquidGlass.accent.primary,
  },
  painBtnText: { 
    fontSize: 26, 
    color: liquidGlass.text.secondary, 
    lineHeight: 30,
  },
  painBtnTextActive: { 
    color: liquidGlass.accent.primary,
  },
  painDisplay: { 
    alignItems: 'center', 
    width: 90,
  },
  painValue: { 
    fontSize: 44, 
    fontWeight: '800' as const, 
    color: liquidGlass.accent.primary,
    letterSpacing: -1,
  },
  painLabel: { 
    fontSize: 13, 
    color: liquidGlass.text.tertiary, 
    marginTop: 6, 
    fontWeight: '600' as const,
  },
  continueBtn: { 
    borderRadius: 50, 
    overflow: 'hidden',
  },
  continueBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 50,
  },
  continueBtnText: { 
    color: liquidGlass.text.inverse, 
    fontWeight: '700' as const, 
    fontSize: 16,
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
    borderRadius: 16, 
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  confidenceEmoji: { 
    fontSize: 34, 
    marginBottom: 10,
  },
  confidenceLabel: { 
    fontSize: 15, 
    fontWeight: '600' as const, 
    color: liquidGlass.text.primary,
  },
  focusCard: {
    marginBottom: 24,
    backgroundColor: liquidGlass.surface.card,
  },
  focusCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  focusScoreBadge: {
    backgroundColor: liquidGlass.accent.muted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: liquidGlass.accent.primary,
  },
  focusScoreText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: liquidGlass.accent.primary,
  },
  focusGraph: {
    flex: 1,
    height: 60,
    marginLeft: 20,
    justifyContent: 'center',
  },
  graphLine: {
    height: 2,
    backgroundColor: liquidGlass.accent.primary,
    borderRadius: 1,
    opacity: 0.3,
  },
  graphDots: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  graphDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: liquidGlass.accent.muted,
    borderWidth: 1,
    borderColor: liquidGlass.accent.primary,
  },
  graphDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: liquidGlass.accent.primary,
    ...glassShadows.glow,
  },
  focusContent: {},
  focusTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 6,
  },
  focusSubtitle: {
    fontSize: 14,
    color: liquidGlass.text.secondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
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
    borderBottomColor: liquidGlass.border.subtle,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: liquidGlass.accent.muted,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
  },
  wellnessCard: {
    backgroundColor: liquidGlass.surface.card,
  },
  wellnessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  wellnessText: {
    flex: 1,
    fontSize: 14,
    color: liquidGlass.text.secondary,
    lineHeight: 22,
  },
  wellnessAvatar: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: liquidGlass.text.inverse,
  },
  workoutCard: {
    padding: 20,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
    marginBottom: 16,
  },
  startWorkoutBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  startWorkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 50,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: liquidGlass.text.inverse,
  },
  quickActions: { 
    gap: 12,
  },
  quickActionCard: { 
    padding: 20,
  },
  quickActionTitle: { 
    fontSize: 17, 
    fontWeight: '700' as const, 
    color: liquidGlass.text.primary, 
    marginTop: 12,
    marginBottom: 4,
  },
  quickActionDescription: { 
    fontSize: 14, 
    color: liquidGlass.text.tertiary, 
    lineHeight: 20,
  },
  bottomSpacer: { 
    height: glassLayout.tabBarHeight,
  },
});
