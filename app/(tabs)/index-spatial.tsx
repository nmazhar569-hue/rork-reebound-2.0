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
import { BlurView } from 'expo-blur';

import { useApp } from '@/contexts/AppContext';
import { useRee } from '@/contexts/ReeContext';
import { LoadingState } from '@/components/ui';
import { WelcomeBackCard } from '@/components/WelcomeBackCard';
import { SpatialGlassCard } from '@/components/SpatialGlassCard';
import colors, { borderRadius, shadows, layout, gradients } from '@/constants/colors';
import spatialGlass, { spatialRadius } from '@/constants/spatialGlass';
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
    <View style={styles.container}>
      {/* LAYER 0: Deep Vibrant Background */}
      <LinearGradient
        colors={spatialGlass.backgrounds.light.vibrant}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Spatial Glass */}
        <View style={styles.header}>
          <Text style={styles.title}>Home Screen</Text>
          <SpatialGlassCard layer="control" interactive onPress={() => haptics.light()} style={styles.notificationBtn}>
            <Bell size={22} color={spatialGlass.typography.light.primary} />
            {hasNotifications && <View style={styles.notificationDot} />}
          </SpatialGlassCard>
        </View>

        {showWelcomeBack && returnStatus.isReturning && (
          <WelcomeBackCard 
            returnStatus={returnStatus} 
            onDismiss={() => setShowWelcomeBack(false)} 
          />
        )}

        {/* Daily Check-In - Spatial Glass Card */}
        {!todayReadiness && !showWelcomeBack && (
          <SpatialGlassCard layer="control" style={styles.readinessCard}>
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
                <SpatialGlassCard layer="elevated" interactive onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setReadinessStep('confidence');
                }} style={styles.continueBtn}>
                  <Text style={styles.continueBtnText}>Next</Text>
                </SpatialGlassCard>
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
                    <SpatialGlassCard 
                      key={opt.key} 
                      layer="elevated" 
                      interactive 
                      onPress={() => handleReadinessSubmit(opt.key as 'low' | 'medium' | 'high')}
                      style={styles.confidenceOption}
                    >
                      <Text style={styles.confidenceEmoji}>{opt.emoji}</Text>
                      <Text style={styles.confidenceLabel}>{opt.label}</Text>
                    </SpatialGlassCard>
                  ))}
                </View>
              </View>
            )}
          </SpatialGlassCard>
        )}

        {/* Today's Focus - Gradient Glass Card with Specular Edges */}
        <SpatialGlassCard layer="control" mode="workout" style={styles.focusCardContainer}>
          <LinearGradient
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.focusCard}
          >
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
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
              <Text style={styles.focusTitle}>Today's Focus</Text>
              <Text style={styles.focusSubtitle}>{getTodayFocusMessage()}</Text>
            </View>
          </LinearGradient>
        </SpatialGlassCard>

        {/* Recent Activities - Nested Glass Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent activities</Text>
          <SpatialGlassCard layer="control" style={styles.activitiesCard}>
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <SpatialGlassCard
                  key={activity.id}
                  layer="elevated"
                  interactive
                  onPress={() => haptics.light()}
                  style={[
                    styles.activityItem,
                    index < recentActivities.length - 1 && styles.activityItemWithBorder,
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <Icon size={20} color={colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} />
                </SpatialGlassCard>
              );
            })}
          </SpatialGlassCard>
        </View>

        {/* Recovery Exercises - Glass Cards with Interactive Physics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Recovery Exercises</Text>
          {suggestedRecoveryExercises.map((exercise) => (
            <SpatialGlassCard
              key={exercise.id}
              layer="control"
              interactive
              mode="recovery"
              onPress={() => {
                haptics.medium();
                router.push('/(tabs)/recovery');
              }}
              style={styles.recoveryCard}
            >
              <Text style={styles.recoveryTitle}>{exercise.title}</Text>
              <Text style={styles.recoverySubtitle}>{exercise.duration} min</Text>
              <Text style={styles.recoveryDescription}>{exercise.type}</Text>
            </SpatialGlassCard>
          ))}
        </View>

        {/* Wellness Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Tips</Text>
          <SpatialGlassCard layer="control" style={styles.tipCard}>
            <Text style={styles.tipTitle}>💧 Hydration Check</Text>
            <Text style={styles.tipText}>Drink 8 glasses of water daily to support joint health and recovery.</Text>
          </SpatialGlassCard>
        </View>

        {/* Workout Card */}
        {todayWorkout && (
          <SpatialGlassCard layer="control" mode="workout" style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>Today's Workout</Text>
            <Text style={styles.workoutName}>{todayWorkout.title}</Text>
            <SpatialGlassCard 
              layer="elevated" 
              interactive 
              onPress={() => router.push(`/workout/${todayWorkout.id}`)}
              style={styles.workoutButton}
            >
              <Play size={20} color={colors.surface} fill={colors.surface} />
              <Text style={styles.workoutButtonText}>Start</Text>
            </SpatialGlassCard>
          </SpatialGlassCard>
        )}

        {/* Quick Action */}
        <SpatialGlassCard 
          layer="control" 
          interactive 
          onPress={() => router.push('/programs/builder')}
          style={styles.buildCard}
        >
          <Text style={styles.buildTitle}>Build My Program</Text>
          <Text style={styles.buildSubtitle}>Get a personalized workout plan</Text>
          <ChevronRight size={24} color={colors.primary} strokeWidth={2.5} />
        </SpatialGlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: spatialGlass.typography.light.primary,
    letterSpacing: -1,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: spatialRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  
  // Readiness Card
  readinessCard: {
    padding: 24,
    marginBottom: 20,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  readinessTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: spatialGlass.typography.light.primary,
    letterSpacing: -0.5,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  readinessQuestion: {
    fontSize: 17,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
    marginBottom: 20,
    lineHeight: 24,
  },
  painSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  painBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  painBtnActive: {
    backgroundColor: colors.primary,
  },
  painBtnText: {
    fontSize: 28,
    fontWeight: '600',
    color: spatialGlass.typography.light.secondary,
  },
  painBtnTextActive: {
    color: '#FFF',
  },
  painDisplay: {
    alignItems: 'center',
    gap: 4,
  },
  painValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -2,
  },
  painLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: spatialGlass.typography.light.secondary,
  },
  continueBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  confidenceOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  confidenceOption: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  confidenceEmoji: {
    fontSize: 32,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
  },
  
  // Focus Card
  focusCardContainer: {
    marginBottom: 28,
    overflow: 'hidden',
  },
  focusCard: {
    padding: 24,
    minHeight: 140,
  },
  focusCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  focusScoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  focusGraph: {
    width: 80,
    height: 40,
    position: 'relative',
  },
  graphLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  graphDot: {
    position: 'absolute',
    right: 0,
    bottom: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  focusContent: {
    gap: 6,
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  focusSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  
  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: spatialGlass.typography.light.primary,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  
  // Activities
  activitiesCard: {
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityItemWithBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
  },
  activitySubtitle: {
    fontSize: 14,
    color: spatialGlass.typography.light.secondary,
  },
  
  // Recovery
  recoveryCard: {
    padding: 18,
    marginBottom: 12,
  },
  recoveryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
    marginBottom: 4,
  },
  recoverySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
  recoveryDescription: {
    fontSize: 14,
    color: spatialGlass.typography.light.secondary,
    lineHeight: 20,
  },
  
  // Tip Card
  tipCard: {
    padding: 20,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: spatialGlass.typography.light.secondary,
    lineHeight: 22,
  },
  
  // Workout Card
  workoutCard: {
    padding: 24,
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: spatialGlass.typography.light.secondary,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 22,
    fontWeight: '700',
    color: spatialGlass.typography.light.primary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  workoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    backgroundColor: colors.primary,
  },
  workoutButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // Build Card
  buildCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  buildTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: spatialGlass.typography.light.primary,
  },
  buildSubtitle: {
    fontSize: 14,
    color: spatialGlass.typography.light.secondary,
  },
  
  bottomSpacer: {
    height: 40,
  },
});
