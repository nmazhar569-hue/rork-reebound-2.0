
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
