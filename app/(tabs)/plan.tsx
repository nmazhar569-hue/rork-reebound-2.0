import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ChevronRight,
  Dumbbell,
  Heart,
  Zap,
  User,
  ChevronLeft,
  Plus,
  Check,
  Play,
} from 'lucide-react-native';
import { router } from 'expo-router';

import { theme } from '@/constants/theme';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { EXERCISE_LIBRARY, ExerciseEntry, ExerciseCategory } from '@/constants/database_seed';
import { useApp } from '@/contexts/AppContext';
import { Exercise } from '@/types';
import { VoidBackground } from '@/components/ui/VoidBackground';
import { GlassCard } from '@/components/ui/GlassCard';

type CategoryKey = 'CROSSFIT' | 'GYM' | 'CARDIO' | 'BODYWEIGHT' | null;

interface CategoryOption {
  id: CategoryKey;
  dbKey: ExerciseCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const WORKOUT_CATEGORIES: CategoryOption[] = [
  {
    id: 'CROSSFIT',
    dbKey: 'CROSSFIT',
    label: 'CrossFit',
    icon: <Zap size={24} color="#FFF" />,
    color: '#FF6B4A',
    description: 'High-intensity functional movements',
  },
  {
    id: 'GYM',
    dbKey: 'GYM',
    label: 'Gym',
    icon: <Dumbbell size={24} color="#FFF" />,
    color: liquidGlass.accent.primary,
    description: 'Traditional strength training',
  },
  {
    id: 'CARDIO',
    dbKey: 'CARDIO',
    label: 'Cardio',
    icon: <Heart size={24} color="#FFF" />,
    color: '#FF6B9D',
    description: 'Endurance and conditioning',
  },
  {
    id: 'BODYWEIGHT',
    dbKey: 'BODYWEIGHT',
    label: 'Bodyweight',
    icon: <User size={24} color="#FFF" />,
    color: '#9B7EFF',
    description: 'No equipment needed',
  },
];

// Pressable wrapper using the shared GlassCard
function PressableGlassCard({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
  const content = (
    <GlassCard style={style}>
      {children}
    </GlassCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export default function PlanScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const filteredExercises = useMemo(() => {
    if (!selectedCategory) return [];
    const category = WORKOUT_CATEGORIES.find(c => c.id === selectedCategory);
    if (!category) return [];
    return EXERCISE_LIBRARY.filter(ex => ex.category === category.dbKey);
  }, [selectedCategory]);

  const uniqueMuscleGroups = useMemo(() => {
    const groups = [...new Set(filteredExercises.map(ex => ex.muscleGroup))];
    return groups.sort();
  }, [filteredExercises]);

  const exercisesForMuscleGroup = useMemo(() => {
    if (!selectedMuscleGroup) return [];
    return filteredExercises.filter(ex => ex.muscleGroup === selectedMuscleGroup);
  }, [filteredExercises, selectedMuscleGroup]);

  const handleCategorySelect = useCallback((category: CategoryKey) => {
    haptics.medium();
    setSelectedCategory(category);
    setSelectedMuscleGroup(null);
  }, []);

  const handleMuscleGroupSelect = useCallback((muscleGroup: string) => {
    haptics.light();
    setSelectedMuscleGroup(muscleGroup);
  }, []);

  const handleBack = useCallback(() => {
    haptics.light();
    if (selectedMuscleGroup) {
      setSelectedMuscleGroup(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setSelectedExercises([]);
    }
  }, [selectedCategory, selectedMuscleGroup]);

  const convertToExercise = useCallback((entry: ExerciseEntry): Exercise => {
    return {
      id: entry.id,
      name: entry.name,
      sets: 3,
      reps: entry.difficulty === 'Beginner' ? '10-12' : entry.difficulty === 'Intermediate' ? '8-10' : '6-8',
      rest: entry.difficulty === 'Advanced' ? 120 : 90,
      kneeSafeLevel: 'safe',
      notes: `${entry.muscleGroup} exercise. Equipment: ${entry.equipment.length > 0 ? entry.equipment.join(', ') : 'None'}`,
    };
  }, []);

  const toggleExercise = useCallback((entry: ExerciseEntry) => {
    haptics.light();
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) {
        return prev.filter(e => e.id !== entry.id);
      }
      return [...prev, convertToExercise(entry)];
    });
  }, [convertToExercise]);

  const isExerciseSelected = useCallback((id: string) => {
    return selectedExercises.some(e => e.id === id);
  }, [selectedExercises]);

  const handleStartWorkout = useCallback(() => {
    if (selectedExercises.length === 0) {
      Alert.alert('No Exercises', 'Please select at least one exercise to start.');
      return;
    }
    haptics.medium();
    router.push('/programs/builder');
  }, [selectedExercises]);

  const renderCategorySelection = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Choose Your Training Style</Text>
      <Text style={styles.sectionSubtitle}>
        Select the type of workout that matches your goals
      </Text>

      <View style={styles.categoryGrid}>
        {WORKOUT_CATEGORIES.map((category) => (
          <PressableGlassCard
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(category.id)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              {category.icon}
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </PressableGlassCard>
        ))}
      </View>
    </View>
  );

  const renderMuscleGroupSelection = () => {
    const category = WORKOUT_CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <View style={styles.muscleGroupsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={liquidGlass.accent.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.categoryBadge, { backgroundColor: category?.color + '20' }]}>
          <View style={[styles.categoryBadgeIcon, { backgroundColor: category?.color }]}>
            {category?.icon}
          </View>
          <Text style={styles.categoryBadgeText}>{category?.label}</Text>
          <Text style={styles.categoryBadgeCount}>{filteredExercises.length} exercises</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Muscle Group</Text>
        <Text style={styles.sectionSubtitle}>
          {uniqueMuscleGroups.length} muscle groups available
        </Text>

        <View style={styles.muscleGroupList}>
          {uniqueMuscleGroups.map((muscleGroup) => {
            const count = filteredExercises.filter(ex => ex.muscleGroup === muscleGroup).length;
            return (
              <PressableGlassCard
                key={muscleGroup}
                style={styles.muscleGroupCard}
                onPress={() => handleMuscleGroupSelect(muscleGroup)}
              >
                <View style={styles.muscleGroupContent}>
                  <Text style={styles.muscleGroupLabel}>{muscleGroup}</Text>
                  <Text style={styles.muscleGroupDescription}>{count} exercises</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textTertiary} />
              </PressableGlassCard>
            );
          })}
        </View>
      </View>
    );
  };

  const renderWorkoutList = () => {
    const category = WORKOUT_CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <View style={styles.workoutListContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={liquidGlass.accent.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.breadcrumbs}>
          <View style={[styles.breadcrumbBadge, { backgroundColor: category?.color + '20' }]}>
            <Text style={[styles.breadcrumbText, { color: category?.color }]}>{category?.label}</Text>
          </View>
          <ChevronRight size={14} color={liquidGlass.text.tertiary} />
          <View style={styles.breadcrumbBadge}>
            <Text style={styles.breadcrumbText}>{selectedMuscleGroup}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{selectedMuscleGroup}</Text>
        <Text style={styles.sectionSubtitle}>
          {exercisesForMuscleGroup.length} exercises available · Tap to select
        </Text>

        <View style={styles.exerciseList}>
          {exercisesForMuscleGroup.map((exercise) => {
            const isSelected = isExerciseSelected(exercise.id);
            const difficultyColor = exercise.difficulty === 'Beginner' ? '#22C55E' : exercise.difficulty === 'Intermediate' ? '#EAB308' : '#EF4444';

            return (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, isSelected && styles.exerciseCardSelected]}
                onPress={() => toggleExercise(exercise)}
                activeOpacity={0.8}
              >
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.equipment.length > 0 ? exercise.equipment.slice(0, 2).join(', ') : 'No equipment'}
                  </Text>
                </View>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
                  <Text style={[styles.difficultyText, { color: difficultyColor }]}>{exercise.difficulty}</Text>
                </View>
                <View style={[styles.selectButton, isSelected && styles.selectButtonActive]}>
                  {isSelected ? (
                    <Check size={18} color="#FFF" />
                  ) : (
                    <Plus size={18} color={liquidGlass.accent.primary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedExercises.length > 0 && (
          <View style={styles.floatingAction}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
              activeOpacity={0.9}
            >
              <Play size={20} color="#FFF" fill="#FFF" />
              <Text style={styles.startButtonText}>
                Build Workout ({selectedExercises.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <VoidBackground>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Workout</Text>
          <Text style={styles.subtitle}>Build your personalized training program</Text>
        </View>

        {!selectedCategory && renderCategorySelection()}
        {selectedCategory && !selectedMuscleGroup && renderMuscleGroupSelection()}
        {selectedCategory && selectedMuscleGroup && renderWorkoutList()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </VoidBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: liquidGlass.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: glassLayout.screenPadding,
    paddingTop: glassLayout.screenPaddingTop,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
  },
  glassCard: {
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    padding: 18,
    ...glassShadows.soft,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  categoryGrid: {
    gap: 14,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 3,
  },
  categoryDescription: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
  },
  muscleGroupsContainer: {
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.accent.primary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    paddingRight: 18,
    paddingVertical: 8,
    paddingLeft: 8,
    borderRadius: 50,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  categoryBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
  },
  muscleGroupList: {
    gap: 12,
  },
  muscleGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  muscleGroupContent: {
    flex: 1,
  },
  muscleGroupLabel: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
    marginBottom: 3,
  },
  muscleGroupDescription: {
    fontSize: 14,
    color: liquidGlass.text.tertiary,
  },
  workoutListContainer: {
    marginTop: 8,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  breadcrumbBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
  },
  categoryBadgeCount: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
    marginLeft: 8,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    gap: 12,
  },
  exerciseCardSelected: {
    borderColor: liquidGlass.accent.primary,
    backgroundColor: liquidGlass.accent.primary + '10',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: liquidGlass.text.primary,
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 13,
    color: liquidGlass.text.tertiary,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  selectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonActive: {
    backgroundColor: liquidGlass.accent.primary,
    borderColor: liquidGlass.accent.primary,
  },
  floatingAction: {
    marginTop: 24,
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: liquidGlass.accent.primary,
    paddingVertical: 16,
    borderRadius: 50,
    ...glassShadows.glowTeal,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  bottomSpacer: {
    height: glassLayout.tabBarHeight,
  },
});
