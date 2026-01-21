import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ReePresenceLevel,
  ReeScreenContext,
  ReeContextualInsight,
  ReePresenceSettings,
  IntentProfile,
} from '@/types';
import { useApp } from './AppContext';
import {
  generateContextualInsight,
  generateHomeInsight,
} from '@/constants/reeInsightEngine';

/**
 * -------------------------------------
 * Persistent Storage Keys
 * -------------------------------------
 */
const STORAGE_KEYS = {
  SETTINGS: 'ree_presence_settings',
  DISMISSED: 'ree_dismissed_insights',
  LAST_INTERACTION: 'ree_last_interaction',
  VISITED_SCREENS: 'ree_visited_screens',
  TAUGHT_CONCEPTS: 'ree_taught_concepts',
  REFERENCED_TOPICS: 'ree_referenced_topics',
};

/**
 * -------------------------------------
 * Defaults
 * -------------------------------------
 */
const DEFAULT_SETTINGS: ReePresenceSettings = {
  showOnboarding: true,
  showPlanningHints: true,
  showWorkoutHints: true,
  showRecoveryHints: true,
  showProgressInsights: true,
  autoMinimizeAfterSeconds: 30,
};

type UserPreference = 'always' | 'contextual' | 'minimal' | 'off';

/**
 * -------------------------------------
 * Ree Context Provider
 * -------------------------------------
 */
export const [ReeProvider, useRee] = createContextHook(() => {
  const {
    userProfile,
    getReturnStatus,
    getActiveProgram,
    getTodayWorkout,
    getTodayReadiness,
  } = useApp();

  /**
   * -------------------------------------
   * Core State
   * -------------------------------------
   */
  const [presenceLevel, setPresenceLevel] =
    useState<ReePresenceLevel>('available');
  const [isMinimized, setIsMinimized] = useState(false);
  const [screenContext, setScreenContext] =
    useState<ReeScreenContext>('home');

  const [currentInsight, setCurrentInsight] =
    useState<ReeContextualInsight | null>(null);
  const [queuedInsights, setQueuedInsights] = useState<ReeContextualInsight[]>(
    []
  );

  const [settings, setSettings] =
    useState<ReePresenceSettings>(DEFAULT_SETTINGS);
  const [userPreference, setUserPreference] =
    useState<UserPreference>('contextual');

  /**
   * -------------------------------------
   * Memory State
   * -------------------------------------
   */
  const [dismissedTriggers, setDismissedTriggers] = useState<string[]>([]);
  const [visitedScreens, setVisitedScreens] = useState<ReeScreenContext[]>([]);
  const [taughtConcepts, setTaughtConcepts] = useState<string[]>([]);
  const [referencedTopics, setReferencedTopics] = useState<string[]>([]);
  const [lastInteractionAt, setLastInteractionAt] = useState<string | null>(null);
  const [hasUnseenInsight, setHasUnseenInsight] = useState(false);

  /**
   * -------------------------------------
   * Load Persistent Memory
   * -------------------------------------
   */
  useEffect(() => {
    (async () => {
      try {
        const [
          settingsData,
          dismissed,
          lastSeen,
          visited,
          taught,
          referenced,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.DISMISSED),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_INTERACTION),
          AsyncStorage.getItem(STORAGE_KEYS.VISITED_SCREENS),
          AsyncStorage.getItem(STORAGE_KEYS.TAUGHT_CONCEPTS),
          AsyncStorage.getItem(STORAGE_KEYS.REFERENCED_TOPICS),
        ]);

        if (settingsData) setSettings(JSON.parse(settingsData));
        if (dismissed) setDismissedTriggers(JSON.parse(dismissed));
        if (lastSeen) setLastInteractionAt(lastSeen);
        if (visited) setVisitedScreens(JSON.parse(visited));
        if (taught) setTaughtConcepts(JSON.parse(taught));
        if (referenced) setReferencedTopics(JSON.parse(referenced));
      } catch (err) {
        console.warn('[Ree] Failed to load memory:', err);
      }
    })();
  }, []);

  /**
   * -------------------------------------
   * Screen Context Handling
   * -------------------------------------
   */
  const updateScreenContext = useCallback(
    (context: ReeScreenContext) => {
      setScreenContext(context);

      if (userPreference === 'off') {
        setCurrentInsight(null);
        return;
      }

      const returnStatus = getReturnStatus();
      const readiness = getTodayReadiness();

      const insight = generateContextualInsight(context, {
        isReturning: returnStatus.isReturning,
        daysAway: returnStatus.daysAway,
        hasProgram: !!getActiveProgram(),
        hasTodayWorkout: !!getTodayWorkout(),
        painLevel: readiness?.painLevel ?? 0,
        confidence: readiness?.confidence ?? null,
        recoveryFirstMode: userProfile?.recoveryFirstMode ?? false,
        intentProfile: userProfile?.intentProfile,
        isFirstVisit: !visitedScreens.includes(context),
        taughtConcepts,
        referencedTopics,
      });

      if (insight && !dismissedTriggers.includes(insight.trigger)) {
        setCurrentInsight(insight);
        setIsMinimized(false);
        setHasUnseenInsight(true);
      } else {
        setCurrentInsight(null);
      }

      if (!visitedScreens.includes(context)) {
        markScreenVisited(context);
      }
    },
    [
      userPreference,
      getReturnStatus,
      getActiveProgram,
      getTodayWorkout,
      getTodayReadiness,
      userProfile,
      dismissedTriggers,
      visitedScreens,
      taughtConcepts,
      referencedTopics,
    ]
  );

  /**
   * -------------------------------------
   * Memory Mutation Helpers
   * -------------------------------------
   */
  const markScreenVisited = useCallback(async (screen: ReeScreenContext) => {
    if (visitedScreens.includes(screen)) return;
    const updated = [...visitedScreens, screen];
    setVisitedScreens(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.VISITED_SCREENS,
      JSON.stringify(updated)
    );
  }, [visitedScreens]);

  const markConceptTaught = useCallback(async (conceptId: string) => {
    if (taughtConcepts.includes(conceptId)) return;
    const updated = [...taughtConcepts, conceptId];
    setTaughtConcepts(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.TAUGHT_CONCEPTS,
      JSON.stringify(updated)
    );
  }, [taughtConcepts]);

  const addReferencedTopic = useCallback(async (topicId: string) => {
    if (referencedTopics.includes(topicId)) return;
    const updated = [...referencedTopics, topicId];
    setReferencedTopics(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REFERENCED_TOPICS,
      JSON.stringify(updated)
    );
  }, [referencedTopics]);

  /**
   * -------------------------------------
   * Insight Lifecycle
   * -------------------------------------
   */
  const dismissCurrentInsight = useCallback(async () => {
    if (!currentInsight) return;
    const updated = [...dismissedTriggers, currentInsight.trigger];
    setDismissedTriggers(updated);
    setCurrentInsight(null);
    await AsyncStorage.setItem(
      STORAGE_KEYS.DISMISSED,
      JSON.stringify(updated)
    );
  }, [currentInsight, dismissedTriggers]);

  const queueInsight = useCallback(
    (insight: ReeContextualInsight) => {
      if (dismissedTriggers.includes(insight.trigger)) return;
      setQueuedInsights(prev =>
        [...prev, insight].sort((a, b) => a.priority - b.priority)
      );
    },
    [dismissedTriggers]
  );

  const showNextQueuedInsight = useCallback(() => {
    if (!queuedInsights.length) return;
    const [next, ...rest] = queuedInsights;
    setCurrentInsight(next);
    setQueuedInsights(rest);
    setIsMinimized(false);
  }, [queuedInsights]);

  /**
   * -------------------------------------
   * Presence Controls
   * -------------------------------------
   */
  const minimizeRee = () => setIsMinimized(true);

  const expandRee = useCallback(async () => {
    setIsMinimized(false);
    setHasUnseenInsight(false);
    const now = new Date().toISOString();
    setLastInteractionAt(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_INTERACTION, now);
  }, []);

  const recordInteraction = useCallback(async () => {
    setHasUnseenInsight(false);
    const now = new Date().toISOString();
    setLastInteractionAt(now);
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_INTERACTION, now);
  }, []);

  const refreshHomeInsight = useCallback(() => {
    const returnStatus = getReturnStatus();
    const readiness = getTodayReadiness();

    const insight = generateHomeInsight({
      isReturning: returnStatus.isReturning,
      daysAway: returnStatus.daysAway,
      hasProgram: !!getActiveProgram(),
      hasTodayWorkout: !!getTodayWorkout(),
      painLevel: readiness?.painLevel ?? 0,
      confidence: readiness?.confidence ?? null,
      recoveryFirstMode: userProfile?.recoveryFirstMode ?? false,
      intentProfile: userProfile?.intentProfile,
      isFirstVisit: false,
      taughtConcepts,
      referencedTopics,
    });

    if (insight && !dismissedTriggers.includes(insight.trigger)) {
      setCurrentInsight(insight);
      setHasUnseenInsight(true);
    }
  }, [
    getReturnStatus,
    getTodayReadiness,
    getActiveProgram,
    getTodayWorkout,
    userProfile,
    taughtConcepts,
    referencedTopics,
    dismissedTriggers,
  ]);

  const updateSettings = useCallback(
    async (newSettings: Partial<ReePresenceSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updated)
      );
    },
    [settings]
  );

  const updateUserPreference = useCallback((pref: UserPreference) => {
    setUserPreference(pref);
    if (pref === 'off') {
      setPresenceLevel('hidden');
      setCurrentInsight(null);
    } else if (pref === 'minimal') {
      setPresenceLevel('minimal');
    } else {
      setPresenceLevel('available');
    }
  }, []);

  /**
   * -------------------------------------
   * Derived State
   * -------------------------------------
   */
  const shouldShowPresence = useMemo(() => {
    if (userPreference === 'off') return false;
    if (presenceLevel === 'hidden') return false;
    if (userPreference === 'minimal' && !currentInsight) return false;
    return true;
  }, [userPreference, presenceLevel, currentInsight]);

  /**
   * -------------------------------------
   * Public API
   * -------------------------------------
   */
  return {
    presenceLevel,
    isMinimized,
    screenContext,
    currentInsight,
    queuedInsights,
    settings,
    userPreference,
    lastInteractionAt,
    visitedScreens,
    taughtConcepts,
    referencedTopics,
    shouldShowPresence,
    hasUnseenInsight,

    updateScreenContext,
    dismissCurrentInsight,
    queueInsight,
    showNextQueuedInsight,

    minimizeRee,
    expandRee,
    updateSettings,
    updateUserPreference,

    markScreenVisited,
    markConceptTaught,
    addReferencedTopic,
    recordInteraction,
    refreshHomeInsight,
  };
});
