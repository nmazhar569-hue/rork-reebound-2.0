export type ExerciseCategory = 'GYM' | 'BODYWEIGHT' | 'CARDIO' | 'CROSSFIT';
export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: string;
  equipment: string[];
  difficulty: ExerciseDifficulty;
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // GYM - CHEST
  { id: 'gym-chest-001', name: 'Barbell Bench Press', category: 'GYM', muscleGroup: 'Chest', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },
  { id: 'gym-chest-002', name: 'Incline Barbell Bench Press', category: 'GYM', muscleGroup: 'Chest', equipment: ['Barbell', 'Incline Bench'], difficulty: 'Intermediate' },
  { id: 'gym-chest-003', name: 'Dumbbell Bench Press', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dumbbells', 'Bench'], difficulty: 'Beginner' },
  { id: 'gym-chest-004', name: 'Dumbbell Flys', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dumbbells', 'Bench'], difficulty: 'Beginner' },
  { id: 'gym-chest-005', name: 'Cable Crossovers', category: 'GYM', muscleGroup: 'Chest', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'gym-chest-006', name: 'Pec Deck Machine', category: 'GYM', muscleGroup: 'Chest', equipment: ['Pec Deck'], difficulty: 'Beginner' },
  { id: 'gym-chest-007', name: 'Weighted Dips', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dip Station', 'Weight Belt'], difficulty: 'Advanced' },

  // GYM - BACK
  { id: 'gym-back-001', name: 'Lat Pulldown', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'gym-back-002', name: 'Weighted Pull-Ups', category: 'GYM', muscleGroup: 'Back', equipment: ['Pull-Up Bar', 'Weight Belt'], difficulty: 'Advanced' },
  { id: 'gym-back-003', name: 'Barbell Bent Over Row', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'gym-back-004', name: 'Single Arm Dumbbell Row', category: 'GYM', muscleGroup: 'Back', equipment: ['Dumbbell', 'Bench'], difficulty: 'Beginner' },
  { id: 'gym-back-005', name: 'Seated Cable Row', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'gym-back-006', name: 'T-Bar Row', category: 'GYM', muscleGroup: 'Back', equipment: ['T-Bar', 'Plates'], difficulty: 'Intermediate' },
  { id: 'gym-back-007', name: 'Conventional Deadlift', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'gym-back-008', name: 'Face Pulls', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine', 'Rope'], difficulty: 'Beginner' },
  { id: 'gym-back-009', name: 'Barbell Shrugs', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Beginner' },

  // GYM - LEGS
  { id: 'gym-legs-001', name: 'Back Squat', category: 'GYM', muscleGroup: 'Legs', equipment: ['Barbell', 'Squat Rack'], difficulty: 'Intermediate' },
  { id: 'gym-legs-002', name: 'Front Squat', category: 'GYM', muscleGroup: 'Legs', equipment: ['Barbell', 'Squat Rack'], difficulty: 'Advanced' },
  { id: 'gym-legs-003', name: 'Leg Press', category: 'GYM', muscleGroup: 'Legs', equipment: ['Leg Press Machine'], difficulty: 'Beginner' },
  { id: 'gym-legs-004', name: 'Hack Squat', category: 'GYM', muscleGroup: 'Legs', equipment: ['Hack Squat Machine'], difficulty: 'Intermediate' },
  { id: 'gym-legs-005', name: 'Leg Extension', category: 'GYM', muscleGroup: 'Legs', equipment: ['Leg Extension Machine'], difficulty: 'Beginner' },
  { id: 'gym-legs-006', name: 'Romanian Deadlift', category: 'GYM', muscleGroup: 'Legs', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'gym-legs-007', name: 'Seated Leg Curl', category: 'GYM', muscleGroup: 'Legs', equipment: ['Leg Curl Machine'], difficulty: 'Beginner' },
  { id: 'gym-legs-008', name: 'Barbell Hip Thrust', category: 'GYM', muscleGroup: 'Legs', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },
  { id: 'gym-legs-009', name: 'Standing Calf Raise', category: 'GYM', muscleGroup: 'Legs', equipment: ['Calf Raise Machine'], difficulty: 'Beginner' },
  { id: 'gym-legs-010', name: 'Bulgarian Split Squat', category: 'GYM', muscleGroup: 'Legs', equipment: ['Dumbbells', 'Bench'], difficulty: 'Intermediate' },

  // GYM - SHOULDERS
  { id: 'gym-shoulders-001', name: 'Barbell Overhead Press', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'gym-shoulders-002', name: 'Dumbbell Shoulder Press', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'gym-shoulders-003', name: 'Arnold Press', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Intermediate' },
  { id: 'gym-shoulders-004', name: 'Lateral Raise', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'gym-shoulders-005', name: 'Cable Lateral Raise', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'gym-shoulders-006', name: 'Rear Delt Fly', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'gym-shoulders-007', name: 'Front Raise', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },

  // GYM - ARMS
  { id: 'gym-arms-001', name: 'Barbell Curl', category: 'GYM', muscleGroup: 'Arms', equipment: ['Barbell'], difficulty: 'Beginner' },
  { id: 'gym-arms-002', name: 'Dumbbell Curl', category: 'GYM', muscleGroup: 'Arms', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'gym-arms-003', name: 'Hammer Curl', category: 'GYM', muscleGroup: 'Arms', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'gym-arms-004', name: 'Preacher Curl', category: 'GYM', muscleGroup: 'Arms', equipment: ['EZ Bar', 'Preacher Bench'], difficulty: 'Beginner' },
  { id: 'gym-arms-005', name: 'Tricep Pushdown', category: 'GYM', muscleGroup: 'Arms', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'gym-arms-006', name: 'Skullcrushers', category: 'GYM', muscleGroup: 'Arms', equipment: ['EZ Bar', 'Bench'], difficulty: 'Intermediate' },
  { id: 'gym-arms-007', name: 'Overhead Tricep Extension', category: 'GYM', muscleGroup: 'Arms', equipment: ['Dumbbell'], difficulty: 'Beginner' },
  { id: 'gym-arms-008', name: 'Close-Grip Bench Press', category: 'GYM', muscleGroup: 'Arms', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },

  // BODYWEIGHT - UPPER PUSH
  { id: 'bw-push-001', name: 'Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-push-002', name: 'Diamond Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Intermediate' },
  { id: 'bw-push-003', name: 'Pike Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Intermediate' },
  { id: 'bw-push-004', name: 'Decline Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Elevated Surface'], difficulty: 'Intermediate' },
  { id: 'bw-push-005', name: 'Parallel Bar Dips', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Dip Station'], difficulty: 'Intermediate' },
  { id: 'bw-push-006', name: 'Handstand Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Wall'], difficulty: 'Advanced' },

  // BODYWEIGHT - UPPER PULL
  { id: 'bw-pull-001', name: 'Pull-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'bw-pull-002', name: 'Chin-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'bw-pull-003', name: 'Inverted Row', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Bar', 'Rings'], difficulty: 'Beginner' },
  { id: 'bw-pull-004', name: 'Muscle-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Advanced' },

  // BODYWEIGHT - LOWER
  { id: 'bw-lower-001', name: 'Air Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-lower-002', name: 'Jump Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-lower-003', name: 'Pistol Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Advanced' },
  { id: 'bw-lower-004', name: 'Walking Lunges', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-lower-005', name: 'Glute Bridge', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-lower-006', name: 'Step-Ups', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: ['Box'], difficulty: 'Beginner' },

  // BODYWEIGHT - CORE
  { id: 'bw-core-001', name: 'Plank', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-core-002', name: 'Side Plank', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-core-003', name: 'Hollow Body Hold', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Intermediate' },
  { id: 'bw-core-004', name: 'Hanging Leg Raise', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'bw-core-005', name: 'Russian Twists', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'bw-core-006', name: 'V-Ups', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Intermediate' },
  { id: 'bw-core-007', name: 'Mountain Climbers', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },

  // BODYWEIGHT - FULL BODY
  { id: 'bw-full-001', name: 'Burpees', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Intermediate' },
  { id: 'bw-full-002', name: 'Bear Crawl', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Beginner' },

  // CARDIO - LISS
  { id: 'cardio-liss-001', name: 'Incline Treadmill Walk', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Treadmill'], difficulty: 'Beginner' },
  { id: 'cardio-liss-002', name: 'Elliptical', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Elliptical'], difficulty: 'Beginner' },
  { id: 'cardio-liss-003', name: 'Stationary Bike', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Stationary Bike'], difficulty: 'Beginner' },
  { id: 'cardio-liss-004', name: 'Swimming Laps', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Pool'], difficulty: 'Intermediate' },
  { id: 'cardio-liss-005', name: 'Rucking', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Weighted Vest', 'Backpack'], difficulty: 'Intermediate' },

  // CARDIO - HIIT
  { id: 'cardio-hiit-001', name: 'Treadmill Sprints', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Treadmill'], difficulty: 'Intermediate' },
  { id: 'cardio-hiit-002', name: 'Assault Bike Sprints', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Assault Bike'], difficulty: 'Intermediate' },
  { id: 'cardio-hiit-003', name: 'Rowing Sprints', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Rowing Machine'], difficulty: 'Intermediate' },
  { id: 'cardio-hiit-004', name: 'Stairmaster Intervals', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Stairmaster'], difficulty: 'Intermediate' },

  // CARDIO - MACHINE
  { id: 'cardio-machine-001', name: 'Rowing Machine', category: 'CARDIO', muscleGroup: 'Machine', equipment: ['Rowing Machine'], difficulty: 'Beginner' },
  { id: 'cardio-machine-002', name: 'SkiErg', category: 'CARDIO', muscleGroup: 'Machine', equipment: ['SkiErg'], difficulty: 'Intermediate' },
  { id: 'cardio-machine-003', name: 'VersaClimber', category: 'CARDIO', muscleGroup: 'Machine', equipment: ['VersaClimber'], difficulty: 'Advanced' },

  // CARDIO - SPORT
  { id: 'cardio-sport-001', name: 'Jump Rope', category: 'CARDIO', muscleGroup: 'Sport', equipment: ['Jump Rope'], difficulty: 'Beginner' },
  { id: 'cardio-sport-002', name: 'Shadow Boxing', category: 'CARDIO', muscleGroup: 'Sport', equipment: [], difficulty: 'Beginner' },
  { id: 'cardio-sport-003', name: 'Heavy Bag Work', category: 'CARDIO', muscleGroup: 'Sport', equipment: ['Heavy Bag', 'Gloves'], difficulty: 'Intermediate' },

  // CROSSFIT - WEIGHTLIFTING
  { id: 'cf-wl-001', name: 'Snatch', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'cf-wl-002', name: 'Power Snatch', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'cf-wl-003', name: 'Clean & Jerk', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'cf-wl-004', name: 'Power Clean', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'cf-wl-005', name: 'Hang Clean', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'cf-wl-006', name: 'Thrusters', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'cf-wl-007', name: 'Wall Balls', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Medicine Ball', 'Wall'], difficulty: 'Beginner' },
  { id: 'cf-wl-008', name: 'Kettlebell Swing', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Kettlebell'], difficulty: 'Beginner' },
  { id: 'cf-wl-009', name: 'Dumbbell Snatch', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Dumbbell'], difficulty: 'Intermediate' },
  { id: 'cf-wl-010', name: 'Devil Press', category: 'CROSSFIT', muscleGroup: 'Weightlifting', equipment: ['Dumbbells'], difficulty: 'Intermediate' },

  // CROSSFIT - GYMNASTICS
  { id: 'cf-gym-001', name: 'Toes-to-Bar', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'cf-gym-002', name: 'Chest-to-Bar Pull-Up', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'cf-gym-003', name: 'Bar Muscle-Up', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Advanced' },
  { id: 'cf-gym-004', name: 'Ring Muscle-Up', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Rings'], difficulty: 'Advanced' },
  { id: 'cf-gym-005', name: 'Handstand Walk', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: [], difficulty: 'Advanced' },
  { id: 'cf-gym-006', name: 'Rope Climb', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Climbing Rope'], difficulty: 'Intermediate' },
  { id: 'cf-gym-007', name: 'Strict HSPU', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Wall'], difficulty: 'Advanced' },
  { id: 'cf-gym-008', name: 'Kipping HSPU', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Wall'], difficulty: 'Advanced' },

  // CROSSFIT - MONOSTRUCTURAL
  { id: 'cf-mono-001', name: 'Assault Bike Calories', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['Assault Bike'], difficulty: 'Beginner' },
  { id: 'cf-mono-002', name: 'Row Calories', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['Rowing Machine'], difficulty: 'Beginner' },
  { id: 'cf-mono-003', name: 'SkiErg Calories', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['SkiErg'], difficulty: 'Intermediate' },
  { id: 'cf-mono-004', name: 'Double Unders', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['Jump Rope'], difficulty: 'Intermediate' },
  { id: 'cf-mono-005', name: 'Box Jumps', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['Plyo Box'], difficulty: 'Beginner' },
  { id: 'cf-mono-006', name: 'Burpee Box Jump Overs', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: ['Plyo Box'], difficulty: 'Intermediate' },
  { id: 'cf-mono-007', name: 'Run 400m', category: 'CROSSFIT', muscleGroup: 'Monostructural', equipment: [], difficulty: 'Beginner' },
];

export const BENCHMARK_WODS = [
  { id: 'wod-fran', name: 'Fran', exercises: ['Thrusters', 'Pull-Ups'], scheme: '21-15-9', type: 'For Time' },
  { id: 'wod-murph', name: 'Murph', exercises: ['Run 1 Mile', 'Pull-Ups', 'Push-Ups', 'Air Squats', 'Run 1 Mile'], scheme: '100-200-300', type: 'For Time' },
  { id: 'wod-diane', name: 'Diane', exercises: ['Deadlift', 'HSPU'], scheme: '21-15-9', type: 'For Time' },
  { id: 'wod-grace', name: 'Grace', exercises: ['Clean & Jerk'], scheme: '30 reps', type: 'For Time' },
  { id: 'wod-cindy', name: 'Cindy', exercises: ['Pull-Ups', 'Push-Ups', 'Air Squats'], scheme: '5-10-15', type: 'AMRAP 20' },
  { id: 'wod-helen', name: 'Helen', exercises: ['Run 400m', 'Kettlebell Swing', 'Pull-Ups'], scheme: '3 rounds', type: 'For Time' },
  { id: 'wod-annie', name: 'Annie', exercises: ['Double Unders', 'Sit-Ups'], scheme: '50-40-30-20-10', type: 'For Time' },
  { id: 'wod-jackie', name: 'Jackie', exercises: ['Row 1000m', 'Thrusters', 'Pull-Ups'], scheme: '50-30', type: 'For Time' },
];

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => ex.category === category);
};

export const getExercisesByMuscleGroup = (muscleGroup: string): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => ex.muscleGroup === muscleGroup);
};

export const getExercisesByDifficulty = (difficulty: ExerciseDifficulty): Exercise[] => {
  return EXERCISE_LIBRARY.filter(ex => ex.difficulty === difficulty);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISE_LIBRARY.find(ex => ex.id === id);
};

export const searchExercises = (query: string): Exercise[] => {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.muscleGroup.toLowerCase().includes(lowerQuery) ||
    ex.equipment.some(eq => eq.toLowerCase().includes(lowerQuery))
  );
};
