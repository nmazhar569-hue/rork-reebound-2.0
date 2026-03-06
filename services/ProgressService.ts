import { storageService } from './StorageService';
import { WorkoutSession, ExerciseLog, SetLog, MuscleGroup } from '@/types';

// Enriched Types for Progress
export interface MuscleMetric {
    muscleId: string; // 'quads', 'chest', 'biceps'
    muscleName: string;
    strengthGrowth: number; // Percentage (e.g. 12 for 12%)
    volumeSets: number; // Sets per week (avg over last 4 weeks)
    status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'PLATEAU';
    bestExercise: string;
    efficiency: number; // Growth per set
}

export interface ProgressSummary {
    strengthGains: number; // Avg % gain across key lifts
    muscleGrowthLbs: number; // Estimated based on volume/progressive overload (a proxy)
    bodyCompChange: number; // Placeholder for actual weight tracking if available
    month: string;
    totalWorkouts: number;
}

export interface ExercisePerformance {
    name: string;
    currentWeight: number;
    startWeight: number;
    gainPercent: number;
    setsPerWeek: number;
    efficiency: number;
    isPlateau: boolean;
    weeksStalled: number;
}

export interface ReeRecommendation {
    id: string;
    muscle: string;
    issue: string; // "Plateau at 85lbs"
    solution: string; // "Add dumbbell curls"
    expectedOutcome: string; // "+4% -> +10%"
    type: 'PLATEAU_FIX' | 'FORM_FIX' | 'OPTIMIZATION';
}

class ProgressService {

    // 1. Get Summary
    async getProgressSummary(timeRange: number = 30): Promise<ProgressSummary> {
        const history = await storageService.getWorkoutHistory();
        if (!history.length) {
            return {
                strengthGains: 0,
                muscleGrowthLbs: 0,
                bodyCompChange: 0,
                month: new Date().toLocaleString('default', { month: 'long' }),
                totalWorkouts: 0
            };
        }

        // Calculate strength gains from analyzing exercise logs
        const exercises = await this.getExerciseAnalysis();
        const avgGain = exercises.length
            ? exercises.reduce((acc, ex) => acc + ex.gainPercent, 0) / exercises.length
            : 0;

        return {
            strengthGains: Math.round(avgGain),
            muscleGrowthLbs: parseFloat((avgGain * 0.2).toFixed(1)), // Simple proxy formula: 10% strength ~ 2lbs muscle (very rough)
            bodyCompChange: 0, // Need weight log for this
            month: new Date().toLocaleString('default', { month: 'long' }),
            totalWorkouts: history.length
        };
    }

    // 2. Get Muscle Metrics
    async getMuscleMetrics(): Promise<MuscleMetric[]> {
        const history = await storageService.getWorkoutHistory();
        // Identify which muscles were worked (this requires Exercise -> Muscle mapping)
        // For now, we'll infer from exercise names or tags if available.
        // Since ExerciseLog might not have muscle tags directly, we rely on a helper or assumption.
        // REAL IMPLEMENTATION: In a real app, we'd lookup Exercise ID -> Muscle Group.
        // Here, we will parse exercise logs.

        // Group by Muscle (Mocking the mapping for now since we don't have a full Exercise DB in memory)
        // We will detect common names: "Bench", "Squat", "Curl".
        const muscleMap: Record<string, { sets: number, gains: number[], bestEx: string, bestGain: number }> = {};

        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        const recentHistory = history.filter(s => new Date(s.date) >= fourWeeksAgo);

        // Flatten exercises
        const exercisesAnalysis = await this.getExerciseAnalysis();

        // Manual mapping for 'Real Data' simulation based on names
        exercisesAnalysis.forEach(ex => {
            let muscle = 'General';
            const name = ex.name.toLowerCase();
            if (name.includes('squat') || name.includes('leg')) muscle = 'Quads';
            else if (name.includes('bench') || name.includes('press') || name.includes('push')) muscle = 'Chest';
            else if (name.includes('curl') || name.includes('pull')) muscle = 'Biceps';
            else if (name.includes('deadlift') || name.includes('hinge')) muscle = 'Posterior Chain';
            else if (name.includes('raise') || name.includes('delts')) muscle = 'Shoulders';

            if (!muscleMap[muscle]) muscleMap[muscle] = { sets: 0, gains: [], bestEx: ex.name, bestGain: ex.gainPercent };

            muscleMap[muscle].sets += ex.setsPerWeek;
            muscleMap[muscle].gains.push(ex.gainPercent);
            if (ex.gainPercent > muscleMap[muscle].bestGain) {
                muscleMap[muscle].bestGain = ex.gainPercent;
                muscleMap[muscle].bestEx = ex.name;
            }
        });

        return Object.keys(muscleMap).map(muscle => {
            const data = muscleMap[muscle];
            const avgGain = data.gains.reduce((a, b) => a + b, 0) / data.gains.length;

            let status: MuscleMetric['status'] = 'GOOD';
            if (avgGain > 15) status = 'EXCELLENT';
            else if (avgGain < 2 && data.sets > 10) status = 'PLATEAU';
            else if (avgGain < 5) status = 'WARNING';

            return {
                muscleId: muscle.toLowerCase(),
                muscleName: muscle,
                strengthGrowth: Math.round(avgGain),
                volumeSets: data.sets, // Total sets in last 4 weeks approx (or convert to weekly)
                status,
                bestExercise: `${data.bestEx} (+${Math.round(data.bestGain)}%)`,
                efficiency: parseFloat((avgGain / Math.max(1, data.sets)).toFixed(2))
            };
        });
    }

    // 3. Recommendation Engine
    async getReeRecommendations(): Promise<ReeRecommendation[]> {
        const muscles = await this.getMuscleMetrics();
        const recs: ReeRecommendation[] = [];

        muscles.forEach(m => {
            if (m.status === 'PLATEAU') {
                recs.push({
                    id: `rec_${m.muscleId}`,
                    muscle: m.muscleName,
                    issue: `Plateau detected. High volume (${Math.round(m.volumeSets / 4)} sets/wk) but low growth.`,
                    solution: 'Switch to higher intensity, lower volume for 2 weeks.',
                    expectedOutcome: 'Break plateau',
                    type: 'PLATEAU_FIX'
                });
            } else if (m.status === 'WARNING' && m.volumeSets < 5) {
                recs.push({
                    id: `rec_${m.muscleId}_vol`,
                    muscle: m.muscleName,
                    issue: `Low growth due to insufficient volume.`,
                    solution: `Add 3-4 sets of isolation work for ${m.muscleName}.`,
                    expectedOutcome: 'Kickstart growth',
                    type: 'OPTIMIZATION'
                });
            }
        });

        return recs;
    }

    // 4. Exercise Analysis (The Core Logic)
    async getExerciseAnalysis(): Promise<ExercisePerformance[]> {
        const history = await storageService.getWorkoutHistory();
        const exerciseMap: Record<string, { sessions: { date: string, maxWeight: number, sets: number }[] }> = {};

        // 1. Group logs by exercise name
        history.forEach(session => {
            session.exercises.forEach(ex => {
                const name = ex.exerciseName || 'Unknown Lift';
                if (!exerciseMap[name]) exerciseMap[name] = { sessions: [] };

                // Find max weight for this session
                const maxWeight = ex.sets.reduce((max, set) => Math.max(max, set.weight || 0), 0);
                const numSets = ex.sets.length;

                if (maxWeight > 0) {
                    exerciseMap[name].sessions.push({
                        date: session.date,
                        maxWeight,
                        sets: numSets
                    });
                }
            });
        });

        // 2. Calculate metrics per exercise
        const results: ExercisePerformance[] = [];

        Object.keys(exerciseMap).forEach(name => {
            const sessions = exerciseMap[name].sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (sessions.length < 2) return; // Need at least 2 points for progress

            const first = sessions[0];
            const current = sessions[sessions.length - 1];

            const startWeight = first.maxWeight;
            const currentWeight = current.maxWeight;

            // Calculate gain
            const gainRaw = currentWeight - startWeight;
            const gainPercent = startWeight > 0 ? (gainRaw / startWeight) * 100 : 0;

            // Calculate sets per week (avg over span)
            const daysSpan = (new Date(current.date).getTime() - new Date(first.date).getTime()) / (1000 * 3600 * 24);
            const weeks = Math.max(1, daysSpan / 7);
            const totalSets = sessions.reduce((acc, s) => acc + s.sets, 0);
            const setsPerWeek = Math.round(totalSets / weeks);

            // Plateau detection: Check last 3 sessions
            let isPlateau = false;
            let weeksStalled = 0;
            if (sessions.length >= 3) {
                const recentMaxes = sessions.slice(-3).map(s => s.maxWeight);
                if (Math.max(...recentMaxes) === Math.min(...recentMaxes)) {
                    isPlateau = true;
                    weeksStalled = 2; // Approximate
                }
            }

            results.push({
                name,
                currentWeight,
                startWeight,
                gainPercent: Math.round(gainPercent),
                setsPerWeek,
                efficiency: setsPerWeek > 0 ? parseFloat((gainPercent / setsPerWeek).toFixed(2)) : 0,
                isPlateau,
                weeksStalled
            });
        });

        return results.sort((a, b) => b.setsPerWeek - a.setsPerWeek); // Sort by most practiced
    }
}

export const progressService = new ProgressService();
