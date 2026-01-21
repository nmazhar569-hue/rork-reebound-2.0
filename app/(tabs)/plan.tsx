import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native';

import { 
  ChevronRight,
  Dumbbell,
  Heart,
  Zap,
  User,
} from 'lucide-react-native';
import { PageHeader, Card } from '@/components/ui';
import colors, { borderRadius, layout, shadows } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

type WorkoutCategory = 'crossfit' | 'gym' | 'cardio' | 'bodyweight' | null;
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'glutes' | 'calves' | null;

interface CategoryOption {
  id: WorkoutCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface MuscleGroupOption {
  id: MuscleGroup;
  label: string;
  description: string;
}

const WORKOUT_CATEGORIES: CategoryOption[] = [
  {
    id: 'crossfit',
    label: 'CrossFit',
    icon: <Zap size={28} color={colors.surface} />,
    color: colors.accent,
    description: 'High-intensity functional movements',
  },
  {
    id: 'gym',
    label: 'Gym',
    icon: <Dumbbell size={28} color={colors.surface} />,
    color: colors.primary,
    description: 'Traditional strength training',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: <Heart size={28} color={colors.surface} />,
    color: '#FF6B9D',
    description: 'Endurance and conditioning',
  },
  {
    id: 'bodyweight',
    label: 'Bodyweight',
    icon: <User size={28} color={colors.surface} />,
    color: '#9B7EFF',
    description: 'No equipment needed',
  },
];

const MUSCLE_GROUPS: MuscleGroupOption[] = [
  { id: 'chest', label: 'Chest', description: 'Pectorals & upper body push' },
  { id: 'back', label: 'Back', description: 'Lats, traps & rhomboids' },
  { id: 'shoulders', label: 'Shoulders', description: 'Deltoids & rotator cuff' },
  { id: 'arms', label: 'Arms', description: 'Biceps, triceps & forearms' },
  { id: 'legs', label: 'Legs', description: 'Quads, hamstrings & calves' },
  { id: 'core', label: 'Core', description: 'Abs & obliques' },
  { id: 'glutes', label: 'Glutes', description: 'Glutes & hips' },
  { id: 'calves', label: 'Calves', description: 'Lower leg muscles' },
];

export default function PlanScreen() {
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>(null);

  const handleCategorySelect = useCallback((category: WorkoutCategory) => {
    haptics.medium();
    setSelectedCategory(category);
    setSelectedMuscleGroup(null);
  }, []);

  const handleMuscleGroupSelect = useCallback((muscleGroup: MuscleGroup) => {
    haptics.light();
    setSelectedMuscleGroup(muscleGroup);
  }, []);

  const handleBack = useCallback(() => {
    haptics.light();
    if (selectedMuscleGroup) {
      setSelectedMuscleGroup(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  }, [selectedCategory, selectedMuscleGroup]);

  const renderCategorySelection = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Choose Your Training Style</Text>
      <Text style={styles.sectionSubtitle}>
        Select the type of workout that matches your goals
      </Text>
      
      <View style={styles.categoryGrid}>
        {WORKOUT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(category.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              {category.icon}
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </TouchableOpacity>
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
          <ChevronRight 
            size={20} 
            color={colors.primary} 
            style={{ transform: [{ rotate: '180deg' }] }}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={[styles.categoryBadge, { backgroundColor: category?.color + '15' }]}>
          <View style={[styles.categoryBadgeIcon, { backgroundColor: category?.color }]}>
            {category?.icon}
          </View>
          <Text style={styles.categoryBadgeText}>{category?.label}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Muscle Group</Text>
        <Text style={styles.sectionSubtitle}>
          Choose the target muscle group for your workout
        </Text>

        <View style={styles.muscleGroupList}>
          {MUSCLE_GROUPS.map((muscle) => (
            <TouchableOpacity
              key={muscle.id}
              style={styles.muscleGroupCard}
              onPress={() => handleMuscleGroupSelect(muscle.id)}
              activeOpacity={0.7}
            >
              <View style={styles.muscleGroupContent}>
                <Text style={styles.muscleGroupLabel}>{muscle.label}</Text>
                <Text style={styles.muscleGroupDescription}>{muscle.description}</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderWorkoutList = () => {
    const category = WORKOUT_CATEGORIES.find(c => c.id === selectedCategory);
    const muscleGroup = MUSCLE_GROUPS.find(m => m.id === selectedMuscleGroup);

    return (
      <View style={styles.workoutListContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronRight 
            size={20} 
            color={colors.primary} 
            style={{ transform: [{ rotate: '180deg' }] }}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.breadcrumbs}>
          <View style={[styles.breadcrumbBadge, { backgroundColor: category?.color + '15' }]}>
            <Text style={[styles.breadcrumbText, { color: category?.color }]}>{category?.label}</Text>
          </View>
          <ChevronRight size={14} color={colors.textTertiary} />
          <View style={styles.breadcrumbBadge}>
            <Text style={styles.breadcrumbText}>{muscleGroup?.label}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{muscleGroup?.label} Workouts</Text>
        <Text style={styles.sectionSubtitle}>
          {category?.label} exercises targeting {muscleGroup?.label.toLowerCase()}
        </Text>

        <Card style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Dumbbell size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.placeholderTitle}>Workouts Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Workout exercises for this muscle group will be added soon. 
            You can provide the workout data later.
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <PageHeader 
          title="Plan Your Workout" 
          subtitle="Build your personalized training program" 
        />

        {!selectedCategory && renderCategorySelection()}
        {selectedCategory && !selectedMuscleGroup && renderMuscleGroupSelection()}
        {selectedCategory && selectedMuscleGroup && renderWorkoutList()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    padding: layout.screenPadding, 
    paddingTop: layout.screenPaddingTop,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 28,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  categoryGrid: {
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 20,
    gap: 16,
    ...shadows.medium,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
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
    color: colors.primary,
    letterSpacing: -0.1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'flex-start',
    paddingRight: 20,
    paddingVertical: 8,
    paddingLeft: 8,
    borderRadius: borderRadius.full,
    marginBottom: 24,
  },
  categoryBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  muscleGroupList: {
    gap: 12,
  },
  muscleGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 18,
    gap: 12,
    ...shadows.soft,
  },
  muscleGroupContent: {
    flex: 1,
  },
  muscleGroupLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  muscleGroupDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDim,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    letterSpacing: 0.1,
  },
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500' as const,
    maxWidth: 300,
  },
  bottomSpacer: { 
    height: layout.tabBarHeight,
  },
});
