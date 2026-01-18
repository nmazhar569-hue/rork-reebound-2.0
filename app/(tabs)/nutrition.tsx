import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
} from 'react-native';
import { 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Plus,
  X,
  Droplet,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui';
import colors, { borderRadius, shadows, layout } from '@/constants/colors';
import { FoodEntry, NutritionLog } from '@/types';
import { haptics } from '@/utils/haptics';

interface MealSlot {
  id: string;
  name: string;
  time: string;
  entries: FoodEntry[];
}

const QUICK_ADD_OPTIONS = [
  { id: 'salad', label: 'Salad', emoji: '🥗' },
  { id: 'protein', label: 'Protein', emoji: '🍗' },
  { id: 'fruit', label: 'Fruit', emoji: '🍎' },
  { id: 'smoothie', label: 'Smoothie', emoji: '🥤' },
];

const WATER_GOAL = 8;

export default function NutritionScreen() {
  const { getTodayLog, logNutrition } = useApp();
  const todayLog = getTodayLog();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterCount, setWaterCount] = useState(todayLog?.nutritionLog?.waterIntake ? Math.floor(todayLog.nutritionLog.waterIntake / 250) : 0);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(todayLog?.nutritionLog?.foodEntries || []);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [activeMealSlot, setActiveMealSlot] = useState<string | null>(null);
  const [mealInput, setMealInput] = useState('');

  const dateKey = selectedDate.toISOString().split('T')[0];

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
      return foodEntries.filter(entry => {
        const hour = new Date(entry.timestamp).getHours();
        if (mealId === 'breakfast') return hour >= 5 && hour < 11;
        if (mealId === 'lunch') return hour >= 11 && hour < 16;
        if (mealId === 'dinner') return hour >= 16 && hour < 22;
        return false;
      });
    };

    return [
      { id: 'breakfast', name: 'Breakfast', time: '8:30 AM', entries: getEntriesForMeal('breakfast') },
      { id: 'lunch', name: 'Lunch', time: '1:00 PM', entries: getEntriesForMeal('lunch') },
      { id: 'dinner', name: 'Dinner', time: '7:00 PM', entries: getEntriesForMeal('dinner') },
    ];
  }, [foodEntries]);

  const saveLog = useCallback((water: number, foods: FoodEntry[]) => {
    const log: NutritionLog = { 
      date: dateKey, 
      waterIntake: water * 250, 
      foodEntries: foods 
    };
    logNutrition(log);
  }, [dateKey, logNutrition]);

  const handleWaterTap = useCallback((index: number) => {
    haptics.light();
    const newCount = index + 1 <= waterCount ? index : index + 1;
    setWaterCount(newCount);
    saveLog(newCount, foodEntries);
  }, [waterCount, foodEntries, saveLog]);

  const handleOpenAddMeal = useCallback((mealId: string) => {
    haptics.light();
    setActiveMealSlot(mealId);
    setShowAddMeal(true);
    setMealInput('');
  }, []);

  const handleAddMeal = useCallback(() => {
    if (!mealInput.trim() || !activeMealSlot) return;
    
    haptics.medium();
    const now = new Date();
    if (activeMealSlot === 'breakfast') now.setHours(8, 30);
    else if (activeMealSlot === 'lunch') now.setHours(13, 0);
    else if (activeMealSlot === 'dinner') now.setHours(19, 0);

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: mealInput.trim(),
      timestamp: now.toISOString(),
    };
    
    const updated = [...foodEntries, newEntry];
    setFoodEntries(updated);
    saveLog(waterCount, updated);
    setShowAddMeal(false);
    setMealInput('');
    setActiveMealSlot(null);
  }, [mealInput, activeMealSlot, foodEntries, waterCount, saveLog]);

  const handleQuickAdd = useCallback((item: typeof QUICK_ADD_OPTIONS[0]) => {
    haptics.light();
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: `${item.emoji} ${item.label}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [...foodEntries, newEntry];
    setFoodEntries(updated);
    saveLog(waterCount, updated);
  }, [foodEntries, waterCount, saveLog]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>Track what feels right</Text>
        </View>

        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.dateNavBtn}>
            <ChevronLeft size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.dateNavBtn}>
            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.mealsSection}>
          {mealSlots.map((meal) => (
            <Card key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              
              {meal.entries.length > 0 ? (
                <View style={styles.mealEntries}>
                  {meal.entries.map((entry) => (
                    <Text key={entry.id} style={styles.entryText}>{entry.name}</Text>
                  ))}
                </View>
              ) : null}
              
              <TouchableOpacity 
                style={styles.addMealBtn}
                onPress={() => handleOpenAddMeal(meal.id)}
              >
                <View style={styles.addMealIcon}>
                  <Utensils size={14} color={colors.primary} />
                </View>
                <Text style={styles.addMealText}>+ Add meal</Text>
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        <View style={styles.waterSection}>
          <Text style={styles.sectionLabel}>Water intake</Text>
          <View style={styles.waterDroplets}>
            {Array.from({ length: WATER_GOAL }).map((_, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => handleWaterTap(index)}
                style={styles.dropletBtn}
              >
                <Droplet 
                  size={32} 
                  color={index < waterCount ? colors.primary : colors.borderLight}
                  fill={index < waterCount ? colors.primary : 'transparent'}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.quickAddSection}>
          <Text style={styles.sectionLabel}>Quick add</Text>
          <View style={styles.quickAddGrid}>
            {QUICK_ADD_OPTIONS.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.quickAddChip}
                onPress={() => handleQuickAdd(item)}
              >
                <Text style={styles.quickAddEmoji}>{item.emoji}</Text>
                <Text style={styles.quickAddLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.reeMessage}>
          <View style={styles.reeAvatar}>
            <Text style={styles.reeAvatarText}>😊</Text>
          </View>
          <View style={styles.reeBubble}>
            <Text style={styles.reeBubbleText}>No pressure - just awareness</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showAddMeal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMeal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add to {mealSlots.find(m => m.id === activeMealSlot)?.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowAddMeal(false)} 
                style={styles.modalClose}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.mealInputField}
              placeholder="What did you have?"
              placeholderTextColor={colors.textTertiary}
              value={mealInput}
              onChangeText={setMealInput}
              autoFocus
            />

            <TouchableOpacity 
              style={[
                styles.addBtn, 
                !mealInput.trim() && styles.addBtnDisabled
              ]}
              onPress={handleAddMeal}
              disabled={!mealInput.trim()}
            >
              <Plus size={18} color={colors.surface} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  dateNavBtn: {
    padding: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  mealsSection: {
    gap: 12,
    marginBottom: 28,
  },
  mealCard: {
    padding: 18,
    backgroundColor: colors.primaryMuted,
    borderWidth: 0,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  mealTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mealEntries: {
    marginBottom: 12,
    gap: 4,
  },
  entryText: {
    fontSize: 14,
    color: colors.text,
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addMealIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  waterSection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 14,
  },
  waterDroplets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  dropletBtn: {
    padding: 4,
  },
  quickAddSection: {
    marginBottom: 28,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickAddEmoji: {
    fontSize: 16,
  },
  quickAddLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  reeMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reeAvatarText: {
    fontSize: 20,
  },
  reeBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reeBubbleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomSpacer: { 
    height: layout.tabBarHeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: 24,
    ...shadows.lifted,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  mealInputField: {
    backgroundColor: colors.surfaceDim,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
  },
});
