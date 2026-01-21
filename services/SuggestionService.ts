import { RecoveryFlag } from './AnalysisService';

export interface Suggestion {
  id: string;
  type: 'SCHEDULE' | 'RECOVERY' | 'NUTRITION';
  title: string;
  message: string;
  actionLabel: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

class SuggestionService {
  public getSuggestions(flags: RecoveryFlag[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (flags.some(f => f.id === 'sleep_critical')) {
      suggestions.push({
        id: 'sugg_sleep_1',
        type: 'RECOVERY',
        title: 'CNS Warning',
        message: 'Your sleep debt is critical. I have replaced heavy compound lifts with mobility work to prevent injury.',
        actionLabel: 'Update Workout',
        impact: 'HIGH',
      });
    }

    if (flags.some(f => f.id === 'sleep_debt')) {
      suggestions.push({
        id: 'sugg_sleep_2',
        type: 'RECOVERY',
        title: 'Sleep Debt Detected',
        message: 'You are accumulating sleep debt. Consider an earlier bedtime or a recovery-focused session today.',
        actionLabel: 'View Recovery Plan',
        impact: 'MEDIUM',
      });
    }

    if (flags.some(f => f.id === 'vol_spike')) {
      suggestions.push({
        id: 'sugg_vol_1',
        type: 'RECOVERY',
        title: 'Volume Deload',
        message: "You are 25% over your volume limit for the week. Let's cut 1 set from all accessories today.",
        actionLabel: 'Apply Reduction',
        impact: 'MEDIUM',
      });
    }

    if (flags.some(f => f.id === 'hrv_tanked')) {
      suggestions.push({
        id: 'sugg_hrv_1',
        type: 'RECOVERY',
        title: 'CNS Fatigue Detected',
        message: 'Your HRV indicates significant stress. A rest day or light yoga would help recovery.',
        actionLabel: 'Switch to Recovery',
        impact: 'HIGH',
      });
    }

    if (flags.some(f => f.id === 'hrv_dip')) {
      suggestions.push({
        id: 'sugg_hrv_2',
        type: 'RECOVERY',
        title: 'HRV Trending Down',
        message: 'Mild CNS stress detected. Consider reducing intensity by 10% today.',
        actionLabel: 'Reduce Intensity',
        impact: 'LOW',
      });
    }

    if (flags.some(f => f.id === 'life_stress')) {
      suggestions.push({
        id: 'sugg_stress_1',
        type: 'RECOVERY',
        title: 'High Stress Alert',
        message: 'Mental stress impacts recovery. A mindfulness session or light walk could help.',
        actionLabel: 'View Stress Relief',
        impact: 'MEDIUM',
      });
    }

    if (flags.some(f => f.id === 'soreness_high')) {
      suggestions.push({
        id: 'sugg_soreness_1',
        type: 'RECOVERY',
        title: 'Muscle Recovery Needed',
        message: 'High soreness detected. Focus on different muscle groups or active recovery today.',
        actionLabel: 'Adjust Workout',
        impact: 'MEDIUM',
      });
    }

    suggestions.push({
      id: 'sugg_sched_1',
      type: 'SCHEDULE',
      title: 'Time Optimization',
      message: 'Based on your schedule, I suggest compressing rest periods to 60s to finish your session efficiently.',
      actionLabel: 'Compress Workout',
      impact: 'LOW',
    });

    if (suggestions.length < 3) {
      suggestions.push({
        id: 'sugg_nutr_1',
        type: 'NUTRITION',
        title: 'Protein Reminder',
        message: 'Post-workout protein intake is crucial. Aim for 25-40g within 2 hours of training.',
        actionLabel: 'Log Nutrition',
        impact: 'LOW',
      });
    }

    return suggestions;
  }

  public async applySuggestion(id: string): Promise<boolean> {
    console.log(`[SuggestionService] Applying suggestion: ${id}`);
    return true;
  }

  public async dismissSuggestion(id: string): Promise<boolean> {
    console.log(`[SuggestionService] Dismissed suggestion: ${id}`);
    return true;
  }
}

export const suggestionService = new SuggestionService();
