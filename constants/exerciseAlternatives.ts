import { ExerciseAlternative, SessionIntensity, SessionAdjustment } from '@/types';

export const EXERCISE_ALTERNATIVES: Record<string, ExerciseAlternative[]> = {
  'squat-back': [
    { exerciseId: 'squat-goblet', type: 'regression', reason: 'Lower load, easier on knees' },
    { exerciseId: 'squat-front', type: 'lateral', reason: 'More quad-dominant variation' },
    { exerciseId: 'bulgarian-split-squat', type: 'progression', reason: 'Higher single-leg demand' },
  ],
  'squat-front': [
    { exerciseId: 'squat-goblet', type: 'regression', reason: 'Lighter load, form-focused' },
    { exerciseId: 'squat-back', type: 'lateral', reason: 'More posterior chain emphasis' },
  ],
  'squat-goblet': [
    { exerciseId: 'squat-front', type: 'progression', reason: 'Higher load capacity' },
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'No standing knee load' },
  ],
  'rdl': [
    { exerciseId: 'good-mornings', type: 'lateral', reason: 'Similar hip hinge pattern' },
    { exerciseId: 'deadlift-conventional', type: 'progression', reason: 'Full range deadlift' },
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'Floor-based hip extension' },
  ],
  'deadlift-conventional': [
    { exerciseId: 'deadlift-trap-bar', type: 'lateral', reason: 'More neutral spine position' },
    { exerciseId: 'rdl', type: 'regression', reason: 'Less total body demand' },
  ],
  'deadlift-trap-bar': [
    { exerciseId: 'rdl', type: 'regression', reason: 'Simpler hip hinge' },
    { exerciseId: 'deadlift-conventional', type: 'lateral', reason: 'Traditional deadlift pattern' },
  ],
  'bulgarian-split-squat': [
    { exerciseId: 'reverse-lunges', type: 'regression', reason: 'More stable, less balance demand' },
    { exerciseId: 'step-ups', type: 'lateral', reason: 'Similar single-leg pattern' },
    { exerciseId: 'walking-lunges', type: 'progression', reason: 'Dynamic movement' },
  ],
  'step-ups': [
    { exerciseId: 'reverse-lunges', type: 'lateral', reason: 'Similar single-leg demand' },
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'No step height stress' },
    { exerciseId: 'bulgarian-split-squat', type: 'progression', reason: 'Higher stability demand' },
  ],
  'walking-lunges': [
    { exerciseId: 'reverse-lunges', type: 'regression', reason: 'Stationary, more control' },
    { exerciseId: 'bulgarian-split-squat', type: 'lateral', reason: 'Static single-leg work' },
  ],
  'reverse-lunges': [
    { exerciseId: 'step-ups', type: 'lateral', reason: 'Different single-leg emphasis' },
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'Floor-based, no lunge stress' },
    { exerciseId: 'walking-lunges', type: 'progression', reason: 'Dynamic movement pattern' },
  ],
  'hip-thrusts': [
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'Bodyweight, lower intensity' },
    { exerciseId: 'rdl', type: 'lateral', reason: 'Standing hip extension' },
  ],
  'glute-bridge': [
    { exerciseId: 'hip-thrusts', type: 'progression', reason: 'Greater range, more load' },
  ],
  'hamstring-curl': [
    { exerciseId: 'rdl', type: 'lateral', reason: 'Compound hamstring work' },
    { exerciseId: 'glute-bridge', type: 'regression', reason: 'Less direct hamstring tension' },
  ],
  'bench-press': [
    { exerciseId: 'push-ups', type: 'regression', reason: 'Bodyweight, easier to scale' },
    { exerciseId: 'incline-bench-press', type: 'lateral', reason: 'Upper chest emphasis' },
    { exerciseId: 'dips', type: 'progression', reason: 'Bodyweight compound pressing' },
  ],
  'incline-bench-press': [
    { exerciseId: 'push-ups', type: 'regression', reason: 'Bodyweight alternative' },
    { exerciseId: 'bench-press', type: 'lateral', reason: 'Flat pressing variation' },
  ],
  'push-ups': [
    { exerciseId: 'bench-press', type: 'progression', reason: 'Loadable pressing' },
    { exerciseId: 'dips', type: 'progression', reason: 'Higher demand pressing' },
  ],
  'dips': [
    { exerciseId: 'push-ups', type: 'regression', reason: 'Lower intensity pushing' },
    { exerciseId: 'bench-press', type: 'lateral', reason: 'Horizontal pressing' },
  ],
  'overhead-press': [
    { exerciseId: 'landmine-press', type: 'regression', reason: 'Angled, shoulder-friendly' },
    { exerciseId: 'push-ups', type: 'regression', reason: 'Horizontal pushing alternative' },
  ],
  'landmine-press': [
    { exerciseId: 'overhead-press', type: 'progression', reason: 'Full vertical pressing' },
    { exerciseId: 'push-ups', type: 'regression', reason: 'Simpler pushing pattern' },
  ],
  'pull-ups': [
    { exerciseId: 'lat-pulldowns', type: 'regression', reason: 'Adjustable load' },
    { exerciseId: 'chin-ups', type: 'lateral', reason: 'Supinated grip variation' },
    { exerciseId: 'towel-pull-ups', type: 'progression', reason: 'Grip-intensive variation' },
  ],
  'chin-ups': [
    { exerciseId: 'lat-pulldowns', type: 'regression', reason: 'Scalable load' },
    { exerciseId: 'pull-ups', type: 'lateral', reason: 'Pronated grip variation' },
  ],
  'barbell-rows': [
    { exerciseId: 'dumbbell-rows', type: 'lateral', reason: 'Unilateral alternative' },
    { exerciseId: 'lat-pulldowns', type: 'regression', reason: 'Seated, less back demand' },
  ],
  'dumbbell-rows': [
    { exerciseId: 'barbell-rows', type: 'lateral', reason: 'Bilateral rowing' },
    { exerciseId: 'lat-pulldowns', type: 'regression', reason: 'Machine-based pulling' },
  ],
  'lat-pulldowns': [
    { exerciseId: 'pull-ups', type: 'progression', reason: 'Bodyweight vertical pull' },
    { exerciseId: 'dumbbell-rows', type: 'lateral', reason: 'Horizontal pulling' },
  ],
  'planks': [
    { exerciseId: 'dead-bugs', type: 'lateral', reason: 'Dynamic core stability' },
    { exerciseId: 'side-planks', type: 'lateral', reason: 'Lateral core focus' },
  ],
  'side-planks': [
    { exerciseId: 'planks', type: 'lateral', reason: 'Frontal core stability' },
    { exerciseId: 'pallof-press', type: 'progression', reason: 'Anti-rotation challenge' },
  ],
  'dead-bugs': [
    { exerciseId: 'planks', type: 'regression', reason: 'Static core hold' },
    { exerciseId: 'hanging-knee-raises', type: 'progression', reason: 'Hanging core work' },
  ],
  'kettlebell-swings': [
    { exerciseId: 'hip-thrusts', type: 'regression', reason: 'Floor-based hip extension' },
    { exerciseId: 'medicine-ball-slams', type: 'lateral', reason: 'Different explosive pattern' },
  ],
  'box-jumps': [
    { exerciseId: 'step-ups', type: 'regression', reason: 'No impact landing' },
    { exerciseId: 'broad-jumps', type: 'lateral', reason: 'Horizontal jumping' },
    { exerciseId: 'jump-squats', type: 'lateral', reason: 'No box needed' },
  ],
  'jump-squats': [
    { exerciseId: 'squat-goblet', type: 'regression', reason: 'No jump impact' },
    { exerciseId: 'box-jumps', type: 'lateral', reason: 'Targeted landing' },
  ],
  'broad-jumps': [
    { exerciseId: 'step-ups', type: 'regression', reason: 'No jump impact' },
    { exerciseId: 'box-jumps', type: 'lateral', reason: 'Vertical jumping' },
  ],
  'easy-run': [
    { exerciseId: 'incline-walks', type: 'regression', reason: 'No running impact' },
    { exerciseId: 'tempo-run', type: 'progression', reason: 'Higher intensity running' },
  ],
  'tempo-run': [
    { exerciseId: 'easy-run', type: 'regression', reason: 'Lower intensity' },
    { exerciseId: 'interval-sprints', type: 'progression', reason: 'Speed work' },
  ],
  'interval-sprints': [
    { exerciseId: 'tempo-run', type: 'regression', reason: 'Sustained effort' },
    { exerciseId: 'hill-sprints', type: 'lateral', reason: 'Incline sprinting' },
  ],
  'hill-sprints': [
    { exerciseId: 'incline-walks', type: 'regression', reason: 'No sprint intensity' },
    { exerciseId: 'interval-sprints', type: 'lateral', reason: 'Flat sprinting' },
  ],
  'long-run': [
    { exerciseId: 'easy-run', type: 'regression', reason: 'Shorter duration' },
  ],
  'burpees': [
    { exerciseId: 'push-ups', type: 'regression', reason: 'No jump or squat component' },
    { exerciseId: 'jump-squats', type: 'lateral', reason: 'Jump-focused conditioning' },
  ],
  'assault-bike': [
    { exerciseId: 'incline-walks', type: 'regression', reason: 'Lower intensity cardio' },
    { exerciseId: 'battle-ropes', type: 'lateral', reason: 'Upper body cardio' },
  ],
  'sled-push': [
    { exerciseId: 'incline-walks', type: 'regression', reason: 'No resistance' },
    { exerciseId: 'sled-pull', type: 'lateral', reason: 'Pulling variation' },
  ],
  'sled-pull': [
    { exerciseId: 'dumbbell-rows', type: 'regression', reason: 'Static pulling' },
    { exerciseId: 'sled-push', type: 'lateral', reason: 'Pushing variation' },
  ],
};

export const SESSION_ADJUSTMENTS: Record<SessionIntensity, SessionAdjustment> = {
  light: {
    intensity: 'light',
    volumeMultiplier: 0.6,
    restMultiplier: 1.5,
    skipCautionExercises: true,
    reason: 'Reduced volume and load for recovery or low-energy days',
  },
  moderate: {
    intensity: 'moderate',
    volumeMultiplier: 0.8,
    restMultiplier: 1.2,
    skipCautionExercises: false,
    reason: 'Slightly reduced intensity while maintaining movement quality',
  },
  full: {
    intensity: 'full',
    volumeMultiplier: 1.0,
    restMultiplier: 1.0,
    skipCautionExercises: false,
    reason: 'Full session as programmed',
  },
};

export const SESSION_SWAP_SUGGESTIONS: Record<string, string[]> = {
  push: ['pull', 'full_body', 'recovery'],
  pull: ['push', 'full_body', 'recovery'],
  legs: ['recovery', 'full_body', 'mobility_joint_care'],
  full_body: ['push', 'pull', 'recovery'],
  recovery: ['mobility_joint_care', 'mobility_tissue_care'],
  explosive_strength: ['control_endurance', 'upper_pull_grip', 'mobility_joint_care'],
  upper_pull_grip: ['explosive_strength', 'control_endurance', 'mobility_joint_care'],
  control_endurance: ['upper_pull_grip', 'explosive_strength', 'mobility_joint_care'],
  fight_conditioning: ['mobility_joint_care', 'upper_pull_grip'],
  mobility_joint_care: ['recovery', 'mobility_tissue_care'],
  easy_run: ['strength_for_runners', 'mobility_tissue_care'],
  speed_intervals: ['easy_run', 'strength_for_runners', 'mobility_tissue_care'],
  long_run: ['easy_run', 'mobility_tissue_care'],
  strength_for_runners: ['easy_run', 'mobility_tissue_care'],
  mobility_tissue_care: ['easy_run', 'recovery'],
};

export const getExerciseAlternatives = (exerciseId: string): ExerciseAlternative[] => {
  return EXERCISE_ALTERNATIVES[exerciseId] || [];
};

export const getSessionSwapOptions = (currentSessionType: string): string[] => {
  return SESSION_SWAP_SUGGESTIONS[currentSessionType] || ['recovery'];
};

export const applyAdjustmentToExercise = (
  exercise: { sets: number; rest: number; kneeSafeLevel: string },
  adjustment: SessionAdjustment
): { sets: number; rest: number } | null => {
  if (adjustment.skipCautionExercises && exercise.kneeSafeLevel === 'caution') {
    return null;
  }
  
  return {
    sets: Math.max(1, Math.round(exercise.sets * adjustment.volumeMultiplier)),
    rest: Math.round(exercise.rest * adjustment.restMultiplier),
  };
};
