import { RecoveryFlag } from './AnalysisService';
import { Routine, InjuryProfile } from '@/types';
import { routineService, PREMADE_ROUTINES } from './RoutineService';

export interface Suggestion {
  id: string;
  type: 'SCHEDULE' | 'RECOVERY' | 'NUTRITION' | 'ROUTINE';
  title: string;
  message: string;
  actionLabel: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  routineId?: string;
  routine?: Routine;
}

class SuggestionService {
  public getSuggestions(flags: RecoveryFlag[], injury?: InjuryProfile): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (flags.some(f => f.id === 'sleep_critical') || flags.some(f => f.id === 'hrv_tanked')) {
      const cnsRoutine = PREMADE_ROUTINES.find(r => r.id === 'cns-reset-protocol');
      if (cnsRoutine) {
        suggestions.push({
          id: 'sugg_cns_routine',
          type: 'ROUTINE',
          title: 'CNS Reset Protocol',
          message: 'Your nervous system needs recovery. This 12-minute routine activates your parasympathetic system to reduce cortisol and promote healing.',
          actionLabel: 'Start Protocol',
          impact: 'HIGH',
          routineId: cnsRoutine.id,
          routine: cnsRoutine,
        });
      }
    }

    if (injury?.active && injury.painLevel >= 6) {
      const acuteRoutine = PREMADE_ROUTINES.find(r => r.id === 'acute-pain-relief');
      if (acuteRoutine) {
        suggestions.push({
          id: 'sugg_acute_pain',
          type: 'ROUTINE',
          title: 'Acute Pain Relief Protocol',
          message: `Your pain level (${injury.painLevel}/10) is elevated. This gentle routine promotes circulation without loading irritated structures.`,
          actionLabel: 'Start Relief',
          impact: 'HIGH',
          routineId: acuteRoutine.id,
          routine: acuteRoutine,
        });
      }
    } else if (injury?.active) {
      const rehabRoutines: Record<string, string> = {
        'PATELLAR_TENDONITIS': 'patellar-tendon-loading',
        'ACL_REHAB': 'acl-stability-protocol',
        'RUNNERS_KNEE': 'pre-run-activation',
        'POST_SURGERY': 'acl-stability-protocol',
      };
      
      const routineId = rehabRoutines[injury.type];
      if (routineId) {
        const routine = PREMADE_ROUTINES.find(r => r.id === routineId);
        if (routine) {
          const validation = routineService.validateRoutine(routine, injury);
          if (validation.safe) {
            suggestions.push({
              id: `sugg_rehab_${injury.type}`,
              type: 'ROUTINE',
              title: routine.name,
              message: routine.description.substring(0, 120) + '...',
              actionLabel: 'View Routine',
              impact: 'HIGH',
              routineId: routine.id,
              routine,
            });
          }
        }
      }
    }

    if (flags.some(f => f.id === 'vol_spike')) {
      const flushRoutine = PREMADE_ROUTINES.find(r => r.id === 'post-leg-day-flush');
      if (flushRoutine) {
        suggestions.push({
          id: 'sugg_vol_routine',
          type: 'ROUTINE',
          title: 'Recovery Flush Protocol',
          message: 'You\'re over your volume limit. This routine increases blood flow to clear metabolites and reduce DOMS.',
          actionLabel: 'Start Flush',
          impact: 'MEDIUM',
          routineId: flushRoutine.id,
          routine: flushRoutine,
        });
      }
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
      const hipRoutine = PREMADE_ROUTINES.find(r => r.id === 'hip-mobility-flow');
      if (hipRoutine) {
        suggestions.push({
          id: 'sugg_stress_routine',
          type: 'ROUTINE',
          title: 'Stress Relief Flow',
          message: 'Mental stress impacts recovery. This hip mobility flow releases tension and promotes relaxation.',
          actionLabel: 'Start Flow',
          impact: 'MEDIUM',
          routineId: hipRoutine.id,
          routine: hipRoutine,
        });
      }
    }

    if (flags.some(f => f.id === 'soreness_high')) {
      const flushRoutine = PREMADE_ROUTINES.find(r => r.id === 'post-leg-day-flush');
      if (flushRoutine && !suggestions.find(s => s.routineId === 'post-leg-day-flush')) {
        suggestions.push({
          id: 'sugg_soreness_routine',
          type: 'ROUTINE',
          title: 'DOMS Relief Protocol',
          message: 'High soreness detected. Active recovery with foam rolling and stretching will speed recovery.',
          actionLabel: 'Start Recovery',
          impact: 'MEDIUM',
          routineId: flushRoutine.id,
          routine: flushRoutine,
        });
      }
    }

    if (suggestions.filter(s => s.type === 'ROUTINE').length === 0) {
      suggestions.push({
        id: 'sugg_sched_1',
        type: 'SCHEDULE',
        title: 'Time Optimization',
        message: 'Based on your schedule, I suggest compressing rest periods to 60s to finish your session efficiently.',
        actionLabel: 'Compress Workout',
        impact: 'LOW',
      });
    }

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

  public getRoutineSuggestions(injury?: InjuryProfile, flags?: string[]): Suggestion[] {
    console.log('[SuggestionService] Getting routine suggestions for injury:', injury?.type);
    
    const suggestions: Suggestion[] = [];
    const suggestedRoutines = routineService.getSuggestedRoutines(injury, flags);

    for (const routine of suggestedRoutines) {
      let isValidated = true;
      if (injury?.active) {
        const validation = routineService.validateRoutine(routine, injury);
        isValidated = validation.safe;
      }

      if (isValidated) {
        suggestions.push({
          id: `routine_${routine.id}`,
          type: 'ROUTINE',
          title: routine.name,
          message: routine.description.substring(0, 100) + '...',
          actionLabel: routine.type === 'INJURY_REHAB' ? 'Start Rehab' : 'Start Routine',
          impact: routine.type === 'INJURY_REHAB' ? 'HIGH' : 'MEDIUM',
          routineId: routine.id,
          routine,
        });
      }
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
