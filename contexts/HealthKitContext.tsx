import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';

// Types for health data
export interface HealthData {
  steps: number;
  heartRate: number;
  distance: number; // in meters
  calories: number;
  activeMinutes: number;
  sleepHours: number;
  lastSynced: Date | null;
}

export interface WorkoutData {
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in minutes
  calories: number;
  distance?: number;
  heartRate?: {
    avg: number;
    max: number;
    min: number;
  };
}

interface HealthContextType {
  isConnected: boolean;
  healthData: HealthData;
  workoutHistory: WorkoutData[];
  connectHealthKit: () => Promise<boolean>;
  connectGoogleFit: () => Promise<boolean>;
  syncHealthData: () => Promise<void>;
  disconnect: () => void;
}

const defaultHealthData: HealthData = {
  steps: 0,
  heartRate: 0,
  distance: 0,
  calories: 0,
  activeMinutes: 0,
  sleepHours: 0,
  lastSynced: null,
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthKitProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [healthData, setHealthData] = useState<HealthData>(defaultHealthData);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutData[]>([]);

  const connectHealthKit = useCallback(async () => {
    try {
      // TODO: Implement actual Apple HealthKit integration
      // For iOS, you'll need to:
      // 1. Add HealthKit capability in app.json
      // 2. Install react-native-health package or expo-health
      // 3. Request permissions
      // 4. Query health data
      
      console.log('Connecting to Apple HealthKit...');
      
      // Mock implementation
      if (Platform.OS === 'ios') {
        // Simulating connection
        setIsConnected(true);
        
        // Mock data
        setHealthData({
          steps: 8543,
          heartRate: 72,
          distance: 6.2 * 1609.34, // 6.2 miles to meters
          calories: 2450,
          activeMinutes: 45,
          sleepHours: 7.5,
          lastSynced: new Date(),
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting to HealthKit:', error);
      return false;
    }
  }, []);

  const connectGoogleFit = useCallback(async () => {
    try {
      // TODO: Implement actual Google Fit integration
      // For Android, you'll need to:
      // 1. Add Google Fit SDK
      // 2. Configure OAuth credentials
      // 3. Request permissions
      // 4. Query fitness data
      
      console.log('Connecting to Google Fit...');
      
      // Mock implementation
      if (Platform.OS === 'android') {
        // Simulating connection
        setIsConnected(true);
        
        // Mock data
        setHealthData({
          steps: 9234,
          heartRate: 75,
          distance: 7.1 * 1609.34, // 7.1 miles to meters
          calories: 2580,
          activeMinutes: 52,
          sleepHours: 8.0,
          lastSynced: new Date(),
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
      return false;
    }
  }, []);

  const syncHealthData = useCallback(async () => {
    if (!isConnected) return;

    try {
      console.log('Syncing health data...');
      
      // TODO: Implement actual data sync
      // This should fetch the latest data from HealthKit/Google Fit
      
      // Mock sync - update lastSynced
      setHealthData(prev => ({
        ...prev,
        lastSynced: new Date(),
      }));
    } catch (error) {
      console.error('Error syncing health data:', error);
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setHealthData(defaultHealthData);
    setWorkoutHistory([]);
  }, []);

  // Auto-sync every 5 minutes when connected
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      syncHealthData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, syncHealthData]);

  return (
    <HealthContext.Provider
      value={{
        isConnected,
        healthData,
        workoutHistory,
        connectHealthKit,
        connectGoogleFit,
        syncHealthData,
        disconnect,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealthKit() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealthKit must be used within HealthKitProvider');
  }
  return context;
}
