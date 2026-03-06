import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Search,
    Plus,
    X,
    Dumbbell,
    Activity,
    Flame,
    Zap,
    Trophy,
    Move
} from 'lucide-react-native';
import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VoidBackground } from '@/components/VoidBackground';
import { liquidGlass, glassShadows, glassLayout, glassStyles } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { useWorkoutStore } from '@/stores/workoutStore';
import { EXERCISE_DATABASE, getExercisesByDomain } from '@/services/ExerciseDatabase';
import { Exercise, ExerciseDomain } from '@/types/workout';

import { CreateCustomExerciseModal } from './components/CreateCustomExerciseModal';

type MuscleGroupCategory = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';

const MUSCLE_GROUPS: { id: MuscleGroupCategory; label: string; icon: any }[] = [
    { id: 'Chest', label: 'Chest', icon: Dumbbell },
    { id: 'Back', label: 'Back', icon: Move },
    { id: 'Legs', label: 'Legs', icon: Activity },
    { id: 'Shoulders', label: 'Shoulders', icon: Dumbbell },
    { id: 'Arms', label: 'Arms', icon: Dumbbell },
    { id: 'Core', label: 'Core', icon: Zap },
];

const mapMuscleToGroup = (muscle: string): MuscleGroupCategory | null => {
    const m = muscle.toLowerCase();
    if (m.includes('chest') || m.includes('pectoral')) return 'Chest';
    if (m.includes('lat') || m.includes('trap') || m.includes('rhomboid') || m.includes('lower back') || m.includes('back')) return 'Back';
    if (m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('calf') || m.includes('leg')) return 'Legs';
    if (m.includes('delt') || m.includes('shoulder')) return 'Shoulders';
    if (m.includes('bicep') || m.includes('tricep') || m.includes('forearm') || m.includes('arm')) return 'Arms';
    if (m.includes('core') || m.includes('abs') || m.includes('oblique')) return 'Core';
    return null;
};

export default function WorkoutLibraryScreen() {
    const { day } = useLocalSearchParams<{ day: string }>();
    const selectedDayIndex = parseInt(day || '0', 10);
    const { addRoutine, updateRoutine, getRoutineForDay, customExercises } = useWorkoutStore();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ExerciseDomain | 'all'>('all');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroupCategory | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const categories: { label: string; value: ExerciseDomain | 'all' }[] = [
        { label: 'All', value: 'all' },
        { label: 'Gym', value: 'gym' },
        { label: 'Cardio', value: 'cardio' },
        { label: 'Cross Training', value: 'cross_training' },
        { label: 'Performance', value: 'sports_performance' },
        { label: 'Calisthenics', value: 'calisthenics' },
    ];

    const allExercises = useMemo(() => {
        const standard = Object.values(EXERCISE_DATABASE);
        return [...customExercises, ...standard];
    }, [customExercises]);

    const filteredExercises = useMemo(() => {
        return allExercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
                ex.muscles.primary.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
                ex.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || ex.categories.includes(selectedCategory);

            let matchesMuscleGroup = true;
            if (selectedCategory === 'gym' && selectedMuscleGroup) {
                matchesMuscleGroup = ex.muscles.primary.some(m => mapMuscleToGroup(m) === selectedMuscleGroup);
            }

            return matchesSearch && matchesCategory && matchesMuscleGroup;
        });
    }, [allExercises, search, selectedCategory, selectedMuscleGroup]);

    const handleBackPress = useCallback(() => {
        if (selectedMuscleGroup) {
            setSelectedMuscleGroup(null);
        } else {
            router.back();
        }
    }, [selectedMuscleGroup]);

    // Reset muscle group when category changes
    const handleCategoryChange = (cat: ExerciseDomain | 'all') => {
        haptics.selection();
        setSelectedCategory(cat);
        setSelectedMuscleGroup(null);
    };

    const handleAddExercise = useCallback((exercise: Exercise) => {
        haptics.success();

        // 1. Create the new WorkoutExercise instance
        const newExercise = {
            id: `we_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            exerciseId: exercise.id,
            targetSets: exercise.sets || 3,
            targetReps: exercise.reps || '10',
            sets: []
        };

        // 2. Check if routine exists for this day
        const existingRoutine = getRoutineForDay(selectedDayIndex);

        if (existingRoutine) {
            // Append to existing routine
            updateRoutine(existingRoutine.id, {
                exercises: [...existingRoutine.exercises, newExercise],
                estimatedDurationMinutes: existingRoutine.estimatedDurationMinutes + 5 // Crude estimate
            });
        } else {
            // Create new routine
            const newRoutineId = `routine_${Date.now()}_${selectedDayIndex}`;
            addRoutine({
                id: newRoutineId,
                name: `${WEEKDAY_FULL[selectedDayIndex]} Workout`, // Default name
                scheduledDay: selectedDayIndex,
                exercises: [newExercise],
                estimatedDurationMinutes: 30,
            });
        }

        router.back();
    }, [selectedDayIndex, addRoutine, updateRoutine, getRoutineForDay]);

    const handleExerciseCreated = useCallback((newExercise: Exercise, shouldAddToPlan: boolean) => {
        setIsCreateModalVisible(false);
        if (shouldAddToPlan) {
            handleAddExercise(newExercise);
        }
    }, [handleAddExercise]);

    const getCategoryIcon = (categories: ExerciseDomain[]) => {
        if (categories.includes('gym')) return <Dumbbell size={20} color={liquidGlass.accent.primary} />;
        if (categories.includes('cardio')) return <Activity size={20} color={liquidGlass.accent.primary} />;
        if (categories.includes('cross_training')) return <Flame size={20} color={liquidGlass.accent.primary} />;
        if (categories.includes('sports_performance')) return <Trophy size={20} color={liquidGlass.accent.primary} />;
        if (categories.includes('calisthenics')) return <Move size={20} color={liquidGlass.accent.primary} />;
        return <Dumbbell size={20} color={liquidGlass.accent.primary} />;
    };

    return (
        <VoidBackground>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <ArrowLeft size={24} color={liquidGlass.text.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>
                            {selectedMuscleGroup ? selectedMuscleGroup : 'Exercise Library'}
                        </Text>
                        <Text style={styles.headerSubtitle}>Adding to {WEEKDAY_FULL[selectedDayIndex]}</Text>
                    </View>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.glassSearchBar}>
                        <Search size={18} color={liquidGlass.text.tertiary} />
                        <TextInput
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search exercises, muscles..."
                            placeholderTextColor={liquidGlass.text.tertiary}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <X size={18} color={liquidGlass.text.tertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category Pills */}
                <View style={styles.categoryScroller}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.value}
                                style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
                                onPress={() => handleCategoryChange(cat.value)}
                            >
                                <Text style={[styles.categoryChipText, selectedCategory === cat.value && styles.categoryChipTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Create Custom Modal */}
                <CreateCustomExerciseModal
                    isVisible={isCreateModalVisible}
                    onClose={() => setIsCreateModalVisible(false)}
                    onCreated={handleExerciseCreated}
                />

                {/* List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Create Custom Card */}
                    <TouchableOpacity
                        style={styles.createCard}
                        onPress={() => setIsCreateModalVisible(true)}
                    >
                        <View style={styles.createIconContainer}>
                            <Plus size={24} color={liquidGlass.text.inverse} />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.createTitle}>Create Custom Workout</Text>
                            <Text style={styles.createSubtitle}>Add your own unique exercise</Text>
                        </View>
                    </TouchableOpacity>

                    {selectedCategory === 'gym' && !selectedMuscleGroup && search.length === 0 ? (
                        <View style={styles.muscleGrid}>
                            {MUSCLE_GROUPS.map((group) => (
                                <TouchableOpacity
                                    key={group.id}
                                    style={styles.muscleCard}
                                    onPress={() => { haptics.selection(); setSelectedMuscleGroup(group.id); }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.muscleIconContainer}>
                                        <group.icon size={24} color={liquidGlass.accent.primary} />
                                    </View>
                                    <Text style={styles.muscleName}>{group.label}</Text>
                                    <Text style={styles.muscleCount}>
                                        {allExercises.filter(e =>
                                            e.categories.includes('gym') &&
                                            e.muscles.primary.some(m => mapMuscleToGroup(m) === group.id)
                                        ).length} exercises
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <>
                            {filteredExercises.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Search size={48} color={liquidGlass.text.tertiary} strokeWidth={1} />
                                    <Text style={styles.emptyText}>No exercises found</Text>
                                </View>
                            ) : (
                                filteredExercises.map((exercise) => (
                                    <TouchableOpacity
                                        key={exercise.id}
                                        style={styles.exerciseCard}
                                        onPress={() => handleAddExercise(exercise)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={styles.iconContainer}>
                                                {getCategoryIcon(exercise.categories)}
                                            </View>
                                            <View style={styles.infoContainer}>
                                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                                <Text style={styles.exerciseMuscles}>
                                                    {exercise.muscles.primary.join(', ')}
                                                </Text>
                                            </View>
                                            <View style={styles.addBtn}>
                                                <Plus size={20} color={liquidGlass.text.inverse} />
                                            </View>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>{exercise.difficulty}</Text>
                                            </View>
                                            {exercise.categories.slice(0, 2).map(c => (
                                                <View key={c} style={styles.tag}>
                                                    <Text style={styles.tagText}>{c.replace('_', ' ')}</Text>
                                                </View>
                                            ))}
                                            {exercise.tags?.includes('custom') && (
                                                <View style={[styles.tag, { backgroundColor: `${liquidGlass.accent.primary}20` }]}>
                                                    <Text style={[styles.tagText, { color: liquidGlass.accent.primary }]}>CUSTOM</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </>
                    )}
                    <View style={styles.footerSpacer} />
                </ScrollView>
            </SafeAreaView>
        </VoidBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: glassLayout.screenPadding,
        paddingVertical: 12,
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: liquidGlass.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: liquidGlass.border.glassLight,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
        marginTop: 2,
    },
    headerRightPlaceholder: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: glassLayout.screenPadding,
        marginBottom: 16,
    },
    glassSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: liquidGlass.surface.glass,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        gap: 12,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    searchInput: {
        flex: 1,
        color: liquidGlass.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    categoryScroller: {
        marginBottom: 20,
    },
    categoryContent: {
        paddingHorizontal: glassLayout.screenPadding,
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: liquidGlass.surface.glass,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    categoryChipActive: {
        backgroundColor: liquidGlass.accent.primary,
        borderColor: liquidGlass.accent.primary,
        ...glassShadows.glow,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '700',
        color: liquidGlass.text.secondary,
        textTransform: 'capitalize',
    },
    categoryChipTextActive: {
        color: liquidGlass.text.inverse,
    },
    scrollView: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: glassLayout.screenPadding,
        paddingBottom: 40,
    },
    createCard: {
        ...glassStyles.card,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(34, 197, 94, 0.1)', // Green tint
        borderColor: 'rgba(34, 197, 94, 0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    createIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#22c55e',
        alignItems: 'center',
        justifyContent: 'center',
        ...glassShadows.glow,
    },
    createTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#22c55e',
        marginBottom: 2,
    },
    createSubtitle: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
    },
    exerciseCard: {
        ...glassStyles.card,
        padding: 16,
        marginBottom: 12,
        backgroundColor: liquidGlass.surface.glass,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 14,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary,
        marginBottom: 4,
    },
    exerciseMuscles: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: liquidGlass.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...glassShadows.glowTeal,
    },
    cardFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
        color: liquidGlass.text.secondary,
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: liquidGlass.text.tertiary,
        fontWeight: '600',
    },
    footerSpacer: {
        height: 40,
    },
    muscleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 20,
    },
    muscleCard: {
        width: (Dimensions.get('window').width - (glassLayout.screenPadding * 2) - 12) / 2,
        ...glassStyles.card,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 120,
        backgroundColor: liquidGlass.surface.glass,
    },
    muscleIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: liquidGlass.surface.glassDark,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: liquidGlass.border.glass,
    },
    muscleName: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlass.text.primary,
    },
    muscleCount: {
        fontSize: 12,
        color: liquidGlass.text.tertiary,
    }
});
