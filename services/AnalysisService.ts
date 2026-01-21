import { WorkoutSession, SleepData } from '@/types';

export interface DailyBiometrics {
  date: Date;
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  hrv: number;
  restingHeartRate: number;
  sorenessRating: number;
  stressRating: number;
}

export type StatusColor = 'GREEN' | 'YELLOW' | 'RED';

export interface RecoveryFlag {
  id: string;
  type: 'SLEEP' | 'VOLUME' | 'INTENSITY' | 'STRESS' | 'HRV' | 'TIME';
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  message: string;
}

export interface RecoveryAnalysis {
  score: number;
  color: StatusColor;
  flags: RecoveryFlag[];
  recommendedAction: 'PUSH' | 'MAINTAIN' | 'ACTIVE_RECOVERY' | 'REST';
}

export class AnalysisService {
  private readonly BASELINE_SLEEP = 7.5;
  private readonly BASELINE_HRV = 50;

  public analyzeDailyState(
    todaysBiometrics: DailyBiometrics,
    lastWorkout?: WorkoutSession,
    weeklyVolumeAverage: number = 0,
    freeMinutes?: number
  ): RecoveryAnalysis {
    const flags: RecoveryFlag[] = [];
    let recoveryScore = 100;

    // RULE 1: Sleep Logic
    const sleepDelta = todaysBiometrics.sleepHours - this.BASELINE_SLEEP;

    if (todaysBiometrics.sleepHours < 5) {
      recoveryScore -= 30;
      flags.push({
        id: 'sleep_critical',
        type: 'SLEEP',
        severity: 'CRITICAL',
        message: `Severe sleep deprivation detected (${todaysBiometrics.sleepHours}h).`
      });
    } else if (sleepDelta < -1.5) {
      recoveryScore -= 15;
      flags.push({
        id: 'sleep_debt',
        type: 'SLEEP',
        severity: 'MEDIUM',
        message: `Sleep debt accumulation. ${Math.abs(sleepDelta).toFixed(1)}h below baseline.`
      });
    }

    // RULE 2: HRV / CNS Status
    const hrvDrop = this.BASELINE_HRV - todaysBiometrics.hrv;
    const hrvDropPercent = (hrvDrop / this.BASELINE_HRV) * 100;

    if (hrvDropPercent > 20) {
      recoveryScore -= 25;
      flags.push({
        id: 'hrv_tanked',
        type: 'HRV',
        severity: 'CRITICAL',
        message: `CNS fatigue detected. HRV is down ${hrvDropPercent.toFixed(1)}%.`
      });
    } else if (hrvDropPercent > 10) {
      recoveryScore -= 10;
      flags.push({
        id: 'hrv_dip',
        type: 'HRV',
        severity: 'LOW',
        message: `Mild CNS stress. HRV is trending down.`
      });
    }

    // RULE 3: Mechanical Overload (The "10% Rule")
    if (lastWorkout) {
      if (weeklyVolumeAverage > 0 && lastWorkout.totalVolume > weeklyVolumeAverage * 1.25) {
        recoveryScore -= 20;
        flags.push({
          id: 'vol_spike',
          type: 'VOLUME',
          severity: 'MEDIUM',
          message: `Acute volume spike detected (+25% over average). Risk of DOMS/Injury.`
        });
      }

      // Check workout recency - acute fatigue from recent sessions
      const today = new Date().toISOString().split('T')[0];
      const workoutDate = lastWorkout.date;
      const daysSinceWorkout = this.getDaysBetween(workoutDate, today);

      if (daysSinceWorkout === 0) {
        // Worked out today - acute fatigue
        recoveryScore -= 15;
        flags.push({
          id: 'worked_today',
          type: 'INTENSITY',
          severity: 'MEDIUM',
          message: `You already trained today (${lastWorkout.durationMinutes}min, ${lastWorkout.totalVolume.toLocaleString()}lbs volume). Additional training not recommended.`
        });
      } else if (daysSinceWorkout === 1 && lastWorkout.totalVolume > 10000) {
        // High volume yesterday - delayed soreness expected
        recoveryScore -= 10;
        flags.push({
          id: 'high_vol_yesterday',
          type: 'INTENSITY',
          severity: 'LOW',
          message: `Yesterday's session was high volume (${lastWorkout.totalVolume.toLocaleString()}lbs). DOMS may be setting in. Consider lighter work.`
        });
      } else if (daysSinceWorkout >= 4) {
        // Haven't trained in a while - good to go but ease in
        flags.push({
          id: 'training_gap',
          type: 'INTENSITY',
          severity: 'LOW',
          message: `${daysSinceWorkout} days since last session. Ease back in with moderate intensity.`
        });
      }
    }

    // RULE 4: Subjective Stress
    if (todaysBiometrics.stressRating >= 8) {
      recoveryScore -= 15;
      flags.push({
        id: 'life_stress',
        type: 'STRESS',
        severity: 'MEDIUM',
        message: `User reported high mental stress (Rating: ${todaysBiometrics.stressRating}/10).`
      });
    }

    // RULE 5: Soreness Check
    if (todaysBiometrics.sorenessRating >= 7) {
      recoveryScore -= 15;
      flags.push({
        id: 'soreness_high',
        type: 'INTENSITY',
        severity: 'MEDIUM',
        message: `High muscle soreness reported (${todaysBiometrics.sorenessRating}/10).`
      });
    } else if (todaysBiometrics.sorenessRating >= 5) {
      recoveryScore -= 5;
      flags.push({
        id: 'soreness_moderate',
        type: 'INTENSITY',
        severity: 'LOW',
        message: `Moderate soreness present.`
      });
    }

    // RULE 6: Time Crunch (Calendar Integration)
    if (freeMinutes !== undefined) {
      if (freeMinutes < 20) {
        recoveryScore -= 10;
        flags.push({
          id: 'time_critical',
          type: 'TIME',
          severity: 'CRITICAL',
          message: `No time for training today. Only ${freeMinutes}m free.`
        });
      } else if (freeMinutes < 45) {
        flags.push({
          id: 'time_crunch',
          type: 'TIME',
          severity: 'MEDIUM',
          message: `Tight schedule detected. ${freeMinutes}m available. Consider a quick session.`
        });
      } else if (freeMinutes < 60) {
        flags.push({
          id: 'time_moderate',
          type: 'TIME',
          severity: 'LOW',
          message: `${freeMinutes}m window available. Standard session fits.`
        });
      }
    }

    // Clamp score between 0-100
    recoveryScore = Math.max(0, Math.min(100, recoveryScore));

    return this.determineStatus(recoveryScore, flags);
  }

  private determineStatus(score: number, flags: RecoveryFlag[]): RecoveryAnalysis {
    let color: StatusColor = 'GREEN';
    let action: RecoveryAnalysis['recommendedAction'] = 'PUSH';

    if (score < 40) {
      color = 'RED';
      action = 'REST';
    } else if (score < 60) {
      color = 'YELLOW';
      action = 'ACTIVE_RECOVERY';
    } else if (score < 75) {
      color = 'YELLOW';
      action = 'MAINTAIN';
    }

    // Override: If any CRITICAL flag exists, force RED status
    if (flags.some(f => f.severity === 'CRITICAL')) {
      color = 'RED';
      action = 'REST';
    }

    return {
      score,
      color,
      flags,
      recommendedAction: action
    };
  }

  public convertSleepDataToBiometrics(
    sleepData: SleepData,
    hrvValue: number = 50,
    restingHR: number = 60,
    soreness: number = 3,
    stress: number = 5
  ): DailyBiometrics {
    return {
      date: new Date(sleepData.date),
      sleepHours: sleepData.durationMinutes / 60,
      sleepQuality: sleepData.quality || 'fair',
      hrv: hrvValue,
      restingHeartRate: restingHR,
      sorenessRating: soreness,
      stressRating: stress
    };
  }

  public getActionLabel(action: RecoveryAnalysis['recommendedAction']): string {
    const labels: Record<RecoveryAnalysis['recommendedAction'], string> = {
      PUSH: 'Ready to Push',
      MAINTAIN: 'Maintain Intensity',
      ACTIVE_RECOVERY: 'Light Activity Recommended',
      REST: 'Rest Day Advised'
    };
    return labels[action];
  }

  public getColorHex(color: StatusColor): string {
    const colors: Record<StatusColor, string> = {
      GREEN: '#22C55E',
      YELLOW: '#EAB308',
      RED: '#EF4444'
    };
    return colors[color];
  }

  private getDaysBetween(dateStr1: string, dateStr2: string): number {
    const date1 = new Date(dateStr1);
    const date2 = new Date(dateStr2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const analysisService = new AnalysisService();
