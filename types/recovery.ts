
export type RecoveryTrigger =
    | 'SLEEP_DEBT'
    | 'CNS_FATIGUE'
    | 'SORENESS'
    | 'HIGH_STRESS'
    | 'POST_DELOAD'
    | 'PROACTIVE';

export type RecoveryProtocolType =
    | 'SLEEP_OPTIMIZATION' // 7 days
    | 'CNS_RECOVERY'       // 7 days (Deload)
    | 'MOBILITY_SORENESS'  // 7-10 days
    | 'STRESS_MANAGEMENT'  // Variable
    | 'RETURN_TO_VOLUME'   // Post-Deload
    | 'MAINTENANCE';       // Proactive

export type RecoveryActivityType =
    | 'MOBILITY'
    | 'LIGHT_CARDIO'
    | 'ACTIVE_RECOVERY'
    | 'STRETCHING'
    | 'YOGA'
    | 'SAUNA_ICE';

export interface RecoverySession {
    id: string;
    type: RecoveryActivityType;
    durationMinutes: number;
    timestamp: string; // ISO Date
    intensity: 'PASSIVE' | 'LIGHT' | 'MODERATE';
    areasWorked?: string[]; // ['QUADS', 'SHOULDERS', etc]
    notes?: string;
    feeling?: {
        energy: number; // 1-10
        soreness: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
        readiness: 'READY' | 'TIRED';
    };
}

export interface SleepLog {
    date: string; // YYYY-MM-DD
    bedtime: string; // HH:MM
    wakeTime: string;
    durationHours: number;
    quality: number; // 1-10
    checklist: {
        eveningRoutine: boolean;
        stretching: boolean;
        noScreens: boolean;
        roomTemp: boolean;
        morningSunlight: boolean;
    };
    notes?: string;
}

export interface DailyRecoveryMetrics {
    date: string;
    energy: number;
    sleepHours: number;
    sorenessScore: number; // 1-10
    stressScore: number;
    compliancePercentage: number;
}

export interface RecoveryPlan {
    id: string;
    type: RecoveryProtocolType;
    trigger: RecoveryTrigger;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

    // Progress
    daysCompleted: number;
    totalDays: number;
    currentDay: number; // 1-indexed

    // Metrics Logic
    metrics: {
        start: DailyRecoveryMetrics;
        current: DailyRecoveryMetrics; // Latest snapshot
        history: DailyRecoveryMetrics[];
    };

    // Specific Targets based on Type
    targets?: {
        sleepHours?: number;
        proteinGrams?: number;
        mobilitySessionsPerWeek?: number;
    };
}

// For the UI "Invitation"
export interface RecoveryRecommendation {
    type: RecoveryProtocolType;
    trigger: RecoveryTrigger;
    reason: string; // "Sleep is 0.6 hrs below optimal..."
    impact: string; // "-2 lbs muscle gain/month"
    expectedResults: string[]; // ["Sleep +0.7 hrs", "Energy +1.0"]
    durationDays: number;
}

export interface DailyProtocolItem {
    id: string;
    title: string;
    duration?: string;
    target?: string;
    type: 'CHECKLIST' | 'ACTIVITY' | 'LOG' | 'STRETCHING' | 'LIFESTYLE' | 'NUTRITION';
}
