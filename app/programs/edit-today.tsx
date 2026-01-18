import { router, useLocalSearchParams } from 'expo-router';
import { Check, Plus, ChevronLeft, Search, Filter, Dumbbell, BicepsFlexed, HeartPulse, Footprints, Swords, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Exercise, WeekdayKey } from '@/types';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';
import { reorderByIndex } from '@/utils/programUtils';

export default function EditTodayScreen() {
  const { workoutId } = useLocalSearchParams();
  const idStr = typeof workoutId === 'string' ? workoutId : Array.isArray(workoutId) ? workoutId[0] : undefined;

  const { getWorkoutById, saveWorkoutOverrideForToday } = useApp();

  const workout = useMemo(() => (idStr ? getWorkoutById(idStr) : null), [getWorkoutById, idStr]);

  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises ?? []);

  const today = new Date().toISOString().split('T')[0];

  const [pickerOpen, setPickerOpen] = useState(false);
  const [createExerciseOpen, setCreateExerciseOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'upper' | 'lower' | 'maintenance' | 'cardio' | 'martial_arts'>('all');

  const getCategory = useCallback((ex: Exercise): string => {
    const name = ex.name.toLowerCase();
    const pattern = ex.movementPattern || '';
    const sport = ex.sportRelevance;

    if (activeCategory === 'martial_arts' && sport?.martial_arts) return 'martial_arts';
    
    if (pattern.includes('squat') || pattern.includes('lunge') || pattern.includes('hinge') || name.includes('leg') || name.includes('squat') || name.includes('deadlift')) return 'lower';
    if (pattern.includes('push') || pattern.includes('pull') || pattern.includes('press') || name.includes('press') || name.includes('pull') || name.includes('row') || name.includes('curl')) return 'upper';
    if (pattern.includes('mobility') || pattern.includes('core') || name.includes('plank') || name.includes('stretch') || name.includes('yoga')) return 'maintenance';
    if (pattern.includes('cardio') || name.includes('run') || name.includes('bike') || name.includes('jump')) return 'cardio';
    if (sport?.martial_arts) return 'martial_arts';

    return 'other';
  }, [activeCategory]);

  const candidates = useMemo(() => {
    // If we are adding custom exercises, we want to look at the whole database + potentially custom ones if we stored them (but here we just use MASTER_EXERCISE_DATABASE)
    // The original code filtered by programId for some reason? "if (!workout?.programId) return [];"
    // But since we want to allow adding ANY exercise, we should just use the database.
    
    let result = MASTER_EXERCISE_DATABASE.slice().sort((a, b) => (a.name > b.name ? 1 : -1));

    if (activeCategory !== 'all') {
      result = result.filter(ex => {
          const cat = getCategory(ex);
          if (activeCategory === 'upper') return cat === 'upper';
          if (activeCategory === 'lower') return cat === 'lower';
          if (activeCategory === 'maintenance') return cat === 'maintenance' || cat === 'other';
          if (activeCategory === 'cardio') return cat === 'cardio';
          if (activeCategory === 'martial_arts') return ex.sportRelevance?.martial_arts;
          return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(query));
    }

    return result;
  }, [searchQuery, activeCategory, getCategory]);

  const move = useCallback((from: number, to: number) => {
    setExercises((prev) => reorderByIndex(prev, from, to));
  }, []);

  const remove = useCallback((index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const save = useCallback(async () => {
    if (!workout?.programId || !workout.sessionType) {
      Alert.alert('Not editable', 'This workout is not from a program.');
      return;
    }

    await saveWorkoutOverrideForToday({
      programId: workout.programId,
      date: today,
      dayOfWeek: workout.dayOfWeek as WeekdayKey,
      sessionTypeKey: workout.sessionType,
      exercises,
    });

    router.back();
  }, [exercises, saveWorkoutOverrideForToday, today, workout?.dayOfWeek, workout?.programId, workout?.sessionType]);

  if (!workout) {
    return (
      <View style={styles.container}>
        <SafeAreaView>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            <View style={{padding: 24}}>
                <Text style={styles.title}>Workout not found</Text>
            </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Session</Text>
        <View style={{width: 40}} /> 
      </View>

    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Edit for today</Text>
        <Text style={styles.subtitle}>
          Changes apply only to {today}. Your saved program stays the same.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{workout.title}</Text>
        <Text style={styles.cardSubtitle}>{workout.kneeSafeNote}</Text>

        <View style={styles.list}>
          {exercises.map((ex, idx) => (
            <View key={ex.id + idx} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName} numberOfLines={1}>{ex.name}</Text>
                <Text style={styles.exMeta}>{ex.sets} × {ex.reps} · {ex.rest}s</Text>
              </View>

              <TouchableOpacity style={styles.miniBtn} onPress={() => move(idx, Math.max(0, idx - 1))} disabled={idx === 0} testID={`editTodayUp-${idx}`}>
                <Text style={[styles.miniBtnText, idx === 0 && styles.miniBtnDisabled]}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniBtn} onPress={() => move(idx, Math.min(exercises.length - 1, idx + 1))} disabled={idx === exercises.length - 1} testID={`editTodayDown-${idx}`}>
                <Text style={[styles.miniBtnText, idx === exercises.length - 1 && styles.miniBtnDisabled]}>↓</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.removeBtn} onPress={() => remove(idx)} testID={`editTodayRemove-${idx}`}>
                <Text style={styles.removeBtnText}>Del</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setPickerOpen(true)} testID="editTodayAdd">
          <Plus size={18} color={colors.primary} />
          <Text style={styles.addBtnText}>Add exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={save} testID="editTodaySave">
          <Check size={20} color={colors.surface} />
          <Text style={styles.saveBtnText}>Save for today</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add exercise</Text>
                <TouchableOpacity onPress={() => setPickerOpen(false)} style={styles.modalCloseIcon}>
                    <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>You’re in control. Knee safety labels still apply.</Text>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputWrapper}>
                    <Search size={18} color={colors.textTertiary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.addCustomBtn}
                    onPress={() => setCreateExerciseOpen(true)}
                >
                    <Plus size={16} color={colors.primary} />
                    <Text style={styles.addCustomBtnText}>Add my own workout</Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
                    {[
                        { key: 'all', label: 'All', icon: <Filter size={14} color={activeCategory === 'all' ? colors.surface : colors.text} /> },
                        { key: 'upper', label: 'Upper', icon: <Dumbbell size={14} color={activeCategory === 'upper' ? colors.surface : colors.text} /> },
                        { key: 'lower', label: 'Lower', icon: <BicepsFlexed size={14} color={activeCategory === 'lower' ? colors.surface : colors.text} /> },
                        { key: 'maintenance', label: 'Maint.', icon: <HeartPulse size={14} color={activeCategory === 'maintenance' ? colors.surface : colors.text} /> },
                        { key: 'cardio', label: 'Cardio', icon: <Footprints size={14} color={activeCategory === 'cardio' ? colors.surface : colors.text} /> },
                        { key: 'martial_arts', label: 'Martial', icon: <Swords size={14} color={activeCategory === 'martial_arts' ? colors.surface : colors.text} /> },
                    ].map((cat: any) => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[styles.categoryChip, activeCategory === cat.key && styles.categoryChipActive]}
                            onPress={() => setActiveCategory(cat.key)}
                        >
                            {cat.icon}
                            <Text style={[styles.categoryChipText, activeCategory === cat.key && styles.categoryChipTextActive]}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {candidates.length > 0 ? (
                  candidates.map((ex) => (
                    <TouchableOpacity
                      key={ex.id}
                      style={styles.modalRow}
                      onPress={() => {
                        if (ex.kneeSafeLevel === 'caution') {
                          Alert.alert(
                            'Caution',
                            'Based on your knee profile, this exercise may increase load. You can still include it — consider reducing range or load.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Add anyway',
                                onPress: () => {
                                  setExercises((prev) => [...prev, ex]);
                                  setPickerOpen(false);
                                  setSearchQuery('');
                                },
                              },
                            ]
                          );
                          return;
                        }

                        setExercises((prev) => [...prev, ex]);
                        setPickerOpen(false);
                        setSearchQuery('');
                      }}
                      testID={`editTodayPick-${ex.id}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalRowTitle}>{ex.name}</Text>
                        <Text style={styles.modalRowMeta}>{ex.sets} × {ex.reps} · {ex.rest}s</Text>
                      </View>
                      <Text style={[styles.levelText, ex.kneeSafeLevel === 'safe' ? styles.levelSafe : ex.kneeSafeLevel === 'modified' ? styles.levelMod : styles.levelCaution]}>
                        {ex.kneeSafeLevel === 'safe' ? 'Knee-Safe' : ex.kneeSafeLevel === 'modified' ? 'Modified' : 'Caution'}
                      </Text>
                    </TouchableOpacity>
                  ))
              ) : (
                  <View style={styles.emptySearch}>
                      <Text style={styles.emptySearchText}>No exercises found.</Text>
                  </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CreateExerciseModal
        visible={createExerciseOpen}
        onClose={() => setCreateExerciseOpen(false)}
        onSave={(newExercise) => {
          setExercises((prev) => [...prev, newExercise]);
          setCreateExerciseOpen(false);
          setPickerOpen(false);
        }}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

function CreateExerciseModal(props: {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('other');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [rest, setRest] = useState('60');

  React.useEffect(() => {
      if (props.visible) {
          setName('');
          setMuscleGroup('other');
          setSets('3');
          setReps('10');
          setRest('60');
      }
  }, [props.visible]);

  const handleSave = () => {
      if (!name.trim()) return;

      const setsNum = parseInt(sets);
      const restNum = parseInt(rest);

      if (isNaN(setsNum) || setsNum < 1) return;

      const newExercise: Exercise = {
          id: `custom-${Date.now()}`,
          name: name.trim(),
          sets: setsNum,
          reps: reps.trim(),
          rest: restNum || 60,
          kneeSafeLevel: 'safe',
          notes: 'Custom exercise',
          movementPattern: muscleGroup === 'legs_squat' ? 'squat' : 
                           muscleGroup === 'legs_hinge' ? 'hinge' : 
                           muscleGroup === 'push' ? 'push_horizontal' : 
                           muscleGroup === 'pull' ? 'pull_horizontal' : 
                           muscleGroup === 'core' ? 'core_flexion' : 'mobility',
      };

      props.onSave(newExercise);
  };

  const muscleOptions = [
      { label: 'Upper (Push)', value: 'push' },
      { label: 'Upper (Pull)', value: 'pull' },
      { label: 'Legs (Squat)', value: 'legs_squat' },
      { label: 'Legs (Hinge)', value: 'legs_hinge' },
      { label: 'Core', value: 'core' },
      { label: 'Cardio', value: 'cardio' },
      { label: 'Other', value: 'other' },
  ];

  return (
      <Modal transparent visible={props.visible} animationType="fade" onRequestClose={props.onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Custom Workout</Text>
            <TouchableOpacity onPress={props.onClose} style={styles.modalCloseIcon}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20, gap: 16 }}>
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Exercise Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.editInput}
                placeholder="e.g. My Special Stretch"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Muscle Group / Type</Text>
              <View style={styles.muscleGroupContainer}>
                  {muscleOptions.map(opt => (
                      <TouchableOpacity 
                          key={opt.value}
                          style={[styles.muscleOption, muscleGroup === opt.value && styles.muscleOptionActive]}
                          onPress={() => setMuscleGroup(opt.value)}
                      >
                          <Text style={[styles.muscleOptionText, muscleGroup === opt.value && styles.muscleOptionTextActive]}>
                              {opt.label}
                          </Text>
                      </TouchableOpacity>
                  ))}
              </View>
            </View>

            <View style={[styles.rowBetween, { gap: 12 }]}>
               <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editLabel}>Sets</Text>
                  <TextInput value={sets} onChangeText={setSets} keyboardType="numeric" style={styles.editInput} />
               </View>
               <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editLabel}>Reps</Text>
                  <TextInput value={reps} onChangeText={setReps} style={styles.editInput} />
               </View>
               <View style={[styles.editField, { flex: 1 }]}>
                  <Text style={styles.editLabel}>Rest (s)</Text>
                  <TextInput value={rest} onChangeText={setRest} keyboardType="numeric" style={styles.editInput} />
               </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Plus size={18} color={colors.surface} />
              <Text style={styles.saveBtnText}>Add to Routine</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
  },
  headerBackBtn: {
      padding: 8,
      marginLeft: -8,
  },
  headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
  },
  content: {
    padding: 24,
    paddingBottom: 24,
  },
  hero: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  exName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  exMeta: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  miniBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  miniBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  miniBtnDisabled: {
    color: colors.textTertiary,
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.danger + '10',
    borderWidth: 1,
    borderColor: colors.danger + '20',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.danger,
  },
  addBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  saveBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    padding: 24,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalCloseIcon: {
      padding: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    borderStyle: 'dashed',
  },
  addCustomBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  categoriesRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  emptySearch: {
    padding: 20,
    alignItems: 'center',
  },
  emptySearchText: {
    color: colors.textSecondary,
  },
  editField: {
    gap: 8,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  muscleGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  muscleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  muscleOptionText: {
    fontSize: 13,
    color: colors.text,
  },
  muscleOptionTextActive: {
    color: colors.surface,
    fontWeight: '600' as const,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalRowTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalRowMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalClose: {
    marginTop: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  levelSafe: {
    color: colors.success,
  },
  levelMod: {
    color: colors.warning,
  },
  levelCaution: {
    color: colors.danger,
  },
});
