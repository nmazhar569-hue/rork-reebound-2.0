import { Exercise, ExerciseDomain } from '@/types/workout';

export const EXERCISE_DATABASE: Record<string, Exercise> = {
    // ═══════════════════════════════════════════════════════════
    // CHEST EXERCISES
    // ═══════════════════════════════════════════════════════════
    'bench_press_barbell': {
        id: 'bench_press_barbell',
        name: 'Barbell Bench Press',
        categories: ['gym'],
        difficulty: 'Advanced',
        equipment: ['Barbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Pectoralis Major', 'Anterior Deltoid'],
            secondary: ['Triceps Brachii', 'Core Stabilizers']
        },
        description: "The bench press allows you to lift heavy weight through a full range of motion, creating mechanical tension—the primary driver of muscle growth.",
        best_for: ["Building maximal pressing strength", "Chest size (hypertrophy)", "Upper body power"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "1-5", rest: "3-5 minutes", intensity: "85-95% 1RM" },
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90-120 seconds", intensity: "70-80% 1RM" },
            endurance: { sets: "2-3", reps: "15-20", rest: "30-60 seconds", intensity: "50-60% 1RM" }
        },
        form_tips: ["Keep shoulder blades pulled back", "Bar touches mid-chest", "Feet flat on floor"],
        common_mistakes: ["Bouncing bar off chest", "Lifting hips", "Flaring elbows"],
        alternatives: [{ id: 'bench_press_dumbbell', name: 'Dumbbell Bench Press', reason: "Greater range of motion" }],
        tags: ['push', 'horizontal_press', 'barbell', 'compound']
    },
    'bench_press_dumbbell': {
        id: 'bench_press_dumbbell',
        name: 'Dumbbell Bench Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Dumbbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Pectoralis Major', 'Anterior Deltoid'],
            secondary: ['Triceps Brachii', 'Core Stabilizers']
        },
        description: "Allows greater range of motion than barbell and helps correct imbalances between sides.",
        best_for: ["Muscle balance", "Greater stretch", "Shoulder health"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-80% effort" }
        },
        form_tips: ["Control the descent", "Touch dumbbells at top", "Keep wrists neutral"],
        common_mistakes: ["Going too heavy", "Letting dumbbells drift"],
        alternatives: [{ id: 'bench_press_barbell', name: 'Barbell Bench Press', reason: "Heavier loading" }],
        tags: ['push', 'dumbbell', 'compound']
    },
    'incline_bench_press': {
        id: 'incline_bench_press',
        name: 'Incline Bench Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Upper Pectoralis Major', 'Anterior Deltoid'],
            secondary: ['Triceps Brachii']
        },
        description: "Targets the upper chest fibers more than flat pressing. Essential for complete chest development.",
        best_for: ["Upper chest development", "Shoulder stability", "Aesthetic balance"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Set bench to 30-45 degrees", "Lower to upper chest", "Drive through heels"],
        common_mistakes: ["Bench angle too steep", "Bouncing weight"],
        alternatives: [{ id: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', reason: "More range of motion" }],
        tags: ['push', 'incline', 'barbell']
    },
    'pushups': {
        id: 'pushups',
        name: 'Push-Ups',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'compound',
        muscles: {
            primary: ['Pectoralis Major', 'Anterior Deltoid'],
            secondary: ['Triceps Brachii', 'Core']
        },
        description: "A foundational bodyweight movement that builds pushing strength and core stability simultaneously.",
        best_for: ["Building base strength", "Core stability", "Anywhere training"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "Near failure", rest: "60-90s", intensity: "Bodyweight" }
        },
        bodyweight_benchmarks: { beginner: "1-10 reps", intermediate: "20-40 reps", advanced: "50+ reps" },
        form_tips: ["Keep body in straight line", "Elbows at 45 degrees", "Full range of motion"],
        common_mistakes: ["Sagging hips", "Elbows flared 90 degrees"],
        alternatives: [],
        tags: ['push', 'bodyweight']
    },
    'chest_fly_dumbbell': {
        id: 'chest_fly_dumbbell',
        name: 'Dumbbell Chest Fly',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Dumbbell', 'Other'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Pectoralis Major'],
            secondary: ['Anterior Deltoid']
        },
        description: "Isolates the chest with a deep stretch. Great for muscle building and chest width.",
        best_for: ["Chest isolation", "Deep stretch", "Finishing movement"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Slight bend in elbows", "Control the stretch", "Squeeze at top"],
        common_mistakes: ["Going too heavy", "Straightening elbows"],
        alternatives: [{ id: 'cable_fly', name: 'Cable Fly', reason: "Constant tension" }],
        tags: ['isolation', 'dumbbell']
    },
    'cable_fly': {
        id: 'cable_fly',
        name: 'Cable Fly',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Cable'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Pectoralis Major'],
            secondary: ['Anterior Deltoid']
        },
        description: "Constant tension across the entire range of motion makes cable flies excellent for chest isolation.",
        best_for: ["Constant tension", "Inner chest squeeze", "Finishing movement"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "12-15", rest: "60s", intensity: "Moderate" }
        },
        form_tips: ["Step forward to create tension", "Slight elbow bend", "Hug a tree motion"],
        common_mistakes: ["Using too much weight", "Pressing instead of flying"],
        alternatives: [{ id: 'chest_fly_dumbbell', name: 'Dumbbell Chest Fly', reason: "Free weight version" }],
        tags: ['isolation', 'cable']
    },
    'dips_chest': {
        id: 'dips_chest',
        name: 'Chest Dips',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Pectoralis Major', 'Triceps'],
            secondary: ['Anterior Deltoid']
        },
        description: "Bodyweight pressing movement with great stretch for chest when performed with forward lean.",
        best_for: ["Lower chest", "Tricep strength", "Bodyweight pushing"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-15", rest: "90 seconds", intensity: "Bodyweight" }
        },
        form_tips: ["Lean forward for chest", "Deep stretch at bottom", "Control descent"],
        common_mistakes: ["Going too deep", "No forward lean"],
        alternatives: [{ id: 'pushups', name: 'Push-Ups', reason: "Easier alternative" }],
        tags: ['push', 'bodyweight', 'compound']
    },

    // ═══════════════════════════════════════════════════════════
    // BACK EXERCISES
    // ═══════════════════════════════════════════════════════════
    'deadlift_conventional': {
        id: 'deadlift_conventional',
        name: 'Conventional Deadlift',
        categories: ['gym'],
        difficulty: 'Advanced',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Erector Spinae', 'Glutes', 'Hamstrings'],
            secondary: ['Lats', 'Traps', 'Forearms']
        },
        description: "Builds total body strength like no other exercise. The ultimate test of posterior chain power.",
        best_for: ["Posterior chain strength", "Back density", "Grip strength"],
        guidance_by_goal: {
            strength: { sets: "1-3", reps: "1-5", rest: "3-5 min", intensity: "90%+" }
        },
        form_tips: ["Bar against shins", "Pull slack out", "Drive floor away"],
        common_mistakes: ["Rounding lower back", "Jerking the bar"],
        alternatives: [{ id: 'romanian_deadlift', name: 'Romanian Deadlift', reason: "More hamstring focus" }],
        tags: ['pull', 'hinge', 'barbell']
    },
    'pullups': {
        id: 'pullups',
        name: 'Pull-Ups',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Latissimus Dorsi', 'Biceps'],
            secondary: ['Rear Deltoid', 'Rhomboids', 'Core']
        },
        description: "The gold standard for back development. Builds a wide, V-tapered back.",
        best_for: ["Back width", "Relative strength", "Functional pulling"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "6-12", rest: "90 seconds", intensity: "Bodyweight" }
        },
        bodyweight_benchmarks: { beginner: "1-5 reps", intermediate: "8-12 reps", advanced: "15+ reps" },
        form_tips: ["Full hang at bottom", "Chest to bar", "Control descent"],
        common_mistakes: ["Kipping", "Partial range"],
        alternatives: [{ id: 'lat_pulldown', name: 'Lat Pulldown', reason: "Easier to scale weight" }],
        tags: ['pull', 'bodyweight', 'compound']
    },
    'barbell_row': {
        id: 'barbell_row',
        name: 'Barbell Row',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Latissimus Dorsi', 'Rhomboids', 'Rear Deltoid'],
            secondary: ['Biceps', 'Erector Spinae']
        },
        description: "Heavy horizontal pulling builds back thickness and strength. Essential for a balanced physique.",
        best_for: ["Back thickness", "Pulling strength", "Posture"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-80%" }
        },
        form_tips: ["Hinge at hips", "Pull to lower chest", "Squeeze shoulder blades"],
        common_mistakes: ["Too much body english", "Standing too upright"],
        alternatives: [{ id: 'dumbbell_row', name: 'Dumbbell Row', reason: "Unilateral focus" }],
        tags: ['pull', 'horizontal_row', 'barbell']
    },
    'pendlay_row': {
        id: 'pendlay_row',
        name: 'Pendlay Row',
        categories: ['gym'],
        difficulty: 'Advanced',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Latissimus Dorsi', 'Rhomboids', 'Erector Spinae'],
            secondary: ['Biceps', 'Forearms']
        },
        description: "A strict barbell row where each rep starts from the floor. Builds explosive pulling power and back thickness.",
        best_for: ["Explosive strength", "Back thickness", "Deadlift assistance"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "5", rest: "2-3 min", intensity: "75-85%" }
        },
        form_tips: ["Back parallel to floor", "Pull explosively to upper abs", "Return bar to floor completely"],
        common_mistakes: ["Hips rising too fast", "Back rounding"],
        alternatives: [{ id: 'barbell_row', name: 'Barbell Row', reason: "Higher rep volume" }],
        tags: ['pull', 'horizontal_row', 'barbell', 'power']
    },
    'dumbbell_row': {
        id: 'dumbbell_row',
        name: 'Dumbbell Row',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Latissimus Dorsi', 'Rhomboids'],
            secondary: ['Biceps', 'Rear Deltoid']
        },
        description: "Single-arm rowing allows for greater range of motion and helps correct imbalances.",
        best_for: ["Muscle balance", "Back development", "Core stability"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12 each arm", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Brace on bench", "Pull to hip", "Full stretch at bottom"],
        common_mistakes: ["Rotating torso", "Using momentum"],
        alternatives: [{ id: 'barbell_row', name: 'Barbell Row', reason: "Heavier loading" }],
        tags: ['pull', 'dumbbell', 'unilateral']
    },
    'lat_pulldown': {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Cable', 'Machine'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Latissimus Dorsi'],
            secondary: ['Biceps', 'Rear Deltoid', 'Rhomboids']
        },
        description: "Machine-based pulling that mimics pull-ups with adjustable resistance.",
        best_for: ["Building to pull-ups", "Back width", "Controlled loading"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12", rest: "60-90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Lean back slightly", "Pull to chest", "Squeeze at bottom"],
        common_mistakes: ["Leaning too far back", "Pulling behind neck"],
        alternatives: [{ id: 'pullups', name: 'Pull-Ups', reason: "Bodyweight progression" }],
        tags: ['pull', 'cable', 'machine']
    },
    'seated_cable_row': {
        id: 'seated_cable_row',
        name: 'Seated Cable Row',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Cable', 'Machine'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Rhomboids', 'Mid Trapezius', 'Latissimus Dorsi'],
            secondary: ['Biceps', 'Rear Deltoid']
        },
        description: "Constant cable tension makes this excellent for back development and posture.",
        best_for: ["Back thickness", "Posture improvement", "Controlled rowing"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12", rest: "60-90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Sit tall", "Pull to lower chest", "Pause at contraction"],
        common_mistakes: ["Rocking back", "Shrugging shoulders"],
        alternatives: [{ id: 'barbell_row', name: 'Barbell Row', reason: "Free weight alternative" }],
        tags: ['pull', 'cable', 'horizontal_row']
    },
    'face_pulls': {
        id: 'face_pulls',
        name: 'Face Pulls',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Cable', 'Band'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Rear Deltoid', 'Mid Trapezius', 'Rhomboids'],
            secondary: ['Rotator Cuff']
        },
        description: "Essential for shoulder health and posture. Balances all the pressing you do.",
        best_for: ["Shoulder health", "Posture", "Rear delt development"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "15-20", rest: "60 seconds", intensity: "Light-Moderate" }
        },
        form_tips: ["Pull to face level", "External rotate at end", "Lead with elbows"],
        common_mistakes: ["Going too heavy", "Not externally rotating"],
        alternatives: [],
        tags: ['pull', 'cable', 'shoulder_health']
    },

    // ═══════════════════════════════════════════════════════════
    // LEG EXERCISES
    // ═══════════════════════════════════════════════════════════
    'squat_barbell': {
        id: 'squat_barbell',
        name: 'Barbell Back Squat',
        categories: ['gym'],
        difficulty: 'Advanced',
        equipment: ['Barbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Quadriceps', 'Gluteus Maximus'],
            secondary: ['Hamstrings', 'Erector Spinae', 'Core']
        },
        description: "The king of lower body exercises. Builds total body strength and muscle mass.",
        best_for: ["Lower body strength", "Total body mass", "Athletic power"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "3-5", rest: "3-5 min", intensity: "85%+" },
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "2-3 min", intensity: "70-80%" }
        },
        form_tips: ["Keep chest up", "Knees track over toes", "Brace core hard"],
        common_mistakes: ["Knees caving in", "Heels lifting", "Rounding back"],
        alternatives: [{ id: 'goblet_squat', name: 'Goblet Squat', reason: "Easier on back" }],
        tags: ['legs', 'squat', 'barbell', 'compound']
    },
    'goblet_squat': {
        id: 'goblet_squat',
        name: 'Goblet Squat',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Quadriceps', 'Gluteus Maximus'],
            secondary: ['Core', 'Upper Back']
        },
        description: "A beginner-friendly squat variation that teaches proper form with a counterbalance.",
        best_for: ["Learning to squat", "Quad development", "Core engagement"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Hold dumbbell at chest", "Elbows between knees", "Sit back and down"],
        common_mistakes: ["Leaning forward", "Not going deep enough"],
        alternatives: [{ id: 'squat_barbell', name: 'Barbell Squat', reason: "Heavier loading" }],
        tags: ['legs', 'squat', 'dumbbell', 'beginner']
    },
    'romanian_deadlift': {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell', 'Dumbbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Hamstrings', 'Gluteus Maximus'],
            secondary: ['Erector Spinae', 'Core']
        },
        description: "The best exercise for hamstring development. Creates a deep stretch under load.",
        best_for: ["Hamstring development", "Hip hinge pattern", "Posterior chain"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Soft knee bend", "Push hips back", "Feel hamstring stretch"],
        common_mistakes: ["Rounding back", "Bending knees too much"],
        alternatives: [{ id: 'leg_curl', name: 'Leg Curl', reason: "Isolation alternative" }],
        tags: ['legs', 'hinge', 'hamstrings']
    },
    'leg_press': {
        id: 'leg_press',
        name: 'Leg Press',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Machine'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Quadriceps', 'Gluteus Maximus'],
            secondary: ['Hamstrings']
        },
        description: "Machine-based leg training allows heavy loading without balance demands.",
        best_for: ["Leg development", "Heavy loading", "Reduced spinal stress"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "90 seconds", intensity: "70-80%" }
        },
        form_tips: ["Don't lock knees", "Full range of motion", "Keep lower back pressed"],
        common_mistakes: ["Going too heavy", "Partial reps", "Lifting hips"],
        alternatives: [{ id: 'squat_barbell', name: 'Barbell Squat', reason: "Free weight alternative" }],
        tags: ['legs', 'machine', 'quad']
    },
    'lunges': {
        id: 'lunges',
        name: 'Walking Lunges',
        categories: ['gym', 'calisthenics'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight', 'Dumbbell'],
        equipment_required: false,
        movement_type: 'compound',
        muscles: {
            primary: ['Quadriceps', 'Gluteus Maximus'],
            secondary: ['Hamstrings', 'Core', 'Hip Stabilizers']
        },
        description: "Unilateral leg exercise that builds balance, stability, and single-leg strength.",
        best_for: ["Single-leg strength", "Balance", "Functional movement"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12 each leg", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Step far enough", "Lower back knee toward floor", "Keep torso upright"],
        common_mistakes: ["Short steps", "Knee caving in"],
        alternatives: [{ id: 'split_squat', name: 'Split Squat', reason: "Stationary version" }],
        tags: ['legs', 'unilateral', 'bodyweight']
    },
    'leg_curl': {
        id: 'leg_curl',
        name: 'Leg Curl',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Machine'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Hamstrings'],
            secondary: ['Calves']
        },
        description: "Direct hamstring isolation. Great for balancing quad-dominant training.",
        best_for: ["Hamstring isolation", "Muscle balance", "Injury prevention"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60 seconds", intensity: "Moderate" }
        },
        form_tips: ["Control the movement", "Pause at contraction", "Full range of motion"],
        common_mistakes: ["Using momentum", "Arching back"],
        alternatives: [{ id: 'romanian_deadlift', name: 'Romanian Deadlift', reason: "Compound alternative" }],
        tags: ['legs', 'machine', 'isolation', 'hamstrings']
    },
    'leg_extension': {
        id: 'leg_extension',
        name: 'Leg Extension',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Machine'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Quadriceps'],
            secondary: []
        },
        description: "Direct quad isolation. Good for finishing leg workouts or pre-exhausting.",
        best_for: ["Quad isolation", "Mind-muscle connection", "Finishing exercise"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "12-15", rest: "60 seconds", intensity: "Moderate" }
        },
        form_tips: ["Pause at top", "Control descent", "Keep back pressed to seat"],
        common_mistakes: ["Going too heavy", "Swinging"],
        alternatives: [],
        tags: ['legs', 'machine', 'isolation', 'quads']
    },
    'calf_raises': {
        id: 'calf_raises',
        name: 'Standing Calf Raises',
        categories: ['gym', 'calisthenics'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight', 'Machine'],
        equipment_required: false,
        movement_type: 'isolation',
        muscles: {
            primary: ['Gastrocnemius', 'Soleus'],
            secondary: []
        },
        description: "Builds the calf muscles for better leg aesthetics and ankle stability.",
        best_for: ["Calf development", "Ankle stability", "Athletic performance"],
        guidance_by_goal: {
            hypertrophy: { sets: "4-5", reps: "12-20", rest: "60 seconds", intensity: "Moderate-High" }
        },
        form_tips: ["Full range of motion", "Pause at top", "Don't bounce"],
        common_mistakes: ["Partial reps", "Bouncing"],
        alternatives: [],
        tags: ['legs', 'calves', 'isolation']
    },

    // ═══════════════════════════════════════════════════════════
    // SHOULDER EXERCISES
    // ═══════════════════════════════════════════════════════════
    'overhead_press_barbell': {
        id: 'overhead_press_barbell',
        name: 'Overhead Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Anterior Deltoid', 'Medial Deltoid'],
            secondary: ['Triceps', 'Upper Chest', 'Core']
        },
        description: "Strict overhead pressing builds broad shoulders and functional overhead strength.",
        best_for: ["Shoulder size", "Overhead strength", "Core stability"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "3-6", rest: "2-3 min", intensity: "80%+" },
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Squeeze glutes", "Head through window at top", "Elbows slightly forward"],
        common_mistakes: ["Excessive arching", "Using legs"],
        alternatives: [{ id: 'overhead_press_dumbbell', name: 'Dumbbell Press', reason: "Unilateral stability" }],
        tags: ['push', 'vertical_press', 'barbell']
    },
    'overhead_press_dumbbell': {
        id: 'overhead_press_dumbbell',
        name: 'Dumbbell Shoulder Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Anterior Deltoid', 'Medial Deltoid'],
            secondary: ['Triceps', 'Core']
        },
        description: "Dumbbell pressing allows natural arm path and builds stability.",
        best_for: ["Shoulder development", "Stability", "Balanced strength"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "70-75%" }
        },
        form_tips: ["Press up and slightly together", "Control descent", "Keep core tight"],
        common_mistakes: ["Arching back", "Dumbbells drifting forward"],
        alternatives: [{ id: 'overhead_press_barbell', name: 'Barbell Press', reason: "Heavier loading" }],
        tags: ['push', 'dumbbell', 'vertical_press']
    },
    'arnold_press': {
        id: 'arnold_press',
        name: 'Arnold Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Anterior Deltoid', 'Medial Deltoid'],
            secondary: ['Rear Deltoid', 'Triceps']
        },
        description: "A shoulder press with rotation, developed by Arnold Schwarzenegger, which targets all three heads of the deltoids.",
        best_for: ["Complete shoulder development", "Deltoid roundness"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12", rest: "90s", intensity: "Moderate" }
        },
        form_tips: ["Start with palms facing you", "Rotate as you press up", "Control the descent and rotation"],
        common_mistakes: ["Rotating too early", "Using momentum"],
        alternatives: [{ id: 'overhead_press_dumbbell', name: 'Dumbbell Press', reason: "More stable pressing" }],
        tags: ['push', 'dumbbell', 'rotation']
    },
    'lateral_raise': {
        id: 'lateral_raise',
        name: 'Dumbbell Lateral Raise',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Medial Deltoid'],
            secondary: ['Anterior Deltoid', 'Trapezius']
        },
        description: "Isolates the side delts for that broad-shouldered look. Essential for shoulder width.",
        best_for: ["Shoulder width", "Side delt development", "Aesthetics"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "12-15", rest: "60 seconds", intensity: "Light-Moderate" }
        },
        form_tips: ["Slight bend in elbows", "Lead with elbows", "Don't swing"],
        common_mistakes: ["Going too heavy", "Swinging body"],
        alternatives: [{ id: 'cable_lateral_raise', name: 'Cable Lateral Raise', reason: "Constant tension" }],
        tags: ['isolation', 'dumbbell', 'side_delt']
    },
    'rear_delt_fly': {
        id: 'rear_delt_fly',
        name: 'Rear Delt Fly',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Rear Deltoid'],
            secondary: ['Rhomboids', 'Middle Trapezius']
        },
        description: "Targets the often-neglected rear delts. Essential for shoulder balance and health.",
        best_for: ["Rear delt development", "Posture", "Shoulder health"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "12-15", rest: "60 seconds", intensity: "Light-Moderate" }
        },
        form_tips: ["Hinge at hips", "Lead with elbows", "Squeeze shoulder blades"],
        common_mistakes: ["Using too much weight", "Momentum"],
        alternatives: [{ id: 'face_pulls', name: 'Face Pulls', reason: "Cable alternative" }],
        tags: ['isolation', 'dumbbell', 'rear_delt']
    },
    'shrugs': {
        id: 'shrugs',
        name: 'Barbell Shrugs',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Barbell', 'Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Upper Trapezius'],
            secondary: ['Levator Scapulae']
        },
        description: "Builds the upper traps for a powerful look and neck stability.",
        best_for: ["Upper trap development", "Neck stability", "Power look"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60-90 seconds", intensity: "Moderate-Heavy" }
        },
        form_tips: ["Straight up, no rolling", "Hold at top", "Full stretch at bottom"],
        common_mistakes: ["Rolling shoulders", "Not enough range"],
        alternatives: [],
        tags: ['isolation', 'traps']
    },

    // ═══════════════════════════════════════════════════════════
    // ARM EXERCISES
    // ═══════════════════════════════════════════════════════════
    'barbell_curl': {
        id: 'barbell_curl',
        name: 'Barbell Curl',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Biceps Brachii'],
            secondary: ['Brachialis', 'Forearms']
        },
        description: "The classic bicep builder. Allows heavy loading for maximum arm development.",
        best_for: ["Bicep mass", "Arm strength", "Heavy curling"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Keep elbows at sides", "Control the negative", "No swinging"],
        common_mistakes: ["Swinging body", "Elbows drifting forward"],
        alternatives: [{ id: 'dumbbell_curl', name: 'Dumbbell Curl', reason: "Unilateral focus" }],
        tags: ['isolation', 'barbell', 'biceps']
    },
    'dumbbell_curl': {
        id: 'dumbbell_curl',
        name: 'Dumbbell Curl',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Biceps Brachii'],
            secondary: ['Brachialis', 'Forearms']
        },
        description: "Allows supination for full bicep contraction and addresses imbalances.",
        best_for: ["Bicep development", "Balance", "Supination"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12", rest: "60 seconds", intensity: "Moderate" }
        },
        form_tips: ["Supinate as you curl", "Keep elbows stable", "Full range"],
        common_mistakes: ["Swinging", "Partial reps"],
        alternatives: [{ id: 'barbell_curl', name: 'Barbell Curl', reason: "Heavier loading" }],
        tags: ['isolation', 'dumbbell', 'biceps']
    },
    'hammer_curl': {
        id: 'hammer_curl',
        name: 'Hammer Curl',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Brachialis', 'Biceps Brachii'],
            secondary: ['Forearms']
        },
        description: "Neutral grip targets the brachialis and forearms. Builds arm thickness.",
        best_for: ["Arm thickness", "Forearm development", "Brachialis"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-12", rest: "60 seconds", intensity: "Moderate" }
        },
        form_tips: ["Neutral grip throughout", "Keep elbows stable", "Controlled movement"],
        common_mistakes: ["Swinging", "Rotating wrist"],
        alternatives: [],
        tags: ['isolation', 'dumbbell', 'biceps', 'forearms']
    },
    'tricep_pushdown': {
        id: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        categories: ['gym'],
        difficulty: 'Beginner',
        equipment: ['Cable'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Triceps Brachii'],
            secondary: []
        },
        description: "Cable-based tricep isolation with constant tension throughout the movement.",
        best_for: ["Tricep isolation", "Constant tension", "Mind-muscle connection"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60 seconds", intensity: "Moderate" }
        },
        form_tips: ["Elbows at sides", "Full extension", "Control return"],
        common_mistakes: ["Elbows floating", "Using body momentum"],
        alternatives: [{ id: 'skull_crushers', name: 'Skull Crushers', reason: "Free weight alternative" }],
        tags: ['isolation', 'cable', 'triceps']
    },
    'skull_crushers': {
        id: 'skull_crushers',
        name: 'Skull Crushers',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell', 'Dumbbell'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Triceps Brachii'],
            secondary: []
        },
        description: "Lying tricep extension that emphasizes the long head. Great for tricep mass.",
        best_for: ["Tricep mass", "Long head focus", "Arm size"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "60-90 seconds", intensity: "Moderate" }
        },
        form_tips: ["Lower to forehead or behind", "Keep elbows in", "Control the weight"],
        common_mistakes: ["Elbows flaring", "Using too much weight"],
        alternatives: [{ id: 'tricep_pushdown', name: 'Tricep Pushdown', reason: "Cable alternative" }],
        tags: ['isolation', 'barbell', 'triceps']
    },
    'tricep_dips': {
        id: 'tricep_dips',
        name: 'Tricep Dips',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Triceps Brachii'],
            secondary: ['Chest', 'Anterior Deltoid']
        },
        description: "Bodyweight tricep exercise. Upright torso targets triceps more than chest.",
        best_for: ["Tricep strength", "Bodyweight pushing", "Arm mass"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-15", rest: "90 seconds", intensity: "Bodyweight" }
        },
        form_tips: ["Stay upright for triceps", "Don't go too deep", "Control movement"],
        common_mistakes: ["Leaning forward", "Going too deep"],
        alternatives: [{ id: 'tricep_pushdown', name: 'Tricep Pushdown', reason: "Isolation alternative" }],
        tags: ['compound', 'bodyweight', 'triceps']
    },
    'close_grip_bench': {
        id: 'close_grip_bench',
        name: 'Close Grip Bench Press',
        categories: ['gym'],
        difficulty: 'Intermediate',
        equipment: ['Barbell', 'Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Triceps Brachii', 'Chest'],
            secondary: ['Anterior Deltoid']
        },
        description: "A bench press variation with hands shoulder-width or closer to shift emphasis to the triceps.",
        best_for: ["Tricep strength", "Pressing power", "Arm mass"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "5-8", rest: "2-3 min", intensity: "75-85%" }
        },
        form_tips: ["Keep elbows tucked", "Control the decent", "Press explosively"],
        common_mistakes: ["Hands too close (painful)", "Flaring elbows"],
        alternatives: [{ id: 'dips_chest', name: 'Chest Dips', reason: "Bodyweight alternative" }],
        tags: ['push', 'barbell', 'triceps']
    },

    // ═══════════════════════════════════════════════════════════
    // CORE EXERCISES
    // ═══════════════════════════════════════════════════════════
    'plank': {
        id: 'plank',
        name: 'Plank',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'endurance',
        muscles: {
            primary: ['Core Stabilizers', 'Rectus Abdominis'],
            secondary: ['Shoulders', 'Glutes']
        },
        description: "The foundational core stability exercise. Builds isometric strength and endurance.",
        best_for: ["Core stability", "Postural health", "Core endurance"],
        guidance_by_goal: {
            endurance: { sets: "3", reps: "30-60s", rest: "60s", intensity: "Bodyweight" }
        },
        form_tips: ["Keep body in straight line", "Squeeze glutes", "Don't let hips sag"],
        common_mistakes: ["Sagging hips", "Butt in air"],
        alternatives: [{ id: 'dead_bug', name: 'Dead Bug', reason: "Easier version" }],
        tags: ['core', 'static', 'stability']
    },
    'hanging_leg_raise': {
        id: 'hanging_leg_raise',
        name: 'Hanging Leg Raise',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight', 'Other'],
        equipment_required: true,
        movement_type: 'isolation',
        muscles: {
            primary: ['Rectus Abdominis', 'Hip Flexors'],
            secondary: ['Forearms', 'Lats']
        },
        description: "Challenging core exercise performed while hanging from a bar. Targets lower abs.",
        best_for: ["Lower abs", "Grip strength", "Core strength"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "10-15", rest: "60-90 seconds", intensity: "Bodyweight" }
        },
        form_tips: ["Control the swing", "Raise with control", "Pause at top"],
        common_mistakes: ["Swinging", "Using momentum"],
        alternatives: [{ id: 'lying_leg_raise', name: 'Lying Leg Raise', reason: "Easier version" }],
        tags: ['core', 'bodyweight', 'advanced']
    },
    'russian_twist': {
        id: 'russian_twist',
        name: 'Russian Twist',
        categories: ['gym', 'calisthenics'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight', 'Dumbbell'],
        equipment_required: false,
        movement_type: 'isolation',
        muscles: {
            primary: ['Obliques'],
            secondary: ['Rectus Abdominis', 'Hip Flexors']
        },
        description: "Rotational core exercise targeting the obliques for a defined waist.",
        best_for: ["Obliques", "Rotational power", "Core definition"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "15-20 each side", rest: "60 seconds", intensity: "Light" }
        },
        form_tips: ["Keep chest up", "Control rotation", "Touch weight to floor"],
        common_mistakes: ["Moving just arms", "Rounding back"],
        alternatives: [],
        tags: ['core', 'bodyweight', 'rotation']
    },
    'dead_bug': {
        id: 'dead_bug',
        name: 'Dead Bug',
        categories: ['calisthenics', 'gym'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'isolation',
        muscles: {
            primary: ['Transverse Abdominis', 'Rectus Abdominis'],
            secondary: ['Hip Flexors', 'Core Stabilizers']
        },
        description: "Anti-extension exercise that builds core stability and coordination.",
        best_for: ["Core stability", "Lower back protection", "Coordination"],
        guidance_by_goal: {
            endurance: { sets: "3-4", reps: "10-15 each side", rest: "60 seconds", intensity: "Bodyweight" }
        },
        form_tips: ["Keep lower back pressed down", "Move slowly", "Exhale as you extend"],
        common_mistakes: ["Back arching", "Moving too fast"],
        alternatives: [],
        tags: ['core', 'bodyweight', 'stability']
    },
    'ab_wheel_rollout': {
        id: 'ab_wheel_rollout',
        name: 'Ab Wheel Rollout',
        categories: ['gym', 'calisthenics'],
        difficulty: 'Advanced',
        equipment: ['Other'],
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Rectus Abdominis', 'Transverse Abdominis'],
            secondary: ['Lats', 'Triceps', 'Hip Flexors']
        },
        description: "Advanced core exercise that challenges the entire anterior chain.",
        best_for: ["Core strength", "Anti-extension", "Total core development"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-4", reps: "8-12", rest: "90 seconds", intensity: "Bodyweight" }
        },
        form_tips: ["Start from knees", "Don't overextend", "Roll out with control"],
        common_mistakes: ["Arching back", "Going too far"],
        alternatives: [{ id: 'plank', name: 'Plank', reason: "Easier alternative" }],
        tags: ['core', 'advanced', 'anti-extension']
    },

    // ═══════════════════════════════════════════════════════════
    // CARDIO EXERCISES
    // ═══════════════════════════════════════════════════════════
    'running': {
        id: 'running',
        name: 'Running',
        categories: ['cardio'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'endurance',
        muscles: {
            primary: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
            secondary: ['Core', 'Heart']
        },
        description: "Foundational cardiovascular exercise for heart health and endurance.",
        best_for: ["Cardiovascular health", "Calorie burn", "Endurance"],
        guidance_by_goal: {
            endurance: { sets: "1", reps: "20-60 min", rest: "N/A", intensity: "Moderate" }
        },
        form_tips: ["Maintain upright posture", "Land mid-foot", "Relax shoulders"],
        common_mistakes: ["Overstriding", "Hunched shoulders"],
        alternatives: [{ id: 'cycling', name: 'Cycling', reason: "Lower impact" }],
        tags: ['aerobic', 'endurance', 'outdoors']
    },
    'cycling': {
        id: 'cycling',
        name: 'Cycling',
        categories: ['cardio'],
        difficulty: 'Beginner',
        equipment: ['Machine', 'Other'],
        equipment_required: true,
        movement_type: 'endurance',
        muscles: {
            primary: ['Quadriceps', 'Gluteus Maximus', 'Calves'],
            secondary: ['Hamstrings']
        },
        description: "Low-impact cardiovascular exercise highly effective for building leg endurance.",
        best_for: ["Joint health", "Leg endurance", "Cardio conditioning"],
        guidance_by_goal: {
            endurance: { sets: "1", reps: "30-60 min", rest: "N/A", intensity: "Moderate" }
        },
        form_tips: ["Proper seat height", "Keep knees aligned", "Consistent cadence"],
        common_mistakes: ["Seat too low", "Rocking hips"],
        alternatives: [{ id: 'running', name: 'Running', reason: "Higher impact/bone density" }],
        tags: ['aerobic', 'endurance', 'low_impact']
    },
    'burpees': {
        id: 'burpees',
        name: 'Burpees',
        categories: ['cardio', 'cross_training', 'calisthenics'],
        difficulty: 'Intermediate',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'explosive',
        muscles: {
            primary: ['Full Body', 'Heart'],
            secondary: ['Chest', 'Quadriceps', 'Core']
        },
        description: "Explosive full-body movement that rapidly elevates heart rate and builds power.",
        best_for: ["Metabolic conditioning", "Fat loss", "Full body explosive power"],
        guidance_by_goal: {
            endurance: { sets: "3-5", reps: "10-20", rest: "30-60s", intensity: "High" }
        },
        form_tips: ["Chest to floor", "Snap feet back", "Explosive jump at top"],
        common_mistakes: ["Sagging hips during pushup", "Landing with straight legs"],
        alternatives: [],
        tags: ['hiit', 'metcon', 'plyo']
    },

    // ═══════════════════════════════════════════════════════════
    // CROSS-TRAINING (METCON)
    // ═══════════════════════════════════════════════════════════
    'kettlebell_swing': {
        id: 'kettlebell_swing',
        name: 'Kettlebell Swing',
        categories: ['cross_training', 'gym'],
        difficulty: 'Intermediate',
        equipment: ['Kettlebell'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Gluteus Maximus', 'Hamstrings'],
            secondary: ['Erector Spinae', 'Core', 'Forearms']
        },
        description: "Dynamic hip-hinge movement that builds explosive power and posterior chain strength.",
        best_for: ["Explosive power", "Hinge mechanics", "Metabolic conditioning"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-5", reps: "15-20", rest: "60s", intensity: "Moderate-High" }
        },
        form_tips: ["Hinge at hips, don't squat", "Drive hips forward explosively", "Let weight float to chest level"],
        common_mistakes: ["Using arms to lift", "Squatting weight", "Rounding back"],
        alternatives: [],
        tags: ['metcon', 'explosive', 'posterior_chain']
    },
    'thrusters': {
        id: 'thrusters',
        name: 'Barbell Thrusters',
        categories: ['cross_training'],
        difficulty: 'Advanced',
        equipment: ['Barbell'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Quadriceps', 'Anterior Deltoid'],
            secondary: ['Glutes', 'Triceps', 'Core']
        },
        description: "A combination of a front squat and an overhead press. A staple metcon movement.",
        best_for: ["Full body power", "Metabolic conditioning", "Functional strength"],
        guidance_by_goal: {
            endurance: { sets: "3-5", reps: "12-15", rest: "90s", intensity: "Moderate" }
        },
        form_tips: ["Keep elbows high in squat", "Use leg drive to press bar", "Lock out at top"],
        common_mistakes: ["Pressing too early", "Dropping elbows"],
        alternatives: [],
        tags: ['metcon', 'explosive', 'compound']
    },

    // ═══════════════════════════════════════════════════════════
    // SPORTS PERFORMANCE
    // ═══════════════════════════════════════════════════════════
    'box_jumps': {
        id: 'box_jumps',
        name: 'Box Jumps',
        categories: ['sports_performance', 'cross_training'],
        difficulty: 'Intermediate',
        equipment: ['Other'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Quadriceps', 'Glutes', 'Calves'],
            secondary: ['Core']
        },
        description: "Plyometric movement that builds explosive jumping power.",
        best_for: ["Explosively", "Vertical jump", "Reactivity"],
        guidance_by_goal: {
            hypertrophy: { sets: "3-5", reps: "5-8", rest: "2 min", intensity: "Explosive" }
        },
        form_tips: ["Land softly", "Stand fully at top", "Step down (don't jump down)"],
        common_mistakes: ["Landing with straight legs", "Jumping off too high a box"],
        alternatives: [],
        tags: ['plyo', 'explosive', 'athletic']
    },
    'shuttle_run': {
        id: 'shuttle_run',
        name: 'Shuttle Run',
        categories: ['sports_performance', 'cardio'],
        difficulty: 'Beginner',
        equipment: ['Bodyweight'],
        equipment_required: false,
        movement_type: 'endurance',
        muscles: {
            primary: ['Full Body', 'Heart'],
            secondary: ['Quadriceps', 'Calves']
        },
        description: "Agility drill involving short sprints with quick changes in direction.",
        best_for: ["Agility", "Change of direction", "Conditioning"],
        guidance_by_goal: {
            endurance: { sets: "4-6", reps: "30 seconds", rest: "60 seconds", intensity: "Max Effort" }
        },
        form_tips: ["Stay low during turn", "Accelerate out of break", "Touch the line"],
        common_mistakes: ["Turning too wide", "Stopping before the line"],
        alternatives: [],
        tags: ['agility', 'sprints', 'athletic']
    },
    'wall_balls': {
        id: 'wall_balls',
        name: 'Wall Balls',
        categories: ['cross_training', 'cardio'],
        difficulty: 'Intermediate',
        equipment: ['Medicine Ball', 'Wall'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Quadriceps', 'Anterior Deltoid'],
            secondary: ['Glutes', 'Triceps', 'Core']
        },
        description: "A full-body functional movement combining a squat and a push press throw.",
        best_for: ["Metabolic conditioning", "Explosive power", "Squat endurance"],
        guidance_by_goal: {
            endurance: { sets: "3-5", reps: "15-30", rest: "60s", intensity: "High" }
        },
        form_tips: ["Squat below parallel", "Keep chest up", "Throw to target (10ft/9ft)"],
        common_mistakes: ["Not squatting deep enough", "Catching ball on face"],
        alternatives: [{ id: 'thrusters', name: 'Thrusters', reason: "Barbell alternative" }],
        tags: ['metcon', 'wallball', 'crossfit']
    },
    'sled_push': {
        id: 'sled_push',
        name: 'Sled Push',
        categories: ['sports_performance', 'cardio', 'cross_training'],
        difficulty: 'Intermediate',
        equipment: ['Other'], // Sled
        equipment_required: true,
        movement_type: 'compound',
        muscles: {
            primary: ['Quadriceps', 'Glutes', 'Calves'],
            secondary: ['Core', 'Shoulders']
        },
        description: "Unilateral leg drive exercise that builds immense lower body power and conditioning completely concentrically (no soreness).",
        best_for: ["Leg power", "Conditioning", "GPP"],
        guidance_by_goal: {
            strength: { sets: "4-6", reps: "20m", rest: "2-3 min", intensity: "Heavy" },
            endurance: { sets: "3-4", reps: "40m", rest: "90s", intensity: "Moderate" }
        },
        form_tips: ["Arms straight (or bent for low push)", "Drive knees high", "Neutral spine"],
        common_mistakes: ["Hips too high", "Walking instead of driving"],
        alternatives: [],
        tags: ['conditioning', 'power', 'sled']
    },
    'agility_ladder': {
        id: 'agility_ladder',
        name: 'Agility Ladder Drills',
        categories: ['sports_performance', 'cardio'],
        difficulty: 'Beginner',
        equipment: ['Other'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Calves', 'Hip Flexors'],
            secondary: ['Core', 'Brain']
        },
        description: "Footwork drills to improve coordination, speed, and cognitive reactivity.",
        best_for: ["Foot speed", "Coordination", "Warm-up"],
        guidance_by_goal: {
            endurance: { sets: "5-10 min", reps: "Continuous", rest: "As needed", intensity: "Fast" }
        },
        form_tips: ["Stay on balls of feet", "Light touches", "Pump arms"],
        common_mistakes: ["Staring at feet (look ahead)", "Heels touching ground"],
        alternatives: [],
        tags: ['agility', 'footwork', 'speed']
    },
    'muscle_up': {
        id: 'muscle_up',
        name: 'Bar Muscle-Up',
        categories: ['calisthenics', 'cross_training', 'gym'],
        difficulty: 'Advanced',
        equipment: ['Pull-up Bar'],
        equipment_required: true,
        movement_type: 'explosive',
        muscles: {
            primary: ['Lats', 'Triceps', 'Chest'],
            secondary: ['Biceps', 'Core']
        },
        description: "The ultimate upper body pulling exercise. Pulling yourself from below the bar to above it.",
        best_for: ["Upper body power", "Gymnastics skill", "Back strength"],
        guidance_by_goal: {
            strength: { sets: "3-5", reps: "1-5", rest: "3 min", intensity: "Max Effort" }
        },
        form_tips: ["Aggressive kip/pull", "Fast transition", "Press out at top"],
        common_mistakes: ["Chicken winging (one arm first)", "Not pulling high enough"],
        alternatives: [{ id: 'pullups', name: 'Explosive Pull-Ups', reason: "Regression" }],
        tags: ['gymnastics', 'advanced', 'skill']
    },
};

export const getExercisesByMuscle = (muscle: string) => {
    if (muscle === 'Full Body') return Object.values(EXERCISE_DATABASE);
    return Object.values(EXERCISE_DATABASE).filter(ex =>
        ex.muscles.primary.includes(muscle) || ex.muscles.secondary.includes(muscle)
    );
};

export const getExercisesByDomain = (domain: ExerciseDomain) => {
    return Object.values(EXERCISE_DATABASE).filter(ex =>
        ex.categories.includes(domain)
    );
};


// touch
