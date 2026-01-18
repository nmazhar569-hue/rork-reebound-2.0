export type GenderIdentity = 'woman' | 'man' | 'non_binary' | 'prefer_not_to_say' | 'other';
export type ExplanationDepth = 'simple' | 'applied_science' | 'deep_biomechanics';

export interface AiPreferences {
  explanationDepth: ExplanationDepth;
}

export type InjuryType = 
  | 'acl' 
  | 'meniscus' 
  | 'patella' 
  | 'general_pain' 
  | 'post_surgery';

export type PainTolerance = 'low' | 'medium' | 'high';

export type TrainingStyle = 'gym' | 'sport' | 'general';

export type SportType = 'gym' | 'running' | 'martial_arts';

export type WorkoutFocus = 'upper_body' | 'lower_body' | 'recovery';

export type SleepQuality = 'poor' | 'average' | 'good';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type StressLevel = 'low' | 'moderate' | 'high';

export type DietPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'halal' | 'kosher' | 'gluten_free' | 'dairy_free';
export type NutritionGoal = 'performance' | 'recovery' | 'body_composition' | 'general_health';
export type AppetiteLevel = 'low' | 'average' | 'high';

export interface NutritionPreferences {
  dietaryPreference: DietPreference;
  allergies?: string[];
  appetiteLevel?: AppetiteLevel;
  eatingFrequency?: number; // meals per day
  goal: NutritionGoal;
}

export interface TrainingBackground {
  yearsExperience?: number;
  isCompetitive?: boolean;
  weeklyHours?: number;
  hasGymAccess?: boolean;
}

export interface RecoveryAwareness {
  previousInjuries?: string[];
  currentDiscomfort?: string[];
  recoveryHabits?: string[];
}

export interface UserProfile {
  injuryType: InjuryType;
  painTolerance: PainTolerance;
  trainingStyle: TrainingStyle;
  sportType?: SportType;
  weeklyFrequency: number;
  onboardingCompleted: boolean;
  
  // Body & Lifestyle
  gender?: GenderIdentity;
  height?: number; // cm
  weight?: number; // kg
  sleepQuality?: SleepQuality;
  activityLevel?: ActivityLevel;
  stressLevel?: StressLevel;
  
  // Extended Profile
  nutritionPreferences?: NutritionPreferences;
  trainingBackground?: TrainingBackground;
  recoveryAwareness?: RecoveryAwareness;
  aiPreferences?: AiPreferences;
  unitPreferences?: UnitPreferences;
  
  // North Star - user's motivational goal
  northStar?: string;
  
  // Intent Profile - captures user's primary reason for using the app
  intentProfile?: IntentProfile;
  
  // Recovery-first mode - true for new users after onboarding
  recoveryFirstMode?: boolean;
  
  // Questionnaire Profile - structured onboarding data
  questionnaireProfile?: QuestionnaireProfile;
}

export interface SportRelevance {
  role: 'primary' | 'secondary' | 'accessory';
  purpose: string;
}

export type MovementPattern = 
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'hinge'
  | 'squat'
  | 'lunge'
  | 'rotation'
  | 'carry'
  | 'core_anti_extension'
  | 'core_anti_rotation'
  | 'core_flexion'
  | 'plyometric'
  | 'cardio_steady'
  | 'cardio_intervals'
  | 'mobility';

export type MuscleGroup = 
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'hip_flexors'
  | 'adductors'
  | 'abductors'
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'rear_delts'
  | 'front_delts'
  | 'side_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'obliques'
  | 'lower_back'
  | 'traps'
  | 'neck';

export type EquipmentType = 
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'pull_up_bar'
  | 'bench'
  | 'box'
  | 'resistance_band'
  | 'medicine_ball'
  | 'sled'
  | 'battle_ropes'
  | 'assault_bike'
  | 'treadmill'
  | 'jump_rope'
  | 'foam_roller'
  | 'trap_bar'
  | 'landmine'
  | 'towel'
  | 'plates';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type JointStressLevel = 'low' | 'moderate' | 'high';

export type InjurySafety = 'safe' | 'caution' | 'avoid';

export interface JointLoadProfile {
  knee: JointStressLevel;
  hip: JointStressLevel;
  ankle: JointStressLevel;
  shoulder: JointStressLevel;
  elbow: JointStressLevel;
  wrist: JointStressLevel;
  spine: JointStressLevel;
}

export interface InjuryConsiderations {
  kneeInjury: InjurySafety;
  shoulderInjury: InjurySafety;
  backInjury: InjurySafety;
  hipInjury: InjurySafety;
  ankleInjury: InjurySafety;
  notes?: string;
}

export type FatigueLevel = 'fresh' | 'normal' | 'tired' | 'exhausted';

export interface InjuryAwareFilters {
  injuryType: InjuryType;
  painLevel: number;
  fatigueLevel: FatigueLevel;
  excludeHighKneeLoad: boolean;
  preferLowImpact: boolean;
}

export interface ExerciseSuitability {
  exerciseId: string;
  suitabilityScore: number;
  kneeLoadLevel: JointStressLevel;
  considerations: string[];
  alternatives: string[];
  isRecommended: boolean;
}

export type AlternativeType = 'regression' | 'progression' | 'lateral';

export interface ExerciseAlternative {
  exerciseId: string;
  type: AlternativeType;
  reason: string;
}

export type SessionIntensity = 'light' | 'moderate' | 'full';

export interface SessionAdjustment {
  intensity: SessionIntensity;
  volumeMultiplier: number;
  restMultiplier: number;
  skipCautionExercises: boolean;
  reason?: string;
}

export interface ExerciseKnowledge {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  jointLoad: JointLoadProfile;
  skillLevel: SkillLevel;
  equipment: EquipmentType[];
  commonMistakes: string[];
  regressions: string[];
  progressions: string[];
  sportRelevance: {
    gym?: SportRelevance;
    running?: SportRelevance;
    martial_arts?: SportRelevance;
  };
  injuryConsiderations: InjuryConsiderations;
  cues: string[];
  defaultSets: number;
  defaultReps: string;
  defaultRest: number;
}

export interface SetLog {
  setNumber: number;
  weight?: number;
  reps?: number;
  completed: boolean;
  timestamp?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
  kneeSafeLevel: 'safe' | 'modified' | 'caution';
  substitution?: string;
  rationale?: string;
  sportRelevance?: {
    gym?: SportRelevance;
    running?: SportRelevance;
    martial_arts?: SportRelevance;
  };
  alternatives?: ExerciseAlternative[];
  movementPattern?: MovementPattern;
}

export interface DailyReadiness {
  date: string;
  painLevel: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface Workout {
  id: string;
  dayOfWeek: number;
  focus: WorkoutFocus;
  title: string;
  kneeSafeNote: string;
  exercises: Exercise[];
  sessionType?: string;
  sportLabel?: string;
  programId?: string;
  source?: 'template' | 'program' | 'override';
  isSwappable?: boolean;
  alternativeSessions?: string[];
  adjustment?: SessionAdjustment;
}

export type WeekdayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ProgramWeekDay {
  dayOfWeek: WeekdayKey;
  sessionTypeKey: string | null; // null = rest
}

export interface ProgramSession {
  dayOfWeek: WeekdayKey;
  sessionTypeKey: string;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  name: string;
  sportType: SportType;
  weekSchedule: ProgramWeekDay[];
  sessions: ProgramSession[];
  createdByUser: true;
  createdAt: string;
}

export interface ProgramWorkoutOverride {
  id: string;
  programId: string;
  date: string; // yyyy-mm-dd
  dayOfWeek: WeekdayKey;
  sessionTypeKey: string | null;
  exercises: Exercise[];
  updatedAt: string;
}

export interface RecoveryRoutine {
  id: string;
  title: string;
  duration: number;
  type: 'warmup' | 'cooldown' | 'mobility';
  steps: RecoveryStep[];
}

export interface RecoveryStep {
  id: string;
  instruction: string;
  duration: number;
}

export interface DailyLog {
  date: string;
  workoutCompleted: boolean;
  recoveryCompleted?: boolean;
  painLevel: number;
  confidenceLevel: number;
  fatigueLevel?: FatigueLevel;
  notes?: string;
  nutritionLog?: NutritionLog;
  workoutId?: string;
  exercisesCompleted?: number;
  totalExercises?: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  tags?: string[]; // 'iron', 'calcium', 'fiber', etc.
  timestamp: string;
}

export interface NutritionLog {
  date: string;
  waterIntake: number; // in ml or cups
  foodEntries: FoodEntry[];
  dailySummary?: string; // Generated insight
}


export interface WeeklyProgress {
  weekStart: string;
  workoutsCompleted: number;
  totalWorkouts: number;
  avgPainLevel: number;
  avgConfidenceLevel: number;
}

export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lb';

export interface UnitPreferences {
  height: HeightUnit;
  weight: WeightUnit;
}

export type AuthProvider = 'apple' | 'google';

export type HealthPlatform = 'apple_health' | 'google_fit' | 'none';

export interface HealthPermissions {
  steps: boolean;
  distance: boolean;
  calories: boolean;
  heartRate: boolean;
  sleep: boolean;
  workouts: boolean;
}

export interface StepData {
  date: string;
  steps: number;
  source: 'device' | 'manual';
}

export interface DistanceData {
  date: string;
  distanceKm: number;
  avgPaceMinPerKm?: number;
  source: 'device' | 'manual';
}

export interface CalorieData {
  date: string;
  activeCalories: number;
  source: 'device' | 'manual';
}

export interface HeartRateData {
  date: string;
  restingHR?: number;
  avgHR?: number;
  maxHR?: number;
  source: 'device' | 'manual';
}

export interface SleepData {
  date: string;
  durationMinutes: number;
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  source: 'device' | 'manual';
}

export interface ExternalWorkout {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  calories?: number;
  source: HealthPlatform;
}

export interface HealthData {
  steps: StepData[];
  distance: DistanceData[];
  calories: CalorieData[];
  heartRate: HeartRateData[];
  sleep: SleepData[];
  externalWorkouts: ExternalWorkout[];
  lastSyncedAt?: string;
}

export interface HealthSettings {
  platform: HealthPlatform;
  permissions: HealthPermissions;
  autoSync: boolean;
  prioritizeLimbriseData: boolean;
}

export interface ReadinessFactors {
  sleepScore: number;
  recoveryScore: number;
  activityBalance: number;
  heartRateVariability: number;
  overallScore: number;
  insights: string[];
}

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  provider: AuthProvider;
  providerUserId: string;
  createdAt: string;
  linkedAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  guestId: string;
}

export interface ReturnStatus {
  isReturning: boolean;
  daysAway: number;
  lastActiveDate: string | null;
  intensityModifier: number;
  welcomeMessage: string;
  suggestions: string[];
}

export interface ReflectionEntry {
  id: string;
  date: string;
  reflection?: string;
  daysAway: number;
  acknowledged: boolean;
}

export type PrimaryIntent = 
  | 'recover_from_injury'
  | 'return_to_training'
  | 'maintain_without_pain'
  | 'understand_body'
  | 'train_with_confidence'
  | 'general_fitness';

export type PrimaryGoal = 
  | 'build_muscle'
  | 'lose_fat'
  | 'improve_performance'
  | 'improve_energy'
  | 'improve_sleep'
  | 'general_health'
  | 'rehab_recovery'
  | 'other';

export type DesiredOutcomeFocus = 
  | 'appearance'
  | 'daily_feeling'
  | 'strength_performance'
  | 'discipline_consistency'
  | 'health_markers';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'returning';

export type TrainingFrequencyCurrent = '0-1' | '2-3' | '4-5' | '6+';

export type NutritionStructureLevel = 'very_structured' | 'somewhat_mindful' | 'inconsistent' | 'not_thinking';

export type DietaryConstraint = 
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'kosher'
  | 'lactose_free'
  | 'gluten_free'
  | 'other';

export type TimeCommitment = '<2hrs' | '2-4hrs' | '4-6hrs' | '6+hrs';

export type FrictionPoint = 
  | 'lack_of_time'
  | 'low_energy'
  | 'motivation'
  | 'inconsistency'
  | 'overthinking'
  | 'stress'
  | 'injuries';

export type MotivationDriver = 
  | 'clear_plans'
  | 'accountability'
  | 'data_metrics'
  | 'encouragement'
  | 'flexibility'
  | 'challenges';

export type ReePersonalityPreference = 'coach' | 'supportive' | 'minimal' | 'data_focused';

export type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';

export interface QuestionnaireProfile {
  preferredName?: string;
  age?: number;
  biologicalSex?: BiologicalSex;
  primaryGoals: PrimaryGoal[];
  desiredOutcomeFocus?: DesiredOutcomeFocus;
  fitnessLevel?: FitnessLevel;
  trainingFrequencyCurrent?: TrainingFrequencyCurrent;
  limitationsNotes?: string;
  nutritionStructureLevel?: NutritionStructureLevel;
  dietaryConstraints: DietaryConstraint[];
  timeCommitment?: TimeCommitment;
  frictionPoints: FrictionPoint[];
  motivationDrivers: MotivationDriver[];
  reePersonalityPreference?: ReePersonalityPreference;
  completedAt?: string;
}

export interface IntentProfile {
  primaryIntent: PrimaryIntent;
  userWords: string;
  clarifiedStatement: string;
  emotionalContext?: string;
  specificGoals?: string[];
  concerns?: string[];
  confirmedAt: string;
}

export type IdentityTitleKey = 
  | 'consistent_mover'
  | 'joint_first_athlete'
  | 'resilient_builder'
  | 'pain_aware_performer'
  | 'recovery_focused'
  | 'mindful_trainer'
  | 'adaptive_athlete'
  | 'steady_progress';

export interface IdentityTitle {
  key: IdentityTitleKey;
  label: string;
  description: string;
  unlockedAt?: string;
}

// Ree Presence System Types
export type ReePresenceLevel = 'hidden' | 'minimal' | 'available' | 'active';

export type ReeScreenContext = 
  | 'home'
  | 'plan'
  | 'workout_active'
  | 'recovery'
  | 'progress'
  | 'profile'
  | 'onboarding'
  | 'program_builder';

export type ReeInsightCategory = 
  | 'orientation'      // Help user understand where they are
  | 'explanation'      // Explain what they're seeing
  | 'choice_support'   // Help with decisions
  | 'confidence'       // Build trust and understanding
  | 'context_shift';   // Acknowledge changes

export interface ReeContextualInsight {
  id: string;
  category: ReeInsightCategory;
  message: string;
  expandedMessage?: string;
  screenContext: ReeScreenContext;
  trigger: string;
  priority: number;
  expiresAt?: string;
  seenAt?: string;
}

export interface ReePresenceState {
  level: ReePresenceLevel;
  isMinimized: boolean;
  currentInsight: ReeContextualInsight | null;
  queuedInsights: ReeContextualInsight[];
  lastInteractionAt: string | null;
  userPreference: 'always' | 'contextual' | 'minimal' | 'off';
  screenContext: ReeScreenContext;
  hasUnseenInsight: boolean;
}

export interface ReePresenceSettings {
  showOnboarding: boolean;
  showPlanningHints: boolean;
  showWorkoutHints: boolean;
  showRecoveryHints: boolean;
  showProgressInsights: boolean;
  autoMinimizeAfterSeconds: number;
}
