import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Zap,
  Flame,
  Clock,
  AlertCircle,
  Sparkles,
  Camera,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { FoodEntry, NutritionLog, WorkoutIntensityDay, MacroTargets } from '@/types';
import { haptics } from '@/utils/haptics';
import { FuelGaugeDashboard } from '@/components/MacroRingChart';
import { SmartFoodLogger } from '@/components/SmartFoodLogger';

const { width } = Dimensions.get('window');

const NEON_LIME = '#CCFF00';
const TEAL = '#00C2B8';
const ORANGE = '#FF7A50';
const BG_PRIMARY = '#000000';
const BG_CARD = 'rgba(255,255,255,0.03)';
const BORDER_COLOR = 'rgba(255,255,255,0.06)';

interface MealSlot {
  id: string;
  name: string;
  time: string;
  icon: string;
  entries: FoodEntry[];
}

const RECENT_FOODS = [
  { id: 'chicken', label: 'Chicken Breast', emoji: '🍗', protein: 31, carbs: 0, fats: 3, calories: 165 },
  { id: 'rice', label: 'Brown Rice', emoji: '🍚', protein: 5, carbs: 45, fats: 2, calories: 216 },
  { id: 'eggs', label: 'Eggs (2)', emoji: '🥚', protein: 12, carbs: 1, fats: 10, calories: 140 },
  { id: 'shake', label: 'Protein Shake', emoji: '🥤', protein: 25, carbs: 5, fats: 2, calories: 130 },
  { id: 'salmon', label: 'Salmon', emoji: '🐟', protein: 25, carbs: 0, fats: 12, calories: 208 },
  { id: 'oats', label: 'Oatmeal', emoji: '🥣', protein: 6, carbs: 27, fats: 3, calories: 150 },
];

const getWorkoutIntensity = (todayLog: { workoutCompleted?: boolean } | null): WorkoutIntensityDay => {
  if (!todayLog?.workoutCompleted) return 'rest';
  return 'high';
};

const getDynamicTargets = (intensity: WorkoutIntensityDay, weight: number = 75): MacroTargets => {
  const baseProtein = weight * 2;
  const baseCarbs = weight * 3;
  const baseFats = weight * 0.8;
  
  const multipliers: Record<WorkoutIntensityDay, { carbs: number; calories: number }> = {
    rest: { carbs: 0.7, calories: 0.85 },
    light: { carbs: 0.85, calories: 0.95 },
    moderate: { carbs: 1, calories: 1 },
    high: { carbs: 1.2, calories: 1.1 },
    intense: { carbs: 1.4, calories: 1.2 },
  };
  
  const mult = multipliers[intensity];
  return {
    protein: Math.round(baseProtein),
    carbs: Math.round(baseCarbs * mult.carbs),
    fats: Math.round(baseFats),
    calories: Math.round((baseProtein * 4 + baseCarbs * mult.carbs * 4 + baseFats * 9) * mult.calories),
  };
};

const getIntensityLabel = (intensity: WorkoutIntensityDay): { label: string; color: string } => {
  const labels: Record<WorkoutIntensityDay, { label: string; color: string }> = {
    rest: { label: 'Rest Day', color: ORANGE },
    light: { label: 'Light Day', color: TEAL },
    moderate: { label: 'Moderate Day', color: TEAL },
    high: { label: 'High Carb Day', color: NEON_LIME },
    intense: { label: 'Fuel Up Day', color: NEON_LIME },
  };
  return labels[intensity];
};

const getAISuggestion = (
  currentMacros: { protein: number; carbs: number; fats: number },
  targets: MacroTargets,
  hasInflammation: boolean
): string => {
  const proteinGap = targets.protein - currentMacros.protein;
  const carbsGap = targets.carbs - currentMacros.carbs;
  const fatsGap = targets.fats - currentMacros.fats;
  
  if (hasInflammation && currentMacros.carbs > 50) {
    return "Consider anti-inflammatory foods like salmon, leafy greens, or turmeric to support recovery.";
  }
  
  if (proteinGap > 40) {
    return `You're ${proteinGap}g short on protein. Try grilled chicken, Greek yogurt, or a protein shake.`;
  }
  
  if (carbsGap > 60) {
    return `Need ${carbsGap}g more carbs for energy. Sweet potato or oatmeal would be great choices.`;
  }
  
  if (fatsGap > 20) {
    return `Add some healthy fats like avocado, nuts, or olive oil to support hormone function.`;
  }
  
  if (proteinGap <= 0 && carbsGap <= 0 && fatsGap <= 0) {
    return "Great job! You've hit all your macro targets for today. Stay hydrated!";
  }
  
  return "You're on track. Keep up the balanced eating for optimal recovery and performance.";
};

export default function NutritionScreen() {
  const { getTodayLog, logNutrition, userProfile } = useApp();
  const todayLog = getTodayLog();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(todayLog?.nutritionLog?.foodEntries || []);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeMealSlot, setActiveMealSlot] = useState<string | null>(null);

  const dateKey = selectedDate.toISOString().split('T')[0];
  
  const workoutIntensity = getWorkoutIntensity(todayLog);
  const userWeight = userProfile?.weight || 75;
  const targets = getDynamicTargets(workoutIntensity, userWeight);
  const intensityInfo = getIntensityLabel(workoutIntensity);
  
  const hasInflammation = userProfile?.injuryType !== undefined;

  const currentMacros = useMemo(() => {
    return foodEntries.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.protein || 0),
        carbs: acc.carbs + (entry.carbs || 0),
        fats: acc.fats + (entry.fats || 0),
        calories: acc.calories + (entry.calories || 0),
      }),
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );
  }, [foodEntries]);

  const aiSuggestion = getAISuggestion(currentMacros, targets, hasInflammation);

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    haptics.light();
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const mealSlots: MealSlot[] = useMemo(() => {
    const getEntriesForMeal = (mealId: string) => {
      return foodEntries.filter(entry => entry.mealType === mealId);
    };

    return [
      { id: 'breakfast', name: 'Breakfast', time: '7:00 AM', icon: '🌅', entries: getEntriesForMeal('breakfast') },
      { id: 'lunch', name: 'Lunch', time: '12:30 PM', icon: '☀️', entries: getEntriesForMeal('lunch') },
      { id: 'pre_workout', name: 'Pre-Workout', time: '4:00 PM', icon: '⚡', entries: getEntriesForMeal('pre_workout') },
      { id: 'dinner', name: 'Dinner', time: '7:30 PM', icon: '🌙', entries: getEntriesForMeal('dinner') },
    ];
  }, [foodEntries]);

  const saveLog = useCallback((foods: FoodEntry[]) => {
    const log: NutritionLog = { 
      date: dateKey, 
      waterIntake: todayLog?.nutritionLog?.waterIntake || 0, 
      foodEntries: foods 
    };
    logNutrition(log);
  }, [dateKey, logNutrition, todayLog?.nutritionLog?.waterIntake]);

  const handleOpenAddMeal = useCallback((mealId: string) => {
    haptics.light();
    setActiveMealSlot(mealId);
    setShowAddMeal(true);
  }, []);

  const handleSmartLogSave = useCallback((entry: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    inflammationScore?: number;
  }) => {
    if (!activeMealSlot) return;
    
    haptics.medium();
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: entry.name,
      timestamp: new Date().toISOString(),
      mealType: activeMealSlot as FoodEntry['mealType'],
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fats,
      calories: entry.calories,
      inflammationScore: entry.inflammationScore,
    };
    
    const updated = [...foodEntries, newEntry];
    setFoodEntries(updated);
    saveLog(updated);
    setShowAddMeal(false);
    setActiveMealSlot(null);
  }, [activeMealSlot, foodEntries, saveLog]);

  const handleCloseModal = useCallback(() => {
    setShowAddMeal(false);
    setActiveMealSlot(null);
  }, []);

  const getMealCalories = (entries: FoodEntry[]) => {
    return entries.reduce((sum, e) => sum + (e.calories || 0), 0);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Nutrition</Text>
            <View style={styles.dateNav}>
              <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.dateNavBtn}>
                <ChevronLeft size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <TouchableOpacity onPress={() => navigateDate('next')} style={styles.dateNavBtn}>
                <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.targetCard}>
            <LinearGradient
              colors={['rgba(204,255,0,0.08)', 'rgba(0,0,0,0)']}
              style={styles.targetGradient}
            />
            <View style={styles.targetHeader}>
              <View style={styles.targetLeft}>
                <Zap size={16} color={intensityInfo.color} />
                <Text style={[styles.targetLabel, { color: intensityInfo.color }]}>
                  {intensityInfo.label}
                </Text>
              </View>
              <View style={styles.caloriesBadge}>
                <Flame size={14} color={ORANGE} />
                <Text style={styles.caloriesText}>
                  {currentMacros.calories} / {targets.calories} kcal
                </Text>
              </View>
            </View>
            <Text style={styles.targetDescription}>
              {workoutIntensity === 'high' || workoutIntensity === 'intense'
                ? 'Carbs increased by 20% to fuel your workout and recovery.'
                : workoutIntensity === 'rest'
                ? 'Lower carbs today to match your activity level.'
                : 'Balanced macros for steady energy throughout the day.'}
            </Text>
          </View>

          <FuelGaugeDashboard
            protein={{ current: currentMacros.protein, target: targets.protein }}
            carbs={{ current: currentMacros.carbs, target: targets.carbs }}
            fats={{ current: currentMacros.fats, target: targets.fats }}
          />

          {hasInflammation && currentMacros.carbs > 100 && (
            <View style={styles.warningCard}>
              <AlertCircle size={18} color={ORANGE} />
              <Text style={styles.warningText}>
                Sugar intake may affect recovery. Consider anti-inflammatory foods.
              </Text>
            </View>
          )}

          <View style={styles.mealFeedSection}>
            <Text style={styles.sectionTitle}>Meal Timeline</Text>
            
            {mealSlots.map((meal, index) => (
              <View key={meal.id}>
                <TouchableOpacity 
                  style={styles.mealCard}
                  onPress={() => handleOpenAddMeal(meal.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mealTimelineIndicator}>
                    <View style={[
                      styles.timelineDot,
                      meal.entries.length > 0 && styles.timelineDotFilled
                    ]} />
                    {index < mealSlots.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.mealContent}>
                    <View style={styles.mealHeader}>
                      <View style={styles.mealLeft}>
                        <Text style={styles.mealIcon}>{meal.icon}</Text>
                        <View>
                          <Text style={styles.mealName}>{meal.name}</Text>
                          <View style={styles.mealTimeRow}>
                            <Clock size={12} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.mealTime}>{meal.time}</Text>
                          </View>
                        </View>
                      </View>
                      {meal.entries.length > 0 ? (
                        <Text style={styles.mealCalories}>
                          {getMealCalories(meal.entries)} kcal
                        </Text>
                      ) : (
                        <View style={styles.addMealBtnSmall}>
                          <Camera size={14} color={NEON_LIME} />
                          <Text style={styles.addMealBtnText}>Log Fuel</Text>
                        </View>
                      )}
                    </View>
                    
                    {meal.entries.length > 0 && (
                      <View style={styles.mealEntries}>
                        {meal.entries.map((entry) => (
                          <View key={entry.id} style={styles.entryChip}>
                            <Text style={styles.entryText}>{entry.name}</Text>
                            {entry.protein ? (
                              <Text style={styles.entryMacros}>
                                P:{entry.protein}g C:{entry.carbs}g F:{entry.fats}g
                              </Text>
                            ) : null}
                          </View>
                        ))}
                        <TouchableOpacity 
                          style={styles.addMoreBtn}
                          onPress={() => handleOpenAddMeal(meal.id)}
                        >
                          <Plus size={14} color={NEON_LIME} />
                          <Text style={styles.addMoreText}>Add more</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.aiCoachWidget}>
            <LinearGradient
              colors={['rgba(204,255,0,0.05)', 'rgba(0,194,184,0.03)']}
              style={styles.aiCoachGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.aiCoachHeader}>
              <View style={styles.aiCoachIcon}>
                <Sparkles size={16} color={NEON_LIME} />
              </View>
              <Text style={styles.aiCoachTitle}>AI Coach</Text>
            </View>
            <Text style={styles.aiCoachMessage}>{aiSuggestion}</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <SmartFoodLogger
        visible={showAddMeal}
        onClose={handleCloseModal}
        onSave={handleSmartLogSave}
        mealName={mealSlots.find(m => m.id === activeMealSlot)?.name || 'Meal'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG_PRIMARY,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    padding: 20, 
    paddingTop: 10, 
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  targetCard: {
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  targetGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,122,80,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  caloriesText: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  targetDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,122,80,0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,122,80,0.2)',
  },
  warningText: {
    flex: 1,
    color: ORANGE,
    fontSize: 13,
    lineHeight: 18,
  },
  mealFeedSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  mealCard: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  mealTimelineIndicator: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timelineDotFilled: {
    backgroundColor: NEON_LIME,
    borderColor: 'rgba(204,255,0,0.3)',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  mealContent: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  mealTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: NEON_LIME,
  },
  addMealBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(204,255,0,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMealBtnText: {
    color: NEON_LIME,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  mealEntries: {
    marginTop: 14,
    gap: 8,
  },
  entryChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  entryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  entryMacros: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  addMoreText: {
    color: NEON_LIME,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  aiCoachWidget: {
    marginTop: 28,
    backgroundColor: BG_CARD,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  aiCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  aiCoachIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(204,255,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCoachTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: NEON_LIME,
  },
  aiCoachMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
  },
  bottomSpacer: { 
    height: 40,
  },
  
});
