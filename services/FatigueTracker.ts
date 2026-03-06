/**
 * Fatigue Tracker Service
 * 
 * Tracks muscle fatigue after workouts and provides
 * connected recovery recommendations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '@/types';
import {
    tagFatiguedParts,
    getRecoverySuggestion,
    getPainModification,
    RecoverySuggestion,
    PainModification,
} from './RecoveryEngine';

const STORAGE_KEY = 'reebound_fatigue_tracker';

interface FatigueEntry {
    bodyPart: string;
    timestamp: string;
    workoutId: string;
    intensity: 'low' | 'medium' | 'high';
    hoursRemaining: number;
}

interface PainReport {
    area: string;
    timestamp: string;
    severity: 'mild' | 'moderate' | 'severe';
    workoutId?: string;
}

interface FatigueState {
    entries: FatigueEntry[];
    painReports: PainReport[];
    lastWorkout: WorkoutSession | null;
    lastWorkoutDate: string | null;
}

const DEFAULT_FATIGUE_STATE: FatigueState = {
    entries: [],
    painReports: [],
    lastWorkout: null,
    lastWorkoutDate: null,
};

// Recovery time in hours by intensity
const RECOVERY_HOURS: Record<string, number> = {
    quads: 48,
    glutes: 48,
    hamstrings: 48,
    chest: 48,
    lats: 48,
    shoulders: 36,
    biceps: 36,
    triceps: 36,
    core: 24,
    calves: 24,
    lower_back: 72,
    upper_back: 48,
};

class FatigueTrackerService {
    private state: FatigueState = DEFAULT_FATIGUE_STATE;
    private loaded: boolean = false;

    /**
     * Load fatigue state from storage
     */
    async load(): Promise<void> {
        if (this.loaded) return;

        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                this.state = JSON.parse(data);
                this.cleanupExpiredEntries();
            }
            this.loaded = true;
        } catch (error) {
            console.warn('[FatigueTracker] Failed to load:', error);
        }
    }

    /**
     * Save state to storage
     */
    private async save(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (error) {
            console.warn('[FatigueTracker] Failed to save:', error);
        }
    }

    /**
     * Remove expired fatigue entries
     */
    private cleanupExpiredEntries(): void {
        const now = new Date().getTime();
        this.state.entries = this.state.entries.filter((entry) => {
            const entryTime = new Date(entry.timestamp).getTime();
            const expiresAt = entryTime + (entry.hoursRemaining * 60 * 60 * 1000);
            return now < expiresAt;
        });
    }

    /**
     * Record workout completion and tag fatigued muscle groups
     */
    async recordWorkoutCompletion(workout: WorkoutSession): Promise<string[]> {
        await this.load();

        const fatiguedParts = tagFatiguedParts(workout);
        const intensity = this.determineIntensity(workout);
        const now = new Date().toISOString();

        fatiguedParts.forEach((bodyPart) => {
            // Remove existing entry for this body part
            this.state.entries = this.state.entries.filter(e => e.bodyPart !== bodyPart);

            // Add new entry
            this.state.entries.push({
                bodyPart,
                timestamp: now,
                workoutId: workout.id,
                intensity,
                hoursRemaining: RECOVERY_HOURS[bodyPart] || 48,
            });
        });

        this.state.lastWorkout = workout;
        this.state.lastWorkoutDate = now.split('T')[0];

        await this.save();
        console.log('[FatigueTracker] Recorded fatigue for:', fatiguedParts);

        return fatiguedParts;
    }

    /**
     * Determine workout intensity based on perceived strain
     */
    private determineIntensity(workout: WorkoutSession): 'low' | 'medium' | 'high' {
        const strain = workout.perceivedStrain || 5;
        if (strain >= 8) return 'high';
        if (strain >= 5) return 'medium';
        return 'low';
    }

    /**
     * Report pain during or after workout
     */
    async reportPain(area: string, severity: 'mild' | 'moderate' | 'severe', workoutId?: string): Promise<void> {
        await this.load();

        this.state.painReports.push({
            area,
            timestamp: new Date().toISOString(),
            severity,
            workoutId,
        });

        await this.save();
        console.log('[FatigueTracker] Pain reported:', area, severity);
    }

    /**
     * Get currently fatigued body parts
     */
    async getFatiguedParts(): Promise<FatigueEntry[]> {
        await this.load();
        this.cleanupExpiredEntries();
        return this.state.entries;
    }

    /**
     * Get recovery suggestion based on last workout
     */
    async getRecoveryRecommendation(): Promise<RecoverySuggestion | null> {
        await this.load();
        return getRecoverySuggestion(this.state.lastWorkout);
    }

    /**
     * Get pain modification if needed
     */
    async getPainModifications(): Promise<PainModification[]> {
        await this.load();

        // Only consider recent pain reports (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentPain = this.state.painReports.filter((p) => {
            return new Date(p.timestamp) > sevenDaysAgo;
        });

        const modifications: PainModification[] = [];
        const seenAreas = new Set<string>();

        recentPain.forEach((pain) => {
            if (!seenAreas.has(pain.area)) {
                const mod = getPainModification(pain.area);
                if (mod) {
                    modifications.push(mod);
                    seenAreas.add(pain.area);
                }
            }
        });

        return modifications;
    }

    /**
     * Get dynamic recovery tab title based on last workout
     */
    async getRecoveryTabTitle(): Promise<string> {
        await this.load();

        if (!this.state.lastWorkout) {
            return 'Recovery';
        }

        const suggestion = getRecoverySuggestion(this.state.lastWorkout);
        return suggestion?.title || 'Recovery';
    }

    /**
     * Check if a body part is fully recovered
     */
    async isRecovered(bodyPart: string): Promise<boolean> {
        await this.load();
        this.cleanupExpiredEntries();

        return !this.state.entries.some(e => e.bodyPart === bodyPart);
    }

    /**
     * Get hours remaining until recovery for a body part
     */
    async getRecoveryTimeRemaining(bodyPart: string): Promise<number> {
        await this.load();

        const entry = this.state.entries.find(e => e.bodyPart === bodyPart);
        if (!entry) return 0;

        const entryTime = new Date(entry.timestamp).getTime();
        const now = new Date().getTime();
        const elapsed = (now - entryTime) / (1000 * 60 * 60);

        return Math.max(0, entry.hoursRemaining - elapsed);
    }

    /**
     * Clear pain report when resolved
     */
    async clearPainReport(area: string): Promise<void> {
        await this.load();
        this.state.painReports = this.state.painReports.filter(p => p.area !== area);
        await this.save();
    }

    /**
     * Reset all fatigue data (for testing)
     */
    async reset(): Promise<void> {
        this.state = DEFAULT_FATIGUE_STATE;
        await this.save();
    }
}

export const fatigueTracker = new FatigueTrackerService();
export default fatigueTracker;
