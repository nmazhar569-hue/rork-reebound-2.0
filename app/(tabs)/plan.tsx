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
  ChevronLeft,
} from 'lucide-react-native';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
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
    icon: <Zap size={24} color="#FFF" />,
    color: '#FF6B4A',
    description: 'High-intensity functional movements',
  },
  {
    id: 'gym',
    label: 'Gym',
    icon: <Dumbbell size={24} color="#FFF" />,
    color: liquidGlass.accent.primary,
    description: 'Traditional strength training',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    icon: <Heart size={24} color="#FFF" />,
    color: '#FF6B9D',
    description: 'Endurance and conditioning',
  },
  {
    id: 'bodyweight',
    label: 'Bodyweight',
    icon: <User size={24} color="#FFF" />,
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

function GlassCard({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) {
  const content = (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
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
          <GlassCard
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
            <ChevronRight size={20} color={liquidGlass.text.tertiary} />
          </GlassCard>
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
        </View>

        <Text style={styles.sectionTitle}>Select Muscle Group</Text>
        <Text style={styles.sectionSubtitle}>
          Choose the target muscle group for your workout
        </Text>

        <View style={styles.muscleGroupList}>
          {MUSCLE_GROUPS.map((muscle) => (
            <GlassCard
              key={muscle.id}
              style={styles.muscleGroupCard}
              onPress={() => handleMuscleGroupSelect(muscle.id)}
            >
              <View style={styles.muscleGroupContent}>
                <Text style={styles.muscleGroupLabel}>{muscle.label}</Text>
                <Text style={styles.muscleGroupDescription}>{muscle.description}</Text>
              </View>
              <ChevronRight size={20} color={liquidGlass.text.tertiary} />
            </GlassCard>
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
          <ChevronLeft size={20} color={liquidGlass.accent.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.breadcrumbs}>
          <View style={[styles.breadcrumbBadge, { backgroundColor: category?.color + '20' }]}>
            <Text style={[styles.breadcrumbText, { color: category?.color }]}>{category?.label}</Text>
          </View>
          <ChevronRight size={14} color={liquidGlass.text.tertiary} />
          <View style={styles.breadcrumbBadge}>
            <Text style={styles.breadcrumbText}>{muscleGroup?.label}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{muscleGroup?.label} Workouts</Text>
        <Text style={styles.sectionSubtitle}>
          {category?.label} exercises targeting {muscleGroup?.label.toLowerCase()}
        </Text>

        <GlassCard style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Dumbbell size={48} color={liquidGlass.text.tertiary} />
          </View>
          <Text style={styles.placeholderTitle}>Workouts Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Workout exercises for this muscle group will be added soon. 
            You can provide the workout data later.
          </Text>
        </GlassCard>
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
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Workout</Text>
          <Text style={styles.subtitle}>Build your personalized training program</Text>
        </View>

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
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: liquidGlass.surface.glassDark,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 15,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomSpacer: { 
    height: glassLayout.tabBarHeight,
  },
});
