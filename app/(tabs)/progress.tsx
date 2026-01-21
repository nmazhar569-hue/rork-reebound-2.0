import { router } from 'expo-router';
import { ChevronRight, RefreshCw, TrendingUp, Calendar, Dumbbell } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Card, PageHeader, ProgressBar } from '@/components/ui';
import { BodyDiagram, MuscleGroupId } from '@/components/BodyDiagram';
import colors, { borderRadius, shadows, layout } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

const CHART_HEIGHT = 180;

// Mock data for muscle-specific progress (replace with real data later)
const MOCK_MUSCLE_DATA: Record<MuscleGroupId, { 
  lastWorkout: string; 
  totalWorkouts: number;
  avgWeight: number;
  weightProgress: number;
  lastExercises: string[];
}> = {
  chest: { 
    lastWorkout: '2 days ago', 
    totalWorkouts: 12, 
    avgWeight: 185,
    weightProgress: 15,
    lastExercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flyes'],
  },
  shoulders: { 
    lastWorkout: '4 days ago', 
    totalWorkouts: 10,
    avgWeight: 85,
    weightProgress: 12,
    lastExercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls'],
  },
  biceps: { 
    lastWorkout: '3 days ago', 
    totalWorkouts: 15,
    avgWeight: 45,
    weightProgress: 8,
    lastExercises: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls'],
  },
  triceps: { 
    lastWorkout: '3 days ago', 
    totalWorkouts: 14,
    avgWeight: 55,
    weightProgress: 10,
    lastExercises: ['Tricep Dips', 'Overhead Extensions', 'Cable Pushdowns'],
  },
  abs: { 
    lastWorkout: '1 day ago', 
    totalWorkouts: 20,
    avgWeight: 0,
    weightProgress: 0,
    lastExercises: ['Planks', 'Russian Twists', 'Leg Raises'],
  },
  obliques: { 
    lastWorkout: '1 day ago', 
    totalWorkouts: 18,
    avgWeight: 35,
    weightProgress: 5,
    lastExercises: ['Side Planks', 'Woodchoppers', 'Bicycle Crunches'],
  },
  quads: { 
    lastWorkout: '2 days ago', 
    totalWorkouts: 16,
    avgWeight: 225,
    weightProgress: 20,
    lastExercises: ['Squats', 'Leg Press', 'Lunges'],
  },
  calves: { 
    lastWorkout: '5 days ago', 
    totalWorkouts: 8,
    avgWeight: 135,
    weightProgress: 7,
    lastExercises: ['Calf Raises', 'Seated Calf Raises'],
  },
  back: { 
    lastWorkout: '3 days ago', 
    totalWorkouts: 13,
    avgWeight: 165,
    weightProgress: 18,
    lastExercises: ['Deadlifts', 'Pull-ups', 'Bent-over Rows'],
  },
  glutes: { 
    lastWorkout: '2 days ago', 
    totalWorkouts: 11,
    avgWeight: 205,
    weightProgress: 16,
    lastExercises: ['Hip Thrusts', 'Bulgarian Split Squats', 'Glute Bridges'],
  },
  hamstrings: { 
    lastWorkout: '4 days ago', 
    totalWorkouts: 9,
    avgWeight: 155,
    weightProgress: 13,
    lastExercises: ['Romanian Deadlifts', 'Leg Curls', 'Good Mornings'],
  },
};

export default function ProgressScreen() {
  const { dailyLogs, workoutPlan } = useApp();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(null);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const logsThisWeek = dailyLogs.filter((log) => new Date(log.date) >= startOfWeek);
    const completedWorkouts = logsThisWeek.filter((log) => log.workoutCompleted).length;
    const painLogs = logsThisWeek.filter((l) => l.painLevel > 0);
    const confidenceLogs = logsThisWeek.filter((l) => l.confidenceLevel > 0);

    return {
      completedWorkouts,
      totalWorkouts: workoutPlan.length,
      avgPain: painLogs.length > 0 ? Math.round((painLogs.reduce((sum, l) => sum + l.painLevel, 0) / painLogs.length) * 10) / 10 : 0,
      avgConfidence: confidenceLogs.length > 0 ? Math.round((confidenceLogs.reduce((sum, l) => sum + l.confidenceLevel, 0) / confidenceLogs.length) * 10) / 10 : 0,
    };
  }, [dailyLogs, workoutPlan]);

  const narrative = useMemo(() => {
    if (weeklyData.completedWorkouts === 0) return "When you're ready, your first session is waiting. No rush.";
    const painTrend = weeklyData.avgPain <= 3 ? "low" : weeklyData.avgPain < 6 ? "moderate" : "high";
    const consistency = weeklyData.completedWorkouts >= 3 ? "consistent" : "building";
    return `You showed up ${weeklyData.completedWorkouts} times this week with ${painTrend} discomfort. ${consistency === 'consistent' ? 'Sustainable progress.' : 'Every session counts.'}`;
  }, [weeklyData]);

  const handleMuscleSelect = (muscle: MuscleGroupId) => {
    haptics.medium();
    setSelectedMuscle(muscle === selectedMuscle ? null : muscle);
  };

  const muscleData = selectedMuscle ? MOCK_MUSCLE_DATA[selectedMuscle] : null;
  const progressPercentage = weeklyData.totalWorkouts > 0 ? (weeklyData.completedWorkouts / weeklyData.totalWorkouts) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <PageHeader title="Progress" subtitle="Track your strength journey" />

      <Card style={styles.narrativeCard}>
        <Text style={styles.narrativeText}>{narrative}</Text>
      </Card>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Workouts This Week</Text>
          <Text style={styles.statValue}>{weeklyData.completedWorkouts}/{weeklyData.totalWorkouts}</Text>
          <ProgressBar progress={progressPercentage} />
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Pain Level</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{weeklyData.avgPain > 0 ? weeklyData.avgPain.toFixed(1) : '-'}</Text>
            <Text style={styles.statValueSuffix}>/10</Text>
          </View>
          <Text style={styles.statNote}>Less discomfort over time</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Muscle Group Progress</Text>
        <Text style={styles.sectionSubtitle}>
          Tap a muscle to see detailed statistics
        </Text>
      </View>

      <Card style={styles.bodyDiagramCard}>
        <BodyDiagram 
          selectedMuscle={selectedMuscle}
          onMuscleSelect={handleMuscleSelect}
        />
      </Card>

      {selectedMuscle && muscleData && (
        <Card style={styles.muscleDetailsCard}>
          <View style={styles.muscleDetailsHeader}>
            <View>
              <Text style={styles.muscleDetailsTitle}>
                {selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1)}
              </Text>
              <Text style={styles.muscleDetailsSubtitle}>Detailed Progress</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedMuscle(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.muscleStatsGrid}>
            <View style={styles.muscleStat}>
              <View style={styles.muscleStatIcon}>
                <Calendar size={20} color={colors.primary} />
              </View>
              <Text style={styles.muscleStatLabel}>Last Workout</Text>
              <Text style={styles.muscleStatValue}>{muscleData.lastWorkout}</Text>
            </View>

            <View style={styles.muscleStat}>
              <View style={styles.muscleStatIcon}>
                <Dumbbell size={20} color={colors.accent} />
              </View>
              <Text style={styles.muscleStatLabel}>Total Sessions</Text>
              <Text style={styles.muscleStatValue}>{muscleData.totalWorkouts}</Text>
            </View>

            {muscleData.avgWeight > 0 && (
              <View style={styles.muscleStat}>
                <View style={styles.muscleStatIcon}>
                  <TrendingUp size={20} color={colors.success} />
                </View>
                <Text style={styles.muscleStatLabel}>Avg Weight</Text>
                <Text style={styles.muscleStatValue}>{muscleData.avgWeight} lb</Text>
              </View>
            )}

            {muscleData.weightProgress > 0 && (
              <View style={styles.muscleStat}>
                <View style={styles.muscleStatIcon}>
                  <TrendingUp size={20} color={colors.success} />
                </View>
                <Text style={styles.muscleStatLabel}>Progress</Text>
                <Text style={[styles.muscleStatValue, { color: colors.success }]}>
                  +{muscleData.weightProgress}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.recentExercises}>
            <Text style={styles.recentExercisesTitle}>Recent Exercises</Text>
            {muscleData.lastExercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseDot} />
                <Text style={styles.exerciseText}>{exercise}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/onboarding')}>
          <View style={styles.settingsIcon}>
            <RefreshCw size={22} color={colors.primary} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsLabel}>Retake Assessment</Text>
            <Text style={styles.settingsDescription}>Revisit your profile anytime</Text>
          </View>
          <ChevronRight size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: layout.screenPadding, paddingTop: layout.screenPaddingTop, paddingBottom: 40 },
  narrativeCard: { marginBottom: 20 },
  narrativeText: { fontSize: 16, color: colors.text, lineHeight: 25, fontWeight: '500' as const, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 18 },
  statLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 8, fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.6 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  statValueSuffix: { fontSize: 14, color: colors.textTertiary, marginLeft: 2 },
  statNote: { fontSize: 12, color: colors.textTertiary, marginTop: 6, fontWeight: '500' as const },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  bodyDiagramCard: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  muscleDetailsCard: {
    marginBottom: 20,
  },
  muscleDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  muscleDetailsTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  muscleDetailsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  muscleStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  muscleStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceDim,
    borderRadius: borderRadius.xl,
    padding: 16,
    alignItems: 'center',
  },
  muscleStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.soft,
  },
  muscleStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muscleStatValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  recentExercises: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  recentExercisesTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  exerciseText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  settingsSection: { marginTop: 12, marginBottom: 18 },
  settingsSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.text, marginBottom: 14, letterSpacing: -0.2 },
  settingsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 18, borderRadius: borderRadius.xxl, ...shadows.medium },
  settingsIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingsContent: { flex: 1 },
  settingsLabel: { fontSize: 17, fontWeight: '700' as const, color: colors.text, marginBottom: 4, letterSpacing: -0.2 },
  settingsDescription: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' as const },
  bottomSpacer: { height: layout.tabBarHeight },
});
