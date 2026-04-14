import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { liquidGlass } from '@/constants/liquidGlass';
import { haptics } from '@/utils/haptics';
import { useFocusEffect, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import {
  progressService,
  ProgressSummary,
  MuscleMetric,
  ExercisePerformance,
  ReeRecommendation
} from '@/services/ProgressService';

import { SummaryCards } from '@/components/progress/SummaryCards';
import { MuscleBreakdownGrid } from '@/components/progress/MuscleBreakdownGrid';
import { ExerciseAnalysis } from '@/components/progress/ExerciseAnalysis';
import { ReeRecommendations } from '@/components/progress/ReeRecommendations';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data State
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [muscles, setMuscles] = useState<MuscleMetric[]>([]);
  const [exercises, setExercises] = useState<ExercisePerformance[]>([]);
  const [recs, setRecs] = useState<ReeRecommendation[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, m, e, r] = await Promise.all([
        progressService.getProgressSummary(),
        progressService.getMuscleMetrics(),
        progressService.getExerciseAnalysis(),
        progressService.getReeRecommendations()
      ]);
      setSummary(s);
      setMuscles(m);
      setExercises(e);
      setRecs(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            haptics.light();
            router.back();
          }}
        >
          <ChevronLeft size={24} color={liquidGlass.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={liquidGlass.text.primary} />}
      >
        {(!summary || summary.totalWorkouts === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Data Yet</Text>
            <Text style={styles.emptyStateText}>Complete your first workout to unlock detailed progress metrics.</Text>
          </View>
        ) : (
          <>
            {summary && <SummaryCards data={summary} />}
            {recs.length > 0 && <ReeRecommendations recs={recs} />}
            {muscles.length > 0 && <MuscleBreakdownGrid metrics={muscles} />}
            {exercises.length > 0 && <ExerciseAnalysis exercises={exercises} />}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: liquidGlass.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: liquidGlass.border.glassLight,
    backgroundColor: liquidGlass.surface.glass,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: liquidGlass.text.primary,
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: liquidGlass.text.primary,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: liquidGlass.text.secondary,
    textAlign: 'center',
  }
});
