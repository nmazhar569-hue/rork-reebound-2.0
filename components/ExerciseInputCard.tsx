import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Check, ChevronDown, ChevronUp, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Exercise } from '@/types';
import colors, { borderRadius, shadows, gradients } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface SetInputData {
  weight: string;
  reps: string;
  completed: boolean;
  rpe: string;
}

interface ExerciseInputCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  initialSets?: SetInputData[];
  onSetComplete: (setIndex: number, data: SetInputData) => void;
  onAllSetsChange: (sets: SetInputData[]) => void;
  darkMode?: boolean;
}

const TEAL = '#00C2B8';

export function ExerciseInputCard({
  exercise,
  exerciseIndex,
  initialSets,
  onSetComplete,
  onAllSetsChange,
  darkMode = false,
}: ExerciseInputCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [sets, setSets] = useState<SetInputData[]>(() => {
    if (initialSets && initialSets.length > 0) return initialSets;
    return Array.from({ length: exercise.sets }, () => ({
      weight: '',
      reps: exercise.reps.split('-')[0] || '10',
      completed: false,
      rpe: '',
    }));
  });

  const scaleAnims = useRef(
    Array.from({ length: exercise.sets }, () => new Animated.Value(1))
  ).current;

  const completionWaveAnim = useRef(new Animated.Value(0)).current;
  const progressPulseAnim = useRef(new Animated.Value(1)).current;

  const completedCount = sets.filter((s) => s.completed).length;
  const progress = (completedCount / exercise.sets) * 100;

  useEffect(() => {
    if (completedCount > 0 && completedCount < exercise.sets) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressPulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(progressPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      progressPulseAnim.setValue(1);
    }
  }, [completedCount, exercise.sets, progressPulseAnim]);

  const handleSetChange = useCallback(
    (setIndex: number, field: keyof SetInputData, value: string | boolean) => {
      setSets((prev) => {
        const updated = [...prev];
        updated[setIndex] = { ...updated[setIndex], [field]: value };
        onAllSetsChange(updated);
        return updated;
      });
    },
    [onAllSetsChange]
  );

  const handleCompleteSet = useCallback(
    (setIndex: number) => {
      const currentSet = sets[setIndex];
      const newCompleted = !currentSet.completed;

      if (newCompleted) {
        haptics.snap();

        Animated.sequence([
          Animated.timing(completionWaveAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(completionWaveAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        haptics.soft();
      }

      Animated.sequence([
        Animated.timing(scaleAnims[setIndex], {
          toValue: 0.95,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[setIndex], {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      setSets((prev) => {
        const updated = [...prev];
        updated[setIndex] = { ...updated[setIndex], completed: newCompleted };
        onAllSetsChange(updated);

        if (newCompleted) {
          onSetComplete(setIndex, updated[setIndex]);
        }
        return updated;
      });
    },
    [onSetComplete, onAllSetsChange, scaleAnims, completionWaveAnim, sets]
  );

  const waveColor = completionWaveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(0, 194, 184, 0)', 'rgba(255, 122, 80, 0.15)', 'rgba(0, 194, 184, 0)'],
  });

  const textColor = colors.text;
  const secondaryTextColor = colors.textSecondary;
  const inputBg = 'rgba(0, 194, 184, 0.06)';
  const borderColor = colors.borderTeal;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: progressPulseAnim }] }
      ]}
    >
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          styles.waveOverlay,
          { backgroundColor: waveColor }
        ]} 
      />

      <View style={styles.glassOverlay} />

      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={gradients.active}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.indexBadge}
          >
            <Text style={styles.indexText}>{exerciseIndex + 1}</Text>
          </LinearGradient>
          <View style={styles.headerInfo}>
            <Text style={[styles.exerciseName, { color: textColor }]} numberOfLines={1}>
              {exercise.name}
            </Text>
            <Text style={[styles.exerciseMeta, { color: secondaryTextColor }]}>
              {exercise.sets} sets × {exercise.reps} reps • {exercise.rest}s rest
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCount}/{exercise.sets}
            </Text>
          </View>
          {expanded ? (
            <ChevronUp size={20} color={secondaryTextColor} />
          ) : (
            <ChevronDown size={20} color={secondaryTextColor} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={progress === 100 ? gradients.completionWave : gradients.active}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progress}%` }]}
        />
      </View>

      {expanded && (
        <View style={styles.setsContainer}>
          <View style={styles.setsHeader}>
            <Text style={[styles.columnLabel, styles.setColumn, { color: secondaryTextColor }]}>SET</Text>
            <Text style={[styles.columnLabel, styles.weightColumn, { color: secondaryTextColor }]}>LBS</Text>
            <Text style={[styles.columnLabel, styles.repsColumn, { color: secondaryTextColor }]}>REPS</Text>
            <Text style={[styles.columnLabel, styles.rpeColumn, { color: secondaryTextColor }]}>RPE</Text>
            <Text style={[styles.columnLabel, styles.checkColumn, { color: secondaryTextColor }]}></Text>
          </View>

          {sets.map((set, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.setRow,
                set.completed && styles.setRowCompleted,
                { transform: [{ scale: scaleAnims[idx] }] },
              ]}
            >
              <View style={[styles.setNumber, styles.setColumn]}>
                <Text
                  style={[
                    styles.setNumberText,
                    { color: set.completed ? TEAL : textColor },
                  ]}
                >
                  {idx + 1}
                </Text>
              </View>

              <View style={styles.weightColumn}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                      borderColor: set.completed ? TEAL : borderColor,
                    },
                  ]}
                  value={set.weight}
                  onChangeText={(v) => handleSetChange(idx, 'weight', v)}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={secondaryTextColor}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.repsColumn}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                      borderColor: set.completed ? TEAL : borderColor,
                    },
                  ]}
                  value={set.reps}
                  onChangeText={(v) => handleSetChange(idx, 'reps', v)}
                  keyboardType="numeric"
                  placeholder={exercise.reps.split('-')[0]}
                  placeholderTextColor={secondaryTextColor}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.rpeColumn}>
                <TextInput
                  style={[
                    styles.input,
                    styles.rpeInput,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                      borderColor: set.completed ? TEAL : borderColor,
                    },
                  ]}
                  value={set.rpe}
                  onChangeText={(v) => handleSetChange(idx, 'rpe', v)}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={secondaryTextColor}
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.checkColumn}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    set.completed && styles.checkboxChecked,
                  ]}
                  onPress={() => handleCompleteSet(idx)}
                  activeOpacity={0.7}
                >
                  {set.completed ? (
                    <Check size={18} color="#FFFFFF" />
                  ) : (
                    <View style={styles.checkboxEmpty} />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>
      )}

      {exercise.notes && expanded && (
        <View style={styles.notesContainer}>
          <Info size={14} color={TEAL} />
          <Text style={[styles.notesText, { color: secondaryTextColor }]}>
            {exercise.notes}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 194, 184, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.lifted,
  },
  waveOverlay: {
    borderRadius: borderRadius.xxl,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.6)',
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  indexBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 13,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBadge: {
    backgroundColor: 'rgba(0, 194, 184, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 184, 0.2)',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: TEAL,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 194, 184, 0.1)',
    marginHorizontal: 18,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  setsContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 194, 184, 0.15)',
  },
  columnLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
  },
  setColumn: {
    width: 36,
  },
  weightColumn: {
    flex: 1,
    marginRight: 8,
  },
  repsColumn: {
    flex: 1,
    marginRight: 8,
  },
  rpeColumn: {
    width: 50,
    marginRight: 8,
  },
  checkColumn: {
    width: 44,
    alignItems: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  setRowCompleted: {
    opacity: 0.9,
  },
  setNumber: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  rpeInput: {
    width: 50,
  },
  checkbox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(0, 194, 184, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 194, 184, 0.08)',
  },
  checkboxEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 194, 184, 0.3)',
  },
  checkboxChecked: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 194, 184, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 184, 0.15)',
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
