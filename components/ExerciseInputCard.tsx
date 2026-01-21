import React, { useState, useCallback, useRef } from 'react';
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
import colors, { borderRadius, shadows } from '@/constants/colors';
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

export function ExerciseInputCard({
  exercise,
  exerciseIndex,
  initialSets,
  onSetComplete,
  onAllSetsChange,
  darkMode = true,
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
      haptics.medium();

      Animated.sequence([
        Animated.timing(scaleAnims[setIndex], {
          toValue: 0.95,
          duration: 100,
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
        const newCompleted = !updated[setIndex].completed;
        updated[setIndex] = { ...updated[setIndex], completed: newCompleted };
        onAllSetsChange(updated);

        if (newCompleted) {
          onSetComplete(setIndex, updated[setIndex]);
        }
        return updated;
      });
    },
    [onSetComplete, onAllSetsChange, scaleAnims]
  );

  const completedCount = sets.filter((s) => s.completed).length;
  const progress = (completedCount / exercise.sets) * 100;

  const bgColor = darkMode ? 'rgba(20, 20, 25, 0.85)' : colors.surface;
  const textColor = darkMode ? '#FFFFFF' : colors.text;
  const secondaryTextColor = darkMode ? 'rgba(255,255,255,0.6)' : colors.textSecondary;
  const inputBg = darkMode ? 'rgba(255,255,255,0.08)' : colors.surfaceDim;
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : colors.borderLight;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {darkMode && (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      <View style={[styles.glassOverlay, { borderColor }]} />

      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{exerciseIndex + 1}</Text>
          </View>
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
          colors={['#00D9A3', '#4BFFCA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progress}%` }]}
        />
      </View>

      {expanded && (
        <View style={styles.setsContainer}>
          <View style={[styles.setsHeader, { borderBottomColor: borderColor }]}>
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
                    { color: set.completed ? colors.success : textColor },
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
                      borderColor: set.completed ? colors.success + '40' : borderColor,
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
                      borderColor: set.completed ? colors.success + '40' : borderColor,
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
                      borderColor: set.completed ? colors.success + '40' : borderColor,
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
                  {set.completed && <Check size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>
      )}

      {exercise.notes && expanded && (
        <View style={[styles.notesContainer, { backgroundColor: inputBg }]}>
          <Info size={14} color={colors.primary} />
          <Text style={[styles.notesText, { color: secondaryTextColor }]}>
            {exercise.notes}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.lifted,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderLeftColor: 'rgba(255,255,255,0.1)',
    borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomColor: 'rgba(255,255,255,0.02)',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.primary,
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
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 18,
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
    opacity: 0.85,
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
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  rpeInput: {
    width: 50,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
