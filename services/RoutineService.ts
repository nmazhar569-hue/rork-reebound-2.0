import {
  Routine,
  RoutineItem,
  RoutineType,
  RoutineValidationResult,
  RoutineWarning,
  InjuryProfile,
  KneeInjuryType,
} from '@/types';
import { RECOVERY_LIBRARY } from '@/constants/recovery_seed';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_ROUTINES_KEY = '@rebound_custom_routines';

const INJURY_CONTRAINDICATIONS: Record<KneeInjuryType, string[]> = {
  'ACL_REHAB': ['impact', 'lateral_pivot', 'deep_flexion', 'plyometric', 'cutting', 'jumping'],
  'PATELLAR_TENDONITIS': ['impact', 'jumping', 'deep_squatting', 'high_load_knee_extension', 'plyometric'],
  'MENISCUS_TEAR': ['deep_flexion', 'rotational_load', 'impact', 'twisting'],
  'RUNNERS_KNEE': ['impact', 'downhill', 'excessive_knee_flexion', 'stairs'],
  'GENERAL_PAIN': ['impact', 'high_load'],
  'POST_SURGERY': ['impact', 'high_load', 'deep_flexion', 'lateral_movement', 'plyometric'],
};

const EXERCISE_RISK_MAP: Record<string, { risks: string[]; biomechanics: string }> = {
  'jump-squats': {
    risks: ['impact', 'plyometric', 'deep_flexion'],
    biomechanics: 'Landing forces create 3-5x bodyweight stress on patellar tendon and ACL',
  },
  'box-jumps': {
    risks: ['impact', 'plyometric'],
    biomechanics: 'Explosive knee extension and landing stress ligaments and tendons',
  },
  'burpees': {
    risks: ['impact', 'deep_flexion'],
    biomechanics: 'Rapid squat-to-jump transition creates shear forces on knee joint',
  },
  'deep-squat-hold': {
    risks: ['deep_flexion'],
    biomechanics: 'Full knee flexion compresses meniscus and stresses posterior structures',
  },
  'walking-lunges': {
    risks: ['deep_flexion', 'balance_demand'],
    biomechanics: 'Dynamic knee loading with balance challenge increases injury risk',
  },
  'bulgarian-split-squat': {
    risks: ['deep_flexion', 'balance_demand'],
    biomechanics: 'Single-leg loading with deep flexion stresses patellar tendon',
  },
  'jump-rope': {
    risks: ['impact', 'repetitive'],
    biomechanics: 'Repetitive landing forces accumulate stress on lower limb joints',
  },
};

export const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'patellar-tendon-loading',
    name: 'Patellar Tendon Loading Protocol',
    type: 'INJURY_REHAB',
    description: 'Progressive tendon loading using isometrics and eccentrics. Research shows isometric holds at 70% MVC for 45s reduce pain and improve tendon stiffness. Eccentric loading stimulates collagen synthesis.',
    items: [
      { exerciseId: 'spanish-squat', targetDuration: 45, targetSets: 4, order: 1, notes: 'Hold at 60-70° knee flexion' },
      { exerciseId: 'tke', targetReps: 15, targetSets: 3, order: 2, notes: 'Focus on full extension' },
      { exerciseId: 'step-downs', targetReps: 12, targetSets: 3, order: 3, notes: 'Control the descent - 3s down' },
      { exerciseId: 'single-leg-balance', targetDuration: 30, targetSets: 2, order: 4, notes: 'Slight knee bend' },
    ],
    tags: ['patellar_tendon', 'isometric', 'eccentric', 'vmo_focus'],
    estimatedDuration: 15,
    targetInjuries: ['PATELLAR_TENDONITIS', 'RUNNERS_KNEE'],
    contraindications: ['acute_inflammation', 'post_surgery_early'],
    difficulty: 'intermediate',
    createdBy: 'system',
  },
  {
    id: 'acl-stability-protocol',
    name: 'ACL Stability & Proprioception',
    type: 'INJURY_REHAB',
    description: 'Neuromuscular training to restore knee stability post-ACL injury. Focuses on hamstring co-activation and proprioceptive awareness - key factors in preventing re-injury.',
    items: [
      { exerciseId: 'quad-sets', targetReps: 15, targetSets: 3, order: 1, notes: 'Maximum quad contraction' },
      { exerciseId: 'slr-quad', targetReps: 12, targetSets: 3, order: 2, notes: 'Lock knee fully' },
      { exerciseId: 'clamshells', targetReps: 15, targetSets: 3, order: 3, notes: 'Control hip rotation' },
      { exerciseId: 'single-leg-balance', targetDuration: 45, targetSets: 3, order: 4, notes: 'Progress to eyes closed' },
      { exerciseId: 'heel-slides', targetReps: 15, targetSets: 2, order: 5, notes: 'Pain-free ROM only' },
    ],
    tags: ['safe_for_acl', 'proprioception', 'stability', 'vmo_focus'],
    estimatedDuration: 18,
    targetInjuries: ['ACL_REHAB', 'POST_SURGERY'],
    contraindications: ['acute_swelling', 'graft_healing'],
    difficulty: 'beginner',
    createdBy: 'system',
  },
  {
    id: 'cns-reset-protocol',
    name: 'CNS Reset Protocol',
    type: 'PERFORMANCE_RECOVERY',
    description: 'Parasympathetic activation routine for neural recovery. Diaphragmatic breathing + gentle mobility reduces cortisol and promotes recovery between high-intensity sessions.',
    items: [
      { exerciseId: 'childs-pose', targetDuration: 90, targetSets: 1, order: 1, notes: 'Deep belly breathing' },
      { exerciseId: 'cat-cow', targetReps: 15, targetSets: 1, order: 2, notes: 'Sync with breath' },
      { exerciseId: 'figure-four-stretch', targetDuration: 60, targetSets: 2, order: 3, notes: 'Relax into the stretch' },
      { exerciseId: '90-90-stretch', targetDuration: 60, targetSets: 2, order: 4, notes: 'No forcing - breathe' },
    ],
    tags: ['cns_reset', 'recovery', 'parasympathetic', 'stress_relief'],
    estimatedDuration: 12,
    difficulty: 'beginner',
    createdBy: 'system',
  },
  {
    id: 'post-leg-day-flush',
    name: 'Post-Leg Day Flush',
    type: 'PERFORMANCE_RECOVERY',
    description: 'Active recovery to reduce DOMS after leg training. Light movement increases blood flow to facilitate metabolite clearance and nutrient delivery to damaged muscle fibers.',
    items: [
      { exerciseId: 'foam-roll-quads', targetDuration: 90, targetSets: 1, order: 1, notes: 'Slow passes, pause on tender spots' },
      { exerciseId: 'foam-roll-it-band', targetDuration: 60, targetSets: 1, order: 2, notes: 'Breathe through discomfort' },
      { exerciseId: 'static-hamstring-stretch', targetDuration: 45, targetSets: 2, order: 3, notes: 'Relax into the stretch' },
      { exerciseId: 'couch-stretch', targetDuration: 60, targetSets: 2, order: 4, notes: 'Squeeze glute of back leg' },
      { exerciseId: 'pigeon-pose', targetDuration: 60, targetSets: 2, order: 5, notes: 'Hip opener - no bouncing' },
    ],
    tags: ['post_leg_day', 'doms_relief', 'blood_flow', 'flexibility'],
    estimatedDuration: 15,
    difficulty: 'beginner',
    createdBy: 'system',
  },
  {
    id: 'pre-run-activation',
    name: 'Pre-Run Knee Prep',
    type: 'PERFORMANCE_RECOVERY',
    description: 'Dynamic activation before running. Prepares the knee stabilizers and hip muscles to reduce patellofemoral stress during running gait.',
    items: [
      { exerciseId: 'ankle-circles', targetReps: 10, targetSets: 1, order: 1, notes: 'Both directions' },
      { exerciseId: 'dynamic-leg-swings', targetReps: 12, targetSets: 1, order: 2, notes: 'Front-back, then side-side' },
      { exerciseId: 'glute-bridge-warmup', targetReps: 12, targetSets: 2, order: 3, notes: 'Squeeze and hold 2s' },
      { exerciseId: 'band-walks', targetReps: 12, targetSets: 2, order: 4, notes: 'Stay low in quarter squat' },
      { exerciseId: 'bodyweight-squat-warmup', targetReps: 10, targetSets: 1, order: 5, notes: 'Control the descent' },
    ],
    tags: ['pre_run', 'warmup', 'glute_activation', 'knee_prep'],
    estimatedDuration: 10,
    targetInjuries: ['RUNNERS_KNEE'],
    difficulty: 'beginner',
    createdBy: 'system',
  },
  {
    id: 'acute-pain-relief',
    name: 'Acute Pain Relief Protocol',
    type: 'INJURY_REHAB',
    description: 'Gentle movements for flare-up days. Focus on circulation and neural calming without loading irritated structures. Movement is medicine - but the dose matters.',
    items: [
      { exerciseId: 'quad-sets', targetReps: 10, targetSets: 3, order: 1, notes: 'Gentle contraction - no pain' },
      { exerciseId: 'heel-slides', targetReps: 10, targetSets: 2, order: 2, notes: 'Only pain-free range' },
      { exerciseId: 'patellar-mobilization', targetDuration: 120, targetSets: 1, order: 3, notes: 'Very gentle pressure' },
      { exerciseId: 'ankle-circles', targetReps: 10, targetSets: 1, order: 4, notes: 'Keep knee still' },
    ],
    tags: ['acute_pain', 'gentle', 'flare_up', 'isometric'],
    estimatedDuration: 8,
    targetInjuries: ['PATELLAR_TENDONITIS', 'RUNNERS_KNEE', 'GENERAL_PAIN'],
    difficulty: 'beginner',
    createdBy: 'system',
  },
  {
    id: 'hip-mobility-flow',
    name: 'Hip Mobility Flow',
    type: 'PERFORMANCE_RECOVERY',
    description: 'Comprehensive hip mobility to take pressure off the knee. Tight hips alter movement mechanics and increase knee stress - this routine addresses the root cause.',
    items: [
      { exerciseId: 'hip-cars', targetReps: 5, targetSets: 2, order: 1, notes: 'Maximum controlled circles' },
      { exerciseId: '90-90-stretch', targetDuration: 60, targetSets: 2, order: 2, notes: 'Work both internal and external rotation' },
      { exerciseId: 'worlds-greatest-stretch', targetReps: 5, targetSets: 2, order: 3, notes: 'Reach and rotate' },
      { exerciseId: 'pigeon-pose', targetDuration: 60, targetSets: 2, order: 4, notes: 'Breathe into the stretch' },
      { exerciseId: 'brettzel-stretch', targetDuration: 45, targetSets: 2, order: 5, notes: 'Keep bottom knee down' },
    ],
    tags: ['hip_mobility', 'knee_friendly', 'flexibility', 'movement_quality'],
    estimatedDuration: 15,
    difficulty: 'intermediate',
    createdBy: 'system',
  },
];

class RoutineService {
  private customRoutines: Routine[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_ROUTINES_KEY);
      if (stored) {
        this.customRoutines = JSON.parse(stored);
      }
      this.initialized = true;
      console.log('[RoutineService] Initialized with', this.customRoutines.length, 'custom routines');
    } catch (error) {
      console.error('[RoutineService] Failed to load custom routines:', error);
      this.customRoutines = [];
      this.initialized = true;
    }
  }

  getAllRoutines(): Routine[] {
    return [...PREMADE_ROUTINES, ...this.customRoutines];
  }

  getPremadeRoutines(): Routine[] {
    return PREMADE_ROUTINES;
  }

  getCustomRoutines(): Routine[] {
    return this.customRoutines;
  }

  getRoutinesByType(type: RoutineType): Routine[] {
    return this.getAllRoutines().filter(r => r.type === type);
  }

  getRoutinesForInjury(injuryType: KneeInjuryType): Routine[] {
    return this.getAllRoutines().filter(r => 
      r.targetInjuries?.includes(injuryType) || 
      r.tags.some(tag => tag.includes('knee_friendly') || tag.includes('safe_for_acl'))
    );
  }

  getRoutineById(id: string): Routine | undefined {
    return this.getAllRoutines().find(r => r.id === id);
  }

  getSuggestedRoutines(injury?: InjuryProfile, flags?: string[]): Routine[] {
    console.log('[RoutineService] Getting suggested routines for injury:', injury?.type, 'flags:', flags);
    
    const suggestions: Routine[] = [];

    if (flags?.includes('vol_spike') || flags?.includes('hrv_tanked')) {
      const cnsReset = this.getRoutineById('cns-reset-protocol');
      if (cnsReset) suggestions.push(cnsReset);
    }

    if (injury?.active && injury.painLevel >= 6) {
      const acutePain = this.getRoutineById('acute-pain-relief');
      if (acutePain) suggestions.push(acutePain);
    }

    if (injury?.active) {
      const injuryRoutines = this.getRoutinesForInjury(injury.type);
      const validated = injuryRoutines.filter(r => {
        const result = this.validateRoutine(r, injury);
        return result.safe;
      });
      suggestions.push(...validated.slice(0, 2));
    }

    if (suggestions.length < 3) {
      const performanceRoutines = this.getRoutinesByType('PERFORMANCE_RECOVERY');
      for (const routine of performanceRoutines) {
        if (!suggestions.find(s => s.id === routine.id)) {
          suggestions.push(routine);
          if (suggestions.length >= 3) break;
        }
      }
    }

    return suggestions.slice(0, 4);
  }

  validateRoutine(routine: Routine, injury: InjuryProfile): RoutineValidationResult {
    console.log('[RoutineService] Validating routine:', routine.name, 'for injury:', injury.type);
    
    const warnings: RoutineWarning[] = [];
    const safeItems: string[] = [];
    const unsafeItems: string[] = [];
    const suggestedAlternatives: Record<string, string[]> = {};

    const injuryContraindications = INJURY_CONTRAINDICATIONS[injury.type] || [];

    for (const item of routine.items) {
      const exercise = RECOVERY_LIBRARY.find(e => e.id === item.exerciseId);
      const exerciseName = exercise?.name || item.exerciseId;

      const riskInfo = EXERCISE_RISK_MAP[item.exerciseId];
      
      if (riskInfo) {
        const conflictingRisks = riskInfo.risks.filter(risk => 
          injuryContraindications.includes(risk)
        );

        if (conflictingRisks.length > 0) {
          const severity = this.calculateSeverity(conflictingRisks, injury.painLevel);
          
          warnings.push({
            exerciseId: item.exerciseId,
            exerciseName,
            severity,
            message: `This exercise involves ${conflictingRisks.join(', ')} which is contraindicated for ${injury.type.replace(/_/g, ' ').toLowerCase()}.`,
            biomechanicalReason: riskInfo.biomechanics,
          });

          unsafeItems.push(item.exerciseId);
          
          if (exercise?.alternatives) {
            suggestedAlternatives[item.exerciseId] = exercise.alternatives;
          }
        } else {
          safeItems.push(item.exerciseId);
        }
      } else if (exercise) {
        const hasContraindication = exercise.contraindications.some(contra =>
          injuryContraindications.some(ic => contra.toLowerCase().includes(ic.toLowerCase()))
        );

        if (hasContraindication) {
          warnings.push({
            exerciseId: item.exerciseId,
            exerciseName,
            severity: 'caution',
            message: `Exercise has noted contraindications that may apply to your condition.`,
            biomechanicalReason: 'Review form carefully and stop if pain increases.',
          });
          unsafeItems.push(item.exerciseId);
        } else {
          safeItems.push(item.exerciseId);
        }
      } else {
        safeItems.push(item.exerciseId);
      }
    }

    if (injury.painLevel >= 7) {
      for (const item of routine.items) {
        const exercise = RECOVERY_LIBRARY.find(e => e.id === item.exerciseId);
        if (exercise && exercise.impactLevel !== 'NONE' && !unsafeItems.includes(item.exerciseId)) {
          warnings.push({
            exerciseId: item.exerciseId,
            exerciseName: exercise.name,
            severity: 'warning',
            message: 'Your pain level is elevated. Consider skipping non-isometric exercises today.',
            biomechanicalReason: 'High pain indicates tissue irritation - loading may worsen symptoms.',
          });
        }
      }
    }

    const overallRisk = this.calculateOverallRisk(warnings, unsafeItems.length, routine.items.length);
    const safe = overallRisk !== 'high' && unsafeItems.length < routine.items.length / 2;

    console.log('[RoutineService] Validation result - safe:', safe, 'risk:', overallRisk, 'warnings:', warnings.length);

    return {
      safe,
      overallRisk,
      warnings,
      safeItems,
      unsafeItems,
      suggestedAlternatives,
    };
  }

  private calculateSeverity(risks: string[], painLevel: number): 'caution' | 'warning' | 'danger' {
    const highRiskFactors = ['impact', 'plyometric', 'lateral_pivot'];
    const hasHighRisk = risks.some(r => highRiskFactors.includes(r));

    if (hasHighRisk && painLevel >= 5) return 'danger';
    if (hasHighRisk || painLevel >= 6) return 'warning';
    return 'caution';
  }

  private calculateOverallRisk(
    warnings: RoutineWarning[], 
    unsafeCount: number, 
    totalCount: number
  ): 'low' | 'moderate' | 'high' {
    const dangerCount = warnings.filter(w => w.severity === 'danger').length;
    const warningCount = warnings.filter(w => w.severity === 'warning').length;

    if (dangerCount >= 2 || unsafeCount >= totalCount / 2) return 'high';
    if (dangerCount >= 1 || warningCount >= 2) return 'moderate';
    return 'low';
  }

  async createCustomRoutine(
    name: string, 
    items: RoutineItem[], 
    description?: string,
    tags?: string[]
  ): Promise<Routine> {
    console.log('[RoutineService] Creating custom routine:', name);

    const totalDuration = items.reduce((sum, item) => {
      const exercise = RECOVERY_LIBRARY.find(e => e.id === item.exerciseId);
      const duration = item.targetDuration || (exercise?.duration || 30);
      const sets = item.targetSets || 1;
      return sum + (duration * sets);
    }, 0);

    const routine: Routine = {
      id: `custom-${Date.now()}`,
      name,
      type: 'CUSTOM',
      description: description || 'Custom routine created by user',
      items: items.map((item, index) => ({ ...item, order: index + 1 })),
      tags: tags || ['custom'],
      estimatedDuration: Math.ceil(totalDuration / 60),
      difficulty: 'intermediate',
      createdAt: new Date().toISOString(),
      createdBy: 'user',
    };

    this.customRoutines.push(routine);
    await this.saveCustomRoutines();

    return routine;
  }

  async updateCustomRoutine(id: string, updates: Partial<Routine>): Promise<Routine | null> {
    const index = this.customRoutines.findIndex(r => r.id === id);
    if (index === -1) {
      console.warn('[RoutineService] Routine not found:', id);
      return null;
    }

    this.customRoutines[index] = { ...this.customRoutines[index], ...updates };
    await this.saveCustomRoutines();
    
    return this.customRoutines[index];
  }

  async deleteCustomRoutine(id: string): Promise<boolean> {
    const index = this.customRoutines.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.customRoutines.splice(index, 1);
    await this.saveCustomRoutines();
    
    console.log('[RoutineService] Deleted routine:', id);
    return true;
  }

  private async saveCustomRoutines(): Promise<void> {
    try {
      await AsyncStorage.setItem(CUSTOM_ROUTINES_KEY, JSON.stringify(this.customRoutines));
      console.log('[RoutineService] Saved', this.customRoutines.length, 'custom routines');
    } catch (error) {
      console.error('[RoutineService] Failed to save custom routines:', error);
    }
  }

  getExerciseDetails(exerciseId: string) {
    return RECOVERY_LIBRARY.find(e => e.id === exerciseId);
  }

  getRoutineExercises(routine: Routine) {
    return routine.items.map(item => ({
      ...item,
      exercise: this.getExerciseDetails(item.exerciseId),
    }));
  }
}

export const routineService = new RoutineService();
