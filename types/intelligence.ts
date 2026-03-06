export type CommunicationStyle = 'data_focused' | 'supportive' | 'direct' | 'coach_like';

export interface UserModel {
    identity: {
        name: string;
        age?: number;
        trainingAge?: string; // e.g. "2-5 years" - derived from fitness level
    };
    goals: {
        primary: string;
        secondary?: string[];
        aspirationalOutcome?: string; // "Look better", "Perform better"
    };
    capacity: {
        fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
        trainingFrequency: number; // days per week
        timePerSession: number; // minutes
        recoveryRisk: 'low' | 'moderate' | 'high'; // Inferred
    };
    psychology: {
        motivationSource: 'intrinsic' | 'extrinsic' | 'data_driven';
        communicationStyle: CommunicationStyle;
        barriers: string[];
        consistencyDrivers: string[];
    };
    metrics: {
        baselineSleep: number; // hours
        baselineEnergy: number; // 0-10
    };
}

export interface TrendData {
    energy7DayAvg: number;
    energyTrend: number; // Slope: positive = improving, negative = declining
    sleep7DayAvg: number;
    sleepTrend: number;
    workoutConsistency: number; // 0-1 (percentage of planned workouts completed)
    workoutVolumeTrend: number; // % change vs last week
}

export type InsightType = 'recovery_warning' | 'positive_reinforcement' | 'consistency_alert' | 'milestone_celebration' | 'general_advice';

export interface ReeInsight {
    id: string;
    type: InsightType;
    title: string;
    message: string;
    action?: {
        label: string;
        route?: string; // e.g. "/recovery"
        actionId?: string; // e.g. "log_sleep"
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
    generatedAt: Date;
    expiresAt?: Date;
    read: boolean;
    triggerData?: any; // The data that caused this insight
}

export interface DailySnapshot {
    date: string;
    energy: number;
    sleepHours?: number;
    workoutsCompleted: number;
    soreness: number; // 0-10 or mapped from category
    stress: number;
    motivation: number;
}

export type ReadinessCategory = 'PEAK' | 'HIGH' | 'ADEQUATE' | 'CAUTION' | 'WARNING' | 'CRITICAL';

export interface ReadinessData {
    score: number; // 0-100
    category: ReadinessCategory;
    advice: string;
    details: {
        energyScore: number;
        sorenessScore: number;
        stressScore: number;
        motivationScore: number;
    };
    action: string;
}

export type OptimizationCategory = 'RECOVERY' | 'OPTIMIZATION' | 'NUTRITION' | 'TRAINING';

export interface OptimizationRecommendation {
    id: string;
    category: OptimizationCategory;
    title: string;
    description: string;
    actionLabel: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    priorityScore: number;
    actionId: string; // e.g., 'view_sleep_protocol'
    triggerData?: any;
}

