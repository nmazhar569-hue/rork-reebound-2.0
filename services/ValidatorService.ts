import { Exercise, ProgramSession, ProgramWeekDay, WeekdayKey } from '@/types';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';

export interface ValidationResult {
    status: 'optimal' | 'warning' | 'critical';
    balance: BalanceCheck;
    volume: VolumeCheck[];
    recovery: RecoveryCheck[];
    feedback: string[]; // "Education Mode" explanations
}

interface BalanceCheck {
    pushSets: number;
    pullSets: number;
    ratio: number; // Push / Pull
    status: 'optimal' | 'imbalanced';
    message: string;
}

interface VolumeCheck {
    muscleGroup: string;
    weeklySets: number;
    status: 'low' | 'optimal' | 'high' | 'excessive';
    message: string;
}

interface RecoveryCheck {
    day: WeekdayKey;
    muscleGroup: string;
    conflictDay: WeekdayKey; // The day causing the conflict (e.g., trained Chest on Mon, then on Tues)
    gapHours: number;
    message: string;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export const validatorService = {
    validateProgram(weekSchedule: ProgramWeekDay[], sessions: ProgramSession[]): ValidationResult {
        const feedback: string[] = [];

        // 1. Calculate Volume per Muscle Group
        const volumeMap = new Map<string, number>();
        const movementMap = { push: 0, pull: 0, squat: 0, hinge: 0 };

        // Helper to get exercises for a day
        const getExercisesForDay = (day: WeekdayKey) => {
            const scheduleItem = weekSchedule.find(d => d.dayOfWeek === day);
            if (!scheduleItem?.sessionTypeKey) return [];
            const session = sessions.find(s => s.dayOfWeek === day && s.sessionTypeKey === scheduleItem.sessionTypeKey);
            return session?.exercises || [];
        };

        // Iterate through the week
        weekSchedule.forEach(day => {
            const exercises = getExercisesForDay(day.dayOfWeek);
            exercises.forEach(ex => {
                // We need lookup from master DB to get muscle details if 'ex' is minimal
                // Assuming 'ex' has the necessary info or we look it up. 
                // For this mock, we rely on ex.primaryMuscle or similar being present or solvable.
                // In the real app, we might need to map ID -> Master DB Entry. 
                const dbEx = MASTER_EXERCISE_DATABASE.find(e => e.id === ex.id) || ex;

                // Volume (Sets)
                const muscles = (dbEx.muscles?.primary || []).concat(dbEx.muscles?.secondary || []);
                const sets = ex.sets || 3;

                muscles.forEach((m: string) => {
                    volumeMap.set(m, (volumeMap.get(m) || 0) + sets);
                });

                // Movement Patterns (Simplified)
                const nameLower = dbEx.name.toLowerCase();
                const movType = dbEx.movement_type?.toLowerCase() || '';

                if (movType === 'push' || nameLower.includes('press') || nameLower.includes('push') || nameLower.includes('dip') || nameLower.includes('extension')) movementMap.push += sets;
                if (movType === 'pull' || nameLower.includes('row') || nameLower.includes('pull') || nameLower.includes('curl') || nameLower.includes('chin')) movementMap.pull += sets;
            });
        });

        // 2. Validate Volume
        const volumeChecks: VolumeCheck[] = [];
        volumeMap.forEach((sets, muscle) => {
            let status: VolumeCheck['status'] = 'optimal';
            let message = `${muscle}: ${sets} sets (Optimal range: 10-20)`;

            if (sets < 8) {
                status = 'low';
                message = `${muscle}: ${sets} sets (Low). Consider adding volume for growth.`;
            } else if (sets > 22) {
                status = 'excessive';
                message = `${muscle}: ${sets} sets (excessive). Risk of overtraining.`;
            } else if (sets > 18) {
                status = 'high';
                message = `${muscle}: ${sets} sets (High side). ensure recovery.`;
            }

            volumeChecks.push({ muscleGroup: muscle, weeklySets: sets, status, message });
        });

        // 3. Validate Balance (Push vs Pull)
        let balanceStatus: 'optimal' | 'imbalanced' = 'optimal';
        let balanceMessage = "Push/Pull ratio is balanced.";
        const ratio = movementMap.pull > 0 ? movementMap.push / movementMap.pull : movementMap.push;

        if (movementMap.push > 0 && movementMap.pull === 0) {
            balanceStatus = 'imbalanced';
            balanceMessage = "⚠️ Zero pulling volume detected. Add Back/Bicep work to prevent posture issues.";
            feedback.push("Muscle growth requires structural balance. Neglecting 'Pull' muscles leads to rounded shoulders.");
        } else if (ratio > 1.5) {
            balanceStatus = 'imbalanced';
            balanceMessage = `⚠️ Push dominated (${movementMap.push} vs ${movementMap.pull} sets). Add rows/pullups.`;
            feedback.push("Significantly more Push than Pull volume can strain shoulder joints long-term.");
        } else if (ratio < 0.6) {
            balanceStatus = 'imbalanced';
            balanceMessage = `⚠️ Pull dominated (${movementMap.pull} vs ${movementMap.push} sets).`;
        }

        const balanceCheck: BalanceCheck = {
            pushSets: movementMap.push,
            pullSets: movementMap.pull,
            ratio,
            status: balanceStatus,
            message: balanceMessage
        };

        // 4. Validate Recovery (Frequency overlap)
        const recoveryChecks: RecoveryCheck[] = [];
        const trainingDays = weekSchedule.filter(d => !!d.sessionTypeKey).sort((a, b) => a.dayOfWeek - b.dayOfWeek);

        // Check consecutive days for same muscle groups
        for (let i = 0; i < trainingDays.length; i++) {
            const currentParams = trainingDays[i];
            const nextParams = trainingDays[(i + 1) % trainingDays.length]; // cyclical check? Maybe just linear for the week is safer for 'Pilot' simplicity

            if (!nextParams || (i === trainingDays.length - 1)) continue;

            // Linear check: if Mon and Tue both hit Chest
            if ((nextParams.dayOfWeek - currentParams.dayOfWeek) === 1) {
                const day1Exercises = getExercisesForDay(currentParams.dayOfWeek);
                const day2Exercises = getExercisesForDay(nextParams.dayOfWeek);

                const day1Muscles = new Set<string>();
                day1Exercises.forEach(e => {
                    const dbEx = MASTER_EXERCISE_DATABASE.find(db => db.id === e.id) || e;
                    (dbEx.muscles?.primary || []).forEach((m: string) => day1Muscles.add(m));
                });

                day2Exercises.forEach(e => {
                    const dbEx = MASTER_EXERCISE_DATABASE.find(db => db.id === e.id) || e;
                    (dbEx.muscles?.primary || []).forEach((m: string) => {
                        if (day1Muscles.has(m)) {
                            // Conflict!
                            recoveryChecks.push({
                                day: nextParams.dayOfWeek,
                                muscleGroup: m,
                                conflictDay: currentParams.dayOfWeek,
                                gapHours: 24,
                                message: `⚠️ ${m} trained on consecutive days. Needs 48h rest.`
                            });
                            feedback.push(`Muscles grow during rest, not training. Hitting ${m} two days in a row interrupts the rebuilding process.`);
                        }
                    });
                });
            }
        }

        // Determine Global Status
        const isCritical = recoveryChecks.length > 0 || balanceCheck.status === 'imbalanced' || volumeChecks.some(v => v.status === 'excessive');
        const isWarning = !isCritical && volumeChecks.some(v => v.status === 'low' || v.status === 'high');

        return {
            status: isCritical ? 'critical' : isWarning ? 'warning' : 'optimal',
            balance: balanceCheck,
            volume: volumeChecks,
            recovery: recoveryChecks,
            feedback
        };
    },
    // [NEW] Neutral Analysis Logic
    analyzePlan(weeklySets: { push: number, pull: number, legs: number }): string[] {
        const insights: string[] = [];

        // Goal Alignment (Mocked "Durability + Strength" check)
        if (weeklySets.push > 8 && weeklySets.pull > 8) {
            insights.push("✔ Weekly volume supports strength.");
        }

        if (Math.abs(weeklySets.push - weeklySets.pull) > 5) {
            insights.push("⚠ Push/Pull gap is widening. Structural balance ensures durability.");
        }

        if (weeklySets.legs > 15) {
            insights.push("⚠ High leg volume. Expect higher neural fatigue tomorrow.");
        } else if (weeklySets.legs > 0) {
            insights.push("✔ Leg volume is sustainable.");
        }

        return insights;
    }
};
