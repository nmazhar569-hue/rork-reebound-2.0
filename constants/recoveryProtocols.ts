
import { RecoveryProtocolType, DailyProtocolItem } from '@/types/recovery';

export const RECOVERY_PROTOCOLS: Record<RecoveryProtocolType, DailyProtocolItem[]> = {
    SLEEP_OPTIMIZATION: [
        { id: 'sleep_1', title: 'Light Movement Session', duration: '30 min', type: 'ACTIVITY' },
        { id: 'sleep_2', title: 'No Screens (Read/Journal)', duration: '60 min', type: 'LIFESTYLE' },
        { id: 'sleep_3', title: 'Sleep Prep Stretch Routine', duration: '15 min', type: 'STRETCHING' },
        { id: 'sleep_4', title: 'Bedroom Setup (65-68°F)', duration: '5 min', type: 'LIFESTYLE' },
        { id: 'sleep_5', title: 'Morning Sunlight', duration: '10 min', type: 'LIFESTYLE' },
    ],
    CNS_RECOVERY: [
        { id: 'cns_1', title: 'Active Recovery Mobility', duration: '45 min', type: 'ACTIVITY' },
        { id: 'cns_2', title: 'Meditation / Breathwork', duration: '10 min', type: 'STRETCHING' },
        { id: 'cns_3', title: 'Hydration Goal (80oz)', duration: 'All Day', type: 'NUTRITION' },
        { id: 'cns_4', title: 'Sleep 7.5+ Hours', duration: 'Night', type: 'LIFESTYLE' },
        { id: 'cns_5', title: 'Deload Strength Session', duration: '40 min', type: 'ACTIVITY' },
    ],
    MOBILITY_SORENESS: [
        { id: 'mob_1', title: 'Targeted Quad/Hip Stretches', duration: '10 min', type: 'STRETCHING' },
        { id: 'mob_2', title: 'Shoulder Mobility Work', duration: '5 min', type: 'STRETCHING' },
        { id: 'mob_3', title: 'Foam Rolling / Myofascial', duration: '5 min', type: 'ACTIVITY' },
        { id: 'mob_4', title: 'Light Blood Flow Walk', duration: '15 min', type: 'ACTIVITY' },
    ],
    STRESS_MANAGEMENT: [
        { id: 'stress_1', title: 'Box Breathing (4-4-4-4)', duration: '5 min', type: 'STRETCHING' },
        { id: 'stress_2', title: 'Guided Meditation', duration: '10 min', type: 'ACTIVITY' },
        { id: 'stress_3', title: 'Gentle Yoga Flow', duration: '10 min', type: 'STRETCHING' },
        { id: 'stress_4', title: 'Journaling / Reflection', duration: '5 min', type: 'LIFESTYLE' },
        { id: 'stress_5', title: 'Sleep Priority (7.5h)', duration: 'Night', type: 'LIFESTYLE' },
    ],
    // Fallback or future protocols
    RETURN_TO_VOLUME: [
        { id: 'rtv_1', title: 'Standard Warmup', duration: '10 min', type: 'ACTIVITY' },
    ],
    MAINTENANCE: [
        { id: 'maint_1', title: 'Daily Mobility', duration: '15 min', type: 'STRETCHING' },
    ]
};

export const STRETCHING_ROUTINES = {
    SLEEP_PREP: [
        { name: 'Hip Flexor Stretch', duration: '3 min', focus: 'Hips' },
        { name: 'Pigeon Pose', duration: '3 min', focus: 'Glutes/Hips' },
        { name: 'Hamstring Stretch', duration: '2 min', focus: 'Posterior Chain' },
        { name: 'Chest Opener', duration: '1.5 min', focus: 'Upper Body' },
        { name: 'Shoulder/Lat Stretch', duration: '3 min', focus: 'Shoulders' },
        { name: 'Child\'s Pose', duration: '2 min', focus: 'Spine/Relaxation' }
    ]
};
