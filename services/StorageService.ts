import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, UserProfile, RecoverySession } from '@/types';

const STORAGE_KEY = '@ai_rebound_history';
const PROFILE_KEY = '@ai_rebound_profile';
const RECOVERY_SESSION_KEY = '@ai_rebound_recovery_sessions';

class StorageService {
  async saveWorkout(session: WorkoutSession): Promise<void> {
    try {
      const history = await this.getWorkoutHistory();
      const updated = [session, ...history];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('[StorageService] Workout saved:', session.id);
      console.log('[StorageService] Total workouts in history:', updated.length);
    } catch (error) {
      console.error('[StorageService] Error saving workout:', error);
      throw error;
    }
  }

  async getWorkoutHistory(): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('[StorageService] No workout history found');
        return [];
      }
      const history = JSON.parse(data) as WorkoutSession[];
      console.log('[StorageService] Loaded workout history:', history.length, 'sessions');
      return history;
    } catch (error) {
      console.error('[StorageService] Error loading workout history:', error);
      return [];
    }
  }

  async getLastWorkout(): Promise<WorkoutSession | null> {
    try {
      const history = await this.getWorkoutHistory();
      if (history.length === 0) {
        console.log('[StorageService] No last workout found');
        return null;
      }
      const lastWorkout = history[0];
      console.log('[StorageService] Last workout:', lastWorkout.id, 'on', lastWorkout.date);
      return lastWorkout;
    } catch (error) {
      console.error('[StorageService] Error getting last workout:', error);
      return null;
    }
  }

  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutSession[]> {
    try {
      const history = await this.getWorkoutHistory();
      const filtered = history.filter(session => {
        return session.date >= startDate && session.date <= endDate;
      });
      console.log('[StorageService] Workouts in range:', filtered.length);
      return filtered;
    } catch (error) {
      console.error('[StorageService] Error filtering workouts by date:', error);
      return [];
    }
  }

  async getWeeklyVolumeAverage(): Promise<number> {
    try {
      const now = new Date();
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      const startDate = fourWeeksAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const workouts = await this.getWorkoutsByDateRange(startDate, endDate);
      
      if (workouts.length === 0) {
        console.log('[StorageService] No workouts in last 4 weeks for volume average');
        return 0;
      }

      const totalVolume = workouts.reduce((sum, session) => sum + session.totalVolume, 0);
      const weeklyAverage = totalVolume / 4;
      
      console.log('[StorageService] Weekly volume average:', weeklyAverage);
      return weeklyAverage;
    } catch (error) {
      console.error('[StorageService] Error calculating weekly volume:', error);
      return 0;
    }
  }

  async getTodayWorkout(): Promise<WorkoutSession | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const history = await this.getWorkoutHistory();
      const todayWorkout = history.find(session => session.date === today);
      
      if (todayWorkout) {
        console.log('[StorageService] Found workout from today:', todayWorkout.id);
      }
      return todayWorkout || null;
    } catch (error) {
      console.error('[StorageService] Error getting today workout:', error);
      return null;
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[StorageService] History cleared');
    } catch (error) {
      console.error('[StorageService] Error clearing history:', error);
      throw error;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      console.log('[StorageService] User profile saved');
    } catch (error) {
      console.error('[StorageService] Error saving user profile:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (!data) {
        console.log('[StorageService] No user profile found');
        return null;
      }
      const profile = JSON.parse(data) as UserProfile;
      console.log('[StorageService] Loaded user profile:', profile.questionnaireProfile?.preferredName || 'User');
      return profile;
    } catch (error) {
      console.error('[StorageService] Error loading user profile:', error);
      return null;
    }
  }

  async saveRecoverySession(session: RecoverySession): Promise<void> {
    try {
      const sessions = await this.getRecoverySessions();
      const updated = [session, ...sessions];
      await AsyncStorage.setItem(RECOVERY_SESSION_KEY, JSON.stringify(updated));
      console.log('[StorageService] Recovery session saved:', session.id);
      console.log('[StorageService] Pain before:', session.painLevelBefore, '-> after:', session.painLevelAfter);
    } catch (error) {
      console.error('[StorageService] Error saving recovery session:', error);
      throw error;
    }
  }

  async getRecoverySessions(): Promise<RecoverySession[]> {
    try {
      const data = await AsyncStorage.getItem(RECOVERY_SESSION_KEY);
      if (!data) {
        console.log('[StorageService] No recovery sessions found');
        return [];
      }
      const sessions = JSON.parse(data) as RecoverySession[];
      console.log('[StorageService] Loaded recovery sessions:', sessions.length);
      return sessions;
    } catch (error) {
      console.error('[StorageService] Error loading recovery sessions:', error);
      return [];
    }
  }

  async getTodayRecoverySession(): Promise<RecoverySession | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sessions = await this.getRecoverySessions();
      const todaySession = sessions.find(s => s.date === today);
      if (todaySession) {
        console.log('[StorageService] Found recovery session from today:', todaySession.routineName);
      }
      return todaySession || null;
    } catch (error) {
      console.error('[StorageService] Error getting today recovery session:', error);
      return null;
    }
  }

  async getRecoverySessionsByDateRange(startDate: string, endDate: string): Promise<RecoverySession[]> {
    try {
      const sessions = await this.getRecoverySessions();
      const filtered = sessions.filter(s => s.date >= startDate && s.date <= endDate);
      console.log('[StorageService] Recovery sessions in range:', filtered.length);
      return filtered;
    } catch (error) {
      console.error('[StorageService] Error filtering recovery sessions:', error);
      return [];
    }
  }

  async clearRecoverySessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECOVERY_SESSION_KEY);
      console.log('[StorageService] Recovery sessions cleared');
    } catch (error) {
      console.error('[StorageService] Error clearing recovery sessions:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
