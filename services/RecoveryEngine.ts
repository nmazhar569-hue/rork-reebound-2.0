<<<<<<< HEAD

import {
    RecoveryPlan,
    RecoveryTrigger,
    RecoveryRecommendation,
    RecoveryProtocolType
} from '@/types/recovery';
import { DailySnapshot } from '@/types/intelligence';

// Mock data interfaces for now - to be replaced with real Service calls
interface UserStats {
    sleepAverage: number; // 7-day avg
    energyTrend: number; // Slope of energy over 7 days
    sorenessScore: number; // 3-day avg
    stressScore: number; // 5-day avg
    lastDeloadDate?: Date;
}

class RecoveryEngine {

    // TRIGGER THRESHOLDS
    private readonly SLEEP_THRESHOLD = 7.0; // Hours
    private readonly ENERGY_DECLINE_THRESHOLD = -0.2; // Points per day
    private readonly SORENESS_THRESHOLD = 3.0; // Above this is "lingering"
    private readonly STRESS_THRESHOLD = 7.0; // High stress

    /**
     * Analyzes user data to see if a Recovery Plan is needed.
     * Returns a recommendation if triggered, or null.
     */
    public checkForTriggers(stats: UserStats): RecoveryRecommendation | null {

        // 1. SLEEP DEBT
        if (stats.sleepAverage < (this.SLEEP_THRESHOLD - 0.5)) {
            return {
                type: 'SLEEP_OPTIMIZATION',
                trigger: 'SLEEP_DEBT',
                reason: `Your sleep average (${stats.sleepAverage.toFixed(1)} hrs) is below optimal.`,
                impact: '-2 lbs muscle gain/month projected.',
                expectedResults: ['Sleep +0.7 hrs/night', 'Energy +0.5 pts', 'Strength +5%'],
                durationDays: 7
            };
        }

        // 2. CNS FATIGUE
        if (stats.energyTrend < this.ENERGY_DECLINE_THRESHOLD) {
            return {
                type: 'CNS_RECOVERY',
                trigger: 'CNS_FATIGUE',
                reason: 'Significant daily energy decline detected.',
                impact: 'High risk of overtraining or injury.',
                expectedResults: ['Energy +0.8 pts', 'HRV +5-10%', 'Motivation Restored'],
                durationDays: 7
            };
        }

        // 3. LINGERING SORENESS
        if (stats.sorenessScore > this.SORENESS_THRESHOLD) {
            return {
                type: 'MOBILITY_SORENESS',
                trigger: 'SORENESS',
                reason: 'Muscle soreness is not clearing up as expected.',
                impact: 'Limited range of motion and reduced power.',
                expectedResults: ['Soreness -40%', 'Mobility Improved', 'Pain Reduction'],
                durationDays: 7
            };
        }

        // 4. HIGH STRESS
        if (stats.stressScore > this.STRESS_THRESHOLD) {
            return {
                type: 'STRESS_MANAGEMENT',
                trigger: 'HIGH_STRESS',
                reason: 'High external stress load detected.',
                impact: 'Cortisol levels may blunt muscle growth.',
                expectedResults: ['Stress Control', 'Sleep Quality +', 'Consistency Maintained'],
                durationDays: 14 // Stress plans can be longer (variable)
            };
        }

        return null;
    }

    /**
     * Generates the actual Plan object when a user accepts a recommendation.
     */
    public createPlan(recommendation: RecoveryRecommendation, currentStats: UserStats): RecoveryPlan {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + recommendation.durationDays);

        return {
            id: Math.random().toString(36).substr(2, 9),
            type: recommendation.type,
            trigger: recommendation.trigger,
            startDate: today.toISOString(),
            endDate: endDate.toISOString(),
            status: 'ACTIVE',
            daysCompleted: 0,
            totalDays: recommendation.durationDays,
            currentDay: 1,
            metrics: {
                start: {
                    date: today.toISOString(),
                    energy: currentStats.energyTrend, // Using trend as proxy or should be raw score? 
                    // Ideally we pass raw daily Energy score here, but using stats for now.
                    // TODO: Pass full daily snapshot for accuracy.
                    sleepHours: currentStats.sleepAverage,
                    sorenessScore: currentStats.sorenessScore,
                    stressScore: currentStats.stressScore,
                    compliancePercentage: 0
                },
                current: {
                    date: today.toISOString(),
                    energy: currentStats.energyTrend, // Placeholder
                    sleepHours: currentStats.sleepAverage,
                    sorenessScore: currentStats.sorenessScore,
                    stressScore: currentStats.stressScore,
                    compliancePercentage: 0
                },
                history: []
            }
        };
    }

    /**
     * Returns the daily checklist based on the Plan Type
     */
    public getDailyChecklist(planType: RecoveryProtocolType): string[] {
        switch (planType) {
            case 'SLEEP_OPTIMIZATION':
                return [
                    'Evening stretching routine (15 min)',
                    'Bedtime consistency (±30 min)',
                    'No screens 1 hr before bed',
                    'Room temp 65-68°F',
                    'Morning sunlight (10 min)'
                ];
            case 'CNS_RECOVERY':
                return [
                    'Sleep 7.5+ hours',
                    'Hydration 80+ oz',
                    'Evening stretching (15 min)',
                    'Meditation/Breathwork (10 min)',
                    'No heavy lifting (Deload intensity)'
                ];
            case 'MOBILITY_SORENESS':
                return [
                    'Targeted mobility session (20 min)',
                    'Light walking (10 min)',
                    'Hydration',
                    'Protein compliance'
                ];
            case 'STRESS_MANAGEMENT':
                return [
                    'Box breathing (5 min)',
                    'Guided meditation (10 min)',
                    'Device-free walk (20 min)',
                    'Journaling (5 min)'
                ];
            default:
                return [];
        }
    }
}

export const recoveryEngine = new RecoveryEngine();
=======
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
>>>>>>> cb8c6477f976d145177632dd4f91084db5d94fa3
