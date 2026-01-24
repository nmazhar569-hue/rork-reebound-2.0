import { router, useRouter, useFocusEffect } from 'expo-router';
import { Bell, Star } from 'lucide-react-native';
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
import { haptics } from '@/utils/haptics';
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
import { calendarService, DailyAvailability } from '@/services/CalendarService';
import { storageService } from '@/services/StorageService';
import { WorkoutSession } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const {
    userProfile,
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
  const [calendarAvailability, setCalendarAvailability] = useState<DailyAvailability | null>(null);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [weeklyVolumeAvg, setWeeklyVolumeAvg] = useState<number>(0);

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

  // Load workout history
  useEffect(() => {
    const loadWorkoutHistory = async () => {
      try {
        const last = await storageService.getLastWorkout();
        const avgVolume = await storageService.getWeeklyVolumeAverage();
        setLastWorkout(last);
        setWeeklyVolumeAvg(avgVolume);
      } catch (error) {
        console.error('[HomeScreen] Error loading workout history:', error);
      }
    };
    loadWorkoutHistory();
  }, []);

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

  // Update screen context for Ree
  useFocusEffect(
    useCallback(() => {
      updateScreenContext('home');
    }, [updateScreenContext])
  );

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
  };

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
        {/* Header */}
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
      <RecoveryInbox
        visible={inboxVisible}
        onClose={() => setInboxVisible(false)}
      />

      {/* Ree Analysis Modal */}
      <ReeAnalysisModal
        visible={checkInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onActionPress={handleStartWorkout}
      />
    </VoidBackground>
  );
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
    paddingBottom: 20,
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
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textInverse,
  },
  greetingText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginBottom: 2,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
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
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
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
  },
});
