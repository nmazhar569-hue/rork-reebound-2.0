export type ExerciseDomain =
    | 'gym'
    | 'cardio'
    | 'cross_training'
    | 'sports_performance'
    | 'calisthenics';

export type MovementType =
    | 'compound'
    | 'isolation'
    | 'explosive'
    | 'endurance';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type Equipment =
    | 'Bodyweight'
    | 'Dumbbell'
    | 'Barbell'
    | 'Machine'
    | 'Cable'
    | 'Band'
    | 'Kettlebell'
    | 'Medicine Ball'
    | 'Pull-up Bar'
    | 'Bench'
    | 'Rack'
    | 'Wall'
    | 'Other';

export interface ExerciseGoalGuidance {
    sets: string;
    reps: string;
    rest: string;
    intensity: string;
}

export interface ExerciseAlternative {
    id: string;
    name: string;
    reason: string;
}

export interface Exercise {
    id: string;
    name: string;
    categories: ExerciseDomain[];
    difficulty: Difficulty;
    equipment: Equipment[];
    equipment_required: boolean;
    movement_type: MovementType;
    muscles: {
        primary: string[];
        secondary: string[];
    };
    description: string;
    best_for: string[];
    guidance_by_goal: {
        strength?: ExerciseGoalGuidance;
        hypertrophy?: ExerciseGoalGuidance;
        endurance?: ExerciseGoalGuidance;
    };
    bodyweight_benchmarks?: {
        beginner: string;
        intermediate: string;
        advanced: string;
    };
    form_tips: string[];
    common_mistakes: string[];
    alternatives: ExerciseAlternative[];
    tags: string[];
    // Workout Instance Fields (Optional for Database)
    sets?: number;
    reps?: string;
    rest?: number;
    notes?: string;
    kneeSafeLevel?: 'safe' | 'modified' | 'caution' | 'critical';
    substitution?: string;
    rationale?: string;
    sportRelevance?: Record<string, { role: 'primary' | 'secondary' | 'accessory', purpose: string }>;
    movementPattern?: string; // Legacy field support
}

export interface WorkoutSet {
    id: string;
    type: 'warmup' | 'working' | 'drop';
    reps: number;
    weight: number;
    rpe: number; // 1-10
    completed: boolean;
    restTimeSeconds?: number;
}

export interface WorkoutExercise {
    id: string; // Unique instance ID in the workout
    exerciseId: string; // Reference to Exercise DB
    targetSets: number;
    targetReps: string; // e.g., "8-12"
    sets: WorkoutSet[];
    notes?: string;
    isSkipped?: boolean;
}

export interface WorkoutRoutine {
    id: string;
    name: string;
    scheduledDay: number; // 0=Monday, 6=Sunday
    exercises: WorkoutExercise[];
    estimatedDurationMinutes: number;
    lastPerformed?: string; // ISO Date
}

export interface CompletedWorkout {
    id: string;
    routineId?: string;
    name: string;
    date: string; // ISO Date
    durationSeconds: number;
    totalVolumeLbs: number;
    averageRpe: number;
    exercises: {
        exerciseId: string;
        sets: WorkoutSet[];
    }[];
    feedback?: {
        rpe: number; // User rating of difficulty
        notes: string;
        issues?: string[];
    };
}
