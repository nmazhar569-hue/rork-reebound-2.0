import { InjuryType, JointStressLevel } from '@/types';

export type JointArea = 'knee' | 'hip' | 'ankle' | 'shoulder' | 'elbow' | 'wrist' | 'spine';

export type LoadCharacteristic = 
  | 'compressive'
  | 'shear'
  | 'tensile'
  | 'rotational'
  | 'impact'
  | 'eccentric'
  | 'isometric';

export type TissueType = 'muscle' | 'tendon' | 'ligament' | 'cartilage' | 'bone';

export interface TissueHealingTimeline {
  tissue: TissueType;
  acutePhase: string;
  repairPhase: string;
  remodelingPhase: string;
  fullAdaptation: string;
  notes: string;
}

export interface JointLoadContext {
  joint: JointArea;
  stressLevel: JointStressLevel;
  loadTypes: LoadCharacteristic[];
  rangeOfMotion: 'full' | 'partial' | 'minimal';
  neutralDescription: string;
}

export interface InjuryAwareExerciseContext {
  exerciseId: string;
  jointLoads: JointLoadContext[];
  fatigueIndicators: string[];
  overuseWarnings: string[];
  modificationCues: string[];
  whenToReduce: string[];
}

export interface RecoveryPrinciple {
  id: string;
  title: string;
  description: string;
  application: string;
}

export const TISSUE_HEALING_TIMELINES: TissueHealingTimeline[] = [
  {
    tissue: 'muscle',
    acutePhase: '1-3 days',
    repairPhase: '3-21 days',
    remodelingPhase: '21-60 days',
    fullAdaptation: '2-3 months',
    notes: 'Muscles adapt relatively quickly. Light movement often helps recovery.',
  },
  {
    tissue: 'tendon',
    acutePhase: '3-7 days',
    repairPhase: '3-6 weeks',
    remodelingPhase: '6 weeks - 6 months',
    fullAdaptation: '6-12 months',
    notes: 'Tendons adapt slower than muscles. Progressive loading is key — too little or too much delays healing.',
  },
  {
    tissue: 'ligament',
    acutePhase: '3-7 days',
    repairPhase: '3-6 weeks',
    remodelingPhase: '6 weeks - 12 months',
    fullAdaptation: '9-18 months',
    notes: 'Ligaments require patience. Stability work supports recovery without overstressing.',
  },
  {
    tissue: 'cartilage',
    acutePhase: '1-2 weeks',
    repairPhase: 'Limited regeneration',
    remodelingPhase: 'Ongoing management',
    fullAdaptation: 'Variable — often permanent adaptation needed',
    notes: 'Cartilage has limited blood supply. Load management and joint health become long-term priorities.',
  },
  {
    tissue: 'bone',
    acutePhase: '1-2 weeks',
    repairPhase: '2-6 weeks',
    remodelingPhase: '6 weeks - 6 months',
    fullAdaptation: '6-12 months for full strength',
    notes: 'Bone responds well to progressive loading after initial healing. Impact can be reintroduced gradually.',
  },
];

export const RECOVERY_PRINCIPLES: RecoveryPrinciple[] = [
  {
    id: 'pain-vs-damage',
    title: 'Pain is information, not always damage',
    description: 'Pain signals can indicate tissue stress, fatigue, or sensitivity — not necessarily harm. Context matters.',
    application: 'If pain is mild (1-3/10), stays stable, and resolves within 24 hours, it may be safe to continue with awareness.',
  },
  {
    id: 'load-management',
    title: 'Load management over avoidance',
    description: 'Tissues need appropriate stress to heal and strengthen. Complete rest can sometimes delay recovery.',
    application: 'Find the right dose: enough to stimulate adaptation, not so much it overwhelms healing capacity.',
  },
  {
    id: 'gradual-progression',
    title: 'Gradual progression protects tissue',
    description: 'Sudden increases in volume, intensity, or frequency are common causes of overuse issues.',
    application: 'Increase one variable at a time. A 10% weekly increase is often cited as a general guideline.',
  },
  {
    id: 'symptom-monitoring',
    title: 'Track response, not just performance',
    description: 'How you feel during, after, and the next day matters more than hitting numbers.',
    application: 'Note any increase in symptoms within 24 hours. Adjust the next session accordingly.',
  },
  {
    id: 'tissue-adaptation-lag',
    title: 'Tendons lag behind muscles',
    description: 'Strength gains often come faster than tendon adaptation. This mismatch can lead to overload.',
    application: 'After strength increases, maintain loads for 2-3 weeks before pushing further.',
  },
  {
    id: 'rest-as-training',
    title: 'Rest is part of the program',
    description: 'Adaptation happens during recovery, not just during training. Skipping rest delays progress.',
    application: 'Trust rest days. They are not lost days — they are when your body builds back stronger.',
  },
];

export const KNEE_INJURY_CONTEXT: Record<InjuryType, {
  primaryConcerns: string[];
  loadConsiderations: string[];
  movementGuidance: string[];
  timelineExpectation: string;
}> = {
  acl: {
    primaryConcerns: [
      'Rotational stability',
      'Sudden direction changes',
      'Landing mechanics',
    ],
    loadConsiderations: [
      'Higher shear forces at certain knee angles',
      'Pivoting and cutting movements',
      'Single-leg landing control',
    ],
    movementGuidance: [
      'Controlled, predictable movements are generally better tolerated',
      'Build single-leg strength progressively',
      'Landing mechanics training supports long-term function',
    ],
    timelineExpectation: 'Full adaptation typically takes 9-12 months post-surgery. Strength and confidence often return before tissue is fully remodeled.',
  },
  meniscus: {
    primaryConcerns: [
      'Deep knee flexion',
      'Twisting under load',
      'Compressive forces at end ranges',
    ],
    loadConsiderations: [
      'Deeper positions increase joint compression',
      'Rotational load in bent-knee positions',
      'Sustained deep positions may cause discomfort',
    ],
    movementGuidance: [
      'Partial range exercises often well-tolerated',
      'Avoid forcing depth that causes symptoms',
      'Strengthening in mid-ranges supports joint health',
    ],
    timelineExpectation: 'Recovery varies widely based on tear type and treatment. Some adapt in weeks, others in months.',
  },
  patella: {
    primaryConcerns: [
      'Anterior knee loading',
      'Stairs and inclines',
      'Prolonged bent-knee positions',
    ],
    loadConsiderations: [
      'Quadriceps-dominant exercises increase patellar stress',
      'Higher forces at deeper knee flexion angles',
      'Repetitive loading can aggravate symptoms',
    ],
    movementGuidance: [
      'Hip and glute strength often reduces knee demand',
      'Partial squats and avoiding deep flexion may help',
      'Isometric holds at comfortable angles can build tolerance',
    ],
    timelineExpectation: 'Patellar issues often respond well to progressive loading. Improvement may take 6-12 weeks of consistent work.',
  },
  general_pain: {
    primaryConcerns: [
      'Variable symptom patterns',
      'Multiple potential contributors',
      'Sensitivity fluctuations',
    ],
    loadConsiderations: [
      'Symptoms may not correlate directly with load',
      'Fatigue and stress can amplify pain perception',
      'Finding consistent patterns takes time',
    ],
    movementGuidance: [
      'Experiment with different exercises to find what feels right',
      'Track patterns between activity and symptoms',
      'Gentle movement often helps more than complete rest',
    ],
    timelineExpectation: 'General knee discomfort often improves with consistent, appropriate loading. Trust gradual progress.',
  },
  post_surgery: {
    primaryConcerns: [
      'Following rehabilitation protocol',
      'Respecting healing phases',
      'Building confidence alongside strength',
    ],
    loadConsiderations: [
      'Early phases: protect healing tissue',
      'Middle phases: progressive loading within guidelines',
      'Later phases: building toward full function',
    ],
    movementGuidance: [
      'Work with your rehabilitation timeline',
      'Celebrate small progressions — they add up',
      'Setbacks are normal. They are not failures.',
    ],
    timelineExpectation: 'Surgical recovery follows tissue healing timelines. Patience and consistency are your allies.',
  },
};

export const LOAD_CHARACTERISTIC_DESCRIPTIONS: Record<LoadCharacteristic, string> = {
  compressive: 'Pressing forces through the joint surfaces',
  shear: 'Sliding forces across joint structures',
  tensile: 'Pulling or stretching forces on tissues',
  rotational: 'Twisting forces around the joint axis',
  impact: 'Sudden forces from landing or striking',
  eccentric: 'Lengthening under load — often higher tissue stress',
  isometric: 'Holding position — generally lower tissue stress',
};

export const JOINT_DEMAND_LABELS: Record<JointStressLevel, {
  label: string;
  description: string;
  color: string;
}> = {
  low: {
    label: 'Lower demand',
    description: 'Generally well-tolerated. Minimal joint stress.',
    color: '#4ECDC4',
  },
  moderate: {
    label: 'Moderate demand',
    description: 'Some joint involvement. Monitor response.',
    color: '#FFB74D',
  },
  high: {
    label: 'Higher demand',
    description: 'More joint stress. May need modification based on symptoms.',
    color: '#FF8A80',
  },
};

export const EXERCISE_INJURY_CONTEXT: Record<string, InjuryAwareExerciseContext> = {
  'squat-back': {
    exerciseId: 'squat-back',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'shear'],
        rangeOfMotion: 'full',
        neutralDescription: 'Higher knee joint demand, especially at depth',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Moderate hip involvement throughout range',
      },
      {
        joint: 'spine',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Spinal loading from bar position',
      },
    ],
    fatigueIndicators: [
      'Form breakdown in later sets',
      'Knees caving inward',
      'Forward lean increasing',
      'Unable to maintain depth',
    ],
    overuseWarnings: [
      'Persistent anterior knee discomfort lasting beyond 24 hours',
      'Gradual increase in symptoms week over week',
      'Discomfort starting earlier in workout over time',
    ],
    modificationCues: [
      'Limit depth to comfortable range',
      'Reduce load and focus on control',
      'Try box squats for consistent depth',
      'Consider goblet squat as alternative',
    ],
    whenToReduce: [
      'Pain increases during the movement',
      'Symptoms persist beyond 48 hours',
      'Compensating with other body parts',
    ],
  },
  'squat-front': {
    exerciseId: 'squat-front',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'shear'],
        rangeOfMotion: 'full',
        neutralDescription: 'Higher anterior knee demand due to upright torso',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip flexion required throughout',
      },
    ],
    fatigueIndicators: [
      'Elbows dropping',
      'Forward collapse of torso',
      'Knees tracking inconsistently',
    ],
    overuseWarnings: [
      'Anterior knee sensitivity between sessions',
      'Quadriceps feeling persistently tight',
    ],
    modificationCues: [
      'Goblet squat maintains similar pattern with less load',
      'Reduce depth if anterior knee discomfort appears',
      'Focus on eccentric control',
    ],
    whenToReduce: [
      'Anterior knee pain during descent',
      'Wrist or elbow discomfort affecting form',
    ],
  },
  'squat-goblet': {
    exerciseId: 'squat-goblet',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Moderate knee involvement with lighter loads',
      },
      {
        joint: 'hip',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip mobility friendly',
      },
    ],
    fatigueIndicators: [
      'Grip fatigue affecting position',
      'Rounding of upper back',
    ],
    overuseWarnings: [
      'Generally well-tolerated — monitor for cumulative volume effects',
    ],
    modificationCues: [
      'Great regression from heavier squat variations',
      'Can use for warm-up or main movement',
    ],
    whenToReduce: [
      'Symptoms appear at any depth — reduce range',
    ],
  },
  'rdl': {
    exerciseId: 'rdl',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: ['tensile'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Minimal knee flexion — primarily hip movement',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile', 'compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip hinge pattern with hamstring lengthening',
      },
      {
        joint: 'spine',
        stressLevel: 'moderate',
        loadTypes: ['shear'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Spinal stability required throughout',
      },
    ],
    fatigueIndicators: [
      'Lower back rounding',
      'Grip failing before target reps',
      'Balance shifting forward',
    ],
    overuseWarnings: [
      'Lower back tightness persisting between sessions',
      'Hamstring strain without recovery',
    ],
    modificationCues: [
      'Keep knees soft but not deeply bent',
      'Focus on hip push-back, not forward lean',
    ],
    whenToReduce: [
      'Lower back discomfort during movement',
      'Hamstring tightness limiting range',
    ],
  },
  'bulgarian-split-squat': {
    exerciseId: 'bulgarian-split-squat',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'shear'],
        rangeOfMotion: 'full',
        neutralDescription: 'Higher single-leg knee demand with balance component',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Rear leg hip flexor stretch, front leg hip load',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Ankle mobility required for depth',
      },
    ],
    fatigueIndicators: [
      'Balance deteriorating',
      'Front knee collapsing inward',
      'Unable to maintain depth consistency',
    ],
    overuseWarnings: [
      'Rear hip flexor strain',
      'Persistent knee soreness on front leg',
    ],
    modificationCues: [
      'Lower rear foot elevation',
      'Use support for balance',
      'Reverse lunges as alternative',
    ],
    whenToReduce: [
      'Knee pain at depth',
      'Hip flexor discomfort on rear leg',
      'Balance too compromised for controlled reps',
    ],
  },
  'walking-lunges': {
    exerciseId: 'walking-lunges',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'shear', 'eccentric'],
        rangeOfMotion: 'full',
        neutralDescription: 'Dynamic knee loading with forward momentum',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip flexor stretch and glute engagement',
      },
    ],
    fatigueIndicators: [
      'Steps becoming shorter',
      'Knees wobbling on stance',
      'Losing upright posture',
    ],
    overuseWarnings: [
      'Knee discomfort increasing with each session',
      'Hip flexor tightness accumulating',
    ],
    modificationCues: [
      'Stationary reverse lunges reduce momentum stress',
      'Shorter steps reduce knee demand',
    ],
    whenToReduce: [
      'Pain during push-off phase',
      'Symptoms worse than starting point',
    ],
  },
  'reverse-lunges': {
    exerciseId: 'reverse-lunges',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['compressive', 'eccentric'],
        rangeOfMotion: 'full',
        neutralDescription: 'More controlled knee loading than forward variations',
      },
      {
        joint: 'hip',
        stressLevel: 'low',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip extension emphasis',
      },
    ],
    fatigueIndicators: [
      'Losing balance stepping back',
      'Front knee drifting forward',
    ],
    overuseWarnings: [
      'Generally well-tolerated — good regression option',
    ],
    modificationCues: [
      'Step length affects knee angle',
      'Support available if needed',
    ],
    whenToReduce: [
      'Knee symptoms appear — try shorter range',
    ],
  },
  'hip-thrusts': {
    exerciseId: 'hip-thrusts',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: ['isometric'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Knee stays at fixed angle — minimal joint stress',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Full hip extension under load',
      },
      {
        joint: 'spine',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Lower back in neutral throughout',
      },
    ],
    fatigueIndicators: [
      'Lower back taking over',
      'Unable to achieve full hip extension',
      'Hamstrings cramping',
    ],
    overuseWarnings: [
      'Lower back discomfort if technique drifts',
    ],
    modificationCues: [
      'Glute bridge is lighter alternative',
      'Focus on glute squeeze, not back arch',
    ],
    whenToReduce: [
      'Lower back involvement increasing',
      'Unable to feel glutes working',
    ],
  },
  'jump-squats': {
    exerciseId: 'jump-squats',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'impact', 'eccentric'],
        rangeOfMotion: 'full',
        neutralDescription: 'High impact forces on landing',
      },
      {
        joint: 'ankle',
        stressLevel: 'high',
        loadTypes: ['impact'],
        rangeOfMotion: 'full',
        neutralDescription: 'Ankle absorbs significant landing force',
      },
    ],
    fatigueIndicators: [
      'Landing becoming louder',
      'Unable to absorb landing smoothly',
      'Jump height decreasing significantly',
    ],
    overuseWarnings: [
      'Cumulative impact stress',
      'Knee symptoms appearing 24-48 hours later',
    ],
    modificationCues: [
      'Box squats with explosive concentric only',
      'Reduce jump height',
      'Focus on landing mechanics',
    ],
    whenToReduce: [
      'Landing causes immediate discomfort',
      'Symptoms persist between sessions',
    ],
  },
  'box-jumps': {
    exerciseId: 'box-jumps',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'impact'],
        rangeOfMotion: 'full',
        neutralDescription: 'Reduced landing impact compared to ground, but still high demand',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['impact'],
        rangeOfMotion: 'full',
        neutralDescription: 'Landing on elevated surface reduces drop',
      },
    ],
    fatigueIndicators: [
      'Catching edge of box',
      'Landing in deep squat position',
      'Hesitation before jumping',
    ],
    overuseWarnings: [
      'Step down, never jump down — reduces eccentric stress',
    ],
    modificationCues: [
      'Lower box height',
      'Step-ups as alternative',
      'Always step down after landing',
    ],
    whenToReduce: [
      'Hesitancy or fear affecting form',
      'Landing mechanics deteriorating',
    ],
  },
  'burpees': {
    exerciseId: 'burpees',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive', 'impact'],
        rangeOfMotion: 'full',
        neutralDescription: 'Repeated squat-to-jump pattern with impact',
      },
      {
        joint: 'shoulder',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Shoulder loading in plank phase',
      },
      {
        joint: 'wrist',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Wrist extension under bodyweight',
      },
    ],
    fatigueIndicators: [
      'Flopping to ground instead of controlled descent',
      'Jump becoming minimal',
      'Unable to maintain pace',
    ],
    overuseWarnings: [
      'High cumulative stress — limit volume',
    ],
    modificationCues: [
      'Step-back burpees eliminate jump impact',
      'Remove jump at top',
      'Push-ups separately as alternative',
    ],
    whenToReduce: [
      'Form completely breaking down',
      'Joint discomfort appearing',
    ],
  },
  'interval-sprints': {
    exerciseId: 'interval-sprints',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['impact', 'shear'],
        rangeOfMotion: 'full',
        neutralDescription: 'High-velocity loading with repeated ground contact',
      },
      {
        joint: 'ankle',
        stressLevel: 'high',
        loadTypes: ['impact', 'tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Achilles and calf under high stress',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip flexors and extensors under rapid loading',
      },
    ],
    fatigueIndicators: [
      'Times significantly slower',
      'Form deteriorating visibly',
      'Recovery between intervals incomplete',
    ],
    overuseWarnings: [
      'Hamstring or calf tightness accumulating',
      'Knee discomfort appearing mid-session',
    ],
    modificationCues: [
      'Tempo runs as lower-intensity alternative',
      'Longer recovery between intervals',
      'Reduce sprint distance',
    ],
    whenToReduce: [
      'Sharp pain during acceleration',
      'Unable to maintain mechanics',
    ],
  },
  'easy-run': {
    exerciseId: 'easy-run',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['impact', 'compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Repeated loading at lower intensity',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['impact'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Cumulative foot strike forces',
      },
    ],
    fatigueIndicators: [
      'Pace drifting slower involuntarily',
      'Form becoming shuffling',
      'Breathing harder than expected',
    ],
    overuseWarnings: [
      'Cumulative volume matters more than single sessions',
      'Monitor weekly totals, not just daily',
    ],
    modificationCues: [
      'Walk breaks are valid',
      'Incline walks as no-impact alternative',
    ],
    whenToReduce: [
      'Symptoms during or after running',
      'Recovery taking longer than 24-48 hours',
    ],
  },
  'deep-squat-hold': {
    exerciseId: 'deep-squat-hold',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'high',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Sustained deep knee flexion — higher joint compression',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Full hip flexion required',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Ankle dorsiflexion demand',
      },
    ],
    fatigueIndicators: [
      'Unable to maintain position',
      'Heels rising',
      'Discomfort increasing during hold',
    ],
    overuseWarnings: [
      'Sustained compression may aggravate certain knee conditions',
    ],
    modificationCues: [
      'Elevate heels for ankle limitation',
      'Hold support for balance',
      'Reduce hold duration',
    ],
    whenToReduce: [
      'Any knee discomfort during hold',
      'Symptoms after position',
    ],
  },
  'step-ups': {
    exerciseId: 'step-ups',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['compressive', 'eccentric'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Controlled single-leg knee loading with adjustable height',
      },
      {
        joint: 'hip',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Hip extension through controlled range',
      },
    ],
    fatigueIndicators: [
      'Pushing off back foot instead of driving through front',
      'Balance deteriorating',
      'Unable to control descent',
    ],
    overuseWarnings: [
      'Generally well-tolerated — adjust box height as needed',
    ],
    modificationCues: [
      'Lower box height reduces knee demand',
      'Use support for balance if needed',
      'Focus on driving through heel',
    ],
    whenToReduce: [
      'Knee discomfort at current height — lower the step',
    ],
  },
  'glute-bridge': {
    exerciseId: 'glute-bridge',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: ['isometric'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Minimal knee involvement — excellent knee-friendly option',
      },
      {
        joint: 'hip',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Hip extension with glute emphasis',
      },
      {
        joint: 'spine',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Lower back supported throughout',
      },
    ],
    fatigueIndicators: [
      'Lower back taking over from glutes',
      'Hamstrings cramping',
    ],
    overuseWarnings: [
      'Very well-tolerated — great foundational movement',
    ],
    modificationCues: [
      'Single-leg version increases challenge',
      'Focus on glute squeeze at top',
    ],
    whenToReduce: [
      'Rarely needed — very joint-friendly',
    ],
  },
  'hamstring-curl': {
    exerciseId: 'hamstring-curl',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Knee flexion under load — monitor behind-knee comfort',
      },
    ],
    fatigueIndicators: [
      'Cramping in hamstrings',
      'Unable to achieve full range',
      'Hips lifting off pad',
    ],
    overuseWarnings: [
      'Some feel discomfort behind knee — reduce range if needed',
    ],
    modificationCues: [
      'Reduce range of motion if behind-knee discomfort',
      'Swiss ball curl as bodyweight alternative',
    ],
    whenToReduce: [
      'Discomfort behind the knee',
      'Cramping that persists',
    ],
  },
  'deadlift-conventional': {
    exerciseId: 'deadlift-conventional',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['compressive', 'shear'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Moderate knee involvement at start position',
      },
      {
        joint: 'hip',
        stressLevel: 'high',
        loadTypes: ['compressive', 'tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Primary hip hinge movement',
      },
      {
        joint: 'spine',
        stressLevel: 'high',
        loadTypes: ['compressive', 'shear'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Significant spinal loading — technique critical',
      },
    ],
    fatigueIndicators: [
      'Lower back rounding',
      'Bar drifting away from body',
      'Grip failing',
      'Hips rising faster than shoulders',
    ],
    overuseWarnings: [
      'Lower back fatigue accumulates — monitor recovery',
      'Grip fatigue may limit before muscles do',
    ],
    modificationCues: [
      'Trap bar reduces spinal loading',
      'RDL focuses more on hip hinge',
      'Elevate starting position if mobility limited',
    ],
    whenToReduce: [
      'Lower back discomfort during or after',
      'Form breakdown under load',
    ],
  },
  'bench-press': {
    exerciseId: 'bench-press',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: [],
        rangeOfMotion: 'minimal',
        neutralDescription: 'No knee involvement — excellent for knee-focused recovery days',
      },
      {
        joint: 'shoulder',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Shoulder stability required throughout',
      },
      {
        joint: 'elbow',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Elbow extension under load',
      },
    ],
    fatigueIndicators: [
      'Bar path becoming inconsistent',
      'Unable to touch chest',
      'Excessive back arch',
    ],
    overuseWarnings: [
      'Shoulder discomfort may develop with high volume',
    ],
    modificationCues: [
      'Narrower grip reduces shoulder demand',
      'Floor press limits range of motion',
      'Dumbbell press allows natural movement',
    ],
    whenToReduce: [
      'Shoulder pain during pressing',
      'Elbow discomfort at lockout',
    ],
  },
  'pull-ups': {
    exerciseId: 'pull-ups',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: [],
        rangeOfMotion: 'minimal',
        neutralDescription: 'No knee involvement',
      },
      {
        joint: 'shoulder',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Full shoulder range under bodyweight',
      },
      {
        joint: 'elbow',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Elbow flexion against bodyweight',
      },
    ],
    fatigueIndicators: [
      'Unable to achieve full range',
      'Kipping or swinging',
      'Grip failing before back',
    ],
    overuseWarnings: [
      'Elbow tendon stress with high volume',
    ],
    modificationCues: [
      'Assisted pull-ups reduce load',
      'Lat pulldowns as alternative',
      'Negative-only builds strength',
    ],
    whenToReduce: [
      'Shoulder impingement symptoms',
      'Elbow pain during pulling',
    ],
  },
  'kettlebell-swings': {
    exerciseId: 'kettlebell-swings',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Minimal knee flexion — primarily hip movement',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile', 'compressive'],
        rangeOfMotion: 'full',
        neutralDescription: 'Explosive hip extension pattern',
      },
      {
        joint: 'spine',
        stressLevel: 'moderate',
        loadTypes: ['shear'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Spinal stability required throughout',
      },
    ],
    fatigueIndicators: [
      'Squatting instead of hinging',
      'Lower back rounding',
      'Grip failing',
      'Bell not reaching chest height',
    ],
    overuseWarnings: [
      'Lower back fatigue with high volume',
      'Grip endurance often limiting factor',
    ],
    modificationCues: [
      'Hip thrusts for similar pattern without ballistic component',
      'Lighter weight to maintain form',
    ],
    whenToReduce: [
      'Lower back discomfort',
      'Form breaking down',
    ],
  },
  'planks': {
    exerciseId: 'planks',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'low',
        loadTypes: [],
        rangeOfMotion: 'minimal',
        neutralDescription: 'No knee involvement',
      },
      {
        joint: 'shoulder',
        stressLevel: 'low',
        loadTypes: ['isometric'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Static shoulder support',
      },
      {
        joint: 'spine',
        stressLevel: 'low',
        loadTypes: ['isometric'],
        rangeOfMotion: 'minimal',
        neutralDescription: 'Anti-extension core stability',
      },
    ],
    fatigueIndicators: [
      'Hips sagging',
      'Hips piking up',
      'Shaking excessively',
    ],
    overuseWarnings: [
      'Very well-tolerated — excellent foundational exercise',
    ],
    modificationCues: [
      'Knees down reduces difficulty',
      'Shorter holds with better form',
    ],
    whenToReduce: [
      'Shoulder or wrist discomfort',
    ],
  },
  'long-run': {
    exerciseId: 'long-run',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['impact', 'compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Cumulative loading over extended duration',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['impact'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Sustained foot strike forces',
      },
      {
        joint: 'hip',
        stressLevel: 'low',
        loadTypes: ['tensile'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Repetitive hip flexion-extension',
      },
    ],
    fatigueIndicators: [
      'Form deteriorating significantly',
      'Pace dropping substantially',
      'Discomfort appearing mid-run',
    ],
    overuseWarnings: [
      'Duration matters more than pace — build gradually',
      'Weekly volume increases should be conservative',
    ],
    modificationCues: [
      'Walk breaks preserve form',
      'Shorter duration at same effort',
      'Alternate with cross-training',
    ],
    whenToReduce: [
      'Symptoms during running',
      'Delayed soreness lasting >48 hours',
    ],
  },
  'tempo-run': {
    exerciseId: 'tempo-run',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['impact', 'compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Moderate-intensity sustained loading',
      },
      {
        joint: 'ankle',
        stressLevel: 'moderate',
        loadTypes: ['impact', 'tensile'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Higher forces than easy running',
      },
    ],
    fatigueIndicators: [
      'Unable to maintain target pace',
      'Form breaking down',
      'Breathing becoming labored early',
    ],
    overuseWarnings: [
      'Quality over quantity — one per week is often sufficient',
    ],
    modificationCues: [
      'Easy runs maintain fitness with less stress',
      'Shorter tempo segments with recovery',
    ],
    whenToReduce: [
      'Knee discomfort at tempo pace',
      'Unable to recover between sessions',
    ],
  },
  'hill-sprints': {
    exerciseId: 'hill-sprints',
    jointLoads: [
      {
        joint: 'knee',
        stressLevel: 'moderate',
        loadTypes: ['compressive'],
        rangeOfMotion: 'partial',
        neutralDescription: 'Reduced impact compared to flat sprints — often better tolerated',
      },
      {
        joint: 'ankle',
        stressLevel: 'high',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'High calf and Achilles demand',
      },
      {
        joint: 'hip',
        stressLevel: 'moderate',
        loadTypes: ['tensile'],
        rangeOfMotion: 'full',
        neutralDescription: 'Hip flexor drive for incline',
      },
    ],
    fatigueIndicators: [
      'Sprint speed dropping significantly',
      'Form deteriorating',
      'Recovery between reps incomplete',
    ],
    overuseWarnings: [
      'Calf and Achilles stress accumulates',
      'Allow full recovery between sessions',
    ],
    modificationCues: [
      'Walk down, never run down',
      'Reduce hill steepness',
      'Fewer reps with full recovery',
    ],
    whenToReduce: [
      'Calf or Achilles tightness',
      'Unable to maintain sprint quality',
    ],
  },
};

export const OVERUSE_INDICATORS = [
  {
    indicator: 'Symptoms appearing earlier in workout',
    meaning: 'Tissue tolerance may be decreasing',
    response: 'Consider reducing volume or intensity for 1-2 weeks',
  },
  {
    indicator: 'Recovery taking longer than 48 hours',
    meaning: 'Current load may exceed recovery capacity',
    response: 'Add a rest day or reduce next session intensity',
  },
  {
    indicator: 'Performance declining despite consistent effort',
    meaning: 'Possible accumulated fatigue',
    response: 'A deload week may help restore adaptation',
  },
  {
    indicator: 'Symptoms spreading to adjacent areas',
    meaning: 'Compensation patterns developing',
    response: 'Address root cause before continuing progression',
  },
  {
    indicator: 'Night discomfort or morning stiffness lasting >30 min',
    meaning: 'May indicate inflammatory response',
    response: 'Reduce load and consider professional consultation',
  },
];

export const PAIN_RESPONSE_GUIDANCE = [
  {
    level: '0-2/10',
    label: 'Minimal',
    guidance: 'Generally safe to continue. This level is often normal adaptation.',
    action: 'Proceed with awareness',
  },
  {
    level: '3-4/10',
    label: 'Mild',
    guidance: 'Monitor closely. May continue if stable and resolves quickly.',
    action: 'Check if it changes during movement. Stop if increasing.',
  },
  {
    level: '5-6/10',
    label: 'Moderate',
    guidance: 'Consider modifying or stopping. This level suggests tissue stress.',
    action: 'Reduce load, try alternative, or rest.',
  },
  {
    level: '7+/10',
    label: 'Significant',
    guidance: 'Stop the movement. Higher pain levels warrant caution.',
    action: 'Rest and reassess. Consider professional guidance.',
  },
];

export const getExerciseInjuryContext = (exerciseId: string): InjuryAwareExerciseContext | null => {
  return EXERCISE_INJURY_CONTEXT[exerciseId] || null;
};

export const getKneeLoadLevel = (exerciseId: string): JointStressLevel => {
  const context = EXERCISE_INJURY_CONTEXT[exerciseId];
  if (!context) return 'moderate';
  
  const kneeLoad = context.jointLoads.find(j => j.joint === 'knee');
  return kneeLoad?.stressLevel || 'low';
};

export const getJointDemandLabel = (level: JointStressLevel): { label: string; description: string; color: string } => {
  return JOINT_DEMAND_LABELS[level];
};

export const getTissueHealingInfo = (tissue: TissueType): TissueHealingTimeline | null => {
  return TISSUE_HEALING_TIMELINES.find(t => t.tissue === tissue) || null;
};

export const getInjuryTypeContext = (injuryType: InjuryType) => {
  return KNEE_INJURY_CONTEXT[injuryType];
};

export const getPainGuidance = (painLevel: number): typeof PAIN_RESPONSE_GUIDANCE[0] => {
  if (painLevel <= 2) return PAIN_RESPONSE_GUIDANCE[0];
  if (painLevel <= 4) return PAIN_RESPONSE_GUIDANCE[1];
  if (painLevel <= 6) return PAIN_RESPONSE_GUIDANCE[2];
  return PAIN_RESPONSE_GUIDANCE[3];
};
