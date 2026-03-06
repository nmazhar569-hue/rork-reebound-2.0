import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Star,
  Bell
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { VoidBackground } from '@/components/VoidBackground';
import { FoodEntry, NutritionLog, WorkoutIntensityDay, MacroTargets, WorkoutSession } from '@/types';
import { haptics } from '@/utils/haptics';
import { FuelGaugeDashboard } from '@/components/MacroRingChart';
import { SmartFoodLogger } from '@/components/SmartFoodLogger';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { router } from 'expo-router';
import { useRee } from '@/contexts/ReeContext';


// Components
import { DynamicStatusPanel, PanelContext } from '@/components/DynamicStatusPanel';
import { ReeAnalysisModal } from '@/components/ReeAnalysisModal';
import { RecoveryInbox } from '@/components/RecoveryInbox';

// Services
import { analysisService, RecoveryAnalysis } from '@/services/AnalysisService';
import { calendarService, DailyAvailability } from '@/services/CalendarService';
import { storageService } from '@/services/StorageService';
import { MineralDashboard } from '@/components/MineralDashboard';
import { WaterTracker } from '@/components/WaterTracker';

interface MealSlot {
  id: 'breakfast' | 'lunch' | 'dinner' | 'pre_workout' | 'post_workout' | 'snack';
  name: string;
  time: string;
  icon: string;
  entries: FoodEntry[];
}

const { width } = Dimensions.get('window');

const NEON_LIME = liquidGlass.accent.primary;
const TEAL = liquidGlass.accent.primary;
const ORANGE = liquidGlass.status.warning;
const BG_PRIMARY = 'transparent';
const BG_CARD = liquidGlass.surface.card;
const BORDER_COLOR = liquidGlass.border.glass;

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
  const { getTodayLog, logNutrition, userProfile, userPoints, dailyLogs } = useApp();
  const { hasUnseenInsight } = useRee();
  const todayLog = getTodayLog();

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate dateKey first so we can initialize state correctly if needed, 
  // though useEffect will handle updates.
  const dateKey = selectedDate.toISOString().split('T')[0];

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeMealSlot, setActiveMealSlot] = useState<string | null>(null);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryAnalysis | null>(null);
  const [calendarAvailability, setCalendarAvailability] = useState<DailyAvailability | null>(null);
  const [lastWorkout, setLastWorkout] = useState<WorkoutSession | null>(null);
  const [weeklyVolumeAvg, setWeeklyVolumeAvg] = useState<number>(0);
  // Removed initial state dependency on todayLog to rely on effect
  const [waterTarget, setWaterTarget] = useState<number>(2500);

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

  // Effect to load data when date changes
  useEffect(() => {
    const logForDate = dailyLogs.find(l => l.date === dateKey);
    const nutrition = logForDate?.nutritionLog;

    setFoodEntries(nutrition?.foodEntries || []);
    setWaterIntake(nutrition?.waterIntake || 0);
  }, [dateKey, dailyLogs]);

  // Load history & biometrics for panel
  useEffect(() => {
    const loadData = async () => {
      try {
        const last = await storageService.getLastWorkout();
        const avgVolume = await storageService.getWeeklyVolumeAverage();
        setLastWorkout(last);
        setWeeklyVolumeAvg(avgVolume);

        await calendarService.requestPermissions();
        const availability = await calendarService.getAvailability();
        setCalendarAvailability(availability);
      } catch (error) {
        console.error('[Nutrition] Data load failed:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const freeMinutes = calendarAvailability?.totalFreeMinutes;
    const result = analysisService.analyzeDailyState(
      {
        date: new Date(),
        sleepHours: 7.8,
        sleepQuality: 'fair',
        hrv: 55,
        restingHeartRate: 62,
        sorenessRating: 3,
        stressRating: 4,
      },
      lastWorkout ?? undefined,
      weeklyVolumeAvg,
      freeMinutes
    );
    setRecoveryStatus(result);
  }, [calendarAvailability, lastWorkout, weeklyVolumeAvg]);

  const panelContext = useMemo((): PanelContext => {
    if (workoutIntensity === 'rest') return 'rest_day';
    return 'morning_ready';
  }, [workoutIntensity]);

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

  const saveLog = useCallback((foods: FoodEntry[], water?: number) => {
    const log: NutritionLog = {
      date: dateKey,
      waterIntake: water !== undefined ? water : waterIntake,
      foodEntries: foods
    };
    logNutrition(log);
  }, [dateKey, logNutrition, waterIntake]);

  const handleWaterUpdate = useCallback((newAmount: number) => {
    setWaterIntake(newAmount);
    saveLog(foodEntries, newAmount);
  }, [foodEntries, saveLog]);

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
    minerals?: any;
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
      minerals: entry.minerals,
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
    <VoidBackground>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* ========== PREMIUM HEADER ========== */}
          <View style={styles.premiumHeader}>
            <View style={styles.logoRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace('/')}
              >
                <ChevronLeft size={24} color={liquidGlass.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.greetingText}>Nutrient Timings</Text>
                <Text style={styles.logoTitle}>Fueling Plan</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.pointsBadge}>
                <Star size={14} color={liquidGlass.accent.primary} fill={liquidGlass.accent.primary} />
                <Text style={styles.pointsText}>{userPoints}</Text>
              </View>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => setInboxVisible(true)}
              >
                <Bell size={20} color={liquidGlass.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ========== DYNAMIC PANEL ========== */}
            <View style={styles.panelContainer}>
              <DynamicStatusPanel
                context={panelContext}
                readinessScore={recoveryStatus?.score ?? 78}
                sleepHours={7.8}
                workoutName={workoutIntensity === 'rest' ? "Rest Day" : "Training Day"}
                recoveryHours="Daily Balance"
                hrvTrend="up"
                reeGuidance={aiSuggestion}
              />
            </View>



            <View style={styles.headerNav}>
              <View style={styles.dateNav}>
                <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.dateNavBtn}>
                  <ChevronLeft size={18} color={liquidGlass.text.tertiary} />
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity onPress={() => navigateDate('next')} style={styles.dateNavBtn}>
                  <ChevronRight size={18} color={liquidGlass.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <FuelGaugeDashboard
              protein={{ current: currentMacros.protein, target: targets.protein }}
              carbs={{ current: currentMacros.carbs, target: targets.carbs }}
              fats={{ current: currentMacros.fats, target: targets.fats }}
            />

            <WaterTracker
              currentIntake={waterIntake}
              targetIntake={waterTarget}
              onUpdate={handleWaterUpdate}
            />

            <MineralDashboard entries={foodEntries} />

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

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Modals */}
      <RecoveryInbox visible={inboxVisible} onClose={() => setInboxVisible(false)} />
      <ReeAnalysisModal visible={checkInModalVisible} onClose={() => setCheckInModalVisible(false)} onActionPress={() => router.push('/myworkoutplan')} />

      <SmartFoodLogger
        visible={showAddMeal}
        onClose={handleCloseModal}
        onSave={handleSmartLogSave}
        mealName={mealSlots.find(m => m.id === activeMealSlot)?.name || 'Meal'}
      />
    </VoidBackground>
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
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: glassLayout.screenPadding,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: liquidGlass.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 12,
    color: liquidGlass.text.tertiary,
    marginBottom: 2,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: liquidGlass.text.primary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${liquidGlass.accent.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${liquidGlass.accent.primary}40`,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700',
    color: liquidGlass.accent.primary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: glassLayout.screenPadding,
    paddingTop: 10,
    paddingBottom: 40,
  },
  panelContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  reeButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerNav: {
    marginBottom: 24,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: liquidGlass.surface.glass,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: liquidGlass.text.secondary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: liquidGlass.status.warningMuted,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: liquidGlass.status.warningMuted,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: liquidGlass.text.primary,
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
    backgroundColor: liquidGlass.border.glassMedium,
    borderWidth: 2,
    borderColor: liquidGlass.border.glass,
  },
  timelineDotFilled: {
    backgroundColor: NEON_LIME,
    borderColor: liquidGlass.accent.muted,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: liquidGlass.border.glassLight,
    marginTop: 4,
  },
  mealContent: {
    flex: 1,
    backgroundColor: liquidGlass.surface.card,
    borderRadius: 20,
    padding: 16,
    marginLeft: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: liquidGlass.border.glass,
    ...glassShadows.soft,
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
    color: liquidGlass.text.primary,
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  mealTime: {
    fontSize: 12,
    color: liquidGlass.text.tertiary,
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
    backgroundColor: liquidGlass.accent.muted,
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
    backgroundColor: liquidGlass.surface.glassDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: liquidGlass.border.glassLight,
  },
  entryText: {
    color: liquidGlass.text.primary,
    fontSize: 14,
  },
  entryMacros: {
    color: liquidGlass.text.tertiary,
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
  bottomSpacer: {
    height: 40,
  },
});
