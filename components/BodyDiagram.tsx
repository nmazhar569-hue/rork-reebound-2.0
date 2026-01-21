import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import colors from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAGRAM_WIDTH = Math.min(SCREEN_WIDTH - 80, 280);
const DIAGRAM_HEIGHT = DIAGRAM_WIDTH * 2;

export type MuscleGroupId = 
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'calves'
  | 'back'
  | 'glutes'
  | 'hamstrings';

interface BodyDiagramProps {
  selectedMuscle: MuscleGroupId | null;
  onMuscleSelect: (muscle: MuscleGroupId) => void;
}

interface MuscleRegion {
  id: MuscleGroupId;
  name: string;
  path: string;
  cx?: number;
  cy?: number;
  r?: number;
}

// Front view muscle regions
const FRONT_MUSCLES: MuscleRegion[] = [
  // Chest
  {
    id: 'chest',
    name: 'Chest',
    cx: 140,
    cy: 130,
    r: 25,
  },
  // Shoulders (left and right as circles)
  {
    id: 'shoulders',
    name: 'Shoulders',
    cx: 100,
    cy: 110,
    r: 18,
  },
  // Biceps
  {
    id: 'biceps',
    name: 'Biceps',
    cx: 85,
    cy: 160,
    r: 14,
  },
  // Triceps
  {
    id: 'triceps',
    name: 'Triceps',
    cx: 75,
    cy: 165,
    r: 12,
  },
  // Abs
  {
    id: 'abs',
    name: 'Abs',
    path: 'M 120 170 L 160 170 L 160 220 L 120 220 Z',
  },
  // Obliques
  {
    id: 'obliques',
    name: 'Obliques',
    cx: 110,
    cy: 195,
    r: 12,
  },
  // Quads
  {
    id: 'quads',
    name: 'Quads',
    path: 'M 110 240 L 140 240 L 145 320 L 105 320 Z',
  },
  // Calves
  {
    id: 'calves',
    name: 'Calves',
    path: 'M 115 340 L 135 340 L 135 390 L 115 390 Z',
  },
];

// Back view muscle regions
const BACK_MUSCLES: MuscleRegion[] = [
  // Back (upper and mid)
  {
    id: 'back',
    name: 'Back',
    path: 'M 100 100 L 180 100 L 170 180 L 110 180 Z',
  },
  // Glutes
  {
    id: 'glutes',
    name: 'Glutes',
    path: 'M 110 220 L 170 220 L 165 260 L 115 260 Z',
  },
  // Hamstrings
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    path: 'M 110 265 L 140 265 L 145 330 L 105 330 Z',
  },
];

export function BodyDiagram({ selectedMuscle, onMuscleSelect }: BodyDiagramProps) {
  const [view, setView] = useState<'front' | 'back'>('front');

  const handleMusclePress = (muscleId: MuscleGroupId) => {
    haptics.medium();
    onMuscleSelect(muscleId);
  };

  const handleToggleView = () => {
    haptics.light();
    setView(view === 'front' ? 'back' : 'front');
  };

  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, view === 'front' && styles.viewButtonActive]}
          onPress={handleToggleView}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewButtonText, view === 'front' && styles.viewButtonTextActive]}>
            Front
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, view === 'back' && styles.viewButtonActive]}
          onPress={handleToggleView}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewButtonText, view === 'back' && styles.viewButtonTextActive]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.diagramContainer}>
        <Svg width={DIAGRAM_WIDTH} height={DIAGRAM_HEIGHT} viewBox="0 0 280 560">
          {/* Body outline */}
          <G opacity={0.15}>
            {/* Head */}
            <Circle cx="140" cy="50" r="30" fill={colors.textSecondary} />
            {/* Torso */}
            <Path
              d="M 110 80 L 170 80 L 170 230 L 110 230 Z"
              fill={colors.textSecondary}
            />
            {/* Arms */}
            <Path
              d="M 70 95 L 110 95 L 110 200 L 80 200 Z"
              fill={colors.textSecondary}
            />
            <Path
              d="M 170 95 L 210 95 L 200 200 L 170 200 Z"
              fill={colors.textSecondary}
            />
            {/* Legs */}
            <Path
              d="M 110 230 L 135 230 L 140 420 L 110 420 Z"
              fill={colors.textSecondary}
            />
            <Path
              d="M 145 230 L 170 230 L 170 420 L 140 420 Z"
              fill={colors.textSecondary}
            />
          </G>

          {/* Interactive muscle regions */}
          {muscles.map((muscle) => {
            const isSelected = selectedMuscle === muscle.id;
            const fillColor = isSelected ? colors.primary : colors.accent;
            const opacity = isSelected ? 0.5 : 0.35;

            if (muscle.path) {
              return (
                <G key={muscle.id} onPress={() => handleMusclePress(muscle.id)}>
                  <Path
                    d={muscle.path}
                    fill={fillColor}
                    opacity={opacity}
                    stroke={isSelected ? colors.primary : colors.accent}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                </G>
              );
            }

            if (muscle.cx && muscle.cy && muscle.r) {
              // Render as circle for shoulders, biceps, etc.
              return (
                <G key={muscle.id} onPress={() => handleMusclePress(muscle.id)}>
                  <Circle
                    cx={muscle.cx}
                    cy={muscle.cy}
                    r={muscle.r}
                    fill={fillColor}
                    opacity={opacity}
                    stroke={isSelected ? colors.primary : colors.accent}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {/* Mirror for symmetric muscles like shoulders */}
                  {muscle.id === 'shoulders' || muscle.id === 'biceps' || muscle.id === 'triceps' || muscle.id === 'obliques' ? (
                    <Circle
                      cx={280 - muscle.cx}
                      cy={muscle.cy}
                      r={muscle.r}
                      fill={fillColor}
                      opacity={opacity}
                      stroke={isSelected ? colors.primary : colors.accent}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                  ) : null}
                </G>
              );
            }

            return null;
          })}
        </Svg>
      </View>

      {selectedMuscle && (
        <View style={styles.selectedLabel}>
          <Text style={styles.selectedLabelText}>
            {muscles.find(m => m.id === selectedMuscle)?.name || 'Selected'}
          </Text>
        </View>
      )}

      <Text style={styles.instruction}>Tap on a muscle group to view progress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDim,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  viewButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  viewButtonTextActive: {
    color: colors.text,
    fontWeight: '700' as const,
  },
  diagramContainer: {
    backgroundColor: colors.surfaceDim,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLabel: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  selectedLabelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.surface,
    letterSpacing: 0.2,
  },
  instruction: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
