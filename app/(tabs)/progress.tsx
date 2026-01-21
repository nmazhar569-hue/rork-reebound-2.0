import { router } from 'expo-router';
import { ChevronRight, RefreshCw, TrendingUp, Calendar, Dumbbell, Settings } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { BodyDiagram, MuscleGroupId } from '@/components/BodyDiagram';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { liquidGlass, glassShadows, glassLayout } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';

const MOCK_MUSCLE_DATA: Record<MuscleGroupId, { 
  lastWorkout: string; 
  totalWorkouts: number;
  avgWeight: number;
  weightProgress: number;
  lastExercises: string[];
}> = {
  chest: { lastWorkout: '2 days ago', totalWorkouts: 12, avgWeight: 185, weightProgress: 15, lastExercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Flyes'] },
  shoulders: { lastWorkout: '4 days ago', totalWorkouts: 10, avgWeight: 85, weightProgress: 12, lastExercises: ['Overhead Press', 'Lateral Raises', 'Face Pulls'] },
  biceps: { lastWorkout: '3 days ago', totalWorkouts: 15, avgWeight: 45, weightProgress: 8, lastExercises: ['Barbell Curls', 'Hammer Curls', 'Preacher Curls'] },
  triceps: { lastWorkout: '3 days ago', totalWorkouts: 14, avgWeight: 55, weightProgress: 10, lastExercises: ['Tricep Dips', 'Overhead Extensions', 'Cable Pushdowns'] },
  abs: { lastWorkout: '1 day ago', totalWorkouts: 20, avgWeight: 0, weightProgress: 0, lastExercises: ['Planks', 'Russian Twists', 'Leg Raises'] },
  obliques: { lastWorkout: '1 day ago', totalWorkouts: 18, avgWeight: 35, weightProgress: 5, lastExercises: ['Side Planks', 'Woodchoppers', 'Bicycle Crunches'] },
  quads: { lastWorkout: '2 days ago', totalWorkouts: 16, avgWeight: 225, weightProgress: 20, lastExercises: ['Squats', 'Leg Press', 'Lunges'] },
  calves: { lastWorkout: '5 days ago', totalWorkouts: 8, avgWeight: 135, weightProgress: 7, lastExercises: ['Calf Raises', 'Seated Calf Raises'] },
  back: { lastWorkout: '3 days ago', totalWorkouts: 13, avgWeight: 165, weightProgress: 18, lastExercises: ['Deadlifts', 'Pull-ups', 'Bent-over Rows'] },
  glutes: { lastWorkout: '2 days ago', totalWorkouts: 11, avgWeight: 205, weightProgress: 16, lastExercises: ['Hip Thrusts', 'Bulgarian Split Squats', 'Glute Bridges'] },
  hamstrings: { lastWorkout: '4 days ago', totalWorkouts: 9, avgWeight: 155, weightProgress: 13, lastExercises: ['Romanian Deadlifts', 'Leg Curls', 'Good Mornings'] },
};

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

function GlassProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
    </View>
  );
}

export default function ProgressScreen() {
  const { dailyLogs, workoutPlan } = useApp();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(null);
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

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

  const handleRetakePress = () => {
    haptics.light();
    setShowRetakeConfirm(true);
  };

  const handleConfirmRetake = () => {
    setShowRetakeConfirm(false);
    router.push('/onboarding');
  };

  const muscleData = selectedMuscle ? MOCK_MUSCLE_DATA[selectedMuscle] : null;
  const progressPercentage = weeklyData.totalWorkouts > 0 ? (weeklyData.completedWorkouts / weeklyData.totalWorkouts) * 100 : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your strength journey</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIconButton}
          onPress={() => {
            haptics.light();
            router.push('/settings');
          }}
        >
          <Settings size={22} color={liquidGlass.text.primary} />
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.narrativeCard}>
        <Text style={styles.narrativeText}>{narrative}</Text>
      </GlassCard>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Workouts This Week</Text>
          <Text style={styles.statValue}>{weeklyData.completedWorkouts}/{weeklyData.totalWorkouts}</Text>
          <GlassProgressBar progress={progressPercentage} />
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Pain Level</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{weeklyData.avgPain > 0 ? weeklyData.avgPain.toFixed(1) : '-'}</Text>
            <Text style={styles.statValueSuffix}>/10</Text>
          </View>
          <Text style={styles.statNote}>Less discomfort over time</Text>
        </GlassCard>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Muscle Group Progress</Text>
        <Text style={styles.sectionSubtitle}>Tap a muscle to see detailed statistics</Text>
      </View>

      <GlassCard style={styles.bodyDiagramCard}>
        <BodyDiagram 
          selectedMuscle={selectedMuscle}
          onMuscleSelect={handleMuscleSelect}
        />
      </GlassCard>

      {selectedMuscle && muscleData && (
        <GlassCard style={styles.muscleDetailsCard}>
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
                <Calendar size={20} color={liquidGlass.accent.primary} />
              </View>
              <Text style={styles.muscleStatLabel}>Last Workout</Text>
              <Text style={styles.muscleStatValue}>{muscleData.lastWorkout}</Text>
            </View>

            <View style={styles.muscleStat}>
              <View style={styles.muscleStatIcon}>
                <Dumbbell size={20} color={liquidGlass.status.warning} />
              </View>
              <Text style={styles.muscleStatLabel}>Total Sessions</Text>
              <Text style={styles.muscleStatValue}>{muscleData.totalWorkouts}</Text>
            </View>

            {muscleData.avgWeight > 0 && (
              <View style={styles.muscleStat}>
                <View style={styles.muscleStatIcon}>
                  <TrendingUp size={20} color={liquidGlass.status.success} />
                </View>
                <Text style={styles.muscleStatLabel}>Avg Weight</Text>
                <Text style={styles.muscleStatValue}>{muscleData.avgWeight} lb</Text>
              </View>
            )}

            {muscleData.weightProgress > 0 && (
              <View style={styles.muscleStat}>
                <View style={styles.muscleStatIcon}>
                  <TrendingUp size={20} color={liquidGlass.status.success} />
                </View>
                <Text style={styles.muscleStatLabel}>Progress</Text>
                <Text style={[styles.muscleStatValue, { color: liquidGlass.status.success }]}>
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
        </GlassCard>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleRetakePress}>
          <View style={styles.settingsIcon}>
            <RefreshCw size={22} color={liquidGlass.accent.primary} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsLabel}>Retake Assessment</Text>
            <Text style={styles.settingsDescription}>Revisit your profile anytime</Text>
          </View>
          <ChevronRight size={20} color={liquidGlass.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showRetakeConfirm}
        title="Retake Assessment?"
        message="This will reset your profile and take you back to the onboarding process. Your progress data will be preserved."
        confirmText="Retake"
        cancelText="Cancel"
        type="warning"
        onConfirm={handleConfirmRetake}
        onCancel={() => setShowRetakeConfirm(false)}
      />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: liquidGlass.background.primary },
  scrollContent: { padding: glassLayout.screenPadding, paddingTop: glassLayout.screenPaddingTop, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  headerContent: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700' as const, color: liquidGlass.text.primary, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 15, color: liquidGlass.text.secondary },
  settingsIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: liquidGlass.surface.glass, borderWidth: 1, borderColor: liquidGlass.border.glassLight, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  glassCard: { backgroundColor: liquidGlass.surface.card, borderRadius: 20, borderWidth: 1, borderColor: liquidGlass.border.glass, padding: 20, ...glassShadows.soft },
  narrativeCard: { marginBottom: 20 },
  narrativeText: { fontSize: 16, color: liquidGlass.text.primary, lineHeight: 25, fontWeight: '500' as const, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, padding: 18 },
  statLabel: { fontSize: 11, color: liquidGlass.text.tertiary, marginBottom: 8, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 28, fontWeight: '800' as const, color: liquidGlass.text.primary, letterSpacing: -0.5 },
  statValueSuffix: { fontSize: 14, color: liquidGlass.text.tertiary, marginLeft: 2 },
  statNote: { fontSize: 12, color: liquidGlass.text.tertiary, marginTop: 6, fontWeight: '500' as const },
  progressBarContainer: { height: 6, backgroundColor: liquidGlass.surface.glassDark, borderRadius: 3, overflow: 'hidden', marginTop: 12 },
  progressBarFill: { height: '100%', backgroundColor: liquidGlass.accent.primary, borderRadius: 3 },
  sectionHeader: { marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 6, letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 14, color: liquidGlass.text.secondary },
  bodyDiagramCard: { paddingVertical: 32, paddingHorizontal: 16, marginBottom: 20 },
  muscleDetailsCard: { marginBottom: 20 },
  muscleDetailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  muscleDetailsTitle: { fontSize: 24, fontWeight: '800' as const, color: liquidGlass.text.primary, marginBottom: 4, letterSpacing: -0.5 },
  muscleDetailsSubtitle: { fontSize: 14, color: liquidGlass.text.secondary },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: liquidGlass.surface.glassDark, borderWidth: 1, borderColor: liquidGlass.border.glassLight, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 18, color: liquidGlass.text.secondary, fontWeight: '600' as const },
  muscleStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  muscleStat: { flex: 1, minWidth: '45%', backgroundColor: liquidGlass.surface.glassDark, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: liquidGlass.border.glassLight },
  muscleStatIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: liquidGlass.surface.glass, borderWidth: 1, borderColor: liquidGlass.border.glass, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  muscleStatLabel: { fontSize: 12, color: liquidGlass.text.secondary, marginBottom: 6, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  muscleStatValue: { fontSize: 20, fontWeight: '800' as const, color: liquidGlass.text.primary, letterSpacing: -0.3 },
  recentExercises: { paddingTop: 24, borderTopWidth: 1, borderTopColor: liquidGlass.border.glassLight },
  recentExercisesTitle: { fontSize: 16, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 14, letterSpacing: -0.2 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  exerciseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: liquidGlass.accent.primary },
  exerciseText: { fontSize: 15, color: liquidGlass.text.primary, fontWeight: '500' as const },
  settingsSection: { marginTop: 12, marginBottom: 18 },
  settingsSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 14, letterSpacing: -0.2 },
  settingsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: liquidGlass.surface.card, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: liquidGlass.border.glass, ...glassShadows.soft },
  settingsIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: liquidGlass.accent.muted, borderWidth: 1, borderColor: liquidGlass.border.glass, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingsContent: { flex: 1 },
  settingsLabel: { fontSize: 17, fontWeight: '700' as const, color: liquidGlass.text.primary, marginBottom: 4, letterSpacing: -0.2 },
  settingsDescription: { fontSize: 14, color: liquidGlass.text.secondary },
  bottomSpacer: { height: glassLayout.tabBarHeight },
});
