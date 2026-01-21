export type ExerciseCategory = 'GYM' | 'BODYWEIGHT' | 'CARDIO' | 'CROSSFIT';
export type ExerciseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ExerciseEntry {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: string;
  equipment: string[];
  difficulty: ExerciseDifficulty;
}

export const EXERCISE_LIBRARY: ExerciseEntry[] = [
  // GYM - CHEST
  { id: 'barbell-bench-press-flat', name: 'Barbell Bench Press (Flat)', category: 'GYM', muscleGroup: 'Chest', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },
  { id: 'barbell-bench-press-incline', name: 'Barbell Bench Press (Incline)', category: 'GYM', muscleGroup: 'Chest', equipment: ['Barbell', 'Incline Bench'], difficulty: 'Intermediate' },
  { id: 'barbell-bench-press-decline', name: 'Barbell Bench Press (Decline)', category: 'GYM', muscleGroup: 'Chest', equipment: ['Barbell', 'Decline Bench'], difficulty: 'Intermediate' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dumbbells', 'Bench'], difficulty: 'Beginner' },
  { id: 'chest-press-machine', name: 'Chest Press Machine', category: 'GYM', muscleGroup: 'Chest', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'weighted-dips', name: 'Weighted Dips', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dip Station', 'Weight Belt'], difficulty: 'Advanced' },
  { id: 'dumbbell-flys', name: 'Dumbbell Flys', category: 'GYM', muscleGroup: 'Chest', equipment: ['Dumbbells', 'Bench'], difficulty: 'Beginner' },
  { id: 'cable-crossovers', name: 'Cable Crossovers', category: 'GYM', muscleGroup: 'Chest', equipment: ['Cable Machine'], difficulty: 'Intermediate' },
  { id: 'pec-deck-machine', name: 'Pec Deck Machine', category: 'GYM', muscleGroup: 'Chest', equipment: ['Machine'], difficulty: 'Beginner' },

  // GYM - BACK
  { id: 'lat-pulldown-wide', name: 'Lat Pulldown (Wide Grip)', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'lat-pulldown-close', name: 'Lat Pulldown (Close Grip)', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'lat-pulldown-reverse', name: 'Lat Pulldown (Reverse Grip)', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Intermediate' },
  { id: 'weighted-pull-ups', name: 'Weighted Pull-Ups', category: 'GYM', muscleGroup: 'Back', equipment: ['Pull-Up Bar', 'Weight Belt'], difficulty: 'Advanced' },
  { id: 'barbell-bent-over-row', name: 'Barbell Bent Over Row', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'dumbbell-row', name: 'Dumbbell Row (Single Arm)', category: 'GYM', muscleGroup: 'Back', equipment: ['Dumbbell', 'Bench'], difficulty: 'Beginner' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'GYM', muscleGroup: 'Back', equipment: ['T-Bar', 'Plates'], difficulty: 'Intermediate' },
  { id: 'deadlift-conventional', name: 'Deadlift (Conventional)', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'deadlift-sumo', name: 'Deadlift (Sumo)', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'rack-pull', name: 'Rack Pull', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell', 'Power Rack'], difficulty: 'Intermediate' },
  { id: 'hyperextensions', name: 'Hyperextensions', category: 'GYM', muscleGroup: 'Back', equipment: ['Hyperextension Bench'], difficulty: 'Beginner' },
  { id: 'barbell-shrugs', name: 'Barbell Shrugs', category: 'GYM', muscleGroup: 'Back', equipment: ['Barbell'], difficulty: 'Beginner' },
  { id: 'face-pulls', name: 'Face Pulls', category: 'GYM', muscleGroup: 'Back', equipment: ['Cable Machine', 'Rope'], difficulty: 'Beginner' },

  // GYM - LEGS (QUADS)
  { id: 'back-squat', name: 'Back Squat', category: 'GYM', muscleGroup: 'Quads', equipment: ['Barbell', 'Squat Rack'], difficulty: 'Intermediate' },
  { id: 'front-squat', name: 'Front Squat', category: 'GYM', muscleGroup: 'Quads', equipment: ['Barbell', 'Squat Rack'], difficulty: 'Advanced' },
  { id: 'leg-press', name: 'Leg Press', category: 'GYM', muscleGroup: 'Quads', equipment: ['Leg Press Machine'], difficulty: 'Beginner' },
  { id: 'hack-squat', name: 'Hack Squat', category: 'GYM', muscleGroup: 'Quads', equipment: ['Hack Squat Machine'], difficulty: 'Intermediate' },
  { id: 'leg-extension', name: 'Leg Extension', category: 'GYM', muscleGroup: 'Quads', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'GYM', muscleGroup: 'Quads', equipment: ['Dumbbell'], difficulty: 'Beginner' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'GYM', muscleGroup: 'Quads', equipment: ['Dumbbells', 'Bench'], difficulty: 'Intermediate' },

  // GYM - LEGS (HAMSTRINGS)
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (RDL)', category: 'GYM', muscleGroup: 'Hamstrings', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', category: 'GYM', muscleGroup: 'Hamstrings', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl', category: 'GYM', muscleGroup: 'Hamstrings', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'nordic-curl', name: 'Nordic Curl', category: 'GYM', muscleGroup: 'Hamstrings', equipment: ['Bodyweight'], difficulty: 'Advanced' },
  { id: 'good-mornings', name: 'Good Mornings', category: 'GYM', muscleGroup: 'Hamstrings', equipment: ['Barbell'], difficulty: 'Intermediate' },

  // GYM - LEGS (GLUTES)
  { id: 'barbell-hip-thrust', name: 'Hip Thrust (Barbell)', category: 'GYM', muscleGroup: 'Glutes', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },
  { id: 'machine-hip-thrust', name: 'Hip Thrust (Machine)', category: 'GYM', muscleGroup: 'Glutes', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'glute-bridge', name: 'Glute Bridge', category: 'GYM', muscleGroup: 'Glutes', equipment: ['Bodyweight'], difficulty: 'Beginner' },
  { id: 'cable-kickbacks', name: 'Cable Kickbacks', category: 'GYM', muscleGroup: 'Glutes', equipment: ['Cable Machine', 'Ankle Strap'], difficulty: 'Beginner' },
  { id: 'abductor-machine', name: 'Abductor Machine', category: 'GYM', muscleGroup: 'Glutes', equipment: ['Machine'], difficulty: 'Beginner' },

  // GYM - LEGS (CALVES)
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'GYM', muscleGroup: 'Calves', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'GYM', muscleGroup: 'Calves', equipment: ['Machine'], difficulty: 'Beginner' },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', category: 'GYM', muscleGroup: 'Calves', equipment: ['Machine'], difficulty: 'Intermediate' },

  // GYM - SHOULDERS
  { id: 'overhead-press-barbell', name: 'Overhead Press (Barbell)', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'overhead-press-dumbbell', name: 'Overhead Press (Dumbbell)', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Intermediate' },
  { id: 'front-raise', name: 'Front Raise', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'lateral-raise-dumbbell', name: 'Lateral Raise (Dumbbell)', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'lateral-raise-cable', name: 'Lateral Raise (Cable)', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'upright-row', name: 'Upright Row', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'GYM', muscleGroup: 'Shoulders', equipment: ['Dumbbells'], difficulty: 'Beginner' },

  // GYM - BICEPS
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['Barbell'], difficulty: 'Beginner' },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['Dumbbells'], difficulty: 'Beginner' },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['EZ Bar', 'Preacher Bench'], difficulty: 'Beginner' },
  { id: 'cable-curl', name: 'Cable Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'concentration-curl', name: 'Concentration Curl', category: 'GYM', muscleGroup: 'Biceps', equipment: ['Dumbbell'], difficulty: 'Beginner' },

  // GYM - TRICEPS
  { id: 'tricep-pushdown-rope', name: 'Tricep Pushdown (Rope)', category: 'GYM', muscleGroup: 'Triceps', equipment: ['Cable Machine', 'Rope'], difficulty: 'Beginner' },
  { id: 'tricep-pushdown-bar', name: 'Tricep Pushdown (Bar)', category: 'GYM', muscleGroup: 'Triceps', equipment: ['Cable Machine'], difficulty: 'Beginner' },
  { id: 'skullcrushers', name: 'Skullcrushers', category: 'GYM', muscleGroup: 'Triceps', equipment: ['EZ Bar', 'Bench'], difficulty: 'Intermediate' },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'GYM', muscleGroup: 'Triceps', equipment: ['Dumbbell'], difficulty: 'Beginner' },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', category: 'GYM', muscleGroup: 'Triceps', equipment: ['Barbell', 'Bench'], difficulty: 'Intermediate' },
  { id: 'bench-dips', name: 'Bench Dips', category: 'GYM', muscleGroup: 'Triceps', equipment: ['Bench'], difficulty: 'Beginner' },

  // BODYWEIGHT - UPPER PUSH
  { id: 'push-up-standard', name: 'Push-Up (Standard)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Beginner' },
  { id: 'push-up-wide', name: 'Push-Up (Wide)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Beginner' },
  { id: 'push-up-diamond', name: 'Push-Up (Diamond)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Intermediate' },
  { id: 'push-up-decline', name: 'Push-Up (Decline)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Bench'], difficulty: 'Intermediate' },
  { id: 'push-up-incline', name: 'Push-Up (Incline)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Bench'], difficulty: 'Beginner' },
  { id: 'push-up-archer', name: 'Push-Up (Archer)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Advanced' },
  { id: 'pike-push-up', name: 'Pike Push-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: [], difficulty: 'Intermediate' },
  { id: 'handstand-push-up', name: 'Handstand Push-Up (Wall)', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Wall'], difficulty: 'Advanced' },
  { id: 'parallel-bar-dips', name: 'Parallel Bar Dips', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Dip Station'], difficulty: 'Intermediate' },
  { id: 'ring-dips', name: 'Ring Dips', category: 'BODYWEIGHT', muscleGroup: 'Upper Push', equipment: ['Rings'], difficulty: 'Advanced' },

  // BODYWEIGHT - UPPER PULL
  { id: 'pull-up', name: 'Pull-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'chin-up', name: 'Chin-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'commando-pull-up', name: 'Commando Pull-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Advanced' },
  { id: 'muscle-up', name: 'Muscle-Up', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Pull-Up Bar'], difficulty: 'Advanced' },
  { id: 'inverted-row', name: 'Inverted Row', category: 'BODYWEIGHT', muscleGroup: 'Upper Pull', equipment: ['Bar', 'Rings'], difficulty: 'Beginner' },

  // BODYWEIGHT - LOWER BODY
  { id: 'air-squat', name: 'Air Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'jump-squat', name: 'Jump Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Intermediate' },
  { id: 'pistol-squat', name: 'Pistol Squat', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Advanced' },
  { id: 'bodyweight-bulgarian-split-squat', name: 'Bulgarian Split Squat (BW)', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: ['Bench'], difficulty: 'Intermediate' },
  { id: 'forward-lunge', name: 'Lunge (Forward)', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'reverse-lunge', name: 'Lunge (Reverse)', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'walking-lunge', name: 'Lunge (Walking)', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },
  { id: 'step-ups', name: 'Step-Ups', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: ['Box'], difficulty: 'Beginner' },
  { id: 'single-leg-calf-raise', name: 'Single-Leg Calf Raise', category: 'BODYWEIGHT', muscleGroup: 'Lower Body', equipment: [], difficulty: 'Beginner' },

  // BODYWEIGHT - CORE
  { id: 'plank', name: 'Plank', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'side-plank', name: 'Side Plank', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'hollow-body-hold', name: 'Hollow Body Hold', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Intermediate' },
  { id: 'l-sit', name: 'L-Sit', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: ['Parallettes'], difficulty: 'Advanced' },
  { id: 'crunches', name: 'Crunches', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'leg-raises-lying', name: 'Leg Raises (Lying)', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'leg-raises-hanging', name: 'Leg Raises (Hanging)', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'russian-twists', name: 'Russian Twists', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'bicycle-crunches', name: 'Bicycle Crunches', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },
  { id: 'v-ups', name: 'V-Ups', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Intermediate' },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'BODYWEIGHT', muscleGroup: 'Core', equipment: [], difficulty: 'Beginner' },

  // BODYWEIGHT - FULL BODY
  { id: 'burpees', name: 'Burpees', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Intermediate' },
  { id: 'bear-crawl', name: 'Bear Crawl', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Beginner' },
  { id: 'crab-walk', name: 'Crab Walk', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Beginner' },
  { id: 'jumping-jacks', name: 'Jumping Jacks', category: 'BODYWEIGHT', muscleGroup: 'Full Body', equipment: [], difficulty: 'Beginner' },

  // CARDIO - LISS
  { id: 'incline-walking', name: 'Incline Walking (Treadmill)', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Treadmill'], difficulty: 'Beginner' },
  { id: 'elliptical-cruise', name: 'Elliptical Cruise', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Elliptical'], difficulty: 'Beginner' },
  { id: 'stationary-bike-steady', name: 'Stationary Bike (Steady)', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Bike'], difficulty: 'Beginner' },
  { id: 'outdoor-jogging', name: 'Outdoor Jogging', category: 'CARDIO', muscleGroup: 'LISS', equipment: [], difficulty: 'Beginner' },
  { id: 'swimming-laps', name: 'Swimming (Laps)', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Pool'], difficulty: 'Beginner' },
  { id: 'rucking', name: 'Rucking', category: 'CARDIO', muscleGroup: 'LISS', equipment: ['Weighted Backpack'], difficulty: 'Intermediate' },

  // CARDIO - HIIT
  { id: 'treadmill-sprints', name: 'Sprints (Treadmill)', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Treadmill'], difficulty: 'Intermediate' },
  { id: 'track-sprints', name: 'Sprints (Track)', category: 'CARDIO', muscleGroup: 'HIIT', equipment: [], difficulty: 'Intermediate' },
  { id: 'assault-bike-sprints', name: 'Assault Bike Sprints', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Assault Bike'], difficulty: 'Intermediate' },
  { id: 'rower-sprints', name: 'Rower Sprints', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Rowing Machine'], difficulty: 'Intermediate' },
  { id: 'stairmaster-intervals', name: 'Stairmaster Intervals', category: 'CARDIO', muscleGroup: 'HIIT', equipment: ['Stairmaster'], difficulty: 'Intermediate' },

  // CARDIO - MACHINE BASED
  { id: 'rowing-machine', name: 'Rowing Machine (Erg)', category: 'CARDIO', muscleGroup: 'Machine Cardio', equipment: ['Rowing Machine'], difficulty: 'Beginner' },
  { id: 'skierg', name: 'SkiErg', category: 'CARDIO', muscleGroup: 'Machine Cardio', equipment: ['SkiErg'], difficulty: 'Intermediate' },
  { id: 'jacobs-ladder', name: 'Jacobs Ladder', category: 'CARDIO', muscleGroup: 'Machine Cardio', equipment: ['Jacobs Ladder'], difficulty: 'Intermediate' },
  { id: 'versaclimber', name: 'VersaClimber', category: 'CARDIO', muscleGroup: 'Machine Cardio', equipment: ['VersaClimber'], difficulty: 'Intermediate' },

  // CARDIO - SPORT SPECIFIC
  { id: 'shadow-boxing', name: 'Shadow Boxing', category: 'CARDIO', muscleGroup: 'Sport Specific', equipment: [], difficulty: 'Beginner' },
  { id: 'jump-rope-single', name: 'Jump Rope (Single Unders)', category: 'CARDIO', muscleGroup: 'Sport Specific', equipment: ['Jump Rope'], difficulty: 'Beginner' },
  { id: 'jump-rope-double', name: 'Jump Rope (Double Unders)', category: 'CARDIO', muscleGroup: 'Sport Specific', equipment: ['Jump Rope'], difficulty: 'Advanced' },
  { id: 'heavy-bag-work', name: 'Heavy Bag Work', category: 'CARDIO', muscleGroup: 'Sport Specific', equipment: ['Heavy Bag'], difficulty: 'Intermediate' },

  // CROSSFIT - WEIGHTLIFTING
  { id: 'snatch-power', name: 'Snatch (Power)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'snatch-squat', name: 'Snatch (Squat)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'clean-and-jerk', name: 'Clean & Jerk', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'clean-power', name: 'Clean (Power)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'clean-squat', name: 'Clean (Squat)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'clean-hang', name: 'Clean (Hang)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'jerk-push', name: 'Jerk (Push)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'jerk-split', name: 'Jerk (Split)', category: 'CROSSFIT', muscleGroup: 'Olympic', equipment: ['Barbell'], difficulty: 'Advanced' },
  { id: 'thrusters', name: 'Thrusters', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { id: 'devil-press', name: 'Devil Press', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Dumbbells'], difficulty: 'Intermediate' },
  { id: 'dumbbell-snatch', name: 'Dumbbell Snatch', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Dumbbell'], difficulty: 'Intermediate' },
  { id: 'kettlebell-swing-american', name: 'Kettlebell Swing (American)', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Kettlebell'], difficulty: 'Intermediate' },
  { id: 'kettlebell-swing-russian', name: 'Kettlebell Swing (Russian)', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Kettlebell'], difficulty: 'Beginner' },
  { id: 'wall-balls', name: 'Wall Balls', category: 'CROSSFIT', muscleGroup: 'Cycling', equipment: ['Medicine Ball', 'Wall'], difficulty: 'Beginner' },

  // CROSSFIT - GYMNASTICS
  { id: 'toes-to-bar', name: 'Toes-to-Bar (T2B)', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'chest-to-bar-pull-ups', name: 'Chest-to-Bar Pull-Ups', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' },
  { id: 'bar-muscle-ups', name: 'Bar Muscle-Ups', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Pull-Up Bar'], difficulty: 'Advanced' },
  { id: 'ring-muscle-ups', name: 'Ring Muscle-Ups', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Rings'], difficulty: 'Advanced' },
  { id: 'handstand-walk', name: 'Handstand Walk', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: [], difficulty: 'Advanced' },
  { id: 'handstand-push-up-strict', name: 'Handstand Push-Up (Strict)', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Wall'], difficulty: 'Advanced' },
  { id: 'handstand-push-up-kipping', name: 'Handstand Push-Up (Kipping)', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Wall'], difficulty: 'Advanced' },
  { id: 'rope-climb-standard', name: 'Rope Climb (Standard)', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Rope'], difficulty: 'Intermediate' },
  { id: 'rope-climb-legless', name: 'Rope Climb (Legless)', category: 'CROSSFIT', muscleGroup: 'Gymnastics', equipment: ['Rope'], difficulty: 'Advanced' },

  // CROSSFIT - MONOSTRUCTURAL
  { id: 'assault-bike-calories', name: 'Assault Bike (Calories)', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Assault Bike'], difficulty: 'Intermediate' },
  { id: 'row-meters', name: 'Row (Meters)', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Rowing Machine'], difficulty: 'Beginner' },
  { id: 'row-calories', name: 'Row (Calories)', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Rowing Machine'], difficulty: 'Beginner' },
  { id: 'skierg-metcon', name: 'SkiErg (Metcon)', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['SkiErg'], difficulty: 'Intermediate' },
  { id: 'double-unders', name: 'Double Unders', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Jump Rope'], difficulty: 'Intermediate' },
  { id: 'box-jumps', name: 'Box Jumps', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Box'], difficulty: 'Beginner' },
  { id: 'box-jump-overs', name: 'Box Jump Overs', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Box'], difficulty: 'Intermediate' },
  { id: 'burpee-box-jump-overs', name: 'Burpee Box Jump Overs', category: 'CROSSFIT', muscleGroup: 'Metcon', equipment: ['Box'], difficulty: 'Intermediate' },
];

export const BENCHMARK_WODS = [
  { id: 'fran', name: 'Fran', description: '21-15-9 Thrusters (95/65) + Pull-Ups', category: 'CROSSFIT' as const, muscleGroup: 'Benchmark', equipment: ['Barbell', 'Pull-Up Bar'], difficulty: 'Advanced' as const },
  { id: 'murph', name: 'Murph', description: '1mi Run + 100 Pull-Ups + 200 Push-Ups + 300 Squats + 1mi Run', category: 'CROSSFIT' as const, muscleGroup: 'Benchmark', equipment: ['Weight Vest'], difficulty: 'Advanced' as const },
  { id: 'diane', name: 'Diane', description: '21-15-9 Deadlift (225/155) + HSPU', category: 'CROSSFIT' as const, muscleGroup: 'Benchmark', equipment: ['Barbell', 'Wall'], difficulty: 'Advanced' as const },
  { id: 'grace', name: 'Grace', description: '30 Clean & Jerks (135/95) for time', category: 'CROSSFIT' as const, muscleGroup: 'Benchmark', equipment: ['Barbell'], difficulty: 'Advanced' as const },
  { id: 'cindy', name: 'Cindy', description: '20min AMRAP: 5 Pull-Ups + 10 Push-Ups + 15 Squats', category: 'CROSSFIT' as const, muscleGroup: 'Benchmark', equipment: ['Pull-Up Bar'], difficulty: 'Intermediate' as const },
];

export const getExercisesByCategory = (category: ExerciseCategory): ExerciseEntry[] => {
  return EXERCISE_LIBRARY.filter(e => e.category === category);
};

export const getExercisesByMuscleGroup = (muscleGroup: string): ExerciseEntry[] => {
  return EXERCISE_LIBRARY.filter(e => e.muscleGroup === muscleGroup);
};

export const getExercisesByDifficulty = (difficulty: ExerciseDifficulty): ExerciseEntry[] => {
  return EXERCISE_LIBRARY.filter(e => e.difficulty === difficulty);
};

export const getExercisesByEquipment = (equipment: string): ExerciseEntry[] => {
  return EXERCISE_LIBRARY.filter(e => e.equipment.includes(equipment));
};

export const searchExercises = (query: string): ExerciseEntry[] => {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(e => 
    e.name.toLowerCase().includes(lowerQuery) ||
    e.muscleGroup.toLowerCase().includes(lowerQuery) ||
    e.category.toLowerCase().includes(lowerQuery)
  );
};
