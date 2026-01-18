import { Exercise, InjuryType, PainTolerance, FatigueLevel, JointStressLevel, ExerciseSuitability } from '@/types';
import { 
  getExerciseInjuryContext, 
  getKneeLoadLevel, 
  getInjuryTypeContext,
  JointArea 
} from '@/constants/injuryIntelligence';
import { getExerciseAlternatives } from '@/constants/exerciseAlternatives';

export interface FilterContext {
  injuryType: InjuryType;
  painTolerance: PainTolerance;
  currentPainLevel: number;
  fatigueLevel: FatigueLevel;
}

export interface FilteredExercise extends Exercise {
  suitabilityInfo: ExerciseSuitability;
}

const PAIN_TOLERANCE_THRESHOLDS: Record<PainTolerance, number> = {
  low: 3,
  medium: 5,
  high: 7,
};

const FATIGUE_MODIFIERS: Record<FatigueLevel, number> = {
  fresh: 1.0,
  normal: 0.9,
  tired: 0.7,
  exhausted: 0.5,
};

const KNEE_LOAD_SCORES: Record<JointStressLevel, number> = {
  low: 1.0,
  moderate: 0.7,
  high: 0.4,
};

export const calculateExerciseSuitability = (
  exercise: Exercise,
  context: FilterContext
): ExerciseSuitability => {
  const kneeLoadLevel = getKneeLoadLevel(exercise.id);
  const injuryContext = getExerciseInjuryContext(exercise.id);
  let baseScore = KNEE_LOAD_SCORES[kneeLoadLevel];
  const considerations: string[] = [];
  const alternatives: string[] = [];
  
  if (context.currentPainLevel > PAIN_TOLERANCE_THRESHOLDS[context.painTolerance]) {
    baseScore *= 0.5;
    considerations.push('Current pain level suggests lighter options may feel better');
  }
  
  baseScore *= FATIGUE_MODIFIERS[context.fatigueLevel];
  if (context.fatigueLevel === 'tired' || context.fatigueLevel === 'exhausted') {
    considerations.push('Fatigue affects movement quality — consider reducing intensity');
  }
  
  if (injuryContext) {
    const kneeLoad = injuryContext.jointLoads.find(j => j.joint === 'knee');
    if (kneeLoad) {
      considerations.push(kneeLoad.neutralDescription);
      
      if (kneeLoad.loadTypes.includes('impact')) {
        baseScore *= 0.7;
        considerations.push('Involves impact forces');
      }
      if (kneeLoad.loadTypes.includes('shear')) {
        baseScore *= 0.85;
      }
    }
    
    if (injuryContext.modificationCues.length > 0) {
      considerations.push(injuryContext.modificationCues[0]);
    }
  }
  
  if (exercise.kneeSafeLevel === 'caution') {
    baseScore *= 0.6;
    considerations.push('Higher joint demand — monitor response');
  } else if (exercise.kneeSafeLevel === 'modified') {
    baseScore *= 0.8;
    considerations.push('Moderate joint involvement');
  }
  
  const exerciseAlternatives = getExerciseAlternatives(exercise.id);
  const regressions = exerciseAlternatives
    .filter(alt => alt.type === 'regression')
    .map(alt => alt.exerciseId);
  alternatives.push(...regressions);
  
  const isRecommended = baseScore >= 0.6 && context.currentPainLevel <= PAIN_TOLERANCE_THRESHOLDS[context.painTolerance];
  
  return {
    exerciseId: exercise.id,
    suitabilityScore: Math.max(0, Math.min(1, baseScore)),
    kneeLoadLevel,
    considerations,
    alternatives,
    isRecommended,
  };
};

export const filterExercisesForContext = (
  exercises: Exercise[],
  context: FilterContext
): FilteredExercise[] => {
  return exercises.map(exercise => ({
    ...exercise,
    suitabilityInfo: calculateExerciseSuitability(exercise, context),
  }));
};

export const sortExercisesBySuitability = (
  exercises: FilteredExercise[]
): FilteredExercise[] => {
  return [...exercises].sort((a, b) => 
    b.suitabilityInfo.suitabilityScore - a.suitabilityInfo.suitabilityScore
  );
};

export const getRecommendedExercises = (
  exercises: Exercise[],
  context: FilterContext
): FilteredExercise[] => {
  const filtered = filterExercisesForContext(exercises, context);
  return filtered.filter(ex => ex.suitabilityInfo.isRecommended);
};

export const getCautionExercises = (
  exercises: Exercise[],
  context: FilterContext
): FilteredExercise[] => {
  const filtered = filterExercisesForContext(exercises, context);
  return filtered.filter(ex => !ex.suitabilityInfo.isRecommended);
};

export const getSuggestedAlternative = (
  exerciseId: string,
  context: FilterContext
): string | null => {
  const alternatives = getExerciseAlternatives(exerciseId);
  const regressions = alternatives.filter(alt => alt.type === 'regression');
  
  if (regressions.length === 0) return null;
  
  const sortedByKneeLoad = regressions.sort((a, b) => {
    const loadA = getKneeLoadLevel(a.exerciseId);
    const loadB = getKneeLoadLevel(b.exerciseId);
    return KNEE_LOAD_SCORES[loadB] - KNEE_LOAD_SCORES[loadA];
  });
  
  return sortedByKneeLoad[0]?.exerciseId || null;
};

export const getExerciseConsiderations = (
  exerciseId: string,
  injuryType: InjuryType
): string[] => {
  const context = getExerciseInjuryContext(exerciseId);
  const injuryTypeContext = getInjuryTypeContext(injuryType);
  const considerations: string[] = [];
  
  if (context) {
    const kneeLoad = context.jointLoads.find(j => j.joint === 'knee');
    if (kneeLoad && kneeLoad.stressLevel !== 'low') {
      considerations.push(kneeLoad.neutralDescription);
    }
    
    if (context.whenToReduce.length > 0) {
      considerations.push(`Consider reducing if: ${context.whenToReduce[0]}`);
    }
  }
  
  if (injuryTypeContext) {
    const relevantGuidance = injuryTypeContext.movementGuidance[0];
    if (relevantGuidance) {
      considerations.push(relevantGuidance);
    }
  }
  
  return considerations;
};

export const shouldShowCautionIndicator = (
  exercise: Exercise,
  painLevel: number,
  painTolerance: PainTolerance
): boolean => {
  if (exercise.kneeSafeLevel === 'caution') return true;
  
  const kneeLoad = getKneeLoadLevel(exercise.id);
  if (kneeLoad === 'high' && painLevel > PAIN_TOLERANCE_THRESHOLDS[painTolerance] - 2) {
    return true;
  }
  
  return false;
};

export const getJointLoadSummary = (
  exerciseId: string
): { joint: JointArea; level: JointStressLevel; description: string }[] => {
  const context = getExerciseInjuryContext(exerciseId);
  if (!context) return [];
  
  return context.jointLoads.map(load => ({
    joint: load.joint,
    level: load.stressLevel,
    description: load.neutralDescription,
  }));
};

export const getFatigueIndicators = (exerciseId: string): string[] => {
  const context = getExerciseInjuryContext(exerciseId);
  return context?.fatigueIndicators || [];
};

export const getOveruseWarnings = (exerciseId: string): string[] => {
  const context = getExerciseInjuryContext(exerciseId);
  return context?.overuseWarnings || [];
};

export const getModificationCues = (exerciseId: string): string[] => {
  const context = getExerciseInjuryContext(exerciseId);
  return context?.modificationCues || [];
};

export const calculateSessionIntensityRecommendation = (
  painLevel: number,
  fatigueLevel: FatigueLevel,
  daysAway: number
): 'light' | 'moderate' | 'full' => {
  if (painLevel >= 6 || fatigueLevel === 'exhausted' || daysAway >= 14) {
    return 'light';
  }
  
  if (painLevel >= 4 || fatigueLevel === 'tired' || daysAway >= 7) {
    return 'moderate';
  }
  
  return 'full';
};

export const getSessionAdjustmentReason = (
  intensity: 'light' | 'moderate' | 'full',
  painLevel: number,
  fatigueLevel: FatigueLevel,
  daysAway: number
): string => {
  if (intensity === 'light') {
    if (painLevel >= 6) return 'Higher pain levels today — easing in protects progress';
    if (fatigueLevel === 'exhausted') return 'Rest matters. A lighter session still counts.';
    if (daysAway >= 14) return 'Welcome back. Starting gentle helps rebuild momentum.';
    return 'Taking it easy today';
  }
  
  if (intensity === 'moderate') {
    if (painLevel >= 4) return 'Some discomfort noted — moderate intensity feels right';
    if (fatigueLevel === 'tired') return 'Tired but moving — adjusted for how you feel';
    if (daysAway >= 7) return 'Easing back in after time away';
    return 'Balanced session for today';
  }
  
  return 'Ready for a full session';
};
