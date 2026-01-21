import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useMemo } from 'react';
import { UserProfile, DailyLog, Workout, DailyReadiness, Program, ProgramWorkoutOverride, WeekdayKey, NutritionLog, ReturnStatus, ReflectionEntry, IdentityTitle, FatigueLevel } from '@/types';
import { computeIdentityTitles } from '@/constants/identityTitles';
import { buildSessionFromType, getWorkoutPlan } from '@/constants/workoutTemplates';
import { 
  getInjuryTypeContext, 
  getPainGuidance, 
  RECOVERY_PRINCIPLES,
  TISSUE_HEALING_TIMELINES 
} from '@/constants/injuryIntelligence';
import { 
  calculateSessionIntensityRecommendation, 
  getSessionAdjustmentReason,
  FilterContext 
} from '@/utils/injuryAwareFiltering';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_LOGS: 'daily_logs',
  DAILY_READINESS: 'daily_readiness',
  PROGRAMS: 'programs',
  ACTIVE_PROGRAM_ID: 'active_program_id',
  PROGRAM_OVERRIDES: 'program_workout_overrides',
  NUTRITION_LOGS: 'nutrition_logs',
  LAST_ACTIVE_DATE: 'last_active_date',
  REFLECTIONS: 'reflections',
  RETURN_ACKNOWLEDGED: 'return_acknowledged',
  SEEN_EXPLANATIONS: 'seen_explanations',
  USER_POINTS: 'user_points',
};

const INACTIVITY_THRESHOLD_DAYS = 3;

const WELCOME_MESSAGES = [
  "Welcome back. Let's ease in.",
  "Good to see you again. No rush.",
  "You're here. That's what matters.",
  "Ready when you are. Take it slow.",
  "Rest was part of the journey.",
  "Your body remembers. Trust it.",
];

const RE_ENTRY_SUGGESTIONS = [
  'Start with gentle movement',
  'A shorter session is still progress',
  'Listen to how your body feels',
  'Recovery work counts too',
  'There is no catching up — just moving forward',
];

export const [AppProvider, useApp] = createContextHook(() => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [dailyReadiness, setDailyReadiness] = useState<DailyReadiness[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [programOverrides, setProgramOverrides] = useState<ProgramWorkoutOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [returnAcknowledged, setReturnAcknowledged] = useState(false);
  const [seenExplanations, setSeenExplanations] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, logsData, readinessData, programsData, activeProgramData, overridesData, lastActiveDateData, reflectionsData, returnAckData, seenExplanationsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_READINESS),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRAMS),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRAM_OVERRIDES),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.REFLECTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.RETURN_ACKNOWLEDGED),
        AsyncStorage.getItem(STORAGE_KEYS.SEEN_EXPLANATIONS),
      ]);

      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        if (profile.onboardingCompleted) {
          const plan = getWorkoutPlan(
            profile.injuryType,
            profile.painTolerance,
            profile.weeklyFrequency,
            profile.sportType || 'gym'
          );
          setWorkoutPlan(plan);
        }
      }

      if (logsData) {
        setDailyLogs(JSON.parse(logsData));
      }

      if (readinessData) {
        setDailyReadiness(JSON.parse(readinessData));
      }

      if (programsData) {
        const parsedPrograms = JSON.parse(programsData) as Program[];
        setPrograms(parsedPrograms);
      }

      if (activeProgramData) {
        setActiveProgramId(activeProgramData);
      }

      if (overridesData) {
        setProgramOverrides(JSON.parse(overridesData) as ProgramWorkoutOverride[]);
      }

      if (lastActiveDateData) {
        setLastActiveDate(lastActiveDateData);
      }

      if (reflectionsData) {
        setReflections(JSON.parse(reflectionsData) as ReflectionEntry[]);
      }

      if (returnAckData === 'true') {
        setReturnAcknowledged(true);
      }

      if (seenExplanationsData) {
        setSeenExplanations(JSON.parse(seenExplanationsData) as string[]);
      }

      const pointsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_POINTS);
      if (pointsData) {
        setUserPoints(parseInt(pointsData, 10));
        console.log('[AppContext] Loaded user points:', pointsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profile: UserProfile) => {
    try {
      const updatedProfile = { ...profile, onboardingCompleted: true, recoveryFirstMode: true };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(updatedProfile)
      );
      setUserProfile(updatedProfile);

      const plan = getWorkoutPlan(
        profile.injuryType,
        profile.painTolerance,
        profile.weeklyFrequency,
        profile.sportType || 'gym'
      );
      setWorkoutPlan(plan);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    try {
      const updatedProfile = { ...userProfile, ...updates };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(updatedProfile)
      );
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const logReadiness = async (readiness: DailyReadiness) => {
    try {
      // Remove existing entry for today if any (though usually we check before showing UI)
      const filtered = dailyReadiness.filter(r => r.date !== readiness.date);
      const updated = [readiness, ...filtered];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_READINESS,
        JSON.stringify(updated)
      );
      setDailyReadiness(updated);
    } catch (error) {
      console.error('Error saving readiness:', error);
    }
  };

  const logWorkout = async (log: DailyLog) => {
    try {
      // Check if we already have a log for today (e.g. recovery)
      const existingLogIndex = dailyLogs.findIndex(l => l.date === log.date);
      let updatedLogs;
      
      if (existingLogIndex >= 0) {
        updatedLogs = [...dailyLogs];
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], ...log };
      } else {
        updatedLogs = [log, ...dailyLogs];
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_LOGS,
        JSON.stringify(updatedLogs)
      );
      setDailyLogs(updatedLogs);
    } catch (error) {
      console.error('Error saving workout log:', error);
    }
  };

  const logNutrition = async (nutritionLog: NutritionLog) => {
    try {
      // Find today's log or create a new one, but we are storing nutritionLog inside DailyLog now
      // Actually, my DailyLog type update has nutritionLog inside it.
      // So we should find the DailyLog for the date and update it.
      
      const existingLogIndex = dailyLogs.findIndex(l => l.date === nutritionLog.date);
      let updatedLogs;
      
      if (existingLogIndex >= 0) {
        updatedLogs = [...dailyLogs];
        updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], nutritionLog };
      } else {
        // Create new daily log if it doesn't exist
        updatedLogs = [{
            date: nutritionLog.date,
            workoutCompleted: false, // Default
            painLevel: 0, // Default or placeholder
            confidenceLevel: 0, // Default or placeholder
            nutritionLog
        }, ...dailyLogs];
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_LOGS,
        JSON.stringify(updatedLogs)
      );
      setDailyLogs(updatedLogs);
    } catch (error) {
      console.error('Error saving nutrition log:', error);
    }
  };

  const todayKey = (): { date: string; dayOfWeek: WeekdayKey } => {
    const date = new Date().toISOString().split('T')[0];
    const dow = new Date().getDay() as WeekdayKey;
    return { date, dayOfWeek: dow };
  };

  const getActiveProgram = (): Program | null => {
    if (!activeProgramId) return null;
    return programs.find((p) => p.id === activeProgramId) || null;
  };

  const buildProgramWorkout = (args: {
    program: Program;
    dayOfWeek: WeekdayKey;
    sessionTypeKey: string;
    date?: string;
    override?: ProgramWorkoutOverride | null;
  }): Workout | null => {
    const { program, dayOfWeek, sessionTypeKey, date, override } = args;

    const profile = userProfile;
    const built = profile
      ? buildSessionFromType(sessionTypeKey, program.sportType, profile.injuryType, profile.painTolerance)
      : null;

    const session = program.sessions.find((s) => s.dayOfWeek === dayOfWeek && s.sessionTypeKey === sessionTypeKey);
    const exercises = override?.exercises ?? session?.exercises ?? built?.exercises ?? [];

    const title = built?.title ?? sessionTypeKey;
    const focus = built?.focus ?? 'upper_body';
    const kneeSafeNote = built?.kneeSafeNote ?? 'Based on your knee profile, adjust range and load if discomfort rises.';
    const sportLabel = built?.sportLabel ?? (program.sportType === 'gym' ? '🏋️ Gym / Strength' : program.sportType === 'running' ? '🏃 Running' : '🥋 Martial Arts');

    return {
      id: override?.id ?? `program-${program.id}-${dayOfWeek}${date ? `-${date}` : ''}`,
      dayOfWeek,
      focus,
      title,
      kneeSafeNote,
      exercises,
      sportLabel,
      programId: program.id,
      source: override ? 'override' : 'program',
      sessionType: sessionTypeKey,
    };
  };

  const getTodayWorkout = (): Workout | null => {
    const { date, dayOfWeek } = todayKey();

    const program = getActiveProgram();
    if (program) {
      const override = programOverrides.find((o) => o.programId === program.id && o.date === date);
      const scheduleEntry = program.weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);

      const sessionTypeKey = override?.sessionTypeKey ?? scheduleEntry?.sessionTypeKey ?? null;
      if (!sessionTypeKey) return null;

      return buildProgramWorkout({ program, dayOfWeek, sessionTypeKey, date, override: override ?? null });
    }

    if (!workoutPlan.length) return null;
    const workout = workoutPlan.find((w) => w.dayOfWeek === dayOfWeek);
    return workout || null;
  };

  const getWorkoutById = (workoutId: string): Workout | null => {
    const fromTemplate = workoutPlan.find((w) => w.id === workoutId);
    if (fromTemplate) return fromTemplate;

    const overrideMatch = programOverrides.find((o) => o.id === workoutId);
    if (overrideMatch) {
      const program = programs.find((p) => p.id === overrideMatch.programId);
      if (!program || !overrideMatch.sessionTypeKey) return null;
      return buildProgramWorkout({
        program,
        dayOfWeek: overrideMatch.dayOfWeek,
        sessionTypeKey: overrideMatch.sessionTypeKey,
        date: overrideMatch.date,
        override: overrideMatch,
      });
    }

    if (workoutId.startsWith('program-')) {
      const parts = workoutId.split('-');
      const programId = parts[1];
      const dayPart = parts[2];
      const dayOfWeek = Number(dayPart) as WeekdayKey;
      const program = programs.find((p) => p.id === programId);
      if (!program) return null;
      const scheduleEntry = program.weekSchedule.find((d) => d.dayOfWeek === dayOfWeek);
      if (!scheduleEntry?.sessionTypeKey) return null;

      return buildProgramWorkout({
        program,
        dayOfWeek,
        sessionTypeKey: scheduleEntry.sessionTypeKey,
        override: null,
      });
    }

    return null;
  };

  const setActiveProgram = async (programId: string | null) => {
    try {
      if (programId) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID, programId);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PROGRAM_ID);
      }
      setActiveProgramId(programId);
    } catch (error) {
      console.error('Error setting active program:', error);
    }
  };

  const upsertProgram = async (program: Program) => {
    try {
      const existingIndex = programs.findIndex((p) => p.id === program.id);
      const updated = existingIndex >= 0 ? programs.map((p) => (p.id === program.id ? program : p)) : [program, ...programs];

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(updated));
      setPrograms(updated);

      if (!activeProgramId) {
        await setActiveProgram(program.id);
      }
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const deleteProgram = async (programId: string) => {
    try {
      const updatedPrograms = programs.filter((p) => p.id !== programId);
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(updatedPrograms));
      setPrograms(updatedPrograms);

      const updatedOverrides = programOverrides.filter((o) => o.programId !== programId);
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAM_OVERRIDES, JSON.stringify(updatedOverrides));
      setProgramOverrides(updatedOverrides);

      if (activeProgramId === programId) {
        await setActiveProgram(null);
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const saveWorkoutOverrideForToday = async (override: Omit<ProgramWorkoutOverride, 'id' | 'updatedAt'>) => {
    try {
      const updatedAt = new Date().toISOString();
      const id = `override-${override.programId}-${override.date}`;
      const full: ProgramWorkoutOverride = { ...override, id, updatedAt };

      const filtered = programOverrides.filter((o) => !(o.programId === override.programId && o.date === override.date));
      const updated = [full, ...filtered];

      await AsyncStorage.setItem(STORAGE_KEYS.PROGRAM_OVERRIDES, JSON.stringify(updated));
      setProgramOverrides(updated);
    } catch (error) {
      console.error('Error saving workout override:', error);
    }
  };

  const getTodayLog = (): DailyLog | null => {
    const today = new Date().toISOString().split('T')[0];
    return dailyLogs.find((log) => log.date === today) || null;
  };

  const getTodayReadiness = (): DailyReadiness | null => {
    const today = new Date().toISOString().split('T')[0];
    return dailyReadiness.find((r) => r.date === today) || null;
  };

  const calculateDaysAway = (lastDate: string | null): number => {
    if (!lastDate) return 0;
    const last = new Date(lastDate);
    const now = new Date();
    const diffTime = now.getTime() - last.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getReturnStatus = (): ReturnStatus => {
    const daysAway = calculateDaysAway(lastActiveDate);
    const isReturning = daysAway >= INACTIVITY_THRESHOLD_DAYS && !returnAcknowledged;
    
    let intensityModifier = 1.0;
    if (daysAway >= 14) {
      intensityModifier = 0.5;
    } else if (daysAway >= 7) {
      intensityModifier = 0.65;
    } else if (daysAway >= INACTIVITY_THRESHOLD_DAYS) {
      intensityModifier = 0.8;
    }

    const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    const suggestions = RE_ENTRY_SUGGESTIONS.slice(0, daysAway >= 7 ? 3 : 2);

    return {
      isReturning,
      daysAway,
      lastActiveDate,
      intensityModifier,
      welcomeMessage,
      suggestions,
    };
  };

  const recordActivity = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
      setLastActiveDate(today);
      
      if (returnAcknowledged) {
        await AsyncStorage.setItem(STORAGE_KEYS.RETURN_ACKNOWLEDGED, 'false');
        setReturnAcknowledged(false);
      }
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  const acknowledgeReturn = async (reflection?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const daysAway = calculateDaysAway(lastActiveDate);
      
      if (reflection || daysAway >= INACTIVITY_THRESHOLD_DAYS) {
        const entry: ReflectionEntry = {
          id: `reflection-${Date.now()}`,
          date: today,
          reflection,
          daysAway,
          acknowledged: true,
        };
        const updatedReflections = [entry, ...reflections];
        await AsyncStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(updatedReflections));
        setReflections(updatedReflections);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.RETURN_ACKNOWLEDGED, 'true');
      setReturnAcknowledged(true);
      
      await recordActivity();
    } catch (error) {
      console.error('Error acknowledging return:', error);
    }
  };

  const markExplanationSeen = async (explanationId: string) => {
    if (seenExplanations.includes(explanationId)) return;
    
    try {
      const updated = [...seenExplanations, explanationId];
      await AsyncStorage.setItem(STORAGE_KEYS.SEEN_EXPLANATIONS, JSON.stringify(updated));
      setSeenExplanations(updated);
    } catch (error) {
      console.error('Error marking explanation seen:', error);
    }
  };

  const getSeenExplanations = (): string[] => {
    return seenExplanations;
  };

  const addPoints = async (points: number) => {
    try {
      const newTotal = userPoints + points;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_POINTS, newTotal.toString());
      setUserPoints(newTotal);
      console.log('[AppContext] Added', points, 'points. New total:', newTotal);
    } catch (error) {
      console.error('[AppContext] Error adding points:', error);
    }
  };

  const resetPoints = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_POINTS, '0');
      setUserPoints(0);
      console.log('[AppContext] Points reset to 0');
    } catch (error) {
      console.error('[AppContext] Error resetting points:', error);
    }
  };

  const getIdentityTitles = (): IdentityTitle[] => {
    const totalWorkouts = dailyLogs.filter(log => log.workoutCompleted).length;
    const totalRecoverySessions = dailyLogs.filter(log => log.recoveryCompleted).length;
    const totalCheckIns = dailyReadiness.length;
    const hasReturnedAfterBreak = reflections.length > 0;
    
    const logsWithPain = dailyLogs.filter(log => log.painLevel > 0);
    const avgPainLevel = logsWithPain.length > 0 
      ? logsWithPain.reduce((sum, log) => sum + log.painLevel, 0) / logsWithPain.length 
      : 0;
    const workoutsWithLowPain = dailyLogs.filter(log => log.workoutCompleted && log.painLevel <= 4).length;
    
    const uniqueDates = new Set(dailyLogs.map(log => log.date));
    const sortedDates = Array.from(uniqueDates).sort();
    let weeksActive = 0;
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const lastDate = new Date(sortedDates[sortedDates.length - 1]);
      weeksActive = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    }

    return computeIdentityTitles({
      totalWorkouts,
      totalRecoverySessions,
      totalCheckIns,
      hasReturnedAfterBreak,
      avgPainLevel,
      workoutsWithLowPain,
      programsCreated: programs.length,
      weeksActive,
    });
  };

  const getInjuryContext = () => {
    if (!userProfile) return null;
    return getInjuryTypeContext(userProfile.injuryType);
  };

  const getCurrentPainGuidance = () => {
    const todayReadinessEntry = getTodayReadiness();
    const painLevel = todayReadinessEntry?.painLevel ?? 0;
    return getPainGuidance(painLevel);
  };

  const getFilterContext = (fatigueLevel: FatigueLevel = 'normal'): FilterContext | null => {
    if (!userProfile) return null;
    const todayReadinessEntry = getTodayReadiness();
    return {
      injuryType: userProfile.injuryType,
      painTolerance: userProfile.painTolerance,
      currentPainLevel: todayReadinessEntry?.painLevel ?? 0,
      fatigueLevel,
    };
  };

  const getRecommendedSessionIntensity = (fatigueLevel: FatigueLevel = 'normal') => {
    const todayReadinessEntry = getTodayReadiness();
    const painLevel = todayReadinessEntry?.painLevel ?? 0;
    const { daysAway } = getReturnStatus();
    
    const intensity = calculateSessionIntensityRecommendation(painLevel, fatigueLevel, daysAway);
    const reason = getSessionAdjustmentReason(intensity, painLevel, fatigueLevel, daysAway);
    
    return { intensity, reason };
  };

  const recoveryKnowledge = useMemo(() => ({
    principles: RECOVERY_PRINCIPLES,
    tissueTimelines: TISSUE_HEALING_TIMELINES,
  }), []);

  return {
    userProfile,
    dailyLogs,
    dailyReadiness,
    workoutPlan,
    programs,
    activeProgramId,
    programOverrides,
    isLoading,
    reflections,
    seenExplanations,
    userPoints,
    completeOnboarding,
    logWorkout,
    logReadiness,
    getTodayWorkout,
    getTodayLog,
    getTodayReadiness,
    setActiveProgram,
    upsertProgram,
    deleteProgram,
    saveWorkoutOverrideForToday,
    getActiveProgram,
    getWorkoutById,
    updateUserProfile,
    logNutrition,
    getReturnStatus,
    recordActivity,
    acknowledgeReturn,
    getIdentityTitles,
    markExplanationSeen,
    getSeenExplanations,
    addPoints,
    resetPoints,
    getInjuryContext,
    getCurrentPainGuidance,
    getFilterContext,
    getRecommendedSessionIntensity,
    recoveryKnowledge,
    exitRecoveryFirstMode: async () => {
      if (!userProfile) return;
      const updated = { ...userProfile, recoveryFirstMode: false };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
      setUserProfile(updated);
    },
  };
});
