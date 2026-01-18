import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  Animated,
} from 'react-native';

import { 
  Plus, 
  X,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Dumbbell,
  Clock,
  Filter,
  BicepsFlexed,
  HeartPulse,
  Swords,
  Footprints,
  Search,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { PageHeader, Card } from '@/components/ui';
import colors, { borderRadius, layout } from '@/constants/colors';
import { Exercise, WeekdayKey, SetLog } from '@/types';
import { MASTER_EXERCISE_DATABASE } from '@/constants/exerciseDatabase';
import hapticsUtil from '@/utils/haptics';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface UserWorkout {
  id: string;
  dayOfWeek: WeekdayKey;
  title: string;
  exercises: Exercise[];
}

export default function PlanScreen() {
  const { userProfile } = useApp();
  const today = new Date().getDay() as WeekdayKey;

  const [selectedDay, setSelectedDay] = useState<WeekdayKey>(today);
  const [userWorkouts, setUserWorkouts] = useState<UserWorkout[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [createExerciseModalOpen, setCreateExerciseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'upper' | 'lower' | 'maintenance' | 'cardio' | 'martial_arts'>('all');
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const selectedWorkout = useMemo(() => {
    return userWorkouts.find(w => w.dayOfWeek === selectedDay) || null;
  }, [userWorkouts, selectedDay]);

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

  const filteredExercises = useMemo(() => {
    let result = MASTER_EXERCISE_DATABASE;

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

    return result.slice(0, 50);
  }, [searchQuery, activeCategory, getCategory]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, pulseAnim]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = useCallback(() => {
    hapticsUtil.medium();
    setIsTimerRunning(true);
    setWorkoutStarted(true);
  }, []);

  const handlePauseTimer = useCallback(() => {
    hapticsUtil.light();
    setIsTimerRunning(false);
  }, []);

  const handleResetTimer = useCallback(() => {
    hapticsUtil.light();
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setWorkoutStarted(false);
    setExerciseLogs({});
  }, []);

  const handleSelectDay = useCallback((day: WeekdayKey) => {
    hapticsUtil.selection();
    setSelectedDay(day);
  }, []);

  const handleAddExercise = useCallback((exercise: Exercise) => {
    hapticsUtil.medium();
    
    const newExercise: Exercise = {
      ...exercise,
      id: `${exercise.id}-${Date.now()}`,
    };

    setUserWorkouts(prev => {
      const existing = prev.find(w => w.dayOfWeek === selectedDay);
      if (existing) {
        return prev.map(w => 
          w.dayOfWeek === selectedDay 
            ? { ...w, exercises: [...w.exercises, newExercise] }
            : w
        );
      } else {
        return [...prev, {
          id: `workout-${selectedDay}-${Date.now()}`,
          dayOfWeek: selectedDay,
          title: `${FULL_DAYS[selectedDay]} Workout`,
          exercises: [newExercise],
        }];
      }
    });
    
    setAddExerciseModalOpen(false);
    setSearchQuery('');
    setActiveCategory('all');
  }, [selectedDay]);

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    hapticsUtil.light();
    setUserWorkouts(prev => 
      prev.map(w => 
        w.dayOfWeek === selectedDay 
          ? { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) }
          : w
      ).filter(w => w.exercises.length > 0)
    );
    setExerciseLogs(prev => {
      const newLogs = { ...prev };
      delete newLogs[exerciseId];
      return newLogs;
    });
  }, [selectedDay]);

  const handleToggleExpand = useCallback((exerciseId: string) => {
    hapticsUtil.selection();
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  }, []);

  const handleSetComplete = useCallback((exerciseId: string, setIndex: number, weight?: number, reps?: number) => {
    hapticsUtil.soft();
    setExerciseLogs(prev => {
      const currentLogs = prev[exerciseId] || [];
      const existingSetIndex = currentLogs.findIndex(s => s.setNumber === setIndex);
      
      if (existingSetIndex >= 0) {
        const updatedLogs = [...currentLogs];
        updatedLogs[existingSetIndex] = {
          ...updatedLogs[existingSetIndex],
          completed: !updatedLogs[existingSetIndex].completed,
          weight: weight ?? updatedLogs[existingSetIndex].weight,
          reps: reps ?? updatedLogs[existingSetIndex].reps,
          timestamp: new Date().toISOString(),
        };
        return { ...prev, [exerciseId]: updatedLogs };
      } else {
        return {
          ...prev,
          [exerciseId]: [...currentLogs, {
            setNumber: setIndex,
            weight,
            reps,
            completed: true,
            timestamp: new Date().toISOString(),
          }],
        };
      }
    });
  }, []);

  const handleUpdateSetValue = useCallback((exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const numValue = parseInt(value) || undefined;
    setExerciseLogs(prev => {
      const currentLogs = prev[exerciseId] || [];
      const existingSetIndex = currentLogs.findIndex(s => s.setNumber === setIndex);
      
      if (existingSetIndex >= 0) {
        const updatedLogs = [...currentLogs];
        updatedLogs[existingSetIndex] = {
          ...updatedLogs[existingSetIndex],
          [field]: numValue,
        };
        return { ...prev, [exerciseId]: updatedLogs };
      } else {
        return {
          ...prev,
          [exerciseId]: [...currentLogs, {
            setNumber: setIndex,
            [field]: numValue,
            completed: false,
          }],
        };
      }
    });
  }, []);

  const getSetLog = useCallback((exerciseId: string, setIndex: number): SetLog | undefined => {
    return exerciseLogs[exerciseId]?.find(s => s.setNumber === setIndex);
  }, [exerciseLogs]);

  const getCompletedSetsCount = useCallback((exerciseId: string): number => {
    return exerciseLogs[exerciseId]?.filter(s => s.completed).length || 0;
  }, [exerciseLogs]);

  const renderWeekSelector = () => (
    <View style={styles.weekSelector}>
      {DAYS_OF_WEEK.map((day, index) => {
        const dayKey = index as WeekdayKey;
        const isSelected = selectedDay === dayKey;
        const isToday = today === dayKey;
        const hasWorkout = userWorkouts.some(w => w.dayOfWeek === dayKey);

        return (
          <TouchableOpacity 
            key={day} 
            style={[
              styles.dayButton,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => handleSelectDay(dayKey)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.dayButtonText,
              isSelected && styles.dayButtonTextSelected,
              isToday && !isSelected && styles.dayButtonTextToday,
            ]}>
              {day}
            </Text>
            {hasWorkout && (
              <View style={[
                styles.dayDot,
                isSelected && styles.dayDotSelected,
              ]} />
            )}
            {isToday && !isSelected && <View style={styles.todayIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTimer = () => (
    <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.timerDisplay}>
        <Clock size={20} color={isTimerRunning ? colors.primary : colors.textSecondary} />
        <Text style={[styles.timerText, isTimerRunning && styles.timerTextActive]}>
          {formatTime(timerSeconds)}
        </Text>
      </View>
      <View style={styles.timerControls}>
        {!isTimerRunning ? (
          <TouchableOpacity 
            style={[styles.timerButton, styles.timerButtonPlay]} 
            onPress={handleStartTimer}
          >
            <Play size={20} color={colors.surface} fill={colors.surface} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.timerButton, styles.timerButtonPause]} 
            onPress={handlePauseTimer}
          >
            <Pause size={20} color={colors.surface} fill={colors.surface} />
          </TouchableOpacity>
        )}
        {workoutStarted && (
          <TouchableOpacity 
            style={[styles.timerButton, styles.timerButtonReset]} 
            onPress={handleResetTimer}
          >
            <RotateCcw size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderExerciseCard = (exercise: Exercise, index: number) => {
    const isExpanded = expandedExercises[exercise.id];
    const completedSets = getCompletedSetsCount(exercise.id);
    const totalSets = exercise.sets;
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    return (
      <Card key={exercise.id} style={styles.exerciseCard}>
        <TouchableOpacity 
          style={styles.exerciseHeader}
          onPress={() => handleToggleExpand(exercise.id)}
          activeOpacity={0.7}
        >
          <View style={styles.exerciseHeaderLeft}>
            <View style={styles.exerciseIndex}>
              <Text style={styles.exerciseIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.sets} sets · {exercise.reps} reps · {exercise.rest}s rest
              </Text>
            </View>
          </View>
          <View style={styles.exerciseHeaderRight}>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{completedSets}/{totalSets}</Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>

        {progress > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        )}

        {isExpanded && (
          <View style={styles.setsContainer}>
            {Array.from({ length: exercise.sets }).map((_, setIndex) => {
              const setLog = getSetLog(exercise.id, setIndex);
              const isCompleted = setLog?.completed || false;

              return (
                <View key={setIndex} style={[styles.setRow, isCompleted && styles.setRowCompleted]}>
                  <View style={styles.setLabel}>
                    <Text style={[styles.setLabelText, isCompleted && styles.setLabelTextCompleted]}>
                      Set {setIndex + 1}
                    </Text>
                  </View>
                  
                  <View style={styles.setInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Weight</Text>
                      <TextInput
                        style={[styles.setInput, isCompleted && styles.setInputCompleted]}
                        placeholder="—"
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        value={setLog?.weight?.toString() || ''}
                        onChangeText={(v) => handleUpdateSetValue(exercise.id, setIndex, 'weight', v)}
                      />
                      <Text style={styles.inputUnit}>
                        {userProfile?.unitPreferences?.weight === 'lb' ? 'lb' : 'kg'}
                      </Text>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={[styles.setInput, isCompleted && styles.setInputCompleted]}
                        placeholder={exercise.reps.split('-')[0] || '—'}
                        placeholderTextColor={colors.textTertiary}
                        keyboardType="numeric"
                        value={setLog?.reps?.toString() || ''}
                        onChangeText={(v) => handleUpdateSetValue(exercise.id, setIndex, 'reps', v)}
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.checkButton, isCompleted && styles.checkButtonCompleted]}
                    onPress={() => handleSetComplete(exercise.id, setIndex, setLog?.weight, setLog?.reps)}
                  >
                    <Check size={18} color={isCompleted ? colors.surface : colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity 
              style={styles.removeExerciseButton}
              onPress={() => handleRemoveExercise(exercise.id)}
            >
              <Trash2 size={16} color={colors.danger} />
              <Text style={styles.removeExerciseText}>Remove exercise</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyDay = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Calendar size={48} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>{FULL_DAYS[selectedDay]}</Text>
      <Text style={styles.emptySubtitle}>No exercises planned for this day</Text>
      <TouchableOpacity 
        style={styles.addFirstButton}
        onPress={() => setAddExerciseModalOpen(true)}
      >
        <Plus size={20} color={colors.surface} />
        <Text style={styles.addFirstButtonText}>Add your first exercise</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddExerciseModal = () => {
    const categories: { key: typeof activeCategory; label: string; icon: React.ReactNode }[] = [
      { key: 'all', label: 'All', icon: <Filter size={14} color={activeCategory === 'all' ? colors.surface : colors.text} /> },
      { key: 'upper', label: 'Upper', icon: <Dumbbell size={14} color={activeCategory === 'upper' ? colors.surface : colors.text} /> },
      { key: 'lower', label: 'Lower', icon: <BicepsFlexed size={14} color={activeCategory === 'lower' ? colors.surface : colors.text} /> },
      { key: 'maintenance', label: 'Maint.', icon: <HeartPulse size={14} color={activeCategory === 'maintenance' ? colors.surface : colors.text} /> },
      { key: 'cardio', label: 'Cardio', icon: <Footprints size={14} color={activeCategory === 'cardio' ? colors.surface : colors.text} /> },
      { key: 'martial_arts', label: 'Martial', icon: <Swords size={14} color={activeCategory === 'martial_arts' ? colors.surface : colors.text} /> },
    ];

    return (
      <Modal
        visible={addExerciseModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddExerciseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity 
                onPress={() => {
                  setAddExerciseModalOpen(false);
                  setSearchQuery('');
                }} 
                style={styles.modalClose}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
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
                  onPress={() => setCreateExerciseModalOpen(true)}
              >
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.addCustomBtnText}>Add my own workout</Text>
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
                {categories.map((cat) => (
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

            <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseListItem}
                    onPress={() => handleAddExercise(exercise)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.exerciseListIcon}>
                      <Dumbbell size={20} color={colors.primary} />
                    </View>
                    <View style={styles.exerciseListContent}>
                      <Text style={styles.exerciseListName}>{exercise.name}</Text>
                      <Text style={styles.exerciseListMeta}>
                        {exercise.sets} sets · {exercise.reps} reps
                      </Text>
                    </View>
                    <Plus size={20} color={colors.primary} />
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
    );
  };

  const renderCreateExerciseModal = () => {
    return (
      <CreateExerciseModal
        visible={createExerciseModalOpen}
        onClose={() => setCreateExerciseModalOpen(false)}
        onSave={(newExercise) => {
          handleAddExercise(newExercise);
          setCreateExerciseModalOpen(false);
          setAddExerciseModalOpen(false); // Optionally close parent modal too
        }}
      />
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
          title="My Plan" 
          subtitle="Build and track your workouts" 
        />

        {renderWeekSelector()}
        
        {renderTimer()}

        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{FULL_DAYS[selectedDay]}</Text>
          {selectedWorkout && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setAddExerciseModalOpen(true)}
            >
              <Plus size={18} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedWorkout ? (
          <View style={styles.exercisesList}>
            {selectedWorkout.exercises.map((exercise, index) => 
              renderExerciseCard(exercise, index)
            )}
          </View>
        ) : (
          renderEmptyDay()
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderAddExerciseModal()}
      {renderCreateExerciseModal()}
    </View>
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

  useEffect(() => {
      if (props.visible) {
          setName('');
          setMuscleGroup('other');
          setSets('3');
          setReps('10');
          setRest('60');
      }
  }, [props.visible]);

  const handleSave = () => {
      if (!name.trim()) {
          // You might want to use Alert here, but for now we'll just return
          return;
      }

      const setsNum = parseInt(sets);
      const restNum = parseInt(rest);

      if (isNaN(setsNum) || setsNum < 1) {
           return;
      }

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
            <TouchableOpacity onPress={props.onClose} style={styles.modalClose}>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    padding: layout.screenPadding, 
    paddingTop: layout.screenPaddingTop,
  },
  weekSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 6,
    marginBottom: 16,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  dayButtonTextSelected: {
    color: colors.surface,
  },
  dayButtonTextToday: {
    color: colors.primary,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  dayDotSelected: {
    backgroundColor: colors.surface,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  timerTextActive: {
    color: colors.primary,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonPlay: {
    backgroundColor: colors.primary,
  },
  timerButtonPause: {
    backgroundColor: colors.accent,
  },
  timerButtonReset: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    padding: 0,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  setsContainer: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: colors.background,
    gap: 10,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 12,
    gap: 12,
  },
  setRowCompleted: {
    backgroundColor: colors.success + '10',
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  setLabel: {
    width: 50,
  },
  setLabelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  setLabelTextCompleted: {
    color: colors.success,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  setInput: {
    flex: 1,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
  },
  setInputCompleted: {
    backgroundColor: colors.success + '10',
  },
  inputUnit: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkButtonCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  removeExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
  },
  removeExerciseText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: borderRadius.full,
  },
  addFirstButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
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
  saveBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
  },
  exerciseList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: 8,
    gap: 12,
  },
  exerciseListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseListContent: {
    flex: 1,
  },
  exerciseListName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  exerciseListMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomSpacer: { 
    height: layout.tabBarHeight,
  },
});
