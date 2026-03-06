import {
    UserModel,
    TrendData,
    ReeInsight,
    DailySnapshot,
    InsightType,
    ReadinessData,
    ReadinessCategory,
    OptimizationRecommendation,
    OptimizationCategory
} from '@/types/intelligence';
import { storageService } from './StorageService';

class UserInsightService {

    // --- LAYER 1: DATA AGGREGATION & READINESS ---

    /**
     * Calculates Daily Readiness Score (0-100) based on check-in data.
     * Formula:
     * - Energy (40%)
     * - Soreness (30%)
     * - Stress (20%)
     * - Motivation (10%)
     */
    calculateReadiness(
        energy: number, // 1-10
        soreness: 'none' | 'mild' | 'moderate' | 'severe',
        stress: number, // 1-10
        motivation: number // 1-10
    ): ReadinessData {
        // 1. Normalize Inputs to 0-1 Scale (where 1 is best)

        // Energy: 10 is best
        const normEnergy = energy / 10;

        // Soreness: None is best. Map to 0-4 scale (0=None, 4=Severe) then invert.
        const soreMap = { 'none': 0, 'mild': 1, 'moderate': 2, 'severe': 4 }; // Penalty is higher for severe
        const soreVal = soreMap[soreness];
        const normSoreness = Math.max(0, 1 - (soreVal / 4));

        // Stress: 1 is best (Least stress). 10 is worst.
        const normStress = 1 - (stress / 10);

        // Motivation: 10 is best
        const normMotivation = motivation / 10;

        // 2. Apply Weighting (Strict Formula from Spec)
        // Score = (Energy × 0.4) + (Soreness × 0.3) + (Stress × 0.2) + (Motivation × 0.1)
        const wEnergy = 0.40;
        const wSoreness = 0.30;
        const wStress = 0.20;
        const wMotivation = 0.10;

        // Score Calculation
        let rawScore = (
            (normEnergy * wEnergy) +
            (normSoreness * wSoreness) +
            (normStress * wStress) +
            (normMotivation * wMotivation)
        ) * 100;

        // Penalties/Limits
        // If soreness is severe, cap readiness at 45 (Warning) regardless of other stats
        if (soreness === 'severe') {
            rawScore = Math.min(rawScore, 45);
        }

        const score = Math.round(rawScore);

        // 3. Categorize
        let category: ReadinessCategory;
        let advice = '';
        let action = '';

        if (score >= 80) {
            category = 'PEAK';
            advice = "You're firing on all cylinders. Perfect time for a challenging session.";
            action = "Push Hard (110%)";
        } else if (score >= 70) {
            category = 'HIGH';
            advice = "You're ready for a solid session. Stick to today's plan.";
            action = "Normal Training";
        } else if (score >= 60) {
            category = 'ADEQUATE';
            advice = "You can train, but be smart. Don't push beyond the plan.";
            action = "No Extra Volume";
        } else if (score >= 50) {
            category = 'CAUTION';
            advice = "Energy is lower today. Let's do a quality session instead of high intensity.";
            action = "70% Intensity";
        } else if (score >= 40) {
            category = 'WARNING';
            advice = "Your body needs recovery today. Let's keep it light.";
            action = "Active Recovery";
        } else {
            category = 'CRITICAL';
            advice = "Your body is telling you it needs rest. Let's take today off.";
            action = "Full Rest";
        }

        return {
            score,
            category,
            advice,
            action,
            details: {
                energyScore: Math.round(normEnergy * 100),
                sorenessScore: Math.round(normSoreness * 100),
                stressScore: Math.round(normStress * 100),
                motivationScore: Math.round(normMotivation * 100)
            }
        };
    }

    /**
     * Calculates rolling averages and trends from raw history
     */
    async calculateTrends(): Promise<TrendData> {
        // In a real implementation, we would query the database for the last 7-28 days.
        // For this MVP, we will simulate the calculation based on "mock" data or 
        // minimal data available in storageService.

        // TODO: Connect to real DailyLogs from StorageService once that model is fully populated
        // For now, we return a structure that can be used by the inference engine/

        // MOCK DATA FOR "BURNOUT WATCH" SCENARIO (To test the logic)
        // In production, replace with: const logs = await storageService.getDailyLogs(7);
        const mockEnergyLast7Days = [7, 7, 6, 6, 5, 5, 4]; // Declining
        const mockSleepLast7Days = [7, 7, 6.5, 6, 6, 5.5, 5]; // Declining

        const energyAvg = this.average(mockEnergyLast7Days);
        const sleepAvg = this.average(mockSleepLast7Days);

        // Simple slope calculation: (Last - First) / Time
        const energySlope = (mockEnergyLast7Days[6] - mockEnergyLast7Days[0]) / 7;
        const sleepSlope = (mockSleepLast7Days[6] - mockSleepLast7Days[0]) / 7;

        return {
            energy7DayAvg: energyAvg,
            energyTrend: energySlope, // e.g., -0.42
            sleep7DayAvg: sleepAvg,
            sleepTrend: sleepSlope, // e.g., -0.28
            workoutConsistency: 0.85, // MOCK: 85% adherence
            workoutVolumeTrend: 0.05, // MOCK: +5% volume
        };
    }

    private average(arr: number[]): number {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    // --- LAYER 2: OPTIMIZATION ENGINE (The Inbox) ---

    /**
     * Generates a prioritized list of optimization recommendations.
     * Always returns top 3 based on Impact x Urgency algorithm.
     */
    async generateOptimizations(userModel: UserModel): Promise<OptimizationRecommendation[]> {
        const trends = await this.calculateTrends();
        const recommendations: OptimizationRecommendation[] = [];

        // 1. DETECTOR: SLEEP DEBT (High Priority)
        // Trigger: Sleep avg < Baseline
        const sleepDeficit = userModel.metrics.baselineSleep - trends.sleep7DayAvg;
        if (sleepDeficit > 0.5) {
            recommendations.push({
                id: 'sleep_debt',
                category: 'RECOVERY',
                title: 'Sleep Debt Detected',
                description: `You're averaging ${trends.sleep7DayAvg.toFixed(1)}h sleep, which is ${sleepDeficit.toFixed(1)}h below your target. This kills recovery.`,
                actionLabel: 'View Sleep Protocol',
                impact: 'HIGH',
                severity: sleepDeficit > 1.5 ? 'HIGH' : 'MEDIUM',
                priorityScore: 90 + (sleepDeficit * 10), // Base 90 + boost for severity
                actionId: 'view_sleep_protocol',
                triggerData: { deficit: sleepDeficit }
            });
        }

        // 2. DETECTOR: CNS FATIGUE (Medium Priority)
        // Trigger: Energy trending down significantly
        if (trends.energyTrend < -0.2) {
            recommendations.push({
                id: 'cns_fatigue',
                category: 'RECOVERY',
                title: 'CNS Fatigue Risk',
                description: `Your energy is strictly declining (${trends.energyTrend.toFixed(2)}/day). Your nervous system needs a break.`,
                actionLabel: 'Reduce Intensity 10%',
                impact: 'HIGH',
                severity: 'MEDIUM',
                priorityScore: 85,
                actionId: 'reduce_intensity'
            });
        }

        // 3. DETECTOR: TIME OPTIMIZATION (Low Priority, Efficiency)
        // Trigger: Workouts getting longer (simulated by volume trend for now)
        if (trends.workoutVolumeTrend > 0.1) {
            recommendations.push({
                id: 'time_opt',
                category: 'OPTIMIZATION',
                title: 'Compress Your Workout',
                description: 'Your sessions are getting longer. Cut rest periods by 30s to maintain density.',
                actionLabel: 'Compress Rest Periods',
                impact: 'MEDIUM',
                severity: 'LOW',
                priorityScore: 70,
                actionId: 'compress_workout'
            });
        }

        // 4. DETECTOR: NUTRITION COMPLIANCE (Medium Priority)
        // Trigger: Simulated low compliance for mock
        const proteinCompliance = 0.65; // Mock
        if (proteinCompliance < 0.7) {
            recommendations.push({
                id: 'nutrition_prot',
                category: 'NUTRITION',
                title: 'Protein Compliance',
                description: 'You missed your protein target 3 times this week. Muscle growth requires fuel.',
                actionLabel: 'Log Protein',
                impact: 'HIGH',
                severity: 'MEDIUM',
                priorityScore: 75,
                actionId: 'log_nutrition'
            });
        }

        // 5. FILLER: GENERAL ADVICE (If empty)
        if (recommendations.length < 3) {
            recommendations.push({
                id: 'consistency_check',
                category: 'TRAINING',
                title: 'Stay Consistent',
                description: 'Consistency is the #1 driver of results. Keep showing up.',
                actionLabel: 'View Schedule',
                impact: 'MEDIUM',
                severity: 'LOW',
                priorityScore: 50,
                actionId: 'view_schedule'
            });
        }

        // SORT & LIMIT
        // Priority Sort: Descending
        recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

        // Always return top 3
        return recommendations.slice(0, 3);
    }

    // --- LAYER 3: INFERENCE ENGINE (Legacy/Alerts) ---

    /**
     * Runs rule-based logic to generate insights
     */
    async generateInsights(userModel: UserModel): Promise<ReeInsight[]> {
        const trends = await this.calculateTrends();
        const insights: ReeInsight[] = [];

        // RULE 1: BURNOUT WATCH
        // Trigger: Energy dropping > 0.2/day AND Training Volume steady/rising
        if (trends.energyTrend < -0.2 && trends.workoutVolumeTrend >= 0) {
            insights.push(this.createInsight(
                'recovery_warning',
                'Burnout Risk Detected',
                `Your energy is dropping (${trends.energyTrend.toFixed(1)}/week) but you're still pushing volume up. This is a recipe for CNS fatigue.`,
                'critical',
                { label: 'Prioritize Sleep', actionId: 'log_sleep_focus' }
            ));
        }

        // RULE 2: SLEEP DEBT
        // Trigger: Sleep avg < Baseline AND Energy < Baseline
        if (trends.sleep7DayAvg < (userModel.metrics.baselineSleep - 0.5)) {
            insights.push(this.createInsight(
                'recovery_warning',
                'Sleep Debt Accumulating',
                `You're averaging ${trends.sleep7DayAvg.toFixed(1)}h sleep, which is below your ${userModel.metrics.baselineSleep}h baseline. This explains your lower energy.`,
                'high',
                { label: 'See Recovery Stats', route: '/recovery' }
            ));
        }

        // RULE 3: POSITIVE REINFORCEMENT (Consistency)
        // Trigger: Consistency > 80% AND Energy stable/up
        if (trends.workoutConsistency > 0.8 && trends.energyTrend >= -0.1) {
            insights.push(this.createInsight(
                'positive_reinforcement',
                'Rock Solid Consistency',
                `You've hit ${Math.round(trends.workoutConsistency * 100)}% of your sessions while keeping energy stable. This is sustainable progress.`,
                'medium'
            ));
        }

        return insights;
    }

    // --- LAYER 3: PERSONALITY ADAPTER ---

    private createInsight(
        type: InsightType,
        title: string,
        baseMessage: string,
        priority: ReeInsight['priority'],
        action?: ReeInsight['action']
    ): ReeInsight {

        // In a full implementation, we would rewrite 'baseMessage' based on UserModel.communicationStyle
        // e.g. if 'soft', add "Hey,". If 'direct', keep as is.

        return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title,
            message: baseMessage,
            priority,
            generatedAt: new Date(),
            read: false,
            action
        };
    }

    /**
     * Builds the User Model from raw profile data
     */
    async buildUserModel(): Promise<UserModel> {
        const profile = await storageService.getUserProfile();

        // Inferences
        const isAdvanced = profile?.trainingBackground?.yearsExperience && profile.trainingBackground.yearsExperience > 2;
        const frequency = 4; // Default or infer from logs

        const communicationStyle: 'data_focused' | 'supportive' =
            (profile?.aiPreferences?.explanationDepth === 'deep_biomechanics') ? 'data_focused' : 'supportive';

        return {
            identity: {
                name: profile?.questionnaireProfile?.preferredName || 'Athlete',
            },
            goals: {
                primary: profile?.goal || 'General Fitness',
            },
            capacity: {
                fitnessLevel: isAdvanced ? 'advanced' : 'intermediate',
                trainingFrequency: frequency,
                timePerSession: 60,
                recoveryRisk: (frequency > 4) ? 'high' : 'moderate'
            },
            psychology: {
                motivationSource: 'data_driven', // TODO: Infer from questionnaire
                communicationStyle: communicationStyle,
                barriers: [],
                consistencyDrivers: []
            },
            metrics: {
                baselineSleep: profile?.baselineSleep || 7.5,
                baselineEnergy: 7.0
            }
        };
    }
}

export const userInsightService = new UserInsightService();
