import {
  Exercise,
  InjuryProfile,
  KneeInjuryType,
  RecoveryExercise,
  RecoveryCategory,
  MuscleGroup
} from '@/types';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';
import { RECOVERY_LIBRARY, getSafeExercisesForInjury } from '@/constants/recovery_seed';

const INJURY_CONTRAINDICATIONS: Record<KneeInjuryType, string[]> = {
  'ACL_REHAB': ['impact', 'lateral_pivot', 'deep_flexion', 'plyometric', 'cutting'],
  'PATELLAR_TENDONITIS': ['impact', 'jumping', 'deep_squatting', 'high_load_knee_extension'],
  'MENISCUS_TEAR': ['deep_flexion', 'rotational_load', 'impact', 'twisting'],
  'RUNNERS_KNEE': ['impact', 'downhill', 'excessive_knee_flexion', 'stairs'],
  'GENERAL_PAIN': ['impact', 'high_load'],
  'POST_SURGERY': ['impact', 'high_load', 'deep_flexion', 'lateral_movement', 'plyometric'],
};

const EXERCISE_RISK_TAGS: Record<string, string[]> = {
  'jump_squats': ['impact', 'plyometric', 'deep_flexion'],
  'box_jumps': ['impact', 'plyometric'],
  'burpees': ['impact', 'deep_flexion'],
  'walking_lunges': ['deep_flexion', 'balance_demand'],
  'bulgarian_split_squat': ['deep_flexion', 'balance_demand'],
  'squat_barbell': ['deep_flexion', 'high_load'],
  'squat_front': ['deep_flexion', 'high_load'],
  'shuttle_run': ['lateral_pivot', 'cutting'],
  'interval_sprints': ['impact', 'high_velocity'],
  'jump_rope': ['impact', 'repetitive'],
};

const SAFE_ALTERNATIVES: Record<string, string[]> = {
  'jump_squats': ['spanish-squat', 'squat_goblet', 'step-ups'],
  'box_jumps': ['step-ups', 'glute-bridge', 'hip-thrusts'],
  'burpees': ['dead_bug', 'plank', 'glute-bridge-warmup'],
  'walking_lunges': ['reverse_lunges', 'step-ups', 'glute-bridge'],
  'bulgarian_split_squat': ['reverse_lunges', 'step-downs', 'slr-quad'],
  'squat_barbell': ['squat_goblet', 'spanish-squat', 'hip-thrusts'],
  'squat_front': ['squat_goblet', 'tke', 'step-downs'],
  'shuttle_run': ['incline_walks', 'assault-bike', 'band-walks'],
  'interval_sprints': ['incline_walks', 'assault-bike', 'easy-run'],
  'jump_rope': ['incline_walks', 'battle-ropes', 'assault-bike'],
  'hamstring_curl': ['rdl', 'glute-bridge', 'good-mornings'],
  'deep-squat-hold': ['hip-cars', '90-90-stretch', 'ankle-dorsiflexion-drill'],
};

export interface AlternativeResult {
  original: Exercise | null;
  alternatives: (Exercise | RecoveryExercise)[];
  reason: string;
  safetyScore: number;
}

export interface RoutineResult {
  exercises: RecoveryExercise[];
  totalDuration: number;
  focus: string;
  instructions: string;
}

export const PhysioLogic = {
  getSafeAlternatives(exerciseId: string, injury: InjuryProfile): AlternativeResult {
    console.log('[PhysioLogic] Getting safe alternatives for:', exerciseId, 'with injury:', injury.type);

    const originalExercise = MASTER_EXERCISE_DATABASE.find(ex => ex.id === exerciseId);

    if (!injury.active) {
      console.log('[PhysioLogic] Injury not active, returning original exercise');
      return {
        original: originalExercise || null,
        alternatives: [],
        reason: 'No active injury - exercise is safe to perform',
        safetyScore: 100,
      };
    }

    const exerciseRisks = EXERCISE_RISK_TAGS[exerciseId] || [];
    const injuryContraindications = INJURY_CONTRAINDICATIONS[injury.type] || [];

    const conflictingRisks = exerciseRisks.filter(risk =>
      injuryContraindications.includes(risk)
    );

    if (conflictingRisks.length === 0 && injury.painLevel <= 3) {
      console.log('[PhysioLogic] No conflicts found, exercise is safe');
      return {
        original: originalExercise || null,
        alternatives: [],
        reason: 'Exercise is compatible with your current condition',
        safetyScore: 85,
      };
    }

    const alternativeIds = SAFE_ALTERNATIVES[exerciseId] || [];
    const alternatives: (Exercise | RecoveryExercise)[] = [];

    for (const altId of alternativeIds) {
      const mainDbExercise = MASTER_EXERCISE_DATABASE.find(ex => ex.id === altId);
      if (mainDbExercise) {
        alternatives.push(mainDbExercise);
        continue;
      }

      const recoveryExercise = RECOVERY_LIBRARY.find(ex => ex.id === altId);
      if (recoveryExercise) {
        alternatives.push(recoveryExercise);
      }
    }

    if (injury.painLevel >= 6) {
      const rehabExercises = getSafeExercisesForInjury(injury.type);
      const gentleAlternatives = rehabExercises.filter(ex =>
        ex.impactLevel === 'NONE' && ex.tags.includes('isometric')
      );
      alternatives.push(...gentleAlternatives.slice(0, 2));
    }

    const safetyScore = calculateSafetyScore(exerciseId, injury, conflictingRisks);
    const reason = generateReason(injury, conflictingRisks, exerciseId);

    console.log('[PhysioLogic] Found', alternatives.length, 'alternatives with safety score:', safetyScore);

    return {
      original: originalExercise || null,
      alternatives,
      reason,
      safetyScore,
    };
  },

  getRoutine(type: 'WARMUP' | 'COOLDOWN' | 'MOBILITY', focus: string, injury?: InjuryProfile): RoutineResult {
    console.log('[PhysioLogic] Building routine:', type, 'with focus:', focus);

    let exercises = RECOVERY_LIBRARY.filter(ex => ex.category === type);

    const focusMuscleGroups = getFocusMuscleGroups(focus);
    if (focusMuscleGroups.length > 0) {
      exercises = exercises.filter(ex =>
        focusMuscleGroups.includes(ex.muscleGroup as MuscleGroup) ||
        ex.muscleGroup === 'full_body' ||
        ex.muscleGroup === 'lower_body' ||
        ex.muscleGroup === 'upper_body'
      );
    }

    if (injury?.active) {
      exercises = exercises.filter(ex => {
        const hasContraindication = injury.contraindications.some(contra =>
          ex.contraindications.includes(contra)
        );
        return !hasContraindication;
      });

      if (injury.painLevel >= 5) {
        exercises = exercises.filter(ex => ex.impactLevel === 'NONE');
      }
    }

    const selectedExercises = selectRoutineExercises(exercises, type);
    const totalDuration = selectedExercises.reduce((sum, ex) => {
      const sets = ex.sets || 1;
      return sum + (ex.duration * sets);
    }, 0);

    const instructions = generateRoutineInstructions(type, focus, injury);

    console.log('[PhysioLogic] Routine built with', selectedExercises.length, 'exercises, duration:', totalDuration, 'seconds');

    return {
      exercises: selectedExercises,
      totalDuration,
      focus,
      instructions,
    };
  },

  getRehabProtocol(injury: InjuryProfile): RoutineResult {
    console.log('[PhysioLogic] Building rehab protocol for:', injury.type);

    let exercises = getSafeExercisesForInjury(injury.type);

    if (injury.painLevel >= 7) {
      exercises = exercises.filter(ex =>
        ex.impactLevel === 'NONE' &&
        (ex.tags.includes('isometric') || ex.tags.includes('gentle'))
      );
    } else if (injury.painLevel >= 4) {
      exercises = exercises.filter(ex => ex.impactLevel !== 'HIGH');
    }

    const selectedExercises = exercises.slice(0, 6);
    const totalDuration = selectedExercises.reduce((sum, ex) => {
      const sets = ex.sets || 1;
      return sum + (ex.duration * sets);
    }, 0);

    const instructions = generateRehabInstructions(injury);

    return {
      exercises: selectedExercises,
      totalDuration,
      focus: `${injury.type} Rehabilitation`,
      instructions,
    };
  },

  assessExerciseSafety(exerciseId: string, injury: InjuryProfile): {
    isSafe: boolean;
    riskLevel: 'low' | 'moderate' | 'high';
    warnings: string[];
    modifications: string[];
  } {
    const exerciseRisks = EXERCISE_RISK_TAGS[exerciseId] || [];
    const injuryContraindications = INJURY_CONTRAINDICATIONS[injury.type] || [];

    const conflicts = exerciseRisks.filter(risk =>
      injuryContraindications.includes(risk)
    );

    const warnings: string[] = [];
    const modifications: string[] = [];

    if (conflicts.includes('deep_flexion')) {
      warnings.push('This exercise involves deep knee bend which may aggravate your condition');
      modifications.push('Limit range of motion to 90 degrees or less');
    }

    if (conflicts.includes('impact')) {
      warnings.push('High impact forces may stress your knee joint');
      modifications.push('Consider a low-impact alternative');
    }

    if (conflicts.includes('lateral_pivot')) {
      warnings.push('Pivoting movements can stress knee ligaments');
      modifications.push('Keep feet planted, avoid twisting');
    }

    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (conflicts.length >= 2 || injury.painLevel >= 6) {
      riskLevel = 'high';
    } else if (conflicts.length === 1 || injury.painLevel >= 4) {
      riskLevel = 'moderate';
    }

    const isSafe = riskLevel === 'low' && injury.painLevel <= 3;

    return {
      isSafe,
      riskLevel,
      warnings,
      modifications,
    };
  },

  getLegDayWarmup(injury?: InjuryProfile): RoutineResult {
    return this.getRoutine('WARMUP', 'Legs', injury);
  },

  getUpperBodyWarmup(injury?: InjuryProfile): RoutineResult {
    return this.getRoutine('WARMUP', 'Upper', injury);
  },

  getPostWorkoutCooldown(focus: string, injury?: InjuryProfile): RoutineResult {
    return this.getRoutine('COOLDOWN', focus, injury);
  },
};

function calculateSafetyScore(
  exerciseId: string,
  injury: InjuryProfile,
  conflicts: string[]
): number {
  let score = 100;

  score -= conflicts.length * 15;
  score -= injury.painLevel * 5;

  if (injury.type === 'POST_SURGERY') {
    score -= 20;
  }

  if (conflicts.includes('impact')) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function generateReason(
  injury: InjuryProfile,
  conflicts: string[],
  exerciseId: string
): string {
  if (conflicts.length === 0) {
    return `With ${injury.type.replace(/_/g, ' ').toLowerCase()}, this exercise requires caution at pain level ${injury.painLevel}/10.`;
  }

  const riskDescriptions: Record<string, string> = {
    'impact': 'high impact forces',
    'deep_flexion': 'deep knee bending',
    'lateral_pivot': 'pivoting movements',
    'plyometric': 'explosive jumping',
    'cutting': 'quick direction changes',
    'twisting': 'rotational stress on the knee',
  };

  const riskNames = conflicts.map(c => riskDescriptions[c] || c).join(' and ');

  return `This exercise involves ${riskNames}, which may aggravate ${injury.type.replace(/_/g, ' ').toLowerCase()}. Consider the alternatives below.`;
}

function getFocusMuscleGroups(focus: string): MuscleGroup[] {
  const focusMap: Record<string, MuscleGroup[]> = {
    'Legs': ['quadriceps', 'hamstrings', 'glutes', 'calves', 'hip_flexors', 'adductors'],
    'Lower': ['quadriceps', 'hamstrings', 'glutes', 'calves', 'hip_flexors', 'adductors'],
    'Upper': ['chest', 'upper_back', 'lats', 'front_delts', 'side_delts', 'rear_delts', 'biceps', 'triceps'],
    'Back': ['upper_back', 'lats', 'lower_back', 'rear_delts'],
    'Chest': ['chest', 'front_delts', 'triceps'],
    'Core': ['core', 'obliques', 'lower_back'],
    'Full Body': [],
  };

  return focusMap[focus] || [];
}

function selectRoutineExercises(
  exercises: RecoveryExercise[],
  type: RecoveryCategory
): RecoveryExercise[] {
  const targetCounts: Record<string, number> = {
    'WARMUP': 5,
    'COOLDOWN': 4,
    'MOBILITY': 4,
    'REHAB': 6,
  };

  const target = targetCounts[type] || 4;

  const muscleGroups = new Set<string>();
  const selected: RecoveryExercise[] = [];

  for (const exercise of exercises) {
    if (selected.length >= target) break;

    if (!muscleGroups.has(exercise.muscleGroup)) {
      selected.push(exercise);
      muscleGroups.add(exercise.muscleGroup);
    }
  }

  for (const exercise of exercises) {
    if (selected.length >= target) break;
    if (!selected.includes(exercise)) {
      selected.push(exercise);
    }
  }

  return selected;
}

function generateRoutineInstructions(
  type: RecoveryCategory,
  focus: string,
  injury?: InjuryProfile
): string {
  const baseInstructions: Record<string, string> = {
    'WARMUP': `Complete this ${focus} warmup before your workout. Move through each exercise with control, gradually increasing range of motion.`,
    'COOLDOWN': `Perform this cooldown after your ${focus} workout. Hold each stretch for the prescribed time, breathing deeply.`,
    'MOBILITY': `This mobility routine targets ${focus}. Move slowly and mindfully, never forcing range of motion.`,
    'REHAB': `Rehabilitation protocol. Focus on quality over quantity. Stop if you experience sharp pain.`,
  };

  let instructions = baseInstructions[type] || '';

  if (injury?.active) {
    instructions += ` Given your ${injury.type.replace(/_/g, ' ').toLowerCase()}, pay attention to any discomfort and modify as needed.`;
  }

  return instructions;
}

function generateRehabInstructions(injury: InjuryProfile): string {
  const phaseInstructions: Record<string, string> = {
    'ACL_REHAB': 'Focus on VMO activation and controlled knee extension. Avoid any pivoting or lateral movements.',
    'PATELLAR_TENDONITIS': 'Emphasize isometric holds and eccentric loading. Avoid jumping and deep squatting.',
    'MENISCUS_TEAR': 'Limit knee flexion to comfortable range. Avoid rotational stress on the knee.',
    'RUNNERS_KNEE': 'Strengthen hip abductors and improve quad control. Reduce impact activities.',
    'GENERAL_PAIN': 'Listen to your body. Focus on gentle, controlled movements.',
    'POST_SURGERY': 'Follow your physical therapist\'s guidance. Progress gradually and avoid high-impact activities.',
  };

  let instructions = phaseInstructions[injury.type] || phaseInstructions['GENERAL_PAIN'];

  if (injury.painLevel >= 6) {
    instructions += ' Current pain level is elevated - focus on gentle exercises only.';
  }

  return instructions;
}

export default PhysioLogic;
