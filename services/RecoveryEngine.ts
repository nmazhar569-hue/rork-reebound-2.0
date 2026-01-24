/**
 * Recovery Engine Service
 * 
 * Intelligent recovery prescription based on previous workout data.
 * Maps exercises to primary movers and generates targeted recovery protocols.
 */

import { WorkoutSession, ExerciseLog } from '@/types';

// Body part mapping for exercises
const EXERCISE_MUSCLE_MAP: Record<string, string[]> = {
    // Lower body
    'squat': ['quads', 'glutes', 'core'],
    'deadlift': ['hamstrings', 'glutes', 'lower_back', 'core'],
    'leg press': ['quads', 'glutes'],
    'lunges': ['quads', 'glutes', 'balance'],
    'leg curl': ['hamstrings'],
    'leg extension': ['quads'],
    'calf raise': ['calves'],
    'hip thrust': ['glutes', 'hamstrings'],
    'romanian deadlift': ['hamstrings', 'glutes', 'lower_back'],

    // Upper body push
    'bench press': ['chest', 'triceps', 'shoulders'],
    'overhead press': ['shoulders', 'triceps', 'core'],
    'incline press': ['upper_chest', 'shoulders', 'triceps'],
    'push up': ['chest', 'triceps', 'core'],
    'dips': ['triceps', 'chest', 'shoulders'],
    'tricep extension': ['triceps'],

    // Upper body pull
    'pull up': ['lats', 'biceps', 'upper_back'],
    'row': ['upper_back', 'lats', 'biceps'],
    'lat pulldown': ['lats', 'biceps'],
    'face pull': ['rear_delts', 'upper_back'],
    'bicep curl': ['biceps'],
    'barbell row': ['upper_back', 'lats', 'biceps'],

    // Core
    'plank': ['core', 'shoulders'],
    'crunch': ['core'],
    'russian twist': ['obliques', 'core'],
    'dead bug': ['core', 'hip_flexors'],
};

// Recovery protocols by body part
const RECOVERY_PROTOCOLS: Record<string, RecoveryProtocol> = {
    quads: {
        title: 'Quad Relief',
        duration: 8,
        exercises: [
            { name: 'Foam Roll Quads', duration: 60, description: 'Slow passes from hip to knee' },
            { name: 'Couch Stretch', duration: 45, description: 'Deep hip flexor and quad stretch' },
            { name: 'Quad Smash', duration: 60, description: 'Release tension on the patella tendon' },
        ],
        insight: 'Your quads worked hard. This releases built-up lactic acid and loosens the patella tendon.',
    },
    glutes: {
        title: 'Glute Activation Reset',
        duration: 6,
        exercises: [
            { name: 'Pigeon Pose', duration: 60, description: 'Deep external rotator stretch' },
            { name: 'Figure-4 Stretch', duration: 45, description: 'Seated glute stretch' },
            { name: 'Glute Foam Roll', duration: 60, description: 'Target the piriformis' },
        ],
        insight: 'Tight glutes can pull on your lower back. These movements restore hip mobility.',
    },
    hamstrings: {
        title: 'Hamstring Flush',
        duration: 7,
        exercises: [
            { name: 'Standing Forward Fold', duration: 45, description: 'Gentle hamstring lengthening' },
            { name: 'Foam Roll Hamstrings', duration: 60, description: 'Sit-bone to knee' },
            { name: 'Active Straight Leg Raise', duration: 60, description: 'Neural flossing' },
        ],
        insight: 'Hamstrings connect to your lower back. Releasing them prevents compensatory pain.',
    },
    chest: {
        title: 'Chest & Shoulder Reset',
        duration: 5,
        exercises: [
            { name: 'Doorway Stretch', duration: 45, description: 'Open up the pecs' },
            { name: 'Chest Foam Roll', duration: 45, description: 'Use a lacrosse ball on the chest wall' },
            { name: 'Thread the Needle', duration: 60, description: 'Thoracic rotation' },
        ],
        insight: 'Tight chest pulls shoulders forward. This restores posture and prevents impingement.',
    },
    lats: {
        title: 'Lat & Upper Back Release',
        duration: 6,
        exercises: [
            { name: 'Child\'s Pose with Reach', duration: 60, description: 'Extended lat stretch' },
            { name: 'Foam Roll Lats', duration: 60, description: 'Side-lying on the roller' },
            { name: 'Cat-Cow', duration: 45, description: 'Spinal mobility' },
        ],
        insight: 'Your lats worked to pull weight. This restores overhead mobility.',
    },
    lower_back: {
        title: 'Lower Back De-Compression',
        duration: 8,
        exercises: [
            { name: 'Knee-to-Chest', duration: 45, description: 'Gentle lumbar stretch' },
            { name: 'Supine Twist', duration: 60, description: 'Rotational release' },
            { name: 'Dead Hang', duration: 30, description: 'Spinal decompression if available' },
            { name: 'Hip 90/90', duration: 60, description: 'Hip mobility for back relief' },
        ],
        insight: 'Your spine was loaded. Decompression prevents disc issues and restores hydration.',
    },
    shoulders: {
        title: 'Shoulder Mobility Flow',
        duration: 6,
        exercises: [
            { name: 'Shoulder Circles', duration: 30, description: 'Full range of motion' },
            { name: 'Wall Slides', duration: 45, description: 'Scapular activation' },
            { name: 'Cross-Body Stretch', duration: 45, description: 'Posterior shoulder' },
        ],
        insight: 'Healthy shoulders need balanced mobility. This prevents rotator cuff strain.',
    },
    core: {
        title: 'Core & Breath Reset',
        duration: 5,
        exercises: [
            { name: 'Diaphragmatic Breathing', duration: 60, description: '4-7-8 pattern' },
            { name: 'Dead Bug Hold', duration: 45, description: 'Anti-extension activation' },
            { name: 'Prone Cobra', duration: 30, description: 'Extension balance' },
        ],
        insight: 'Your core stabilized heavy loads. Breath work restores parasympathetic balance.',
    },
};

// Pain modification protocols
const PAIN_MODIFICATIONS: Record<string, PainProtocol> = {
    knee: {
        title: 'Knee De-Load Protocol',
        warning: 'Knee pain detected. Modifying next session.',
        modifications: [
            'Replace Squats with Box Squats (reduced depth)',
            'Reduce Leg Extension weight by 30%',
            'Add Terminal Knee Extensions as warm-up',
            'Foam roll IT band before session',
        ],
        recoveryFocus: ['quads', 'glutes'],
    },
    lower_back: {
        title: 'Lower Back Protection',
        warning: 'Lower back discomfort reported. Adjusting deadlift pattern.',
        modifications: [
            'Replace Conventional Deadlift with Trap Bar',
            'Add Bird-Dogs to warm-up',
            'Reduce hip hinge volume by 25%',
            'Focus on core bracing technique',
        ],
        recoveryFocus: ['lower_back', 'hamstrings', 'glutes'],
    },
    shoulder: {
        title: 'Shoulder Care Protocol',
        warning: 'Shoulder strain noted. Protecting the joint.',
        modifications: [
            'Replace Barbell Overhead Press with Dumbbells',
            'Lower bench angle on incline work',
            'Add band pull-aparts between sets',
            'Skip behind-neck movements',
        ],
        recoveryFocus: ['shoulders', 'chest'],
    },
};

interface RecoveryExercise {
    name: string;
    duration: number;
    description: string;
}

interface RecoveryProtocol {
    title: string;
    duration: number;
    exercises: RecoveryExercise[];
    insight: string;
}

interface PainProtocol {
    title: string;
    warning: string;
    modifications: string[];
    recoveryFocus: string[];
}

export interface RecoverySuggestion {
    title: string;
    subtitle: string;
    duration: number;
    protocols: RecoveryProtocol[];
    insight: string;
    priority: 'high' | 'medium' | 'low';
}

export interface PainModification {
    area: string;
    protocol: PainProtocol;
}

/**
 * Analyze a workout session and return targeted recovery suggestions
 */
export function getRecoverySuggestion(lastWorkout: WorkoutSession | null): RecoverySuggestion | null {
    if (!lastWorkout || lastWorkout.exercises.length === 0) {
        return null;
    }

    // Extract all muscle groups worked
    const workedMuscles = new Map<string, number>();

    lastWorkout.exercises.forEach((exercise) => {
        const exerciseName = exercise.exerciseName.toLowerCase();

        // Find matching exercise in our map
        for (const [key, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
            if (exerciseName.includes(key)) {
                muscles.forEach((muscle) => {
                    const count = workedMuscles.get(muscle) || 0;
                    workedMuscles.set(muscle, count + exercise.sets.length);
                });
                break;
            }
        }
    });

    if (workedMuscles.size === 0) {
        return null;
    }

    // Sort by most worked
    const sortedMuscles = Array.from(workedMuscles.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Top 3 worked areas

    // Build recovery protocols
    const protocols: RecoveryProtocol[] = [];
    let totalDuration = 0;

    sortedMuscles.forEach(([muscle]) => {
        const protocol = RECOVERY_PROTOCOLS[muscle];
        if (protocol && !protocols.find(p => p.title === protocol.title)) {
            protocols.push(protocol);
            totalDuration += protocol.duration;
        }
    });

    if (protocols.length === 0) {
        return null;
    }

    // Determine workout type for title
    const workoutType = determineWorkoutType(sortedMuscles.map(m => m[0]));
    const wasIntense = (lastWorkout.perceivedStrain || 0) >= 7;

    return {
        title: `Post-${workoutType} Repair`,
        subtitle: wasIntense ? 'High intensity detected. Recovery is essential.' : 'Targeted recovery for optimal adaptation.',
        duration: totalDuration,
        protocols,
        insight: protocols[0]?.insight || '',
        priority: wasIntense ? 'high' : 'medium',
    };
}

/**
 * Get pain modification protocol
 */
export function getPainModification(painArea: string): PainModification | null {
    const normalizedArea = painArea.toLowerCase().replace(' ', '_');
    const protocol = PAIN_MODIFICATIONS[normalizedArea];

    if (!protocol) {
        return null;
    }

    return {
        area: painArea,
        protocol,
    };
}

/**
 * Tag body parts as fatigued after a workout
 */
export function tagFatiguedParts(workout: WorkoutSession): string[] {
    const fatigued: string[] = [];

    workout.exercises.forEach((exercise) => {
        const exerciseName = exercise.exerciseName.toLowerCase();

        for (const [key, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
            if (exerciseName.includes(key)) {
                muscles.forEach((muscle) => {
                    if (!fatigued.includes(muscle)) {
                        fatigued.push(muscle);
                    }
                });
                break;
            }
        }
    });

    return fatigued;
}

/**
 * Determine the workout type based on muscle groups
 */
function determineWorkoutType(muscles: string[]): string {
    const lowerBody = ['quads', 'glutes', 'hamstrings', 'calves'];
    const push = ['chest', 'shoulders', 'triceps', 'upper_chest'];
    const pull = ['lats', 'upper_back', 'biceps', 'rear_delts'];

    const lowerCount = muscles.filter(m => lowerBody.includes(m)).length;
    const pushCount = muscles.filter(m => push.includes(m)).length;
    const pullCount = muscles.filter(m => pull.includes(m)).length;

    if (lowerCount > pushCount && lowerCount > pullCount) {
        return 'Leg Day';
    } else if (pushCount > pullCount) {
        return 'Push Day';
    } else if (pullCount > 0) {
        return 'Pull Day';
    } else {
        return 'Workout';
    }
}

export default {
    getRecoverySuggestion,
    getPainModification,
    tagFatiguedParts,
};
