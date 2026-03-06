import { router, useRouter, useFocusEffect } from 'expo-router';
<<<<<<< HEAD
import { Bell, Star, Compass, BarChart } from 'lucide-react-native';
=======
import { Bell, Star } from 'lucide-react-native';
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
  Modal,
} from 'react-native';
<<<<<<< HEAD
=======
import { LinearGradient } from 'expo-linear-gradient';
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3

import { useApp } from '@/contexts/AppContext';
import { useRee } from '@/contexts/ReeContext';
import { haptics } from '@/utils/haptics';
<<<<<<< HEAD
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import colors from '@/constants/colors';

// Components
import { ReeButton } from '@/components/ReeButton';
import { VoidBackground } from '@/components/VoidBackground';
import { RecoverySnapshot } from '@/components/home/RecoverySnapshot';
import { WorkoutHero } from '@/components/home/WorkoutHero';
import { WeeklyDashboard } from '@/components/home/WeeklyDashboard';
import { NutritionSnapshot } from '@/components/home/NutritionSnapshot';
import { ReeInsight } from '@/components/home/ReeInsight';
import { RecoveryInbox } from '@/components/RecoveryInbox';
import { ReeCheckInModal } from '@/components/ReeCheckInModal';



// Services
=======
import { theme } from '@/constants/theme';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';

// Components
import { DynamicStatusPanel, PanelContext } from '@/components/DynamicStatusPanel';
import { ReeButton } from '@/components/ReeButton';
import { QuickActions } from '@/components/QuickActions';
import { RecoveryInbox } from '@/components/RecoveryInbox';
import { ReeAnalysisModal } from '@/components/ReeAnalysisModal';
import { VoidBackground } from '@/components/ui/VoidBackground';

// Services
import { analysisService, RecoveryAnalysis } from '@/services/AnalysisService';
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
import { calendarService, DailyAvailability } from '@/services/CalendarService';

import { storageService } from '@/services/StorageService';
import { userInsightService } from '@/services/UserInsightService';
import { WorkoutSession } from '@/types';

import { ReeInsight as ReeInsightData, ReadinessData } from '@/types/intelligence';
import { RecoveryPlan, RecoveryRecommendation } from '@/types/recovery';
import { recoveryEngine } from '@/services/RecoveryEngine';
import { RecoveryInvitation } from '@/components/RecoveryInvitation';
import { RecoveryDashboard } from '@/components/RecoveryDashboard';
import { RecoveryActivityLogger } from '@/components/RecoveryActivityLogger';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const {
    userProfile,
<<<<<<< HEAD
    dailyLogs,
    getTodayWorkout,
    isLoading,
    userPoints,
    logWorkout,
    getTodayLog
  } = useApp();

  const { updateScreenContext, hasUnseenInsight } = useRee();
  const todayWorkout = getTodayWorkout();
  const todayLog = getTodayLog();
  const todayDate = new Date();
  const routerInstance = useRouter();

  // State
  const [hasNotifications] = useState(true);
  const [inboxVisible, setInboxVisible] = useState(false);
=======
    getTodayWorkout,
    getTodayReadiness,
    isLoading,
    getReturnStatus,
    recordActivity,
    userPoints
  } = useApp();

  const { updateScreenContext, hasUnseenInsight } = useRee();
  const todayWorkout = getTodayWorkout();
  const todayReadiness = getTodayReadiness();
  const returnStatus = getReturnStatus();
  const routerInstance = useRouter();

  // State
  const [hasNotifications] = useState(true);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryAnalysis | null>(null);
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  const [calendarAvailability, setCalendarAvailability] = useState<DailyAvailability | null>(null);
  const [reeInsight, setReeInsight] = useState<ReeInsightData | null>(null);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [readinessData, setReadinessData] = useState<ReadinessData | null>(null);

<<<<<<< HEAD
  // Recovery Engine State
  const [activePlan, setActivePlan] = useState<RecoveryPlan | null>(null);
  const [recoveryRec, setRecoveryRec] = useState<RecoveryRecommendation | null>(null);
  const [invitationVisible, setInvitationVisible] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [activityLoggerVisible, setActivityLoggerVisible] = useState(false);

=======
  // Mock biometrics (will be replaced with real data later)
  const mockBiometrics = useMemo(() => {
    const painLevel = todayReadiness?.painLevel ?? 3;
    const sleepHours = 7.8;
    const hrvValue = painLevel > 6 ? 35 : painLevel > 3 ? 45 : 55;
    const stressLevel = painLevel > 5 ? 7 : 4;

    return {
      sleepHours,
      hrv: hrvValue,
      stressRating: stressLevel,
      sorenessRating: painLevel,
    };
  }, [todayReadiness]);

  // Determine panel context based on time and state
  const panelContext = useMemo((): PanelContext => {
    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    const isEvening = hour >= 18 || hour < 5;
    const hasWorkedOutToday = todayReadiness?.painLevel !== undefined;
    const isRestDay = !todayWorkout;
    const isLowEnergy = mockBiometrics.stressRating >= 7;

    if (isLowEnergy) return 'low_energy';
    if (isRestDay) return 'rest_day';
    if (hasWorkedOutToday && isEvening) return 'evening_complete';
    if (hasWorkedOutToday) return 'post_workout';
    if (isMorning) return 'morning_ready';
    if (isEvening && !hasWorkedOutToday) return 'evening_pending';

    return 'morning_ready';
  }, [todayWorkout, todayReadiness, mockBiometrics.stressRating]);

>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  // Initialize calendar
  useEffect(() => {
    const initCalendar = async () => {
      try {
        await calendarService.requestPermissions();
        const availability = await calendarService.getAvailability();
        setCalendarAvailability(availability);
      } catch (error) {
        console.error('[HomeScreen] Calendar init failed:', error);
      }
    };
    initCalendar();
  }, []);

<<<<<<< HEAD
  // Initialize Intelligence Engine
=======
  // Load workout history
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  useEffect(() => {
    const loadInsights = async () => {
      try {
<<<<<<< HEAD
        // 1. Build Model (In a real app, this runs in background)
        const model = await userInsightService.buildUserModel();
        // 2. Run Inference
        const insights = await userInsightService.generateInsights(model);
        // 3. Set top insight
        if (insights.length > 0) {
          setReeInsight(insights[0]);
        }
      } catch (err) {
        console.warn('[InsightEngine] Failed to generate insights:', err);
=======
        const last = await storageService.getLastWorkout();
        const avgVolume = await storageService.getWeeklyVolumeAverage();
        setLastWorkout(last);
        setWeeklyVolumeAvg(avgVolume);
      } catch (error) {
        console.error('[HomeScreen] Error loading workout history:', error);
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
      }
    };
    loadInsights();
  }, []);

<<<<<<< HEAD
  // Initialize Recovery Engine (Real Data Integration)
  useEffect(() => {
    // Only check if no active plan
    if (activePlan) return;

    // 1. Calculate Real Stats from Daily Logs
    const last7Days = dailyLogs.slice(0, 7); // Assuming dailyLogs is sorted desc? Need to verify. 
    // Usually dailyLogs are date keyed or sorted. Let's assume standard array.

    // Calculate 7-day Sleep Avg
    const sleepSum = last7Days.reduce((acc, log) => acc + (log.sleepHours || 0), 0);
    const validSleepLogs = last7Days.filter(l => l.sleepHours && l.sleepHours > 0).length;
    const sleepAverage = validSleepLogs > 0 ? sleepSum / validSleepLogs : (userProfile?.baselineSleep || 7.5);

    // Calculate Energy Trend (Last 3 vs Previous 3) or just current
    // Simple approach: Current vs Baseline (5)
    const currentEnergy = todayLog?.energyLevel || 7; // Default ok
    const energyTrend = (currentEnergy - 7) / 10; // -0.3 to +0.3 range approx

    // Soreness/Stress from today's checking or recent logs
    const sorenessScore = todayLog?.painLevel || 0;
    // Stress is not fully logged in DailyLog yet, defaulting to userProfile or neutral
    const stressScore = 3;

    const realStats = {
      sleepAverage,
      energyTrend,
      sorenessScore,
      stressScore
    };

    console.log('[Home] Checking Recovery Triggers with:', realStats);

    const rec = recoveryEngine.checkForTriggers(realStats);
    if (rec) {
      setRecoveryRec(rec);
      // Delay slightly for effect
      setTimeout(() => setInvitationVisible(true), 1500);
    }
  }, [activePlan, dailyLogs, todayLog, userProfile]);

  // Recovery Handlers
  const handleAcceptPlan = () => {
    if (!recoveryRec) return;

    // Use current state for plan creation
    const sleepAverage = (dailyLogs.reduce((acc, l) => acc + (l.sleepHours || 0), 0) / (dailyLogs.length || 1)) || 7.5;

    const realStats = {
      sleepAverage,
      energyTrend: 0, // Neutral start for plan
      sorenessScore: todayLog?.painLevel || 0,
      stressScore: 5 // Neutral
    };

    const newPlan = recoveryEngine.createPlan(recoveryRec, realStats);
    setActivePlan(newPlan);
    setInvitationVisible(false);
    haptics.success();
    // Open dashboard immediately
    setTimeout(() => setDashboardVisible(true), 500);
  };

  const handleLogRecoveryActivity = (type: string) => {
    // In real app, we set the type state then open logger
    setActivityLoggerVisible(true);
  };

  const handleSaveRecoveryLog = (data: any) => {
    console.log('Recovery Logged:', data);
    haptics.success();
    setActivityLoggerVisible(false);
    // Here we would actually update the Plan state with the log
  };

=======
  // Analyze daily state
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
  }, [mockBiometrics, calendarAvailability, lastWorkout, weeklyVolumeAvg]);

>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  // Update screen context for Ree
  useFocusEffect(
    useCallback(() => {
      updateScreenContext('home');
    }, [updateScreenContext])
  );

<<<<<<< HEAD
  // Real Data Logic
  // todayLog and todayDate moved to top

  // 1. Recovery Data Handler
  const handleCheckInSubmit = async (data: any) => {
    setCheckInVisible(false);

    // Calculate Readiness
    const readiness = userInsightService.calculateReadiness(
      data.energy,
      data.soreness,
      data.stress,
      data.motivation
    );

    setReadinessData(readiness);
    haptics.success();

    // Log to DB (Partial log for now)
    const log = todayLog || {
      date: todayDate.toISOString().split('T')[0],
      workoutCompleted: false,
      painLevel: 0,
      confidenceLevel: 0
    };

    await logWorkout({
      ...log,
      energyLevel: data.energy,
      // TODO: Add soreness, stress, motivation to DB schema
    });

    // Show result via creating a temporary insight or using the UI directly
    // Ideally we show a "Readiness Result" modal, but for now we set it to state 
    // and let the Home Screen render it.
  };

  // 2. Weekly Stats Calculation
  const weeklyStats = useMemo(() => {
    const end = new Date();
    // Start of week (Monday) calculation
    const day = end.getDay();
    const diff = end.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(end.setDate(diff));

    const completedDays = [false, false, false, false, false, false, false];
    let completedCount = 0;
    const weekLogs = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const log = dailyLogs.find(l => l.date === dateStr);
      if (log?.workoutCompleted) {
        completedDays[i] = true;
        completedCount++;
      }
      if (log) weekLogs.push(log);
    }

    const totalSleep = weekLogs.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0);
    const avgSleep = weekLogs.length ? (totalSleep / weekLogs.length).toFixed(1) : '0.0';

    const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    return {
      completedDays,
      currentDayIdx, // Fix: use current day not loop index
      trainingCount: completedCount,
      avgSleep,
    };
  }, [dailyLogs]);

  // 3. Workout Hero Logic
  const heroData = useMemo(() => {
    if (!todayWorkout) return null;

    return {
      focus: todayWorkout.focus.replace('_', ' ').toUpperCase(),
      exerciseCount: todayWorkout.exercises.length,
      // Sets is a number in Exercise type, not an array
      setCount: todayWorkout.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0),
      // Duration not present on Workout type, calculate manually
      duration: todayWorkout.exercises.length * 5 + 10,
    };
  }, [todayWorkout]);

  // Recovery Checklist State (Initialize from log or default)
  const defaultChecklist = [
    { id: 'hydrate', label: 'Hydrate (3L)', completed: false },
    { id: 'stretch', label: '10m Stretching', completed: false },
    { id: 'screen_off', label: 'No Screens (1hr pre-bed)', completed: false },
    { id: 'breath', label: 'Breathwork (5m)', completed: false },
  ];

  const [recoveryChecklist, setRecoveryChecklist] = useState(
    dailyLogs.find(l => l.date === new Date().toISOString().split('T')[0])?.recoveryChecklist || defaultChecklist
  );

  // Sync checklist if log updates (e.g. initial load)
  useEffect(() => {
    const log = dailyLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
    if (log?.recoveryChecklist) {
      setRecoveryChecklist(log.recoveryChecklist);
    }
  }, [dailyLogs]);

  const handleToggleRecoveryTask = async (id: string) => {
    const updatedList = recoveryChecklist.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setRecoveryChecklist(updatedList);
    haptics.light();

    // Persist to Storage
    // We reuse logWorkout to update the daily entry
    const log = getTodayLog() || {
      date: new Date().toISOString().split('T')[0],
      workoutCompleted: false,
      painLevel: 0,
      confidenceLevel: 0
    };

    await logWorkout({
      ...log,
      recoveryChecklist: updatedList
    });
  };

  // Simple Insight Logic
  const showInsight = (todayLog?.energyLevel || 10) < 5;

  // Handlers


  const handleStartWorkout = () => {
    haptics.medium();
    router.push('/myworkoutplan');
=======
  // Redirect to onboarding if needed
  useEffect(() => {
    if (!isLoading && !userProfile?.onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [isLoading, userProfile]);

  // Record activity
  useEffect(() => {
    if (!isLoading && userProfile?.onboardingCompleted && !returnStatus.isReturning) {
      recordActivity();
    }
  }, [isLoading, userProfile?.onboardingCompleted, returnStatus.isReturning, recordActivity]);

  // Handlers
  const handleReePress = () => {
    setCheckInModalVisible(true);
  };

  const handleStartWorkout = () => {
    haptics.medium();
    if (todayWorkout) {
      routerInstance.push(`/workout/${todayWorkout.id}`);
    } else {
      routerInstance.push('/(tabs)/plan');
    }
  };

  const handleLogNutrition = () => {
    haptics.light();
    routerInstance.push('/(tabs)/nutrition');
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  };

  const handleViewNutrition = () => {
    haptics.light();
    router.push('/(tabs)/nutrition');
  };

  const userGoal = useMemo(() => {
    if (userProfile?.northStar) return userProfile.northStar;
    if (userProfile?.intentProfile?.primaryIntent) {
      return userProfile.intentProfile.primaryIntent.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return 'North Star';
  }, [userProfile]);

  if (isLoading) {
    return (
      <VoidBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </VoidBackground>
    );
  }

  return (
    <VoidBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD
=======
        {/* Header */}
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <TouchableOpacity
              style={styles.userAvatarBtn}
              onPress={() => {
                haptics.light();
                routerInstance.push('/profile');
              }}
            >
              <Text style={styles.userAvatarText}>
                {userProfile?.questionnaireProfile?.preferredName?.charAt(0).toUpperCase() || 'R'}
              </Text>
            </TouchableOpacity>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.greetingText}>Welcome back</Text>
              </View>
              <Text style={styles.logoTitle}>
                {userProfile?.questionnaireProfile?.preferredName || 'Athlete'}
              </Text>
            </View>
          </View>

<<<<<<< HEAD
          {/* Centered North Star */}
          <View style={styles.centeredHeader}>
            <View style={styles.northStarBadge}>
              <Compass size={12} color={liquidGlass.accent.secondary} />
              <Text style={styles.northStarText} numberOfLines={1}>{userGoal}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => {
                haptics.light();
                setInboxVisible(true);
              }}
            >
              <Bell size={20} color={liquidGlass.text.primary} />
              {hasNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra Function: View Progress */}
        <TouchableOpacity
          style={styles.viewProgressBtn}
          onPress={() => {
            haptics.medium();
            routerInstance.push('/progress');
          }}
        >
          <BarChart size={18} color={liquidGlass.text.primary} />
          <Text style={styles.viewProgressText}>Visualize Progress</Text>
        </TouchableOpacity>

        {/* TIER 1: ACTIVE RECOVERY PLAN (Overrides Weekly if active) */}
        {activePlan ? (
          <TouchableOpacity
            style={styles.activePlanCard}
            onPress={() => {
              haptics.light();
              setDashboardVisible(true);
            }}
          >
            <View style={styles.activePlanHeader}>
              <Text style={styles.activePlanTitle}>active {activePlan.type.replace('_', ' ')} plan</Text>
              <View style={styles.activePlanBadge}>
                <Text style={styles.activePlanBadgeText}>DAY {activePlan.currentDay}/{activePlan.totalDays}</Text>
              </View>
            </View>
            <Text style={styles.activePlanSub}>Tap to view daily protocols & progress</Text>
          </TouchableOpacity>
        ) : (
          <WeeklyDashboard
            completedDays={weeklyStats.completedDays}
            currentDayIndex={weeklyStats.currentDayIdx}
            recoveryChecklist={recoveryChecklist}
            onToggleRecoveryTask={handleToggleRecoveryTask}
          />
        )}

        {/* Nutrition Snapshot */}
        <NutritionSnapshot />

        {/* TIER 2: Daily Check-In & Readiness */}
        {!readinessData ? (
          <TouchableOpacity
            style={styles.checkInCard}
            onPress={() => {
              haptics.medium();
              setCheckInVisible(true);
            }}
          >
            <View style={styles.checkInContent}>
              <Text style={styles.checkInTitle}>Daily Check-In</Text>
              <Text style={styles.checkInSubtitle}>Analyze your readiness to train</Text>
            </View>
            <View style={styles.checkInButton}>
              <Text style={styles.checkInButtonText}>Start</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.readinessCard}>
            <View style={styles.readinessHeader}>
              <Text style={styles.readinessScoreTitle}>Readiness Score</Text>
              <Text style={[styles.readinessScoreValue, { color: getReadinessColor(readinessData.category) }]}>
                {readinessData.score}
              </Text>
            </View>
            <Text style={styles.readinessCategory}>{readinessData.category}</Text>
            <Text style={styles.readinessAdvice}>{readinessData.advice}</Text>
            <View style={[styles.recommendationBadge, { backgroundColor: getReadinessColor(readinessData.category) + '20' }]}>
              <Text style={[styles.recommendationText, { color: getReadinessColor(readinessData.category) }]}>
                Rec: {readinessData.action}
              </Text>
            </View>
          </View>
        )}

        {/* TIER 3: Workout Hero */}
        {heroData ? (
          <WorkoutHero
            focus={heroData.focus}
            exerciseCount={heroData.exerciseCount}
            setCount={heroData.setCount}
            durationMinutes={heroData.duration}
            onStart={handleStartWorkout}
          />
        ) : (
          <TouchableOpacity onPress={handleStartWorkout} style={styles.emptyHero}>
            <Text style={styles.emptyHeroTitle}>Rest Day, or Schedule One?</Text>
            <Text style={styles.emptyHeroSubtitle}>Tap to browse workouts</Text>
          </TouchableOpacity>
        )}

        {/* TIER 3: Ree's Insight */}
        <ReeInsight
          insight={reeInsight}
          onAction={(actionId, route) => {
            haptics.medium();
            setReeInsight(null); // Dismiss immediately on action

            if (route) {
              router.push(route as any);
            } else if (actionId === 'start_workout') {
              router.push('/myworkoutplan');
            } else if (actionId === 'log_nutrition') {
              router.push('/(tabs)/nutrition');
            } else if (actionId === 'recovery_session') {
              // If we had a specific recovery route, or open dashboard
              setDashboardVisible(true);
            } else {
              // Fallback
              router.push('/(tabs)');
            }
          }}
          onDismiss={() => {
            haptics.light();
            setReeInsight(null);
          }}
        />

      </ScrollView>

=======
          <View style={styles.headerRight}>
            <View style={styles.pointsBadge}>
              <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
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
              <Bell size={20} color={theme.colors.text} />
              {hasNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* App Title */}
        <View style={styles.titleContainer}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.appTitle}>REEBOUND</Text>
          </LinearGradient>
        </View>

        {/* Dynamic Status Panel */}
        <View style={styles.panelContainer}>
          <DynamicStatusPanel
            context={panelContext}
            readinessScore={recoveryStatus?.score ?? 78}
            sleepHours={mockBiometrics.sleepHours}
            workoutName={todayWorkout?.title || "Recovery Day"}
            recoveryHours="48-72"
            hrvTrend="up"
          />
        </View>

        {/* Ree Analysis Button */}
        <View style={styles.reeButtonContainer}>
          <ReeButton
            onPress={handleReePress}
            hasNewInsights={hasUnseenInsight}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickActions
            onStartWorkout={handleStartWorkout}
            onLogNutrition={handleLogNutrition}
          />
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Recovery Inbox Modal */}
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
      <RecoveryInbox
        visible={inboxVisible}
        onClose={() => setInboxVisible(false)}
      />

<<<<<<< HEAD
      <ReeCheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onSubmit={handleCheckInSubmit}
        onSkip={() => setCheckInVisible(false)}
      />

      {/* Recovery Modals */}
      <RecoveryInvitation
        visible={invitationVisible}
        recommendation={recoveryRec}
        onClose={() => setInvitationVisible(false)}
        onAccept={handleAcceptPlan}
      />

      <Modal visible={dashboardVisible} animationType="slide">
        {activePlan && (
          <RecoveryDashboard
            plan={activePlan}
            onLogActivity={handleLogRecoveryActivity}
            onExitPlan={() => setDashboardVisible(false)}
          />
        )}
        <RecoveryActivityLogger
          visible={activityLoggerVisible}
          onClose={() => setActivityLoggerVisible(false)}
          onSave={handleSaveRecoveryLog}
        />
      </Modal>
=======
      {/* Ree Analysis Modal */}
      <ReeAnalysisModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onActionPress={handleStartWorkout}
      />
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
    </VoidBackground>
  );
}

// Helpers
function getReadinessColor(category: string) {
  switch (category) {
    case 'PEAK': return '#22C55E'; // Green
    case 'HIGH': return '#10B981'; // Teal
    case 'ADEQUATE': return '#3B82F6'; // Blue
    case 'CAUTION': return '#F59E0B'; // Amber
    case 'WARNING': return '#F97316'; // Orange
    case 'CRITICAL': return '#EF4444'; // Red
    default: return '#9CA3AF';
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: glassLayout.screenPadding,
    paddingTop: glassLayout.screenPaddingTop,
<<<<<<< HEAD
    paddingBottom: 100, // Space for floating button
=======
    paddingBottom: 20,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  centeredHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    pointerEvents: 'none',
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
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
<<<<<<< HEAD
    color: liquidGlass.text.inverse,
=======
    color: theme.colors.textInverse,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  },
  greetingText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
<<<<<<< HEAD
    color: liquidGlass.text.primary,
=======
    color: theme.colors.text,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
<<<<<<< HEAD
    backgroundColor: `${liquidGlass.accent.primary}20`,
=======
    backgroundColor: `${theme.colors.primary}20`,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
<<<<<<< HEAD
    borderColor: `${liquidGlass.accent.primary}40`,
=======
    borderColor: `${theme.colors.primary}40`,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
<<<<<<< HEAD
    color: liquidGlass.accent.primary,
=======
    color: theme.colors.primary,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: theme.colors.primary,
  },
<<<<<<< HEAD
  floatingRee: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 100,
  },
  emptyHero: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyHeroTitle: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  },
  emptyHeroSubtitle: {
    color: '#93C5FD',
    fontSize: 14,
  },
  northStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 146, 60, 0.15)', // Orange tint
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
    maxWidth: 160, // Prevent overlap with sides
  },
  northStarText: {
    fontSize: 11,
    fontWeight: '600',
    color: liquidGlass.accent.secondary,
  },
  viewProgressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewProgressText: {
    color: liquidGlass.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  checkInCard: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.soft,
  },
  checkInContent: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: liquidGlass.text.primary,
    marginBottom: 4,
  },
  checkInSubtitle: {
    fontSize: 14,
    color: liquidGlass.text.secondary,
  },
  checkInButton: {
    backgroundColor: liquidGlass.accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  checkInButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  readinessCard: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.medium,
  },
  readinessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readinessScoreTitle: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    fontWeight: '600',
  },
  readinessScoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  readinessCategory: {
    fontSize: 20,
    fontWeight: '700',
    color: liquidGlass.text.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  readinessAdvice: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activePlanCard: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.medium,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePlanTitle: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activePlanBadge: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePlanBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
  },
  activePlanSub: {
    color: liquidGlass.text.secondary,
    fontSize: 14,
=======
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textInverse,
    letterSpacing: 4,
  },
  panelContainer: {
    marginBottom: 24,
  },
  reeButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  bottomSpacer: {
    height: glassLayout.tabBarHeight,
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
  },
});
