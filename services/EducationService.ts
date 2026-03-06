export const educationService = {
    getRepRangeTip(reps: number): string {
        if (reps >= 1 && reps <= 5) return "Strength Focus: Builds density and max force. High CNS fatigue.";
        if (reps >= 6 && reps <= 12) return "Hypertrophy Zone: Optimal for muscle growth. Focus on full range of motion.";
        if (reps > 12) return "Endurance/Metabolic: Increases tolerance to lactic acid. Good for conditioning.";
        return "";
    },

    getVolumeTip(weeklySets: number): string {
        if (weeklySets > 20) return "Diminishing Returns: >20 sets often creates more fatigue than growth stimulus.";
        if (weeklySets < 10) return "Maintenance Volume: <10 sets maintains muscle but may not maximize growth.";
        return "Optimal Volume: 10-20 sets captures the peak adaptation window.";
    },

    /**
     * Get deep insight for a specific exercise.
     * In a real app, this would come from a rich DB.
     * For pilot, we infer/mock based on keywords or IDs.
     */
    getExerciseInsight(exerciseId: string, exerciseName: string): {
        trains: string[],
        why: string,
        relevance: string
    } {
        const name = exerciseName.toLowerCase();

        if (name.includes('squat')) {
            return {
                trains: ['Quadriceps (high tension)', 'Glutes (hip extension)', 'Knee joint load'],
                why: 'High strength stimulus but high recovery cost.',
                relevance: 'Aligns with strength goals. Watch knee volume.'
            };
        }
        if (name.includes('bench') || name.includes('press')) {
            return {
                trains: ['Pectorals', 'Anterior Delts', 'Triceps'],
                why: 'Primary upper body push pattern.',
                relevance: 'Essential for upper body mass.'
            };
        }
        if (name.includes('deadlift') || name.includes('hinge')) {
            return {
                trains: ['Posterior Chain', 'Lower Back', 'Grip'],
                why: 'High CNS fatigue. Potent strength builder.',
                relevance: 'Foundation of durability if form is perfect.'
            };
        }

        return {
            trains: ['Primary Movers', 'Stabilizers'],
            why: 'Contributes to total volume.',
            relevance: 'Supports your weekly progression.'
        };
    }
};
