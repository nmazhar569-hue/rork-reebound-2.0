import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, Plus, RotateCcw, ChevronLeft, ArrowDown, ArrowUp, ArrowLeftRight, Info, Trash2, RefreshCw, Moon, Droplets, Dumbbell, Footprints, Swords, ChevronDown, ChevronUp, Search, Filter, BicepsFlexed, HeartPulse } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Program, ProgramSession, ProgramWeekDay, SportType, WeekdayKey, Exercise, AlternativeType } from '@/types';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';
import { buildSessionFromType, getAllSessionTypeOptions } from '@/constants/workoutTemplates';
import { reorderByIndex } from '@/utils/programUtils';
import { getExerciseAlternatives } from '@/constants/exerciseAlternatives';
import { haptics } from '@/utils/haptics';

const WEEKDAYS: { key: WeekdayKey; label: string; short: string }[] = [
  { key: 0, label: 'Sunday', short: 'Sun' },
  { key: 1, label: 'Monday', short: 'Mon' },
  { key: 2, label: 'Tuesday', short: 'Tue' },
  { key: 3, label: 'Wednesday', short: 'Wed' },
  { key: 4, label: 'Thursday', short: 'Thu' },
  { key: 5, label: 'Friday', short: 'Fri' },
  { key: 6, label: 'Saturday', short: 'Sat' },
];

type BuilderStep = 'basics' | 'schedule' | 'sessions';

interface AlternativeWithDetails {
  exercise: Exercise;
  type: AlternativeType;
  reason: string;
  impactNote?: string;
}

const SPORT_ICONS: Record<SportType, React.ReactNode> = {
  gym: <Dumbbell size={20} color={colors.primary} />,
  running: <Footprints size={20} color={colors.primary} />,
  martial_arts: <Swords size={20} color={colors.primary} />,
};

function labelSport(sportType: SportType): string {
  if (sportType === 'gym') return 'Gym / Strength';
  if (sportType === 'running') return 'Running';
  return 'Martial Arts';
}

function getSessionIntensity(sessionTypeKey: string | null): 'rest' | 'light' | 'moderate' | 'heavy' {
  if (!sessionTypeKey) return 'rest';
  const key = sessionTypeKey.toLowerCase();
  if (key.includes('recovery') || key.includes('mobility') || key.includes('stretch')) return 'light';
  if (key.includes('strength') || key.includes('power') || key.includes('hiit')) return 'heavy';
  return 'moderate';
}

export default function ProgramBuilderScreen() {
  const { programId } = useLocalSearchParams();
  const idStr = typeof programId === 'string' ? programId : Array.isArray(programId) ? programId[0] : undefined;

  const { userProfile, programs, upsertProgram } = useApp();

  const existing = useMemo(() => programs.find((p) => p.id === idStr) || null, [programs, idStr]);

  const [step, setStep] = useState<BuilderStep>('basics');
  const [name, setName] = useState<string>(existing?.name ?? 'My Program');
  const [sportType, setSportType] = useState<SportType>(existing?.sportType ?? userProfile?.sportType ?? 'gym');
  const [reeGuidanceExpanded, setReeGuidanceExpanded] = useState(false);
  const [showReeInterventionDismissed, setShowReeInterventionDismissed] = useState(false);

  const initialWeekSchedule = useMemo<ProgramWeekDay[]>(() => {
    if (existing?.weekSchedule?.length) return existing.weekSchedule;
    return WEEKDAYS.map((d) => ({ dayOfWeek: d.key, sessionTypeKey: null }));
  }, [existing]);

  const initialSessions = useMemo<ProgramSession[]>(() => {
    if (existing?.sessions?.length) return existing.sessions;
    return [];
  }, [existing]);

  const [weekSchedule, setWeekSchedule] = useState<ProgramWeekDay[]>(initialWeekSchedule);
  const [sessions, setSessions] = useState<ProgramSession[]>(initialSessions);

  const sessionTypeOptions = useMemo(() => getAllSessionTypeOptions(), []);

  const [sessionPickerOpen, setSessionPickerOpen] = useState(false);
  const [sessionPickerDay, setSessionPickerDay] = useState<WeekdayKey | null>(null);

  const selectedDaysCount = useMemo(() => weekSchedule.filter((d) => !!d.sessionTypeKey).length, [weekSchedule]);

  const consecutiveTrainingDays = useMemo(() => {
    let maxConsecutive = 0;
    let current = 0;
    for (let i = 0; i < 14; i++) {
      const dayIndex = (i % 7) as WeekdayKey;
      const entry = weekSchedule.find(x => x.dayOfWeek === dayIndex);
      if (entry?.sessionTypeKey) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    return maxConsecutive;
  }, [weekSchedule]);

  const showReeIntervention = consecutiveTrainingDays >= 4 && !showReeInterventionDismissed;

  const ensureSessionsFromSchedule = useCallback(
    (schedule: ProgramWeekDay[], nextSport: SportType) => {
      const profile = userProfile;
      if (!profile) return;

      const next: ProgramSession[] = [];

      schedule.forEach((d) => {
        if (!d.sessionTypeKey) return;
        const existingSession = sessions.find((s) => s.dayOfWeek === d.dayOfWeek && s.sessionTypeKey === d.sessionTypeKey);
        if (existingSession) {
          next.push(existingSession);
          return;
        }

        const built = buildSessionFromType(d.sessionTypeKey, nextSport, profile.injuryType, profile.painTolerance);
        next.push({
          dayOfWeek: d.dayOfWeek,
          sessionTypeKey: d.sessionTypeKey,
          exercises: built?.exercises ?? [],
        });
      });

      setSessions(next);
    },
    [sessions, userProfile]
  );

  const setDaySessionType = useCallback(
    (dayOfWeek: WeekdayKey, sessionTypeKey: string | null) => {
      setWeekSchedule((prev) => {
        const updated = prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, sessionTypeKey } : d));
        return updated;
      });

      const nextSchedule = weekSchedule.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, sessionTypeKey } : d));
      ensureSessionsFromSchedule(nextSchedule, sportType);
    },
    [ensureSessionsFromSchedule, sportType, weekSchedule]
  );

  const updateExercise = useCallback(
    (day: WeekdayKey, sessionTypeKey: string, exIndex: number, next: Exercise) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.dayOfWeek !== day || s.sessionTypeKey !== sessionTypeKey) return s;
          const copy = [...s.exercises];
          copy[exIndex] = next;
          return { ...s, exercises: copy };
        })
      );
    },
    []
  );

  const removeExercise = useCallback((day: WeekdayKey, sessionTypeKey: string, exIndex: number) => {
    haptics.light();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== day || s.sessionTypeKey !== sessionTypeKey) return s;
        const copy = s.exercises.filter((_, i) => i !== exIndex);
        return { ...s, exercises: copy };
      })
    );
  }, []);

  const moveExercise = useCallback((day: WeekdayKey, sessionTypeKey: string, fromIndex: number, toIndex: number) => {
    haptics.selection();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== day || s.sessionTypeKey !== sessionTypeKey) return s;
        return { ...s, exercises: reorderByIndex(s.exercises, fromIndex, toIndex) };
      })
    );
  }, []);

  const addExercise = useCallback((day: WeekdayKey, sessionTypeKey: string, exercise: Exercise) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.dayOfWeek !== day || s.sessionTypeKey !== sessionTypeKey) return s;
        return { ...s, exercises: [...s.exercises, exercise] };
      })
    );
  }, []);

  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exercisePickerTarget, setExercisePickerTarget] = useState<{ day: WeekdayKey; sessionTypeKey: string; mode: 'add' | 'swap'; index?: number; base?: Exercise } | null>(null);
  const [createExerciseOpen, setCreateExerciseOpen] = useState(false);

  type EditTarget = { day: WeekdayKey; sessionTypeKey: string; index: number; exercise: Exercise } | null;
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editExercise, setEditExercise] = useState<EditTarget>(null);

  const openAddExercise = useCallback((day: WeekdayKey, sessionTypeKey: string) => {
    setExercisePickerTarget({ day, sessionTypeKey, mode: 'add' });
    setExercisePickerOpen(true);
  }, []);

  const openSwapExercise = useCallback((day: WeekdayKey, sessionTypeKey: string, index: number, base: Exercise) => {
    haptics.light();
    setExercisePickerTarget({ day, sessionTypeKey, mode: 'swap', index, base });
    setExercisePickerOpen(true);
  }, []);

  const getImpactNote = useCallback((current: Exercise | undefined, next: Exercise): string | undefined => {
    if (!current) return undefined;
    
    const currentLevel = current.kneeSafeLevel;
    const nextLevel = next.kneeSafeLevel;
    
    if (currentLevel === 'safe' && nextLevel === 'caution') {
      return 'This option increases knee load. Consider starting with lighter weight or reduced range.';
    }
    if (currentLevel === 'safe' && nextLevel === 'modified') {
      return 'Slightly more demanding on joints. Listen to your body.';
    }
    if (currentLevel === 'modified' && nextLevel === 'caution') {
      return 'Higher knee stress. Two lower-load alternatives are available below.';
    }
    if (nextLevel === 'safe' && currentLevel !== 'safe') {
      return 'A gentler option that protects your joints.';
    }
    return undefined;
  }, []);

  const exerciseAlternatives = useMemo((): { regressions: AlternativeWithDetails[]; lateral: AlternativeWithDetails[]; progressions: AlternativeWithDetails[]; all: AlternativeWithDetails[] } => {
    const target = exercisePickerTarget;
    if (!target?.base) {
      return { regressions: [], lateral: [], progressions: [], all: [] };
    }

    const alternatives = getExerciseAlternatives(target.base.id);
    const result: { regressions: AlternativeWithDetails[]; lateral: AlternativeWithDetails[]; progressions: AlternativeWithDetails[] } = {
      regressions: [],
      lateral: [],
      progressions: [],
    };

    alternatives.forEach((alt) => {
      const exercise = MASTER_EXERCISE_DATABASE.find((e) => e.id === alt.exerciseId);
      if (!exercise) return;

      const impactNote = getImpactNote(target.base, exercise);
      const detailed: AlternativeWithDetails = {
        exercise,
        type: alt.type,
        reason: alt.reason,
        impactNote,
      };

      if (alt.type === 'regression') result.regressions.push(detailed);
      else if (alt.type === 'lateral') result.lateral.push(detailed);
      else if (alt.type === 'progression') result.progressions.push(detailed);
    });

    return { ...result, all: [...result.regressions, ...result.lateral, ...result.progressions] };
  }, [exercisePickerTarget, getImpactNote]);

  const exerciseCandidates = useMemo(() => {
    const target = exercisePickerTarget;
    if (!target) return [];

    const base = target.base;
    const list = MASTER_EXERCISE_DATABASE;

    if (!base) {
      return list
        .filter((e) => !!e.sportRelevance?.[sportType])
        .sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    const alternativeIds = new Set(exerciseAlternatives.all.map(a => a.exercise.id));
    
    const baseRole = base.sportRelevance?.[sportType]?.role;
    const baseLevel = base.kneeSafeLevel;

    const preferred = list.filter((e) => {
      if (alternativeIds.has(e.id) || e.id === base.id) return false;
      const sameLevel = e.kneeSafeLevel === baseLevel;
      const role = e.sportRelevance?.[sportType]?.role;
      const closeRole = !!baseRole ? role === baseRole : true;
      return sameLevel && closeRole;
    });

    const fallback = list.filter((e) => {
      if (alternativeIds.has(e.id) || e.id === base.id) return false;
      return e.kneeSafeLevel === baseLevel;
    });

    const merged = [...preferred, ...fallback].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);
    return merged.sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [exercisePickerTarget, sportType, exerciseAlternatives]);

  const saveProgram = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Program name required', 'Give your program a short name to save it.');
      return;
    }

    if (!userProfile) {
      Alert.alert('Missing profile', 'Complete onboarding first.');
      router.replace('/onboarding');
      return;
    }

    if (selectedDaysCount < 1) {
      Alert.alert('Add at least 1 session', 'Pick a session type for at least one day.');
      return;
    }

    const id = existing?.id ?? `prog-${Date.now()}`;

    const program: Program = {
      id,
      name: trimmed,
      sportType,
      weekSchedule,
      sessions,
      createdByUser: true,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    console.log('[program-builder] saving', { id, sportType, days: selectedDaysCount });
    await upsertProgram(program);
    router.back();
  }, [name, userProfile, selectedDaysCount, existing, sportType, weekSchedule, sessions, upsertProgram]);

  const resetToSuggestions = useCallback(() => {
    if (!userProfile) return;
    ensureSessionsFromSchedule(weekSchedule, sportType);
  }, [ensureSessionsFromSchedule, sportType, userProfile, weekSchedule]);

  const handleBack = () => {
      if (step === 'sessions') setStep('schedule');
      else if (step === 'schedule') setStep('basics');
      else router.back();
  };

  const isActiveRecovery = (sessionTypeKey: string | null): boolean => {
    if (!sessionTypeKey) return false;
    const key = sessionTypeKey.toLowerCase();
    return key.includes('recovery') || key.includes('mobility') || key.includes('stretch') || key.includes('active_recovery');
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn}>
                <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.stepPills}>
                <TouchableOpacity style={[styles.stepPill, step === 'basics' && styles.stepPillActive]} onPress={() => setStep('basics')} testID="builderStepBasics">
                <Text style={[styles.stepPillText, step === 'basics' && styles.stepPillTextActive]}>Basics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.stepPill, step === 'schedule' && styles.stepPillActive]} onPress={() => setStep('schedule')} testID="builderStepSchedule">
                <Text style={[styles.stepPillText, step === 'schedule' && styles.stepPillTextActive]}>Week</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.stepPill, step === 'sessions' && styles.stepPillActive]} onPress={() => setStep('sessions')} testID="builderStepSessions">
                <Text style={[styles.stepPillText, step === 'sessions' && styles.stepPillTextActive]}>Sessions</Text>
                </TouchableOpacity>
            </View>
            <View style={{width: 40}} /> 
        </View>

    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {step === 'basics' && (
        <View style={styles.card}>
          <View style={styles.reeIntroBlock}>
            <View style={styles.reeAvatar}>
              <Text style={styles.reeAvatarText}>R</Text>
            </View>
            <Text style={styles.reeIntroText}>
              I will suggest exercises that fit your goals — you are always in control.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Program name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Weekday Strength + Recovery"
              placeholderTextColor={colors.textTertiary}
              testID="programNameInput"
              maxLength={50}
            />
            <Text style={styles.inputCharCount}>{name.length}/50</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Sport intent</Text>
          <Text style={styles.sectionHint}>Based on what you told me earlier — adjustable anytime.</Text>

          <View style={styles.sportRow}>
            {(['gym', 'running', 'martial_arts'] as SportType[]).map((st) => {
              const active = st === sportType;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.sportChip, active && styles.sportChipActive]}
                  onPress={() => {
                    haptics.selection();
                    setSportType(st);
                    ensureSessionsFromSchedule(weekSchedule, st);
                  }}
                  testID={`builderSport-${st}`}
                >
                  <View style={styles.sportChipIcon}>
                    {SPORT_ICONS[st]}
                  </View>
                  <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>{labelSport(st)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep('schedule')} testID="builderBasicsNext">
            <Text style={styles.nextBtnText}>Next Step</Text>
            <ChevronRight size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      )}

      {step === 'schedule' && (
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.reeGuidanceCard}
            onPress={() => {
              haptics.selection();
              setReeGuidanceExpanded(!reeGuidanceExpanded);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.reeGuidanceHeader}>
              <View style={styles.reeAvatar}>
                <Text style={styles.reeAvatarText}>R</Text>
              </View>
              <Text style={styles.reeGuidanceTitle}>Your week is a rhythm, not a race.</Text>
              {reeGuidanceExpanded ? (
                <ChevronUp size={18} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={18} color={colors.textSecondary} />
              )}
            </View>
            {reeGuidanceExpanded && (
              <Text style={styles.reeGuidanceText}>
                Balance training with rest. Your body adapts during recovery, not just during effort.
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Weekly structure</Text>
              <Text style={styles.sectionHint}>Pick a session type per day. Leave blank for rest.</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{selectedDaysCount} days planned</Text>
            </View>
          </View>

          <View style={styles.scheduleList}>
            {WEEKDAYS.map((d) => {
              const entry = weekSchedule.find((x) => x.dayOfWeek === d.key);
              const value = entry?.sessionTypeKey ?? null;
              const intensity = getSessionIntensity(value);
              const display = value
                ? sessionTypeOptions.find((o) => o.key === value)?.title ?? value
                : 'Recovery';

              const intensityWidth = intensity === 'rest' ? 0 : intensity === 'light' ? 30 : intensity === 'moderate' ? 60 : 90;

              return (
                <TouchableOpacity
                  key={d.key}
                  style={styles.scheduleRow}
                  onPress={() => {
                    setSessionPickerDay(d.key);
                    setSessionPickerOpen(true);
                  }}
                  testID={`builderDay-${d.key}`}
                >
                  {intensityWidth > 0 && (
                    <View style={[styles.intensityBar, { width: `${intensityWidth}%` }]} />
                  )}
                  <Text style={styles.scheduleDay}>{d.short}</Text>
                  <View style={styles.scheduleValueRow}>
                    {!value && <Moon size={14} color={colors.textTertiary} style={{ marginRight: 6 }} />}
                    <Text style={[styles.scheduleValue, !value && styles.scheduleValueRest]} numberOfLines={1}>
                      {display}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => setStep('basics')} testID="builderScheduleBack">
              <Text style={styles.ghostBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              ensureSessionsFromSchedule(weekSchedule, sportType);
              setStep('sessions');
            }} testID="builderScheduleNext">
              <Text style={styles.nextBtnText}>Next Step</Text>
              <ChevronRight size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'sessions' && (
        <View style={styles.card}>
          {showReeIntervention && (
            <View style={styles.reeInterventionCard}>
              <View style={styles.reeInterventionHeader}>
                <View style={styles.reeAvatar}>
                  <Text style={styles.reeAvatarText}>R</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reeInterventionText}>
                    You are building an active week. Want help placing rest days for recovery?
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowReeInterventionDismissed(true)}
                  style={styles.reeInterventionDismiss}
                >
                  <Text style={styles.reeInterventionDismissText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Sessions</Text>
              <Text style={styles.sectionHint}>Drag to reorder, tap to edit sets/reps/rest.</Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={resetToSuggestions} testID="builderResetSuggestions">
              <RotateCcw size={14} color={colors.primary} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {WEEKDAYS.map((d) => {
            const scheduleEntry = weekSchedule.find((x) => x.dayOfWeek === d.key);
            if (!scheduleEntry?.sessionTypeKey) return null;

            const sessionTypeKey = scheduleEntry.sessionTypeKey;
            const title = sessionTypeOptions.find((o) => o.key === sessionTypeKey)?.title ?? sessionTypeKey;
            const session = sessions.find((s) => s.dayOfWeek === d.key && s.sessionTypeKey === sessionTypeKey);
            const exList = session?.exercises ?? [];
            const isRecoverySession = isActiveRecovery(sessionTypeKey);

            return (
              <View key={`${d.key}-${sessionTypeKey}`} style={[styles.sessionBlock, isRecoverySession && styles.sessionBlockRecovery]}>
                <View style={styles.sessionHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionDay}>{d.label}</Text>
                    <View style={styles.sessionTitleRow}>
                      {isRecoverySession && <Droplets size={16} color={colors.accent} style={{ marginRight: 6 }} />}
                      <Text style={[styles.sessionTitle, isRecoverySession && styles.sessionTitleRecovery]} numberOfLines={1}>{title}</Text>
                    </View>
                    {isRecoverySession && (
                      <Text style={styles.sessionSubtitle}>Gentle movement · 20 min</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => openAddExercise(d.key, sessionTypeKey)}
                    testID={`builderAddExercise-${d.key}`}
                  >
                    <Plus size={16} color={colors.surface} />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {exList.length ? (
                  <View style={styles.exerciseList}>
                    {exList.map((ex, idx) => {
                      const isCaution = ex.kneeSafeLevel === 'caution';
                      const cautionText = isCaution ? 'Use Caution' : ex.kneeSafeLevel === 'modified' ? 'Modified' : 'Knee-Safe';
                      const cautionColor = isCaution ? colors.danger : ex.kneeSafeLevel === 'modified' ? colors.warning : colors.success;

                      return (
                        <View key={ex.id + idx} style={styles.exerciseRow}>
                          <TouchableOpacity
                            style={styles.exerciseMain}
                            onPress={() => {
                              setEditExercise({ day: d.key, sessionTypeKey, index: idx, exercise: ex });
                              setEditModalOpen(true);
                            }}
                            testID={`builderExercise-${d.key}-${idx}`}
                          >
                            <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                            <Text style={styles.exerciseMeta}>{ex.sets} × {ex.reps} · {ex.rest}s</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.levelPill, { backgroundColor: cautionColor + '12' }]}
                            onPress={() => {
                              if (isCaution) {
                                const alternatives = getExerciseAlternatives(ex.id);
                                const regressions = alternatives.filter(a => a.type === 'regression');
                                const altNames = regressions.slice(0, 2).map(a => {
                                  const found = MASTER_EXERCISE_DATABASE.find(e => e.id === a.exerciseId);
                                  return found?.name;
                                }).filter(Boolean).join(' or ');
                                
                                Alert.alert(
                                  'This exercise loads the knee more',
                                  `You can absolutely include it — consider starting lighter or with reduced range.${altNames ? `\n\nLower-load alternatives: ${altNames}` : ''}`,
                                  [
                                    { text: 'Keep it', style: 'cancel' },
                                    altNames ? { text: 'Swap', onPress: () => openSwapExercise(d.key, sessionTypeKey, idx, ex) } : null,
                                  ].filter(Boolean) as any
                                );
                              } else if (ex.kneeSafeLevel === 'modified') {
                                Alert.alert(
                                  'Modified for your profile',
                                  'This exercise has been adapted to work with your needs. Listen to your body and adjust if needed.',
                                  [{ text: 'Got it' }]
                                );
                              }
                            }}
                            testID={`builderExerciseLevel-${d.key}-${idx}`}
                          >
                            <Text style={[styles.levelPillText, { color: cautionColor }]}>{cautionText}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => openSwapExercise(d.key, sessionTypeKey, idx, ex)}
                            testID={`builderSwap-${d.key}-${idx}`}
                          >
                            <RefreshCw size={16} color={colors.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => removeExercise(d.key, sessionTypeKey, idx)}
                            testID={`builderRemove-${d.key}-${idx}`}
                          >
                            <Trash2 size={16} color={colors.danger} />
                          </TouchableOpacity>

                          <View style={styles.reorderCol}>
                            <TouchableOpacity
                              style={styles.reorderBtn}
                              onPress={() => moveExercise(d.key, sessionTypeKey, idx, Math.max(0, idx - 1))}
                              disabled={idx === 0}
                              testID={`builderMoveUp-${d.key}-${idx}`}
                            >
                              <ArrowUp size={14} color={idx === 0 ? colors.textTertiary : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.reorderBtn}
                              onPress={() => moveExercise(d.key, sessionTypeKey, idx, Math.min(exList.length - 1, idx + 1))}
                              disabled={idx === exList.length - 1}
                              testID={`builderMoveDown-${d.key}-${idx}`}
                            >
                              <ArrowDown size={14} color={idx === exList.length - 1 ? colors.textTertiary : colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.sessionEmpty}>
                    <Text style={styles.sessionEmptyText}>No exercises yet.</Text>
                    <TouchableOpacity
                      style={styles.ghostInline}
                      onPress={() => resetToSuggestions()}
                      testID={`builderSessionFill-${d.key}`}
                    >
                      <Text style={styles.ghostInlineText}>Fill with suggestions</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => setStep('schedule')} testID="builderSessionsBack">
              <Text style={styles.ghostBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveProgram} testID="builderSaveProgram">
              <Check size={20} color={colors.surface} />
              <Text style={styles.saveBtnText}>Save Program</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal transparent visible={sessionPickerOpen} animationType="fade" onRequestClose={() => setSessionPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Session type</Text>
            <Text style={styles.modalSubtitle}>Sport-relevant options first. Cross-sport is allowed.</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <TouchableOpacity
                style={styles.modalRow}
                onPress={() => {
                  if (sessionPickerDay === null) return;
                  setDaySessionType(sessionPickerDay, null);
                  setSessionPickerOpen(false);
                }}
                testID="sessionPickerRest"
              >
                <Moon size={18} color={colors.textTertiary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalRowTitle}>Recovery</Text>
                  <Text style={styles.modalRowMeta}>No session</Text>
                </View>
              </TouchableOpacity>

              {sessionTypeOptions
                .slice()
                .sort((a, b) => {
                  const aRel = a.sportType === sportType ? 0 : 1;
                  const bRel = b.sportType === sportType ? 0 : 1;
                  if (aRel !== bRel) return aRel - bRel;
                  return a.title > b.title ? 1 : -1;
                })
                .map((opt) => (
                  <TouchableOpacity
                    key={`${opt.sportType}-${opt.key}`}
                    style={styles.modalRow}
                    onPress={() => {
                      if (sessionPickerDay === null) return;
                      setDaySessionType(sessionPickerDay, opt.key);
                      setSessionPickerOpen(false);
                    }}
                    testID={`sessionPicker-${opt.key}`}
                  >
                    <Text style={styles.modalRowTitle}>{opt.title}</Text>
                    <Text style={styles.modalRowMeta}>{labelSport(opt.sportType)}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.modalClose} onPress={() => setSessionPickerOpen(false)} testID="sessionPickerClose">
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ExercisePickerModal
        visible={exercisePickerOpen}
        onClose={() => {
          setExercisePickerOpen(false);
          setExercisePickerTarget(null);
        }}
        candidates={exerciseCandidates}
        alternatives={exerciseAlternatives}
        baseExercise={exercisePickerTarget?.base}
        mode={exercisePickerTarget?.mode ?? 'add'}
        onRequestCreate={() => {
          setCreateExerciseOpen(true);
        }}
        onSelect={(ex) => {
          const target = exercisePickerTarget;
          if (!target) return;

          if (target.mode === 'add') {
            addExercise(target.day, target.sessionTypeKey, ex);
          } else {
            const index = target.index ?? -1;
            if (index >= 0) {
              updateExercise(target.day, target.sessionTypeKey, index, ex);
            }
          }

          setExercisePickerOpen(false);
          setExercisePickerTarget(null);
        }}
      />

      <EditExerciseModal
        visible={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditExercise(null);
        }}
        value={editExercise}
        onSave={(next) => {
          updateExercise(next.day, next.sessionTypeKey, next.index, next.exercise);
          setEditModalOpen(false);
          setEditExercise(null);
        }}
      />

      <CreateExerciseModal
        visible={createExerciseOpen}
        onClose={() => setCreateExerciseOpen(false)}
        onSave={(newExercise) => {
          const target = exercisePickerTarget;
          if (target && target.mode === 'add') {
             addExercise(target.day, target.sessionTypeKey, newExercise);
          }
          setCreateExerciseOpen(false);
          setExercisePickerOpen(false);
        }}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
    </SafeAreaView>
  );

  function ExercisePickerModal(props: {
    visible: boolean;
    candidates: Exercise[];
    alternatives: { regressions: AlternativeWithDetails[]; lateral: AlternativeWithDetails[]; progressions: AlternativeWithDetails[]; all: AlternativeWithDetails[] };
    baseExercise?: Exercise;
    mode: 'add' | 'swap';
    onClose: () => void;
    onRequestCreate?: () => void;
    onSelect: (exercise: Exercise) => void;
  }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | 'upper' | 'lower' | 'maintenance' | 'cardio' | 'martial_arts'>('all');
    
    React.useEffect(() => {
        if (props.visible) {
            setSearchQuery('');
            setActiveCategory('all');
        }
    }, [props.visible]);

    const getCategory = useCallback((ex: Exercise): string => {
        const name = ex.name.toLowerCase();
        const pattern = ex.movementPattern || '';
        const sport = ex.sportRelevance;

        if (activeCategory === 'martial_arts' && sport?.martial_arts) return 'martial_arts';
        
        if (pattern.includes('squat') || pattern.includes('lunge') || pattern.includes('hinge') || name.includes('leg') || name.includes('squat') || name.includes('deadlift')) return 'lower';
        if (pattern.includes('push') || pattern.includes('pull') || pattern.includes('press') || name.includes('press') || name.includes('pull') || name.includes('row') || name.includes('curl')) return 'upper';
        if (pattern.includes('mobility') || pattern.includes('core') || name.includes('plank') || name.includes('stretch') || name.includes('yoga')) return 'maintenance';
        if (pattern.includes('cardio') || name.includes('run') || name.includes('bike') || name.includes('jump')) return 'cardio';
        if (sport?.martial_arts) return 'martial_arts';

        return 'other';
    }, [activeCategory]);

    const filteredCandidates = useMemo(() => {
      let result = props.candidates;

      if (activeCategory !== 'all') {
        result = result.filter(ex => {
            const cat = getCategory(ex);
            if (activeCategory === 'upper') return cat === 'upper';
            if (activeCategory === 'lower') return cat === 'lower';
            if (activeCategory === 'maintenance') return cat === 'maintenance' || cat === 'other';
            if (activeCategory === 'cardio') return cat === 'cardio';
            if (activeCategory === 'martial_arts') return ex.sportRelevance?.martial_arts;
            return true;
        });
      }

      if (!searchQuery.trim()) return result;
      const query = searchQuery.toLowerCase();
      return result.filter(ex => ex.name.toLowerCase().includes(query));
    }, [props.candidates, searchQuery, activeCategory, getCategory]);

    const hasAlternatives = props.alternatives.all.length > 0;
    const isSwapMode = props.mode === 'swap' && hasAlternatives;

    const renderAlternativeSection = (title: string, items: AlternativeWithDetails[], icon: React.ReactNode, bgColor: string) => {
      if (items.length === 0) return null;
      return (
        <View style={styles.altSection}>
          <View style={[styles.altSectionHeader, { backgroundColor: bgColor }]}>
            {icon}
            <Text style={styles.altSectionTitle}>{title}</Text>
          </View>
          {items.map((alt) => {
            const levelColor = alt.exercise.kneeSafeLevel === 'safe' ? colors.success : alt.exercise.kneeSafeLevel === 'modified' ? colors.warning : colors.danger;
            return (
              <TouchableOpacity 
                key={alt.exercise.id} 
                style={styles.altRow} 
                onPress={() => props.onSelect(alt.exercise)} 
                testID={`exercisePick-${alt.exercise.id}`}
              >
                <View style={styles.altRowContent}>
                  <View style={styles.altRowMain}>
                    <Text style={styles.altRowName}>{alt.exercise.name}</Text>
                    <Text style={styles.altRowReason}>{alt.reason}</Text>
                    {alt.impactNote && (
                      <View style={styles.impactNoteContainer}>
                        <Info size={12} color={colors.textSecondary} />
                        <Text style={styles.impactNoteText}>{alt.impactNote}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.altRowMeta}>
                    <Text style={styles.altRowVolume}>{alt.exercise.sets}×{alt.exercise.reps}</Text>
                    <View style={[styles.levelDotSmall, { backgroundColor: levelColor }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };

    const categories: { key: typeof activeCategory; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: 'All', icon: <Filter size={14} color={activeCategory === 'all' ? colors.surface : colors.text} /> },
        { key: 'upper', label: 'Upper', icon: <Dumbbell size={14} color={activeCategory === 'upper' ? colors.surface : colors.text} /> },
        { key: 'lower', label: 'Lower', icon: <BicepsFlexed size={14} color={activeCategory === 'lower' ? colors.surface : colors.text} /> },
        { key: 'maintenance', label: 'Maintenance', icon: <HeartPulse size={14} color={activeCategory === 'maintenance' ? colors.surface : colors.text} /> },
        { key: 'cardio', label: 'Cardio', icon: <Footprints size={14} color={activeCategory === 'cardio' ? colors.surface : colors.text} /> },
        { key: 'martial_arts', label: 'Martial Arts', icon: <Swords size={14} color={activeCategory === 'martial_arts' ? colors.surface : colors.text} /> },
    ];

    return (
      <Modal transparent visible={props.visible} animationType="slide" onRequestClose={props.onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { height: '85%', paddingBottom: 0 }]}>
            <View style={{ paddingHorizontal: 0, paddingBottom: 16 }}>
                 <Text style={styles.modalTitle}>{isSwapMode ? 'Swap exercise' : 'Choose exercise'}</Text>
                 {!isSwapMode && <Text style={styles.modalSubtitle}>Select from database or create your own.</Text>}
            </View>

            {isSwapMode && props.baseExercise ? (
              <View style={styles.swapContext}>
                <Text style={styles.swapContextLabel}>Currently:</Text>
                <Text style={styles.swapContextName}>{props.baseExercise.name}</Text>
                <Text style={styles.modalSubtitle}>Here are alternatives that work similar muscles. Choose what feels right for you.</Text>
              </View>
            ) : (
                <View>
                     <View style={styles.searchContainer}>
                        <Search size={18} color={colors.textTertiary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInputStyled}
                            placeholder="Search exercises..."
                            placeholderTextColor={colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                     </View>

                    {props.onRequestCreate && (
                        <TouchableOpacity 
                            style={styles.addCustomBtn}
                            onPress={props.onRequestCreate}
                        >
                            <Plus size={16} color={colors.primary} />
                            <Text style={styles.addCustomBtnText}>Add my own workout</Text>
                        </TouchableOpacity>
                    )}

                     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.key}
                                style={[styles.categoryChip, activeCategory === cat.key && styles.categoryChipActive]}
                                onPress={() => setActiveCategory(cat.key)}
                            >
                                {cat.icon}
                                <Text style={[styles.categoryChipText, activeCategory === cat.key && styles.categoryChipTextActive]}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                     </ScrollView>
                </View>
            )}

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {isSwapMode && (
                <>
                  {renderAlternativeSection(
                    'Easier options',
                    props.alternatives.regressions,
                    <ArrowDown size={14} color={colors.success} />,
                    colors.successMuted
                  )}
                  {renderAlternativeSection(
                    'Similar alternatives',
                    props.alternatives.lateral,
                    <ArrowLeftRight size={14} color={colors.primary} />,
                    colors.primaryMuted
                  )}
                  {renderAlternativeSection(
                    'More challenging',
                    props.alternatives.progressions,
                    <ArrowUp size={14} color={colors.accent} />,
                    colors.accentMuted
                  )}
                  
                  {filteredCandidates.length > 0 && (
                    <View style={styles.otherOptionsSection}>
                      <Text style={styles.otherOptionsTitle}>Other options</Text>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                  )}
                </>
              )}

              {(!isSwapMode || filteredCandidates.length > 0) && (
                <View style={styles.candidatesList}>
                  {filteredCandidates.map((ex) => {
                    const levelColor = ex.kneeSafeLevel === 'safe' ? colors.success : ex.kneeSafeLevel === 'modified' ? colors.warning : colors.danger;
                    const levelText = ex.kneeSafeLevel === 'safe' ? 'Knee-Safe' : ex.kneeSafeLevel === 'modified' ? 'Modified' : 'Caution';
                    return (
                      <TouchableOpacity key={ex.id} style={styles.modalRow} onPress={() => props.onSelect(ex)} testID={`exercisePick-${ex.id}`}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalRowTitle}>{ex.name}</Text>
                          <Text style={styles.modalRowMeta}>{ex.sets} × {ex.reps} · {ex.rest}s</Text>
                        </View>
                        <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
                        <Text style={[styles.levelText, { color: levelColor }]}>{levelText}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {filteredCandidates.length === 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: colors.textSecondary }}>No exercises found.</Text>
                  </View>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>

            <TouchableOpacity style={styles.modalClose} onPress={props.onClose} testID="exercisePickerClose">
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  function EditExerciseModal(props: {
    visible: boolean;
    value: EditTarget;
    onClose: () => void;
    onSave: (next: { day: WeekdayKey; sessionTypeKey: string; index: number; exercise: Exercise }) => void;
  }) {
    const value = props.value;

    const [setsText, setSetsText] = useState<string>('');
    const [repsText, setRepsText] = useState<string>('');
    const [restText, setRestText] = useState<string>('');

    React.useEffect(() => {
      if (!props.visible || !value) return;
      setSetsText(String(value.exercise.sets));
      setRepsText(String(value.exercise.reps));
      setRestText(String(value.exercise.rest));
    }, [props.visible, value]);

    if (!value) {
      return (
        <Modal transparent visible={props.visible} animationType="fade" onRequestClose={props.onClose}>
          <View style={styles.modalOverlay} />
        </Modal>
      );
    }

    return (
      <Modal transparent visible={props.visible} animationType="fade" onRequestClose={props.onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit exercise</Text>
            <Text style={styles.modalSubtitle}>{value.exercise.name}</Text>

            <View style={styles.editGrid}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Sets</Text>
                <TextInput
                  value={setsText}
                  onChangeText={setSetsText}
                  keyboardType="number-pad"
                  style={styles.editInput}
                  testID="editExerciseSets"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Reps</Text>
                <TextInput
                  value={repsText}
                  onChangeText={setRepsText}
                  style={styles.editInput}
                  testID="editExerciseReps"
                />
              </View>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Rest (sec)</Text>
                <TextInput
                  value={restText}
                  onChangeText={setRestText}
                  keyboardType="number-pad"
                  style={styles.editInput}
                  testID="editExerciseRest"
                />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.ghostBtn} onPress={props.onClose} testID="editExerciseCancel">
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => {
                  const sets = Number(setsText);
                  const rest = Number(restText);
                  if (!Number.isFinite(sets) || sets < 1 || sets > 20) {
                    Alert.alert('Invalid sets', 'Sets must be between 1 and 20.');
                    return;
                  }
                  if (!Number.isFinite(rest) || rest < 0 || rest > 600) {
                    Alert.alert('Invalid rest', 'Rest must be between 0 and 600 seconds.');
                    return;
                  }

                  props.onSave({
                    day: value.day,
                    sessionTypeKey: value.sessionTypeKey,
                    index: value.index,
                    exercise: {
                      ...value.exercise,
                      sets,
                      reps: repsText.trim() || value.exercise.reps,
                      rest,
                    },
                  });
                }}
                testID="editExerciseSave"
              >
                <Check size={18} color={colors.surface} />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

  function CreateExerciseModal(props: {
    visible: boolean;
    onClose: () => void;
    onSave: (exercise: Exercise) => void;
  }) {
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('other');
    const [sets, setSets] = useState('3');
    const [reps, setReps] = useState('10');
    const [rest, setRest] = useState('60');

    React.useEffect(() => {
        if (props.visible) {
            setName('');
            setMuscleGroup('other');
            setSets('3');
            setReps('10');
            setRest('60');
        }
    }, [props.visible]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter an exercise name');
            return;
        }

        const setsNum = parseInt(sets);
        const restNum = parseInt(rest);

        if (isNaN(setsNum) || setsNum < 1) {
             Alert.alert('Invalid', 'Sets must be a number > 0');
             return;
        }

        const newExercise: Exercise = {
            id: `custom-${Date.now()}`,
            name: name.trim(),
            sets: setsNum,
            reps: reps.trim(),
            rest: restNum || 60,
            kneeSafeLevel: 'safe',
            notes: 'Custom exercise',
            movementPattern: muscleGroup === 'legs_squat' ? 'squat' : 
                             muscleGroup === 'legs_hinge' ? 'hinge' : 
                             muscleGroup === 'push' ? 'push_horizontal' : 
                             muscleGroup === 'pull' ? 'pull_horizontal' : 
                             muscleGroup === 'core' ? 'core_flexion' : 'mobility',
        };

        props.onSave(newExercise);
    };

    const muscleOptions = [
        { label: 'Upper Body (Push)', value: 'push' },
        { label: 'Upper Body (Pull)', value: 'pull' },
        { label: 'Legs (Squat/Lunge)', value: 'legs_squat' },
        { label: 'Legs (Hinge/Back)', value: 'legs_hinge' },
        { label: 'Core', value: 'core' },
        { label: 'Cardio', value: 'cardio' },
        { label: 'Other/Maintenance', value: 'other' },
    ];

    return (
        <Modal transparent visible={props.visible} animationType="fade" onRequestClose={props.onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Custom Workout</Text>
            <Text style={styles.modalSubtitle}>Add your own exercise to the routine.</Text>

            <View style={styles.editGrid}>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Exercise Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.editInput}
                  placeholder="e.g. My Special Stretch"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Muscle Group / Type</Text>
                <View style={styles.muscleGroupContainer}>
                    {muscleOptions.map(opt => (
                        <TouchableOpacity 
                            key={opt.value}
                            style={[styles.muscleOption, muscleGroup === opt.value && styles.muscleOptionActive]}
                            onPress={() => setMuscleGroup(opt.value)}
                        >
                            <Text style={[styles.muscleOptionText, muscleGroup === opt.value && styles.muscleOptionTextActive]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
              </View>

              <View style={[styles.rowBetween, { gap: 12 }]}>
                 <View style={[styles.editField, { flex: 1 }]}>
                    <Text style={styles.editLabel}>Sets</Text>
                    <TextInput value={sets} onChangeText={setSets} keyboardType="numeric" style={styles.editInput} />
                 </View>
                 <View style={[styles.editField, { flex: 1 }]}>
                    <Text style={styles.editLabel}>Reps</Text>
                    <TextInput value={reps} onChangeText={setReps} style={styles.editInput} />
                 </View>
                 <View style={[styles.editField, { flex: 1 }]}>
                    <Text style={styles.editLabel}>Rest (s)</Text>
                    <TextInput value={rest} onChangeText={setRest} keyboardType="numeric" style={styles.editInput} />
                 </View>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.ghostBtn} onPress={props.onClose}>
                <Text style={styles.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Plus size={18} color={colors.surface} />
                <Text style={styles.saveBtnText}>Add to Routine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
  },
  headerBackBtn: {
      padding: 8,
      marginLeft: -8,
  },
  content: {
    padding: 20,
  },
  stepPills: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 6,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepPill: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  stepPillActive: {
    backgroundColor: colors.primary,
  },
  stepPillText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  stepPillTextActive: {
    color: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  reeIntroBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  reeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reeAvatarText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  reeIntroText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInputStyled: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.text,
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    borderStyle: 'dashed',
  },
  addCustomBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  muscleGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  muscleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  muscleOptionText: {
    fontSize: 13,
    color: colors.text,
  },
  muscleOptionTextActive: {
    color: colors.surface,
    fontWeight: '600' as const,
  },
  inputCharCount: {
    position: 'absolute',
    right: 16,
    top: 20,
    fontSize: 12,
    color: colors.textTertiary,
  },
  sportRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  sportChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sportChipIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  sportChipTextActive: {
    color: colors.surface,
  },
  nextBtn: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  reeGuidanceCard: {
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  reeGuidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reeGuidanceTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  reeGuidanceText: {
    marginTop: 12,
    marginLeft: 40,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scheduleList: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  intensityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary + '10',
  },
  scheduleDay: {
    width: 48,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    zIndex: 1,
  },
  scheduleValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  scheduleValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primaryDark,
  },
  scheduleValueRest: {
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  ghostBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  saveBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  reeInterventionCard: {
    backgroundColor: colors.warning + '12',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  reeInterventionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reeInterventionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  reeInterventionDismiss: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reeInterventionDismissText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '300' as const,
  },
  sessionBlock: {
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  sessionBlockRecovery: {
    backgroundColor: colors.accent + '08',
    borderColor: colors.accent + '20',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  sessionDay: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  sessionTitleRecovery: {
    color: colors.accent,
  },
  sessionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  exerciseMain: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderCol: {
    width: 32,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sessionEmpty: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 12,
  },
  sessionEmptyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  ghostInline: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
  },
  ghostInlineText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    padding: 24,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalRowTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalRowMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalClose: {
    marginTop: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  altSection: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  altSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  altSectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.text,
  },
  altRow: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  altRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  altRowMain: {
    flex: 1,
  },
  altRowName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  altRowReason: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  altRowMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  altRowVolume: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  levelDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  impactNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  impactNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    lineHeight: 17,
  },
  swapContext: {
    marginBottom: 16,
  },
  swapContextLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  swapContextName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  otherOptionsSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  otherOptionsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  candidatesList: {
    marginTop: 8,
  },
  editGrid: {
    gap: 16,
    marginBottom: 24,
  },
  editField: {
    gap: 8,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
});
