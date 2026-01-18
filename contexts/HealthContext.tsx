import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import {
  HealthSettings,
  HealthData,
  HealthPlatform,
  HealthPermissions,
  StepData,
  SleepData,
  HeartRateData,
  ReadinessFactors,
} from '@/types';

const STORAGE_KEYS = {
  HEALTH_SETTINGS: 'health_settings',
  HEALTH_DATA: 'health_data',
};

const DEFAULT_PERMISSIONS: HealthPermissions = {
  steps: false,
  distance: false,
  calories: false,
  heartRate: false,
  sleep: false,
  workouts: false,
};

const DEFAULT_SETTINGS: HealthSettings = {
  platform: 'none',
  permissions: DEFAULT_PERMISSIONS,
  autoSync: true,
  prioritizeLimbriseData: true,
};

const DEFAULT_HEALTH_DATA: HealthData = {
  steps: [],
  distance: [],
  calories: [],
  heartRate: [],
  sleep: [],
  externalWorkouts: [],
};

export const [HealthProvider, useHealth] = createContextHook(() => {
  const [settings, setSettings] = useState<HealthSettings>(DEFAULT_SETTINGS);
  const [healthData, setHealthData] = useState<HealthData>(DEFAULT_HEALTH_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  useEffect(() => {
    loadHealthData();
    checkPedometerAvailability();
  }, []);

  const checkPedometerAvailability = async () => {
    if (Platform.OS === 'web') {
      console.log('[Health] Pedometer not available on web');
      setIsPedometerAvailable(false);
      return;
    }

    try {
      const available = await Pedometer.isAvailableAsync();
      console.log('[Health] Pedometer available:', available);
      setIsPedometerAvailable(available);
    } catch (error) {
      console.log('[Health] Error checking pedometer:', error);
      setIsPedometerAvailable(false);
    }
  };

  const loadHealthData = async () => {
    try {
      const [settingsData, healthDataStored] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HEALTH_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.HEALTH_DATA),
      ]);

      if (settingsData) {
        setSettings(JSON.parse(settingsData));
      }

      if (healthDataStored) {
        setHealthData(JSON.parse(healthDataStored));
      }
    } catch (error) {
      console.error('[Health] Error loading health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      console.log('[Health] Permissions not available on web');
      return false;
    }

    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermissionStatus(granted ? 'granted' : 'denied');
      console.log('[Health] Permission status:', status);
      return granted;
    } catch (error) {
      console.error('[Health] Error requesting permissions:', error);
      return false;
    }
  };

  const connectPlatform = async (platform: HealthPlatform): Promise<boolean> => {
    if (platform === 'none') {
      await updateSettings({ platform: 'none', permissions: DEFAULT_PERMISSIONS });
      return true;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('[Health] Permission denied for', platform);
      return false;
    }

    const newSettings: HealthSettings = {
      ...settings,
      platform,
      permissions: {
        ...settings.permissions,
        steps: true,
      },
    };

    await updateSettings(newSettings);
    await syncHealthData();
    return true;
  };

  const updateSettings = async (newSettings: Partial<HealthSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_SETTINGS, JSON.stringify(updated));
      setSettings(updated);
      console.log('[Health] Settings updated:', updated);
    } catch (error) {
      console.error('[Health] Error updating settings:', error);
    }
  };

  const updatePermissions = async (permissions: Partial<HealthPermissions>) => {
    await updateSettings({
      permissions: { ...settings.permissions, ...permissions },
    });
  };

  const syncHealthData = async () => {
    if (settings.platform === 'none' || Platform.OS === 'web') {
      return;
    }

    console.log('[Health] Syncing health data...');

    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      if (settings.permissions.steps && isPedometerAvailable) {
        await syncStepData(sevenDaysAgo, today);
      }

      const updated = { ...healthData, lastSyncedAt: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(updated));
      setHealthData(updated);
      console.log('[Health] Sync complete');
    } catch (error) {
      console.error('[Health] Error syncing health data:', error);
    }
  };

  const syncStepData = async (start: Date, end: Date) => {
    if (Platform.OS === 'web') return;

    try {
      const newSteps: StepData[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        try {
          const result = await Pedometer.getStepCountAsync(dayStart, dayEnd);
          if (result) {
            newSteps.push({
              date: dayStart.toISOString().split('T')[0],
              steps: result.steps,
              source: 'device',
            });
          }
        } catch {
          console.log('[Health] Error fetching steps for day:', dayStart.toISOString().split('T')[0]);
        }
      }

      const existingDates = new Set(newSteps.map((s) => s.date));
      const mergedSteps = [
        ...newSteps,
        ...healthData.steps.filter((s) => !existingDates.has(s.date) || s.source === 'manual'),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setHealthData((prev) => ({ ...prev, steps: mergedSteps.slice(0, 30) }));
      console.log('[Health] Step data synced:', newSteps.length, 'days');
    } catch (error) {
      console.error('[Health] Error syncing step data:', error);
    }
  };

  const getTodaySteps = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = healthData.steps.find((s) => s.date === today);
    return todayData?.steps ?? 0;
  }, [healthData.steps]);

  const getWeeklyStepsAverage = useCallback((): number => {
    const lastWeek = healthData.steps.slice(0, 7);
    if (lastWeek.length === 0) return 0;
    const total = lastWeek.reduce((sum, d) => sum + d.steps, 0);
    return Math.round(total / lastWeek.length);
  }, [healthData.steps]);

  const getTodaySleep = useCallback((): SleepData | null => {
    const today = new Date().toISOString().split('T')[0];
    return healthData.sleep.find((s) => s.date === today) ?? null;
  }, [healthData.sleep]);

  const getTodayHeartRate = useCallback((): HeartRateData | null => {
    const today = new Date().toISOString().split('T')[0];
    return healthData.heartRate.find((h) => h.date === today) ?? null;
  }, [healthData.heartRate]);

  const logManualSleep = async (date: string, durationMinutes: number, quality?: SleepData['quality']) => {
    const newSleep: SleepData = { date, durationMinutes, quality, source: 'manual' };
    const existingIndex = healthData.sleep.findIndex((s) => s.date === date);
    
    let updated: SleepData[];
    if (existingIndex >= 0 && settings.prioritizeLimbriseData) {
      updated = [...healthData.sleep];
      updated[existingIndex] = newSleep;
    } else if (existingIndex >= 0) {
      updated = healthData.sleep;
    } else {
      updated = [newSleep, ...healthData.sleep];
    }

    const newHealthData = { ...healthData, sleep: updated.slice(0, 30) };
    await AsyncStorage.setItem(STORAGE_KEYS.HEALTH_DATA, JSON.stringify(newHealthData));
    setHealthData(newHealthData);
  };

  const calculateReadinessFactors = useCallback(
    (userPainLevel?: number, userConfidence?: 'low' | 'medium' | 'high'): ReadinessFactors => {
      const today = new Date().toISOString().split('T')[0];
      const insights: string[] = [];

      let sleepScore = 70;
      const todaySleep = healthData.sleep.find((s) => s.date === today);
      if (todaySleep) {
        const hours = todaySleep.durationMinutes / 60;
        if (hours >= 7 && hours <= 9) {
          sleepScore = 100;
        } else if (hours >= 6) {
          sleepScore = 80;
          insights.push('Consider getting more sleep for optimal recovery');
        } else {
          sleepScore = 50;
          insights.push('Sleep duration was low - consider a lighter session');
        }

        if (todaySleep.quality === 'excellent') sleepScore = Math.min(100, sleepScore + 10);
        else if (todaySleep.quality === 'poor') sleepScore = Math.max(0, sleepScore - 20);
      }

      let recoveryScore = 70;
      if (userPainLevel !== undefined) {
        if (userPainLevel <= 2) {
          recoveryScore = 100;
        } else if (userPainLevel <= 4) {
          recoveryScore = 80;
        } else if (userPainLevel <= 6) {
          recoveryScore = 60;
          insights.push('Elevated pain detected - prioritize recovery exercises');
        } else {
          recoveryScore = 40;
          insights.push('High pain level - consider rest or very light activity');
        }
      }

      let activityBalance = 70;
      const weeklySteps = getWeeklyStepsAverage();
      const todaySteps = getTodaySteps();

      if (weeklySteps > 0) {
        const ratio = todaySteps / weeklySteps;
        if (ratio > 1.5) {
          activityBalance = 60;
          insights.push('Higher activity than usual - ensure adequate recovery');
        } else if (ratio > 0.8 && ratio < 1.2) {
          activityBalance = 90;
        } else if (ratio < 0.5 && todaySteps < 3000) {
          activityBalance = 75;
          insights.push('Movement has been low - a light workout could help');
        }
      }

      let heartRateVariability = 70;
      const todayHR = healthData.heartRate.find((h) => h.date === today);
      if (todayHR?.restingHR) {
        const avgResting = healthData.heartRate.slice(0, 7).reduce((sum, h) => sum + (h.restingHR ?? 0), 0) / 7;
        if (avgResting > 0) {
          const diff = todayHR.restingHR - avgResting;
          if (diff > 10) {
            heartRateVariability = 50;
            insights.push('Elevated resting heart rate - your body may need more recovery');
          } else if (diff < -5) {
            heartRateVariability = 90;
          }
        }
      }

      let confidenceBonus = 0;
      if (userConfidence === 'high') confidenceBonus = 10;
      else if (userConfidence === 'low') confidenceBonus = -10;

      const weights = { sleep: 0.3, recovery: 0.35, activity: 0.2, hrv: 0.15 };
      const overallScore = Math.round(
        Math.min(
          100,
          Math.max(
            0,
            sleepScore * weights.sleep +
              recoveryScore * weights.recovery +
              activityBalance * weights.activity +
              heartRateVariability * weights.hrv +
              confidenceBonus
          )
        )
      );

      if (overallScore >= 80 && insights.length === 0) {
        insights.push('Your body is well-recovered and ready for training');
      } else if (overallScore < 50) {
        insights.push('Consider a recovery-focused day');
      }

      return {
        sleepScore,
        recoveryScore,
        activityBalance,
        heartRateVariability,
        overallScore,
        insights,
      };
    },
    [healthData, getTodaySteps, getWeeklyStepsAverage]
  );

  const isConnected = useMemo(() => settings.platform !== 'none', [settings.platform]);

  const disconnect = async () => {
    await updateSettings(DEFAULT_SETTINGS);
    setHealthData(DEFAULT_HEALTH_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.HEALTH_DATA);
    console.log('[Health] Disconnected');
  };

  return {
    settings,
    healthData,
    isLoading,
    isConnected,
    isPedometerAvailable,
    permissionStatus,
    connectPlatform,
    disconnect,
    updateSettings,
    updatePermissions,
    syncHealthData,
    getTodaySteps,
    getWeeklyStepsAverage,
    getTodaySleep,
    getTodayHeartRate,
    logManualSleep,
    calculateReadinessFactors,
  };
});
