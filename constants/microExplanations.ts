export interface MicroExplanation {
  id: string;
  trigger: 'workout' | 'program_change' | 'pain_input' | 'fatigue_input' | 'readiness' | 'volume_change' | 'recovery' | 'exercise_info';
  short: string;
  expanded: string;
  category?: 'adaptation' | 'tissue' | 'recovery' | 'movement' | 'load';
  priority?: number;
}

export const MICRO_EXPLANATIONS: Record<string, MicroExplanation> = {
  volume_reduced_pain: {
    id: 'volume_reduced_pain',
    trigger: 'pain_input',
    short: "Today's session is lighter.",
    expanded: "Your body shared that pain is higher. Adjusting volume based on that is part of training wisely, not a step backward.",
    category: 'recovery',
    priority: 1,
  },
  volume_reduced_fatigue: {
    id: 'volume_reduced_fatigue',
    trigger: 'fatigue_input',
    short: "A lighter day today.",
    expanded: "Fatigue is information. Responding to it builds long-term capacity. Progress isn't always forward motion — sometimes it's knowing when to ease back.",
    category: 'recovery',
    priority: 1,
  },
  volume_reduced_sleep: {
    id: 'volume_reduced_sleep',
    trigger: 'readiness',
    short: "Adjusted for sleep.",
    expanded: "Sleep is when repair happens. With less of it, a shorter or lighter session can be more productive than pushing through.",
    category: 'recovery',
    priority: 1,
  },
  tendon_adaptation: {
    id: 'tendon_adaptation',
    trigger: 'workout',
    short: "Tendons adapt slowly.",
    expanded: "Tendons remodel 3-5x slower than muscles. What feels ready muscularly may still be catching up at the connective tissue level.",
    category: 'adaptation',
    priority: 2,
  },
  rest_between_sets: {
    id: 'rest_between_sets',
    trigger: 'workout',
    short: "Rest supports quality.",
    expanded: "Adequate rest between sets helps tissues recover and maintain good movement patterns. Taking time isn't slowing down — it's training well.",
    category: 'recovery',
    priority: 3,
  },
  modified_range: {
    id: 'modified_range',
    trigger: 'workout',
    short: "Modified range for comfort.",
    expanded: "Working in a comfortable range builds strength effectively while respecting your joint's current tolerance.",
    category: 'movement',
    priority: 1,
  },
  progressive_overload: {
    id: 'progressive_overload',
    trigger: 'program_change',
    short: "Gradual progression.",
    expanded: "Adding load slowly gives tissues time to adapt. Consistency over time tends to outperform intensity in bursts.",
    category: 'load',
    priority: 2,
  },
  deload_week: {
    id: 'deload_week',
    trigger: 'program_change',
    short: "Recovery week.",
    expanded: "Lighter weeks let accumulated fatigue clear. Adaptation often consolidates during rest — you may feel stronger after.",
    category: 'recovery',
    priority: 1,
  },
  warmup_importance: {
    id: 'warmup_importance',
    trigger: 'recovery',
    short: "Warmup prepares tissues.",
    expanded: "Warming up increases blood flow and joint lubrication. It's not wasted time — it's setting up better movement quality.",
    category: 'movement',
    priority: 2,
  },
  cooldown_recovery: {
    id: 'cooldown_recovery',
    trigger: 'recovery',
    short: "Cooldown supports recovery.",
    expanded: "Gentle movement after training helps begin the recovery process. A few minutes now can make tomorrow's session feel better.",
    category: 'recovery',
    priority: 3,
  },
  pain_is_information: {
    id: 'pain_is_information',
    trigger: 'pain_input',
    short: "Pain is information.",
    expanded: "Your body communicates through sensation. Noting it helps guide adjustments — it's useful data, not a judgment.",
    category: 'recovery',
    priority: 1,
  },
  confidence_matters: {
    id: 'confidence_matters',
    trigger: 'fatigue_input',
    short: "How you feel matters.",
    expanded: "Confidence affects movement quality. When you trust your body, you tend to move better. This is factored in.",
    category: 'movement',
    priority: 2,
  },
  returning_after_break: {
    id: 'returning_after_break',
    trigger: 'readiness',
    short: "Welcome back.",
    expanded: "Time away isn't lost progress. Your body adapts to where you are now. Starting from here is all that matters.",
    category: 'adaptation',
    priority: 1,
  },
  high_training_load: {
    id: 'high_training_load',
    trigger: 'readiness',
    short: "Consistency is adding up.",
    expanded: "Your body has been working. Rest is when adaptation consolidates — what you've done is already enough.",
    category: 'recovery',
    priority: 1,
  },
  knee_safe_exercise: {
    id: 'knee_safe_exercise',
    trigger: 'workout',
    short: "Knee-friendly selection.",
    expanded: "This exercise was chosen to minimize stress on sensitive structures while still building strength and mobility.",
    category: 'movement',
    priority: 1,
  },
  substitution_available: {
    id: 'substitution_available',
    trigger: 'workout',
    short: "Alternatives available.",
    expanded: "If something doesn't feel right, substitutions are there. You decide what works for your body today.",
    category: 'movement',
    priority: 2,
  },

  // Adaptation timeline explanations
  muscle_adaptation_timeline: {
    id: 'muscle_adaptation_timeline',
    trigger: 'exercise_info',
    short: "Muscles respond within weeks.",
    expanded: "Muscle tissue adapts relatively quickly — noticeable changes in 2-4 weeks. But this speed can mask that deeper structures need longer.",
    category: 'adaptation',
    priority: 3,
  },
  tendon_adaptation_timeline: {
    id: 'tendon_adaptation_timeline',
    trigger: 'exercise_info',
    short: "Tendons need months, not weeks.",
    expanded: "Tendon remodeling takes 3-6 months of consistent loading. Patience here prevents setbacks later.",
    category: 'adaptation',
    priority: 2,
  },
  joint_cartilage_timeline: {
    id: 'joint_cartilage_timeline',
    trigger: 'exercise_info',
    short: "Cartilage adapts slowest.",
    expanded: "Joint cartilage has limited blood supply and adapts over 6-12 months. Gradual loading protects these structures.",
    category: 'adaptation',
    priority: 2,
  },
  neural_adaptation: {
    id: 'neural_adaptation',
    trigger: 'workout',
    short: "Your nervous system learns first.",
    expanded: "Early strength gains come from your brain getting better at activating muscles. Tissue changes follow.",
    category: 'adaptation',
    priority: 3,
  },

  // What it stresses explanations
  compound_movement_load: {
    id: 'compound_movement_load',
    trigger: 'exercise_info',
    short: "This works multiple joints.",
    expanded: "Compound movements distribute load across joints. More efficient for building strength, but requires good form to protect all structures.",
    category: 'load',
    priority: 2,
  },
  isolation_movement_load: {
    id: 'isolation_movement_load',
    trigger: 'exercise_info',
    short: "Focused stress on one area.",
    expanded: "Isolation work targets specific muscles. Useful for addressing weak points without loading sensitive joints elsewhere.",
    category: 'load',
    priority: 3,
  },
  eccentric_stress: {
    id: 'eccentric_stress',
    trigger: 'exercise_info',
    short: "The lowering phase builds strength.",
    expanded: "Eccentric (lowering) movement creates more muscle tension and is effective for tendon health — but also causes more soreness initially.",
    category: 'tissue',
    priority: 2,
  },
  isometric_hold: {
    id: 'isometric_hold',
    trigger: 'exercise_info',
    short: "Holds build tendon resilience.",
    expanded: "Isometric contractions load tendons without joint movement. Often used early in rehab or to build capacity at specific angles.",
    category: 'tissue',
    priority: 2,
  },
  high_compression_load: {
    id: 'high_compression_load',
    trigger: 'exercise_info',
    short: "This compresses the joint.",
    expanded: "Deep positions or heavy loads create compressive forces. Cartilage generally tolerates compression well, but sensitive joints may need modified depth.",
    category: 'load',
    priority: 1,
  },
  shear_force_info: {
    id: 'shear_force_info',
    trigger: 'exercise_info',
    short: "This creates shear forces.",
    expanded: "Shear forces occur when tissues slide against each other. Some positions create more shear — not inherently bad, but worth noting if sensitive.",
    category: 'load',
    priority: 1,
  },

  // Recovery and tissue health
  sleep_tissue_repair: {
    id: 'sleep_tissue_repair',
    trigger: 'readiness',
    short: "Sleep repairs tissue.",
    expanded: "Growth hormone peaks during deep sleep, driving tissue repair. Poor sleep slows recovery — adjusting volume accounts for this.",
    category: 'recovery',
    priority: 2,
  },
  inflammation_response: {
    id: 'inflammation_response',
    trigger: 'pain_input',
    short: "Some inflammation is normal.",
    expanded: "Mild inflammation after training signals repair is happening. Persistent or sharp pain is different — that's worth noting.",
    category: 'tissue',
    priority: 2,
  },
  blood_flow_healing: {
    id: 'blood_flow_healing',
    trigger: 'recovery',
    short: "Movement brings blood flow.",
    expanded: "Light movement increases circulation to healing tissues. This is why gentle activity often helps more than complete rest.",
    category: 'recovery',
    priority: 2,
  },
};

export type ExplanationContext = {
  painLevel?: number;
  confidenceLevel?: string;
  sleepScore?: number;
  recentWorkouts?: number;
  isReturning?: boolean;
  intensityModifier?: number;
  exerciseKneeSafeLevel?: 'safe' | 'modified' | 'caution';
  hasSubstitution?: boolean;
  movementType?: 'compound' | 'isolation';
  loadType?: 'eccentric' | 'isometric' | 'concentric';
  jointStress?: 'compression' | 'shear' | 'minimal';
  seenExplanations?: string[];
};

function prioritizeUnseen(
  explanations: MicroExplanation[],
  seenIds: string[]
): MicroExplanation[] {
  const unseen = explanations.filter(e => !seenIds.includes(e.id));
  const seen = explanations.filter(e => seenIds.includes(e.id));
  
  unseen.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
  seen.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
  
  return [...unseen, ...seen];
}

export function getRelevantExplanations(
  trigger: MicroExplanation['trigger'],
  context: ExplanationContext
): MicroExplanation[] {
  const candidates: MicroExplanation[] = [];
  const seenIds = context.seenExplanations ?? [];

  if (trigger === 'pain_input') {
    if (context.painLevel && context.painLevel > 5) {
      candidates.push(MICRO_EXPLANATIONS.volume_reduced_pain);
    }
    candidates.push(MICRO_EXPLANATIONS.pain_is_information);
    if (context.painLevel && context.painLevel > 3) {
      candidates.push(MICRO_EXPLANATIONS.inflammation_response);
    }
  }

  if (trigger === 'fatigue_input') {
    if (context.confidenceLevel === 'low') {
      candidates.push(MICRO_EXPLANATIONS.volume_reduced_fatigue);
    }
    candidates.push(MICRO_EXPLANATIONS.confidence_matters);
  }

  if (trigger === 'readiness') {
    if (context.sleepScore && context.sleepScore < 60) {
      candidates.push(MICRO_EXPLANATIONS.volume_reduced_sleep);
      candidates.push(MICRO_EXPLANATIONS.sleep_tissue_repair);
    }
    if (context.isReturning) {
      candidates.push(MICRO_EXPLANATIONS.returning_after_break);
    }
    if (context.recentWorkouts && context.recentWorkouts >= 5) {
      candidates.push(MICRO_EXPLANATIONS.high_training_load);
    }
  }

  if (trigger === 'workout') {
    if (context.exerciseKneeSafeLevel === 'modified' || context.exerciseKneeSafeLevel === 'caution') {
      candidates.push(MICRO_EXPLANATIONS.modified_range);
    }
    if (context.exerciseKneeSafeLevel === 'safe') {
      candidates.push(MICRO_EXPLANATIONS.knee_safe_exercise);
    }
    if (context.hasSubstitution) {
      candidates.push(MICRO_EXPLANATIONS.substitution_available);
    }
    candidates.push(MICRO_EXPLANATIONS.tendon_adaptation);
    candidates.push(MICRO_EXPLANATIONS.neural_adaptation);
  }

  if (trigger === 'exercise_info') {
    if (context.movementType === 'compound') {
      candidates.push(MICRO_EXPLANATIONS.compound_movement_load);
    } else if (context.movementType === 'isolation') {
      candidates.push(MICRO_EXPLANATIONS.isolation_movement_load);
    }
    
    if (context.loadType === 'eccentric') {
      candidates.push(MICRO_EXPLANATIONS.eccentric_stress);
    } else if (context.loadType === 'isometric') {
      candidates.push(MICRO_EXPLANATIONS.isometric_hold);
    }
    
    if (context.jointStress === 'compression') {
      candidates.push(MICRO_EXPLANATIONS.high_compression_load);
    } else if (context.jointStress === 'shear') {
      candidates.push(MICRO_EXPLANATIONS.shear_force_info);
    }
    
    candidates.push(MICRO_EXPLANATIONS.muscle_adaptation_timeline);
    candidates.push(MICRO_EXPLANATIONS.tendon_adaptation_timeline);
    candidates.push(MICRO_EXPLANATIONS.joint_cartilage_timeline);
  }

  if (trigger === 'program_change') {
    if (context.intensityModifier && context.intensityModifier < 1) {
      candidates.push(MICRO_EXPLANATIONS.deload_week);
    }
    candidates.push(MICRO_EXPLANATIONS.progressive_overload);
  }

  if (trigger === 'recovery') {
    candidates.push(MICRO_EXPLANATIONS.warmup_importance);
    candidates.push(MICRO_EXPLANATIONS.cooldown_recovery);
    candidates.push(MICRO_EXPLANATIONS.blood_flow_healing);
  }

  const prioritized = prioritizeUnseen(candidates, seenIds);
  return prioritized.slice(0, 2);
}

export function getExplanationById(id: string): MicroExplanation | null {
  return MICRO_EXPLANATIONS[id] ?? null;
}

export function getAdaptationExplanations(): MicroExplanation[] {
  return Object.values(MICRO_EXPLANATIONS).filter(e => e.category === 'adaptation');
}
