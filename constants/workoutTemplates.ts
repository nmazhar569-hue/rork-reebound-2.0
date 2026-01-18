import { Workout, RecoveryRoutine, InjuryType, PainTolerance, SportType, Exercise } from '@/types';
import { MASTER_EXERCISE_DATABASE } from './exerciseDatabase';

type KneeSafeLevel = 'safe' | 'modified' | 'caution';

type SportModule = {
  label: string;
  icon: string;
  language: {
    primaryLiftLabel: string;
    effortLabel: string;
  };
  sessionTypes: {
    key: string;
    title: string;
    focus: Workout['focus'];
    intent: string;
    exercisePool: string[];
    kneeSafeFilterOverride?: KneeSafeLevel[];
  }[];
  weeklyStructureByFrequency: Record<3 | 4 | 5, string[]>;
};

const SPORT_MODULES: Record<SportType, SportModule> = {
  gym: {
    label: 'Gym / Strength',
    icon: '🏋️',
    language: {
      primaryLiftLabel: 'Working sets',
      effortLabel: 'Load & volume',
    },
    sessionTypes: [
      {
        key: 'push',
        title: 'Push — Strength',
        focus: 'upper_body',
        intent: 'Pressing strength and upper body volume.',
        exercisePool: ['bench-press', 'incline-bench-press', 'overhead-press', 'dips', 'push-ups', 'face-pulls', 'planks'],
      },
      {
        key: 'pull',
        title: 'Pull — Strength',
        focus: 'upper_body',
        intent: 'Pulling strength, posture, and grip support.',
        exercisePool: ['pull-ups', 'chin-ups', 'barbell-rows', 'dumbbell-rows', 'lat-pulldowns', 'face-pulls', 'dead-hangs'],
      },
      {
        key: 'legs',
        title: 'Legs — Controlled',
        focus: 'lower_body',
        intent: 'Lower body strength with knee-aware range of motion.',
        exercisePool: ['rdl', 'hip-thrusts', 'squat-goblet', 'glute-bridge', 'step-ups', 'reverse-lunges', 'hamstring-curl'],
      },
      {
        key: 'full_body',
        title: 'Full Body — Athletic',
        focus: 'upper_body',
        intent: 'Balanced strength with optional conditioning finish.',
        exercisePool: ['bench-press', 'pull-ups', 'rdl', 'hip-thrusts', 'planks', 'farmers-carry', 'battle-ropes'],
      },
      {
        key: 'recovery',
        title: 'Active Recovery',
        focus: 'recovery',
        intent: 'Restore range of motion and keep tissues calm.',
        exercisePool: ['hip-flexor-stretch', 'hamstring-stretch', 'calf-stretch', 'thoracic-rotations', 'ankle-dorsiflexion', 'hip-cars'],
        kneeSafeFilterOverride: ['safe'],
      },
    ],
    weeklyStructureByFrequency: {
      3: ['push', 'legs', 'pull'],
      4: ['push', 'legs', 'pull', 'recovery'],
      5: ['push', 'legs', 'pull', 'full_body', 'recovery'],
    },
  },
  martial_arts: {
    label: 'Martial Arts',
    icon: '🥋',
    language: {
      primaryLiftLabel: 'Rounds',
      effortLabel: 'Intent & control',
    },
    sessionTypes: [
      {
        key: 'explosive_strength',
        title: 'Explosive Strength',
        focus: 'lower_body',
        intent: 'Max intent power work with full recovery between sets.',
        exercisePool: ['kettlebell-swings', 'medicine-ball-slams', 'medicine-ball-throws', 'trap-bar-deadlift', 'box-jumps', 'broad-jumps', 'jump-squats', 'planks'],
      },
      {
        key: 'upper_pull_grip',
        title: 'Upper Pull + Grip',
        focus: 'upper_body',
        intent: 'Grappling-ready pulling strength and grip endurance.',
        exercisePool: ['pull-ups', 'chin-ups', 'barbell-rows', 'landmine-press', 'farmers-carry', 'dead-hangs', 'towel-pull-ups', 'pallof-press'],
      },
      {
        key: 'control_endurance',
        title: 'Strength Endurance & Control',
        focus: 'lower_body',
        intent: 'Unilateral control and balance under fatigue.',
        exercisePool: ['bulgarian-split-squat', 'step-ups', 'reverse-lunges', 'walking-lunges', 'hip-thrusts', 'planks', 'side-planks'],
      },
      {
        key: 'fight_conditioning',
        title: 'Fight Conditioning (Rounds)',
        focus: 'upper_body',
        intent: 'Round-based conditioning with knee-aware options.',
        exercisePool: ['assault-bike', 'battle-ropes', 'sled-push', 'sled-pull', 'jump-rope', 'burpees'],
      },
      {
        key: 'mobility_joint_care',
        title: 'Mobility & Joint Care',
        focus: 'recovery',
        intent: 'Hips, ankles, and thoracic mobility for durable movement.',
        exercisePool: ['hip-cars', 'ankle-dorsiflexion', 'thoracic-rotations', 'hip-flexor-stretch', 'hamstring-stretch', 'neck-mobility'],
        kneeSafeFilterOverride: ['safe'],
      },
    ],
    weeklyStructureByFrequency: {
      3: ['upper_pull_grip', 'control_endurance', 'mobility_joint_care'],
      4: ['upper_pull_grip', 'explosive_strength', 'fight_conditioning', 'mobility_joint_care'],
      5: ['upper_pull_grip', 'explosive_strength', 'control_endurance', 'fight_conditioning', 'mobility_joint_care'],
    },
  },
  running: {
    label: 'Running',
    icon: '🏃',
    language: {
      primaryLiftLabel: 'Run type',
      effortLabel: 'Impact load',
    },
    sessionTypes: [
      {
        key: 'easy_run',
        title: 'Easy / Recovery Run',
        focus: 'lower_body',
        intent: 'Conversational pace to build consistency with low stress.',
        exercisePool: ['easy-run', 'incline-walks', 'planks', 'side-planks'],
        kneeSafeFilterOverride: ['safe', 'modified'],
      },
      {
        key: 'speed_intervals',
        title: 'Speed & Intervals',
        focus: 'lower_body',
        intent: 'Short, focused speed work with full warm-up.',
        exercisePool: ['hill-sprints', 'interval-sprints', 'tempo-run', 'planks', 'pallof-press'],
        kneeSafeFilterOverride: ['safe', 'modified', 'caution'],
      },
      {
        key: 'long_run',
        title: 'Long Run',
        focus: 'lower_body',
        intent: 'Easy, steady endurance with gradual progression.',
        exercisePool: ['long-run', 'planks', 'dead-bugs'],
        kneeSafeFilterOverride: ['safe', 'modified'],
      },
      {
        key: 'strength_for_runners',
        title: 'Strength for Runners',
        focus: 'lower_body',
        intent: 'Posterior chain + single-leg strength to support efficiency.',
        exercisePool: ['rdl', 'hip-thrusts', 'bulgarian-split-squat', 'step-ups', 'glute-bridge', 'planks', 'side-planks'],
      },
      {
        key: 'mobility_tissue_care',
        title: 'Mobility & Tissue Care',
        focus: 'recovery',
        intent: 'Ankles, calves, and hips — keep impact tolerance stable.',
        exercisePool: ['ankle-dorsiflexion', 'calf-stretch', 'hip-flexor-stretch', 'hamstring-stretch', 'thoracic-rotations'],
        kneeSafeFilterOverride: ['safe'],
      },
    ],
    weeklyStructureByFrequency: {
      3: ['easy_run', 'strength_for_runners', 'mobility_tissue_care'],
      4: ['easy_run', 'strength_for_runners', 'speed_intervals', 'mobility_tissue_care'],
      5: ['easy_run', 'strength_for_runners', 'easy_run', 'speed_intervals', 'long_run'],
    },
  },
};

const getSportRelevanceScore = (exercise: Exercise, sportType: SportType): number => {
  const relevance = exercise.sportRelevance?.[sportType];
  if (!relevance) return 0;

  if (relevance.role === 'primary') return 3;
  if (relevance.role === 'secondary') return 2;
  if (relevance.role === 'accessory') return 1;
  return 0;
};

const toKneeFilter = (painTolerance: PainTolerance): KneeSafeLevel[] => {
  if (painTolerance === 'low') return ['safe', 'modified'];
  return ['safe', 'modified', 'caution'];
};

const getInjuryCue = (injuryType: InjuryType): string => {
  if (injuryType === 'acl') return 'Avoid aggressive twisting and sudden direction changes.';
  if (injuryType === 'meniscus') return 'Keep knee flexion controlled. Avoid deep, loaded positions if painful.';
  if (injuryType === 'patella') return 'Keep loads smooth and controlled. Avoid sharp anterior knee pain.';
  if (injuryType === 'post_surgery') return 'Keep intensity conservative and range of motion comfortable.';
  return 'Train within a comfortable range of motion.';
};

const applySportRationale = (exercise: Exercise, sportType: SportType, sessionIntent: string): Exercise => {
  const relevance = exercise.sportRelevance?.[sportType];
  const base = relevance?.purpose ? `For ${SPORT_MODULES[sportType].label}: ${relevance.purpose}.` : undefined;

  if (exercise.rationale) return exercise;

  const merged = [base, sessionIntent].filter(Boolean).join(' ');
  return {
    ...exercise,
    rationale: merged || 'Chosen to support today’s training intent while keeping knee stress predictable.',
  };
};

const filterExercisesBySport = (
  exerciseIds: string[],
  sportType: SportType,
  kneeSafeFilter?: KneeSafeLevel[]
): Exercise[] => {
  const exercises = exerciseIds
    .map((id) => MASTER_EXERCISE_DATABASE.find((ex) => ex.id === id))
    .filter((ex): ex is Exercise => ex !== undefined);

  const filtered = kneeSafeFilter ? exercises.filter((ex) => kneeSafeFilter.includes(ex.kneeSafeLevel)) : exercises;

  return filtered.sort((a, b) => {
    const scoreA = getSportRelevanceScore(a, sportType);
    const scoreB = getSportRelevanceScore(b, sportType);
    return scoreB - scoreA;
  });
};

const pickExercises = (
  pool: string[],
  sportType: SportType,
  kneeFilter: KneeSafeLevel[],
  sessionIntent: string,
  targetCount: number
): Exercise[] => {
  const ordered = filterExercisesBySport(pool, sportType, kneeFilter);
  const picked = ordered.slice(0, targetCount).map((ex) => applySportRationale(ex, sportType, sessionIntent));
  return picked;
};

export const getSessionTypeOptions = (sportType: SportType): { key: string; title: string; focus: Workout['focus']; intent: string }[] => {
  return SPORT_MODULES[sportType].sessionTypes.map((s) => ({
    key: s.key,
    title: s.title,
    focus: s.focus,
    intent: s.intent,
  }));
};

export const getAllSessionTypeOptions = (): { sportType: SportType; key: string; title: string; focus: Workout['focus']; intent: string }[] => {
  const entries: { sportType: SportType; key: string; title: string; focus: Workout['focus']; intent: string }[] = [];
  (Object.keys(SPORT_MODULES) as SportType[]).forEach((st) => {
    SPORT_MODULES[st].sessionTypes.forEach((s) => {
      entries.push({ sportType: st, key: s.key, title: s.title, focus: s.focus, intent: s.intent });
    });
  });
  return entries;
};

export const buildSessionFromType = (
  sessionTypeKey: string,
  sportType: SportType,
  injuryType: InjuryType,
  painTolerance: PainTolerance
): { focus: Workout['focus']; title: string; kneeSafeNote: string; exercises: Exercise[]; sportLabel: string; sessionType: string } | null => {
  const module = SPORT_MODULES[sportType];
  const session = module.sessionTypes.find((s) => s.key === sessionTypeKey);
  if (!session) return null;

  const safeByPain = toKneeFilter(painTolerance);
  const kneeFilter = session.kneeSafeFilterOverride ?? safeByPain;
  const injuryCue = getInjuryCue(injuryType);
  const targetCount = session.focus === 'recovery' ? 4 : sportType === 'running' && session.key.includes('run') ? 3 : 6;
  const exercises = pickExercises(session.exercisePool, sportType, kneeFilter, session.intent, targetCount);

  const kneeSafeNoteParts: string[] = [];
  kneeSafeNoteParts.push(injuryCue);

  if (session.focus === 'recovery') {
    kneeSafeNoteParts.push('Keep the pace easy. Stop if discomfort increases.');
  } else if (sportType === 'gym') {
    kneeSafeNoteParts.push('Use smooth reps. If pain rises, reduce load or range.');
  } else if (sportType === 'martial_arts') {
    kneeSafeNoteParts.push('Prioritize intent and control. Choose knee-friendly options if needed.');
  } else {
    kneeSafeNoteParts.push('Keep impact predictable. If pain rises, shorten or swap to low-impact.');
  }

  const sportLabel = `${module.icon} ${module.label}`;

  return {
    focus: session.focus,
    title: session.title,
    kneeSafeNote: kneeSafeNoteParts.join(' '),
    exercises,
    sportLabel,
    sessionType: session.key,
  };
};

export const getWorkoutPlan = (
  injuryType: InjuryType,
  painTolerance: PainTolerance,
  frequency: number,
  sportType: SportType = 'gym'
): Workout[] => {
  const module = SPORT_MODULES[sportType];
  const safeByPain = toKneeFilter(painTolerance);
  const freqKey: 3 | 4 | 5 = (frequency >= 5 ? 5 : frequency === 4 ? 4 : 3) as 3 | 4 | 5;

  const structure = module.weeklyStructureByFrequency[freqKey];
  const injuryCue = getInjuryCue(injuryType);

  const sessionsByKey = new Map(module.sessionTypes.map((s) => [s.key, s] as const));

  const workouts: Workout[] = [];
  const plannedDays: number[] = freqKey === 5 ? [1, 2, 3, 5, 6] : freqKey === 4 ? [1, 2, 4, 6] : [1, 3, 5];

  structure.forEach((sessionKey, index) => {
    const session = sessionsByKey.get(sessionKey);
    if (!session) return;

    const dayOfWeek = plannedDays[index] ?? (index + 1);
    const kneeFilter = session.kneeSafeFilterOverride ?? safeByPain;

    const targetCount = session.focus === 'recovery' ? 4 : sportType === 'running' && sessionKey.includes('run') ? 3 : 6;

    const exercises = pickExercises(session.exercisePool, sportType, kneeFilter, session.intent, targetCount);

    const sportLabel = `${module.icon} ${module.label}`;

    const kneeSafeNoteParts: string[] = [];
    kneeSafeNoteParts.push(injuryCue);

    if (session.focus === 'recovery') {
      kneeSafeNoteParts.push('Keep the pace easy. Stop if discomfort increases.');
    } else if (sportType === 'gym') {
      kneeSafeNoteParts.push('Use smooth reps. If pain rises, reduce load or range.');
    } else if (sportType === 'martial_arts') {
      kneeSafeNoteParts.push('Prioritize intent and control. Choose knee-friendly options if needed.');
    } else {
      kneeSafeNoteParts.push('Keep impact predictable. If pain rises, shorten or swap to low-impact.');
    }

    const kneeSafeNote = kneeSafeNoteParts.join(' ');

    workouts.push({
      id: `${sportType}-${sessionKey}-${index + 1}`,
      dayOfWeek,
      focus: session.focus,
      title: session.title,
      kneeSafeNote,
      exercises,
      sessionType: sessionKey,
      sportLabel,
    });
  });

  console.log('[getWorkoutPlan] Generated plan', {
    injuryType,
    painTolerance,
    frequency,
    sportType,
    sessions: workouts.map((w) => ({ id: w.id, dayOfWeek: w.dayOfWeek, title: w.title, focus: w.focus })),
  });

  return workouts;
};

export const recoveryRoutines: RecoveryRoutine[] = [
  {
    id: 'warmup-1',
    title: 'Pre-Workout Warm-Up',
    duration: 8,
    type: 'warmup',
    steps: [
      {
        id: 's1',
        instruction: 'Gentle walking or marching in place',
        duration: 120,
      },
      {
        id: 's2',
        instruction: 'Ankle circles: 10 each direction, both ankles',
        duration: 60,
      },
      {
        id: 's3',
        instruction: 'Knee flexion/extension: Slowly bend and straighten knee 10 times',
        duration: 90,
      },
      {
        id: 's4',
        instruction: 'Hip circles: 10 each direction',
        duration: 60,
      },
      {
        id: 's5',
        instruction: 'Bodyweight glute bridges: 12 reps',
        duration: 60,
      },
      {
        id: 's6',
        instruction: 'Light quad activation: Contract and hold 5s, repeat 8 times',
        duration: 90,
      },
    ],
  },
  {
    id: 'cooldown-1',
    title: 'Post-Workout Cool-Down',
    duration: 6,
    type: 'cooldown',
    steps: [
      {
        id: 'c1',
        instruction: 'Slow walking to bring heart rate down',
        duration: 120,
      },
      {
        id: 'c2',
        instruction: 'Seated hamstring stretch: 30s each leg',
        duration: 60,
      },
      {
        id: 'c3',
        instruction: 'Quad stretch (standing or lying): 30s each leg',
        duration: 60,
      },
      {
        id: 'c4',
        instruction: 'Figure-4 hip stretch: 30s each side',
        duration: 60,
      },
      {
        id: 'c5',
        instruction: 'Calf stretch: 30s each leg',
        duration: 60,
      },
    ],
  },
  {
    id: 'mobility-1',
    title: 'Daily Mobility Flow',
    duration: 10,
    type: 'mobility',
    steps: [
      {
        id: 'm1',
        instruction: 'Cat-cow stretch: 10 slow repetitions',
        duration: 60,
      },
      {
        id: 'm2',
        instruction: 'Knee circles: 10 each direction',
        duration: 60,
      },
      {
        id: 'm3',
        instruction: 'Ankle pumps: 20 reps',
        duration: 45,
      },
      {
        id: 'm4',
        instruction: 'Hip flexor stretch: 45s each side',
        duration: 90,
      },
      {
        id: 'm5',
        instruction: 'IT band foam roll: Gentle pressure, 60s each side',
        duration: 120,
      },
      {
        id: 'm6',
        instruction: 'Gentle knee flexion/extension: 15 slow reps',
        duration: 90,
      },
      {
        id: 'm7',
        instruction: 'Deep breathing: 5 deep breaths',
        duration: 45,
      },
    ],
  },
];
