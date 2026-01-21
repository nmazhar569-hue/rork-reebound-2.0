import { router, useRouter, useFocusEffect } from 'expo-router';
import { Bell, ChevronRight, Utensils, Activity, Play, Sparkles, Moon, Heart, Calendar, ArrowRight, User, Star } from 'lucide-react-native';
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
import { StatusGlassCard } from '@/components/StatusGlassCard';
import { RecoveryInbox } from '@/components/RecoveryInbox';
import { analysisService, RecoveryAnalysis, StatusColor } from '@/services/AnalysisService';
import { calendarService, DailyAvailability } from '@/services/CalendarService';
import { storageService } from '@/services/StorageService';
import { WorkoutSession } from '@/types';

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
  const { userProfile, getTodayWorkout, getTodayReadiness, logReadiness, isLoading, getReturnStatus, recordActivity, dailyLogs, getTodayLog, userPoints } = useApp();
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
  const [inboxVisible, setInboxVisible] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryAnalysis | null>(null);
  const [calendarAvailability, setCalendarAvailability] = useState<DailyAvailability | null>(null);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [weeklyVolumeAvg, setWeeklyVolumeAvg] = useState<number>(0);

  const mockBiometrics = useMemo(() => {
    const painLevel = todayReadiness?.painLevel ?? 3;
    const sleepHours = 6.5;
    const hrvValue = painLevel > 6 ? 35 : painLevel > 3 ? 45 : 55;
    const stressLevel = painLevel > 5 ? 7 : 4;
    
    return {
      sleepHours,
      hrv: hrvValue,
      stressRating: stressLevel,
      sorenessRating: painLevel,
    };
  }, [todayReadiness]);

  useEffect(() => {
    const initCalendar = async () => {
      try {
        await calendarService.requestPermissions();
        const availability = await calendarService.getAvailability();
        setCalendarAvailability(availability);
        console.log('[HomeScreen] Calendar availability:', availability);
      } catch (error) {
        console.error('[HomeScreen] Calendar init failed:', error);
      }
    };
    initCalendar();
  }, []);

  useEffect(() => {
    const loadWorkoutHistory = async () => {
      try {
        const last = await storageService.getLastWorkout();
        const avgVolume = await storageService.getWeeklyVolumeAverage();
        setLastWorkout(last);
        setWeeklyVolumeAvg(avgVolume);
        console.log('[HomeScreen] Last workout:', last?.date, 'Volume avg:', avgVolume);
      } catch (error) {
        console.error('[HomeScreen] Error loading workout history:', error);
      }
    };
    loadWorkoutHistory();
  }, []);

  useEffect(() => {
    const freeMinutes = calendarAvailability?.totalFreeMinutes;
    const result = analysisService.analyzeDailyState(
      {
        date: new Date(),
        sleepHours: mockBiometrics.sleepHours,
        sleepQuality: 'fair',
        hrv: mockBiometrics.hrv,
        restingHeartRate: 62,
        sorenessRating: mockBiometrics.sorenessRating,
        stressRating: mockBiometrics.stressRating,
      },
      lastWorkout ?? undefined,
      weeklyVolumeAvg,
      freeMinutes
    );
    setRecoveryStatus(result);
    console.log('[HomeScreen] Recovery analysis:', result);
  }, [mockBiometrics, calendarAvailability, lastWorkout, weeklyVolumeAvg]);

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

  const getStatusColor = (color: StatusColor): string => {
    if (color === 'GREEN') return '#22C55E';
    if (color === 'YELLOW') return '#EAB308';
    return '#EF4444';
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
            <TouchableOpacity 
              style={styles.userAvatarBtn}
              onPress={() => {
                haptics.light();
                routerInstance.push('/profile');
              }}
              testID="profile-button"
            >
              <Text style={styles.userAvatarText}>
                {userProfile?.questionnaireProfile?.preferredName?.charAt(0).toUpperCase() || 'R'}
              </Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.greetingText}>Welcome back</Text>
              <Text style={styles.logoTitle}>
                {userProfile?.questionnaireProfile?.preferredName || 'Athlete'}
              </Text>
            </View>
          </View>
          <View style={styles.pointsBadge}>
            <Star size={14} color="#CCFF00" fill="#CCFF00" />
            <Text style={styles.pointsText}>{userPoints}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn} 
            onPress={() => {
              haptics.light();
              setInboxVisible(true);
            }}
            testID="inbox-button"
          >
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

        {recoveryStatus && (
          <StatusGlassCard
            variant="hero"
            statusColor={recoveryStatus.color}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>SYSTEM STATUS</Text>
                <Text style={styles.heroTitle}>
                  {analysisService.getActionLabel(recoveryStatus.recommendedAction)}
                </Text>
              </View>
              <View style={[styles.scoreCircle, { borderColor: getStatusColor(recoveryStatus.color) }]}>
                <Text style={[styles.scoreText, { color: getStatusColor(recoveryStatus.color) }]}>
                  {recoveryStatus.score}
                </Text>
              </View>
            </View>
            <View style={styles.agentMessage}>
              <Text style={styles.agentText}>
                {recoveryStatus.flags[0]?.message || 'All systems go. You are primed for high intensity.'}
              </Text>
            </View>
          </StatusGlassCard>
        )}

        <View style={styles.briefRow}>
          <StatusGlassCard variant="thin" style={styles.smallCard}>
            <Moon color="rgba(255,255,255,0.6)" size={20} />
            <Text style={styles.statValue}>{mockBiometrics.sleepHours}h</Text>
            <Text style={styles.statLabel}>Sleep</Text>
          </StatusGlassCard>
          <StatusGlassCard variant="thin" style={styles.smallCard}>
            <Heart color="rgba(255,255,255,0.6)" size={20} />
            <Text style={styles.statValue}>{mockBiometrics.hrv}</Text>
            <Text style={styles.statLabel}>HRV (ms)</Text>
          </StatusGlassCard>
          <StatusGlassCard variant="thin" style={styles.smallCard}>
            <Calendar color="rgba(255,255,255,0.6)" size={20} />
            <Text style={styles.statValue}>
              {calendarAvailability 
                ? calendarService.formatFreeTime(calendarAvailability.totalFreeMinutes)
                : '...'}
            </Text>
            <Text style={styles.statLabel}>Free</Text>
          </StatusGlassCard>
        </View>

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

      <RecoveryInbox 
        visible={inboxVisible} 
        onClose={() => setInboxVisible(false)} 
      />
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
    gap: 12,
  },
  userAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: liquidGlass.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: liquidGlass.text.inverse,
  },
  greetingText: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginBottom: 2,
  },
  logoTitle: {
    fontSize: 18,
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
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(204, 255, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#CCFF00',
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
  heroCard: {
    minHeight: 160,
    marginBottom: 20,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600' as const,
  },
  heroTitle: {
    color: liquidGlass.text.primary,
    fontSize: 22,
    fontWeight: '700' as const,
    marginTop: 6,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  agentMessage: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  agentText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 21,
  },
  briefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  smallCard: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: liquidGlass.text.primary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500' as const,
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
