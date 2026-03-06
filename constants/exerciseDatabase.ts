import { Exercise } from '@/types';

export const MASTER_EXERCISE_DATABASE: Exercise[] = [
  // ═══════════════════════════════════════════════════════════
  // GYM (Strength & Hypertrophy)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'bench_press_barbell',
    name: 'Barbell Bench Press',
    categories: ['gym'],
    difficulty: 'Intermediate',
    equipment: ['Barbell', 'Bench'],
    equipment_required: true,
    movement_type: 'compound',
    muscles: {
      primary: ['Chest'],
      secondary: ['Triceps', 'Shoulders']
    },
    description: "The classic horizontal press for chest development and upper body strength.",
    best_for: ["Chest size", "Pushing strength", "Upper body power"],
    guidance_by_goal: {
      strength: { sets: "3-5", reps: "3-6", rest: "3 min", intensity: "Heavy" },
      hypertrophy: { sets: "3-4", reps: "8-12", rest: "90s", intensity: "Moderate-Heavy" }
    },
    form_tips: ["Keep shoulder blades retracted", "Touch bar to mid-chest", "Drive feet into floor"],
    common_mistakes: ["Flaring elbows", "Bouncing bar"],
    alternatives: [{ id: 'bench_press_dumbbell', name: 'Dumbbell Bench Press', reason: "More range of motion" }],
    tags: ['push', 'horizontal'],
    sets: 4,
    reps: '8-10',
    rest: 120,
    kneeSafeLevel: 'safe'
  },
  {
    id: 'squat_barbell',
    name: 'Barbell Back Squat',
    categories: ['gym'],
    difficulty: 'Advanced',
    equipment: ['Barbell', 'Rack'],
    equipment_required: true,
    movement_type: 'compound',
    muscles: {
      primary: ['Quadriceps', 'Glutes'],
      secondary: ['Hamstrings', 'Lower Back', 'Core']
    },
    description: "The king of lower body exercises for total leg mass and strength.",
    best_for: ["Leg strength", "Muscle growth", "Athletic power"],
    guidance_by_goal: {
      strength: { sets: "3-5", reps: "3-5", rest: "3-5 min", intensity: "85%+" },
      hypertrophy: { sets: "3-4", reps: "8-12", rest: "2-3 min", intensity: "70-80%" }
    },
    form_tips: ["Break at hips and knees", "Keep chest up", "Drive through mid-foot"],
    common_mistakes: ["Knees caving", "Rounding back"],
    alternatives: [{ id: 'goblet_squat', name: 'Goblet Squat', reason: "Easier on back" }],
    tags: ['legs', 'squat'],
    sets: 4,
    reps: '6-8',
    rest: 180,
    kneeSafeLevel: 'caution'
  },

  // ═══════════════════════════════════════════════════════════
  // CALISTHENICS (Bodyweight)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'pullups',
    name: 'Pull-Ups',
    categories: ['calisthenics', 'gym'],
    difficulty: 'Intermediate',
    equipment: ['Pull-up Bar'],
    equipment_required: true,
    movement_type: 'compound',
    muscles: {
      primary: ['Lats'],
      secondary: ['Biceps', 'Upper Back', 'Core']
    },
    description: "The gold standard bodyweight pull for a wide back and functional strength.",
    best_for: ["Back width", "Grip strength", "Relative power"],
    guidance_by_goal: {
      hypertrophy: { sets: "3-4", reps: "Failure", rest: "90s", intensity: "Bodyweight" }
    },
    form_tips: ["Dead hang at bottom", "Chest to bar", "Control descent"],
    common_mistakes: ["Kipping", "Half reps"],
    alternatives: [{ id: 'lat_pulldown', name: 'Lat Pulldown', reason: "Adjustable weight" }],
    tags: ['pull', 'vertical'],
    sets: 3,
    reps: '8-12',
    rest: 90,
    kneeSafeLevel: 'safe'
  },
  {
    id: 'pushups',
    name: 'Push-Ups',
    categories: ['calisthenics', 'gym'],
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    equipment_required: false,
    movement_type: 'compound',
    muscles: {
      primary: ['Chest'],
      secondary: ['Triceps', 'Shoulders', 'Core']
    },
    description: "Foundational pushing movement that builds upper body endurance and stability.",
    best_for: ["Core stability", "Pushing endurance", "Anywhere training"],
    guidance_by_goal: {
      endurance: { sets: "3", reps: "20-30", rest: "60s", intensity: "Bodyweight" }
    },
    form_tips: ["Body in straight line", "Elbows at 45 degrees", "Full range of motion"],
    common_mistakes: ["Sagging hips", "Flaring elbows"],
    alternatives: [],
    tags: ['push', 'horizontal'],
    sets: 3,
    reps: '15-20',
    rest: 60,
    kneeSafeLevel: 'safe'
  },

  // ═══════════════════════════════════════════════════════════
  // CARDIO
  // ═══════════════════════════════════════════════════════════
  {
    id: 'running',
    name: 'Running',
    categories: ['cardio'],
    difficulty: 'Beginner',
    equipment: ['Bodyweight'],
    equipment_required: false,
    movement_type: 'endurance',
    muscles: {
      primary: ['Full Body', 'Heart'],
      secondary: ['Legs', 'Core']
    },
    description: "Fundamental cardiovascular conditioning for heart health and longevity.",
    best_for: ["Cardio health", "Calorie burn", "Mental clarity"],
    guidance_by_goal: {
      endurance: { sets: "1", reps: "30 min", rest: "N/A", intensity: "Moderate" }
    },
    form_tips: ["Upright posture", "Short strides", "Relaxed shoulders"],
    common_mistakes: ["Overstriding", "Heel striking heavily"],
    alternatives: [{ id: 'cycling', name: 'Cycling', reason: "Lower impact" }],
    tags: ['aerobic', 'endurance'],
    sets: 1,
    reps: '20-40 min',
    rest: 0,
    kneeSafeLevel: 'modified'
  },

  // ═══════════════════════════════════════════════════════════
  // CROSS-TRAINING (Metcon)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'burpees',
    name: 'Burpees',
    categories: ['cross_training', 'cardio', 'calisthenics'],
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    equipment_required: false,
    movement_type: 'explosive',
    muscles: {
      primary: ['Full Body'],
      secondary: ['Heart', 'Chest', 'Quads']
    },
    description: "Dynamic full-body movement for metabolic conditioning and power.",
    best_for: ["Fat loss", "Metabolic conditioning", "Toughness"],
    guidance_by_goal: {
      endurance: { sets: "4", reps: "15", rest: "30-60s", intensity: "High" }
    },
    form_tips: ["Chest to floor", "Explosive jump", "Soft landing"],
    common_mistakes: ["Snake pushup", "No jump"],
    alternatives: [],
    tags: ['metcon', 'plyo'],
    sets: 3,
    reps: '10-15',
    rest: 60,
    kneeSafeLevel: 'caution'
  },

  // ═══════════════════════════════════════════════════════════
  // SPORTS PERFORMANCE
  // ═══════════════════════════════════════════════════════════
  {
    id: 'shuttle_run',
    name: 'Shuttle Run',
    categories: ['sports_performance', 'cardio'],
    difficulty: 'Intermediate',
    equipment: ['Bodyweight'],
    equipment_required: false,
    movement_type: 'explosive',
    muscles: {
      primary: ['Legs', 'Heart'],
      secondary: ['Core']
    },
    description: "Agility drill for change of direction and explosive acceleration.",
    best_for: ["Agility", "Speed", "Coordination"],
    guidance_by_goal: {
      endurance: { sets: "5", reps: "30s", rest: "60s", intensity: "Max Effort" }
    },
    form_tips: ["Stay low on turns", "Accelerate out", "Touch the line"],
    common_mistakes: ["Turning wide", "Stopping short"],
    alternatives: [],
    tags: ['agility', 'sprints'],
    sets: 4,
    reps: '20m x 10',
    rest: 90,
    kneeSafeLevel: 'caution'
  },
];
